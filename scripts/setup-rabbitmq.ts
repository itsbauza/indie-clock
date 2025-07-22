#!/usr/bin/env tsx

import fetch from 'node-fetch';

interface RabbitMQConfig {
  apiUrl: string;
  adminUser: string;
  adminPass: string;
}

class RabbitMQSetup {
  private config: RabbitMQConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.RABBITMQ_API || 'http://localhost:15672/api',
      adminUser: process.env.RABBITMQ_ADMIN_USER || 'admin',
      adminPass: process.env.RABBITMQ_ADMIN_PASS || 'admin_password',
    };
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${this.config.adminUser}:${this.config.adminPass}`).toString('base64'),
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (response.status === 204) {
        return null; // No content
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking RabbitMQ connection...');
      await this.makeRequest('/overview');
      console.log('✅ Successfully connected to RabbitMQ Management API');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ Management API');
      console.error('   Make sure RabbitMQ is running and management plugin is enabled');
      console.error('   URL:', this.config.apiUrl);
      return false;
    }
  }

  async enableMQTTPlugin(): Promise<boolean> {
    try {
      console.log('🔌 Enabling MQTT plugin...');
      
      // Check if plugin is already enabled
      const plugins = await this.makeRequest('/plugins') as any[];
      const mqttPlugin = plugins.find((p: any) => p.name === 'rabbitmq_mqtt');
      
      if (mqttPlugin && mqttPlugin.enabled) {
        console.log('✅ MQTT plugin is already enabled');
        return true;
      }

      // Enable the plugin
      await this.makeRequest('/plugins/rabbitmq_mqtt', 'PUT');
      console.log('✅ MQTT plugin enabled successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to enable MQTT plugin:', error);
      return false;
    }
  }

  async createUser(username: string, password: string, tags: string = ''): Promise<boolean> {
    try {
      console.log(`👤 Creating user: ${username}...`);
      
      // Check if user already exists
      try {
        await this.makeRequest(`/users/${username}`);
        console.log(`✅ User ${username} already exists`);
        return true;
      } catch (error) {
        // User doesn't exist, create it
      }

      await this.makeRequest(`/users/${username}`, 'PUT', {
        password,
        tags
      });
      
      console.log(`✅ User ${username} created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create user ${username}:`, error);
      return false;
    }
  }

  async setPermissions(username: string, vhost: string = '/', configure: string = '.*', write: string = '.*', read: string = '.*'): Promise<boolean> {
    try {
      console.log(`🔐 Setting permissions for user: ${username}...`);
      
      const encodedVhost = encodeURIComponent(vhost);
      await this.makeRequest(`/permissions/${encodedVhost}/${username}`, 'PUT', {
        configure,
        write,
        read
      });
      
      console.log(`✅ Permissions set for user ${username}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to set permissions for user ${username}:`, error);
      return false;
    }
  }

  async createExchange(name: string, type: string = 'topic', vhost: string = '/', durable: boolean = true): Promise<boolean> {
    try {
      console.log(`🔄 Creating exchange: ${name}...`);
      
      const encodedVhost = encodeURIComponent(vhost);
      await this.makeRequest(`/exchanges/${encodedVhost}/${name}`, 'PUT', {
        type,
        durable,
        auto_delete: false,
        internal: false,
        arguments: {}
      });
      
      console.log(`✅ Exchange ${name} created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create exchange ${name}:`, error);
      return false;
    }
  }

  async setupDefaultUsers(): Promise<boolean> {
    console.log('\n📋 Setting up default users...');
    
    const users = [
      {
        username: 'backend',
        password: process.env.RABBITMQ_BACKEND_PASSWORD || 'backend_password',
        tags: 'management',
        permissions: {
          configure: 'amq\\.topic|users\\..*|awtrix.*',
          write: 'amq\\.topic|users\\..*|awtrix.*',
          read: 'amq\\.topic|users\\..*|awtrix.*'
        }
      }
    ];

    let success = true;
    for (const user of users) {
      const userCreated = await this.createUser(user.username, user.password, user.tags);
      if (!userCreated) {
        success = false;
        continue;
      }

      const permissionsSet = await this.setPermissions(
        user.username,
        '/',
        user.permissions.configure,
        user.permissions.write,
        user.permissions.read
      );
      if (!permissionsSet) {
        success = false;
      }
    }

    return success;
  }

  async setupExchanges(): Promise<boolean> {
    console.log('\n🔄 Setting up exchanges...');
    
    const exchanges = [
      { name: 'amq.topic', type: 'topic' }
    ];

    let success = true;
    for (const exchange of exchanges) {
      const created = await this.createExchange(exchange.name, exchange.type);
      if (!created) {
        success = false;
      }
    }

    return success;
  }

  async showStatus(): Promise<void> {
    try {
      console.log('\n📊 RabbitMQ Status:');
      const overview = await this.makeRequest('/overview') as any;
      console.log(`   Version: ${overview.rabbitmq_version}`);
      console.log(`   Erlang Version: ${overview.erlang_version}`);
      console.log(`   Node: ${overview.node}`);
      console.log(`   Management Version: ${overview.management_version}`);
      
      const plugins = await this.makeRequest('/plugins') as any[];
      const enabledPlugins = plugins.filter((p: any) => p.enabled).map((p: any) => p.name);
      console.log(`   Enabled Plugins: ${enabledPlugins.join(', ')}`);
      
      const users = await this.makeRequest('/users') as any[];
      console.log(`   Total Users: ${users.length}`);
      
      const exchanges = await this.makeRequest('/exchanges') as any[];
      console.log(`   Total Exchanges: ${exchanges.length}`);
      
    } catch (error) {
      console.error('❌ Failed to get status:', error);
    }
  }

  async run(): Promise<void> {
    console.log('🚀 Starting RabbitMQ setup...\n');

    // Check connection
    const connected = await this.checkConnection();
    if (!connected) {
      process.exit(1);
    }

    // Enable MQTT plugin
    const mqttEnabled = await this.enableMQTTPlugin();
    if (!mqttEnabled) {
      console.error('⚠️  MQTT plugin setup failed, but continuing...');
    }

    // Setup users
    const usersSetup = await this.setupDefaultUsers();
    if (!usersSetup) {
      console.error('⚠️  Some users failed to setup, but continuing...');
    }

    // Setup exchanges
    const exchangesSetup = await this.setupExchanges();
    if (!exchangesSetup) {
      console.error('⚠️  Some exchanges failed to setup, but continuing...');
    }

    // Show final status
    await this.showStatus();

    console.log('\n✅ RabbitMQ setup completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test MQTT connection: npm run mqtt:test');
    console.log('   2. Monitor messages: npm run mqtt:monitor');
    console.log('   3. Access management UI: http://localhost:15672');
    console.log(`   4. Login with: ${this.config.adminUser} / ${this.config.adminPass}`);
  }
}

// Main execution
async function main() {
  try {
    const setup = new RabbitMQSetup();
    await setup.run();
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  main();
}

export { RabbitMQSetup }; 