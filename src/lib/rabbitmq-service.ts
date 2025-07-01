import amqp from 'amqplib';
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
  draw?: any[];
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

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://backend:backend_password@localhost:5672';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel?.assertExchange('amq.topic', 'topic', { durable: true });
      this.isConnected = true;
      console.log('Connected to RabbitMQ');
      this.connection?.on('error', (error: any) => {
        console.error('RabbitMQ connection error:', error);
        this.isConnected = false;
      });
      this.connection?.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.isConnected = false;
      setTimeout(() => this.connect(), 5000);
    }
  }

  public async publishGitHubContributions(username: string, contributionsData: any) {
    if (!this.isConnected || !this.channel) {
      console.error('RabbitMQ not connected');
      return;
    }
    const topic = `users.${username}.github-contributions`;
    const message: AwtrixMessage = {
      text: `GitHub: ${contributionsData.totalContributions} contributions`,
      icon: 'github',
      color: '#ffffff',
      duration: 10,
      effect: 'scroll',
      rainbow: false,
      fade: true,
      topText: `@${username}`,
      bottomText: `${contributionsData.totalContributions} contributions this year`,
      progress: Math.min(contributionsData.totalContributions / 365, 100),
      progressC: '#00ff00',
      progressBC: '#333333',
    };
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        await prisma.rabbitMQMessage.create({
          data: {
            userId: user.id,
            topic,
            message: message as unknown as Prisma.JsonObject,
          },
        });
      }
      this.channel?.publish(
        'amq.topic',
        topic,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      console.log(`Published GitHub data to topic: ${topic}`);
    } catch (error) {
      console.error('Error publishing to RabbitMQ:', error);
    }
  }

  public async publishStatus(username: string, status: string) {
    if (!this.isConnected || !this.channel) {
      console.error('RabbitMQ not connected');
      return;
    }
    const topic = `users.${username}.status`;
    const message = {
      status,
      timestamp: new Date().toISOString(),
    };
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user) {
        await prisma.rabbitMQMessage.create({
          data: {
            userId: user.id,
            topic,
            message: message as unknown as Prisma.JsonObject,
          },
        });
      }
      this.channel?.publish(
        'amq.topic',
        topic,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      console.log(`Published status to topic: ${topic}`);
    } catch (error) {
      console.error('Error publishing status to RabbitMQ:', error);
    }
  }

  public async createRabbitMQUser(username: string, password: string) {
    try {
      await prisma.user.update({
        where: { username },
        data: {
          rabbitmqUsername: username,
          rabbitmqPassword: password,
        },
      });
      console.log(`RabbitMQ user created for: ${username}`);
      return true;
    } catch (error) {
      console.error('Error creating RabbitMQ user:', error);
      return false;
    }
  }

  /**
   * Programmatically create a RabbitMQ user and set topic permissions for AWTRIX device isolation.
   * @param username The RabbitMQ username to create
   * @param password The password for the user
   * @param prefix The topic prefix (e.g., awtrix_<userId>_<deviceId>)
   */
  public async createRabbitMQUserAndPermissions(username: string, password: string, prefix: string) {
    const RABBITMQ_API = process.env.RABBITMQ_API || 'http://localhost:15672/api';
    const ADMIN_USER = process.env.RABBITMQ_ADMIN_USER || 'admin';
    const ADMIN_PASS = process.env.RABBITMQ_ADMIN_PASS || 'admin_password';
    try {
      // 1. Create the user
      const userRes = await fetch(
        `${RABBITMQ_API}/users/${username}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64'),
          },
          body: JSON.stringify({ password, tags: '' }),
        }
      );
      if (!userRes.ok) throw new Error('Failed to create RabbitMQ user');
      // 2. Set permissions for the user (default vhost is "/")
      const regex = `^${prefix}\\..*`;
      const permRes = await fetch(
        `${RABBITMQ_API}/permissions/%2F/${username}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString('base64'),
          },
          body: JSON.stringify({ configure: regex, write: regex, read: regex }),
        }
      );
      if (!permRes.ok) throw new Error('Failed to set RabbitMQ permissions');
      // 3. Store credentials in DB (removed, now handled in Device table)
      console.log(`RabbitMQ user and permissions created for: ${username}`);
      return true;
    } catch (error) {
      console.error('Error creating RabbitMQ user and permissions:', error);
      return false;
    }
  }

  public async disconnect() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    this.isConnected = false;
  }
}

export const rabbitmqService = new RabbitMQService(); 