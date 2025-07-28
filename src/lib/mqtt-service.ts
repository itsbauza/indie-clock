import mqtt, { MqttClient } from 'mqtt';
import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export interface AwtrixMessage {
  text?: string;
  icon?: string;
  color?: string;
  duration?: number;
  pushIcon?: number;
  repeat?: number;
  effect?: string;
  rainbow?: boolean;
  fade?: boolean;
  hold?: boolean;
  topText?: string;
  bottomText?: string;
  bar?: number[];
  line?: number[];
  autoscale?: boolean;
  progress?: number;
  progressC?: string;
  progressBC?: string;
  draw?: { [key: string]: any[] }[];
  lifetime?: number;
  stack?: boolean;
  wake?: boolean;
  sound?: string;
  volume?: number;
  rtttl?: string;
  loop?: boolean;
  scrollSpeed?: number;
  leds?: number[];
  map?: number[];
}

class MQTTService {
  private client: MqttClient | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      // In Docker environment, connect to RabbitMQ container
      const mqttUrl = process.env.MQTT_URL || 'mqtt://rabbitmq:1883';
      const mqttUsername = process.env.MQTT_USERNAME || 'admin';
      const mqttPassword = process.env.MQTT_PASSWORD || 'admin_password';

      this.client = mqtt.connect(mqttUrl, {
        username: mqttUsername,
        password: mqttPassword,
        clientId: `indie-clock-backend-${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('MQTT connection closed');
        this.isConnected = false;
      });

      this.client.on('offline', () => {
        console.log('MQTT client offline');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        console.log('MQTT client reconnecting...');
      });

    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      this.isConnected = false;
    }
  }

  /**
   * Create a new MQTT user with specific topic permissions
   * Uses RabbitMQ HTTP API to create users and set permissions
   */
  private async createMQTTUser(username: string, password: string, topicPrefix: string): Promise<boolean> {
    try {
      const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
      const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
      const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

      // Convert topic prefix to MQTT format (dots to slashes)
      const mqttTopicPrefix = topicPrefix.replace(/\./g, '/');
      
      // Create user via RabbitMQ HTTP API
      const createUserResponse = await fetch(`${rabbitmqApiUrl}/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        },
        body: JSON.stringify({
          password: password,
          tags: 'management'
        })
      });

      if (!createUserResponse.ok) {
        console.error(`Failed to create MQTT user ${username}:`, await createUserResponse.text());
        return false;
      }

      // Set permissions for the user's specific topics
      // MQTT clients need broader permissions for subscriptions and exchanges
      const permissions = {
        configure: `${mqttTopicPrefix}.*|mqtt-subscription-.*`,
        write: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`,
        read: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`
      };

      const setPermissionsResponse = await fetch(`${rabbitmqApiUrl}/permissions/%2F/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        },
        body: JSON.stringify(permissions)
      });

      if (!setPermissionsResponse.ok) {
        console.error(`Failed to set permissions for MQTT user ${username}:`, await setPermissionsResponse.text());
        return false;
      }

      console.log(`✅ Created MQTT user ${username} with topic permissions: ${mqttTopicPrefix}.*`);
      return true;

    } catch (error) {
      console.error('Error creating MQTT user:', error);
      return false;
    }
  }

  /**
   * Delete an MQTT user
   */
  private async deleteMQTTUser(username: string): Promise<boolean> {
    try {
      const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
      const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
      const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

      const response = await fetch(`${rabbitmqApiUrl}/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        console.error(`Failed to delete MQTT user ${username}:`, await response.text());
        return false;
      }

      console.log(`✅ Deleted MQTT user ${username}`);
      return true;

    } catch (error) {
      console.error('Error deleting MQTT user:', error);
      return false;
    }
  }

  /**
   * Publish GitHub contributions as an Awtrix3 custom app
   * Uses the proper Awtrix3 MQTT topics for custom apps
   */
  public async publishAwtrix3CustomApp(username: string, contributionsData: any) {
    if (!this.isConnected || !this.client) {
      console.error('MQTT not connected');
      return;
    }
    
    try {
      // Find user by username, email, or use the username as email prefix
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubUsername: username },
            { email: username },
            { email: { startsWith: username + '@' } }
          ]
        }
      });
      
      if (!user) {
        console.error('User not found for Awtrix3 custom app. Username:', username);
        return;
      }

      // Get user's devices
      const devices = await prisma.device.findMany({
        where: { userId: user.id }
      });

      // Create a GitHub contributions calendar visualization - this is the main focus
      const contributionsCalendar = this.createContributionsCalendar(contributionsData.contributions);

      // Awtrix3 custom app message format focused on contributions calendar
      const customAppMessage: AwtrixMessage = {
        // The contributions calendar is the primary visualization
        draw: contributionsCalendar,
        wake: true, // Wake screen to show the calendar
      };

      // Publish to each device using Awtrix3 custom app topics
      for (const device of devices) {
        // Awtrix3 custom app topics:
        // - Custom app data: awtrix3/custom/github-contributions
        
        const baseTopic = device.topicPrefix.replace(/\./g, '/');
        
        // Main app data topic
        const appDataTopic = `${baseTopic}/custom/github-contributions`;
        this.client.publish(appDataTopic, JSON.stringify(customAppMessage), { qos: 1, retain: true });
        console.log(`Published Awtrix3 custom app with contributions calendar to: ${appDataTopic}`);

        // Store in database for tracking
        await prisma.rabbitMQMessage.create({
          data: {
            userId: user.id,
            topic: appDataTopic,
            // @ts-ignore
            message: customAppMessage as any,
          },
        });
      }

    } catch (error) {
      console.error('Error publishing Awtrix3 custom app:', error);
    }
  }

  /**
   * Create a GitHub contributions calendar visualization for Awtrix3
   * Creates a proper contribution chart with squares like GitHub's calendar
   * Optimized for 64x8 pixel display by creating a single bitmap
   */
  private createContributionsCalendar(contributions: any[]): any[] {
    const WIDTH = 32; // 32 week columns for an 8x32 matrix
    const HEIGHT = 8; // 7 rows for Mon-Sun, 1 spare row (bottom)
    const BACKGROUND_COLOR = 0x000000; // Black background

    // Prepare bitmap filled with background
    const bitmap: number[] = new Array(WIDTH * HEIGHT).fill(BACKGROUND_COLOR);

    const setPixel = (x: number, y: number, color: number) => {
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        bitmap[y * WIDTH + x] = color;
      }
    };

    // 4-level palette (very high → very low) matching GitHub colours
    const contributionColors = [
      0x56d364, // very high
      0x2da042, // high
      0x196c2e, // medium
      0x023a16  // low
    ];
    const noContributionColor = BACKGROUND_COLOR;

    if (!contributions || contributions.length === 0) {
      console.warn('No contribution data – blank calendar returned');
      return [{ db: [0, 0, WIDTH, HEIGHT, bitmap] }];
    }

    // Map ISO date → count for O(1) look-ups
    const contributionMap = new Map<string, number>();
    for (const c of contributions) {
      const dateStr = (c.date ?? c.day ?? '').substring(0, 10);
      if (dateStr) {
        contributionMap.set(dateStr, c.contributionCount ?? c.count ?? 0);
      }
    }

    // Determine the Monday of the current week (GitHub uses Monday-to-Sunday rows)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekday = (today.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - currentWeekday);

    // Earliest Monday we want to display (64 columns)
    const earliestMonday = new Date(currentMonday);
    earliestMonday.setDate(currentMonday.getDate() - (WIDTH - 1) * 7);

    // Render weeks left → right (oldest → newest) just like GitHub
    for (let week = 0; week < WIDTH; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(earliestMonday);
        date.setDate(earliestMonday.getDate() + week * 7 + day);
        const isoDate = date.toISOString().substring(0, 10);
        const count = contributionMap.get(isoDate) ?? 0;

        // Determine colour
        let color = noContributionColor;
        if (count > 0) {
          if (count >= 10) {
            color = contributionColors[0];
          } else if (count >= 6) {
            color = contributionColors[1];
          } else if (count >= 3) {
            color = contributionColors[2];
          } else {
            color = contributionColors[3];
          }
        }

        // x = week (column), y = day (row) – Monday = 0, Sunday = 6
        const x = week;
        const y = day; // row 7 (index 7) remains blank
        setPixel(x, y, color);
      }
    }

    console.log('Created 64x8 bitmap for GitHub contributions calendar');
    return [{ db: [0, 0, WIDTH, HEIGHT, bitmap] }];
  }

  /**
   * Publish Awtrix3 custom app sync request
   * This allows the Awtrix3 device to request fresh data
   */
  public async publishAwtrix3CustomAppSync(username: string) {
    if (!this.isConnected || !this.client) {
      console.error('MQTT not connected');
      return;
    }
    
    try {
      // Find user by username, email, or use the username as email prefix
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubUsername: username },
            { email: username },
            { email: { startsWith: username + '@' } }
          ]
        }
      });
      
      if (!user) {
        console.error('User not found for Awtrix3 custom app sync. Username:', username);
        return;
      }

      const devices = await prisma.device.findMany({
        where: { userId: user.id }
      });

      for (const device of devices) {
        const baseTopic = device.topicPrefix.replace(/\./g, '/');
        const syncTopic = `${baseTopic}/custom/github-contributions/sync`;
        
        const syncMessage = {
          action: 'sync',
          app: 'github-contributions',
          timestamp: new Date().toISOString(),
          requestId: `sync_${Date.now()}`
        };
        
        this.client.publish(syncTopic, JSON.stringify(syncMessage), { qos: 1, retain: false });
        console.log(`Published Awtrix3 custom app sync request to: ${syncTopic}`);
      }

    } catch (error) {
      console.error('Error publishing Awtrix3 custom app sync:', error);
    }
  }

  /**
   * Send a simple notification to all user's devices
   * Uses the Awtrix3 notify topic: [PREFIX]/notify
   */
  public async sendNotification(username: string, message: AwtrixMessage) {
    if (!this.isConnected || !this.client) {
      console.error('MQTT not connected');
      return false;
    }
    
    try {
      // Find user by username, email, or use the username as email prefix
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubUsername: username },
            { email: username },
            { email: { startsWith: username + '@' } }
          ]
        }
      });
      
      if (!user) {
        console.error('User not found for notification. Username:', username);
        return false;
      }

      const devices = await prisma.device.findMany({
        where: { userId: user.id }
      });

      if (devices.length === 0) {
        console.log('No devices found for user:', username);
        return false;
      }

      let successCount = 0;
      for (const device of devices) {
        const baseTopic = device.topicPrefix.replace(/\./g, '/');
        const notifyTopic = `${baseTopic}/notify`;
        
        this.client.publish(notifyTopic, JSON.stringify(message), { qos: 1, retain: false });
        console.log(`Published notification to: ${notifyTopic}`);
        successCount++;

        // Store in database for tracking
        await prisma.rabbitMQMessage.create({
          data: {
            userId: user.id,
            topic: notifyTopic,
            // @ts-ignore
            message: message as any,
          },
        });
      }

      return successCount > 0;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Update RabbitMQ definitions file to include new users and reload
   * This makes users persist across RabbitMQ restarts
   */
  private async updateRabbitMQDefinitions(username: string, password: string, topicPrefix: string): Promise<boolean> {
    try {
      const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
      const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
      const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

      // Convert topic prefix to MQTT format (dots to slashes)
      const mqttTopicPrefix = topicPrefix.replace(/\./g, '/');

      // Get current definitions
      const getDefinitionsResponse = await fetch(`${rabbitmqApiUrl}/definitions`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        }
      });

      if (!getDefinitionsResponse.ok) {
        console.error('Failed to get current definitions:', await getDefinitionsResponse.text());
        return false;
      }

      const currentDefinitions = await getDefinitionsResponse.json();

      // Check if user already exists in definitions
      const userExists = currentDefinitions.users?.some((user: any) => user.name === username);
      if (userExists) {
        console.log(`User ${username} already exists in definitions`);
        return true;
      }

      // Add new user to definitions
      const newUser = {
        name: username,
        password: password,
        tags: "management"
      };

      const newPermission = {
        user: username,
        vhost: "/",
        configure: `${mqttTopicPrefix}.*|mqtt-subscription-.*`,
        write: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`,
        read: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`
      };

      // Update definitions with new user and permissions
      const updatedDefinitions = {
        ...currentDefinitions,
        users: [...(currentDefinitions.users || []), newUser],
        permissions: [...(currentDefinitions.permissions || []), newPermission]
      };

      // Upload updated definitions
      const updateDefinitionsResponse = await fetch(`${rabbitmqApiUrl}/definitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        },
        body: JSON.stringify(updatedDefinitions)
      });

      if (!updateDefinitionsResponse.ok) {
        console.error('Failed to update definitions:', await updateDefinitionsResponse.text());
        return false;
      }

      console.log(`✅ Added user ${username} to RabbitMQ definitions for persistence`);
      return true;

    } catch (error) {
      console.error('Error updating RabbitMQ definitions:', error);
      return false;
    }
  }

  /**
   * Create MQTT user and permissions for a device
   * This creates an actual MQTT user with topic-specific permissions
   */
  public async createRabbitMQUserAndPermissions(username: string, password: string, prefix: string): Promise<boolean> {
    try {
      console.log(`Creating MQTT user: ${username} with topic prefix: ${prefix}`);
      
      // Create the MQTT user with specific topic permissions
      const success = await this.createMQTTUser(username, password, prefix);
      
      if (success) {
        // Also update the definitions file for persistence
        await this.updateRabbitMQDefinitions(username, password, prefix);
        
        console.log(`✅ MQTT user ${username} created successfully`);
        console.log(`📡 Topic pattern: ${prefix.replace(/\./g, '/')}.*`);
        console.log(`🔐 Username: ${username}`);
        console.log(`🔑 Password: ${password}`);
        return true;
      } else {
        console.error(`❌ Failed to create MQTT user ${username}`);
        return false;
      }
    } catch (error) {
      console.error('Error in createRabbitMQUserAndPermissions:', error);
      return false;
    }
  }

  /**
   * Update permissions for an existing MQTT user
   */
  public async updateRabbitMQUserPermissions(username: string, prefix: string): Promise<boolean> {
    try {
      console.log(`Updating permissions for MQTT user: ${username} with prefix: ${prefix}`);
      
      const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
      const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
      const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

      // Convert topic prefix to MQTT format (dots to slashes)
      const mqttTopicPrefix = prefix.replace(/\./g, '/');
      
      // Set updated permissions for the user's specific topics
      const permissions = {
        configure: `${mqttTopicPrefix}.*|mqtt-subscription-.*`,
        write: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`,
        read: `${mqttTopicPrefix}.*|amq\\.topic|mqtt-subscription-.*`      };

      const setPermissionsResponse = await fetch(`${rabbitmqApiUrl}/permissions/%2F/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        },
        body: JSON.stringify(permissions)
      });

      if (!setPermissionsResponse.ok) {
        console.error(`Failed to update permissions for MQTT user ${username}:`, await setPermissionsResponse.text());
        return false;
      }

      console.log(`✅ Updated permissions for MQTT user ${username} with topic permissions: ${mqttTopicPrefix}.*`);
      return true;

    } catch (error) {
      console.error('Error updating MQTT user permissions:', error);
      return false;
    }
  }

  /**
   * Switch to a specific app on all user's devices
   * Uses the Awtrix3 switch topic: [PREFIX]/switch
   */
  public async switchToApp(username: string, appName: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      console.error('MQTT not connected');
      return false;
    }
    
    try {
      // Find user by ID, username, email, or use the username as email prefix
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: username }, // In case username is actually a user ID
            { githubUsername: username },
            { email: username },
            { email: { startsWith: username + '@' } }
          ]
        }
      });
      
      if (!user) {
        console.error('User not found for app switch. Username:', username);
        return false;
      }

      const devices = await prisma.device.findMany({
        where: { userId: user.id }
      });

      if (devices.length === 0) {
        console.log('No devices found for user:', username);
        return false;
      }

      let successCount = 0;
      for (const device of devices) {
        const baseTopic = device.topicPrefix.replace(/\./g, '/');
        const switchTopic = `${baseTopic}/switch`;
        
        const switchMessage = {
          name: appName
        };
        
        this.client.publish(switchTopic, JSON.stringify(switchMessage), { qos: 1, retain: false });
        console.log(`Published app switch to: ${switchTopic} with app: ${appName}`);
        successCount++;

        // Store in database for tracking
        await prisma.rabbitMQMessage.create({
          data: {
            userId: user.id,
            topic: switchTopic,
            // @ts-ignore
            message: switchMessage as any,
          },
        });
      }

      return successCount > 0;
    } catch (error) {
      console.error('Error switching to app:', error);
      return false;
    }
  }

  /**
   * Delete MQTT user and permissions for a device
   */
  public async deleteRabbitMQUserAndPermissions(username: string): Promise<boolean> {
    try {
      console.log(`Deleting MQTT user: ${username}`);
      return await this.deleteMQTTUser(username);
    } catch (error) {
      console.error('Error in deleteRabbitMQUserAndPermissions:', error);
      return false;
    }
  }

  /**
   * Restore all MQTT users from database on startup
   * This ensures all registered devices have their users recreated after RabbitMQ restarts
   */
  public async restoreUsersFromDatabase(): Promise<void> {
    try {
      console.log('🔄 Restoring MQTT users from database...');
      
      // Get all devices from database
      const devices = await prisma.device.findMany({
        select: {
          rabbitmqUsername: true,
          rabbitmqPassword: true,
          topicPrefix: true,
        }
      });

      console.log(`Found ${devices.length} devices to restore`);

      for (const device of devices) {
        try {
          // Check if user already exists in RabbitMQ
          const userExists = await this.checkUserExists(device.rabbitmqUsername);
          
          if (!userExists) {
            console.log(`Recreating MQTT user: ${device.rabbitmqUsername}`);
            await this.createMQTTUser(device.rabbitmqUsername, device.rabbitmqPassword, device.topicPrefix);
            await this.updateRabbitMQDefinitions(device.rabbitmqUsername, device.rabbitmqPassword, device.topicPrefix);
          } else {
            console.log(`MQTT user already exists: ${device.rabbitmqUsername}`);
          }
        } catch (error) {
          console.error(`Error restoring user ${device.rabbitmqUsername}:`, error);
        }
      }

      console.log('✅ MQTT user restoration completed');
    } catch (error) {
      console.error('Error restoring users from database:', error);
    }
  }

  /**
   * Check if a user exists in RabbitMQ
   */
  private async checkUserExists(username: string): Promise<boolean> {
    try {
      const rabbitmqApiUrl = process.env.RABBITMQ_API || 'http://localhost:15672/api';
      const adminUser = process.env.RABBITMQ_ADMIN_USER || 'admin';
      const adminPass = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';

      const response = await fetch(`${rabbitmqApiUrl}/users/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Error checking if user ${username} exists:`, error);
      return false;
    }
  }

  public async disconnect() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
    }
    this.isConnected = false;
  }
}

export const mqttService = new MQTTService(); 
