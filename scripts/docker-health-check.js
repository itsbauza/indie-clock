#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class DockerHealthCheck {
  constructor() {
    this.services = [
      {
        name: 'PostgreSQL',
        container: 'indie-clock-postgres',
        port: 5433,
        healthCheck: () => this.checkPostgres()
      },
      {
        name: 'RabbitMQ',
        container: 'indie-clock-rabbitmq',
        port: 15672,
        healthCheck: () => this.checkRabbitMQ()
      }
    ];
  }

  async checkContainerStatus(containerName) {
    try {
      const { stdout } = await execAsync(`docker ps --filter "name=${containerName}" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"`);
      return stdout.trim().split('\n').slice(1); // Remove header
    } catch (error) {
      console.error(`❌ Error checking container ${containerName}:`, error.message);
      return [];
    }
  }

  async checkPortConnectivity(port) {
    try {
      const { stdout } = await execAsync(`netstat -an | grep :${port} || ss -an | grep :${port}`);
      return stdout.includes(`:${port}`);
    } catch (error) {
      return false;
    }
  }

  async checkPostgres() {
    try {
      // Try to connect to PostgreSQL
      const { stdout } = await execAsync('docker exec indie-clock-postgres pg_isready -U postgres -d indie_clock');
      return stdout.includes('accepting connections');
    } catch (error) {
      return false;
    }
  }

  async checkRabbitMQ() {
    try {
      // Check RabbitMQ status
      const { stdout } = await execAsync('docker exec indie-clock-rabbitmq rabbitmq-diagnostics ping');
      return stdout.includes('Ping succeeded');
    } catch (error) {
      return false;
    }
  }

  async checkRabbitMQPlugins() {
    try {
      const { stdout } = await execAsync('docker exec indie-clock-rabbitmq rabbitmq-plugins list');
      const plugins = stdout.split('\n');
      
      const requiredPlugins = ['rabbitmq_management', 'rabbitmq_mqtt'];
      const enabledPlugins = plugins.filter(line => line.includes('[E*]')).map(line => {
        const match = line.match(/\s+(\S+)\s+/);
        return match ? match[1] : null;
      }).filter(Boolean);

      console.log('🔌 Enabled plugins:', enabledPlugins.join(', '));
      
      const missingPlugins = requiredPlugins.filter(plugin => !enabledPlugins.includes(plugin));
      if (missingPlugins.length > 0) {
        console.log('⚠️  Missing plugins:', missingPlugins.join(', '));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error checking RabbitMQ plugins:', error.message);
      return false;
    }
  }

  async checkMQTTConnectivity() {
    try {
      // Use a simple MQTT ping test
      const mqtt = require('mqtt');
      return new Promise((resolve) => {
        const client = mqtt.connect('mqtt://localhost:1883', {
          username: 'backend',
          password: 'backend_password',
          connectTimeout: 5000,
          clientId: `health-check-${Date.now()}`
        });

        const timeout = setTimeout(() => {
          client.end();
          resolve(false);
        }, 10000);

        client.on('connect', () => {
          clearTimeout(timeout);
          client.end();
          resolve(true);
        });

        client.on('error', () => {
          clearTimeout(timeout);
          client.end();
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  async run() {
    console.log('🏥 Docker Health Check Starting...\n');

    // Check if Docker Compose is running
    try {
      await execAsync('docker-compose ps');
    } catch (error) {
      console.error('❌ Docker Compose not found or not running');
      console.log('💡 Try: npm run docker:up');
      process.exit(1);
    }

    let allHealthy = true;

    // Check each service
    for (const service of this.services) {
      console.log(`🔍 Checking ${service.name}...`);
      
      // Check container status
      const containerStatus = await this.checkContainerStatus(service.container);
      if (containerStatus.length === 0) {
        console.log(`❌ ${service.name} container not running`);
        allHealthy = false;
        continue;
      }
      
      console.log(`✅ ${service.name} container is running`);
      
      // Check port connectivity
      const portOpen = await this.checkPortConnectivity(service.port);
      if (!portOpen) {
        console.log(`❌ ${service.name} port ${service.port} not accessible`);
        allHealthy = false;
        continue;
      }
      
      console.log(`✅ ${service.name} port ${service.port} is accessible`);
      
      // Service-specific health check
      const serviceHealthy = await service.healthCheck();
      if (!serviceHealthy) {
        console.log(`❌ ${service.name} health check failed`);
        allHealthy = false;
        continue;
      }
      
      console.log(`✅ ${service.name} is healthy`);
      console.log('');
    }

    // Additional RabbitMQ checks
    console.log('🔍 Checking RabbitMQ plugins...');
    const pluginsOk = await this.checkRabbitMQPlugins();
    if (!pluginsOk) {
      console.log('❌ RabbitMQ plugins not properly configured');
      allHealthy = false;
    } else {
      console.log('✅ RabbitMQ plugins properly configured');
    }

    console.log('🔍 Checking MQTT connectivity...');
    const mqttOk = await this.checkMQTTConnectivity();
    if (!mqttOk) {
      console.log('❌ MQTT connectivity failed');
      console.log('💡 Try running: npm run rabbitmq:setup');
      allHealthy = false;
    } else {
      console.log('✅ MQTT connectivity working');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (allHealthy) {
      console.log('✅ All services are healthy!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run setup: npm run rabbitmq:setup');
      console.log('   2. Test MQTT: npm run mqtt:test');
      console.log('   3. Monitor: npm run mqtt:monitor');
      console.log('   4. Access management: http://localhost:15672');
    } else {
      console.log('❌ Some services have issues');
      console.log('\n🛠️  Troubleshooting:');
      console.log('   1. Restart services: npm run docker:down && npm run docker:up');
      console.log('   2. Check logs: docker-compose logs');
      console.log('   3. Run setup: npm run rabbitmq:setup');
    }

    process.exit(allHealthy ? 0 : 1);
  }
}

// Run the health check
const healthCheck = new DockerHealthCheck();
healthCheck.run().catch(error => {
  console.error('💥 Health check failed:', error);
  process.exit(1);
}); 