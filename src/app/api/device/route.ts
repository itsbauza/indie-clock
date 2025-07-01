import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { rabbitmqService } from '../../../lib/rabbitmq-service';
import { auth } from '../../../lib/auth';
import crypto from 'crypto';

async function getUserFromRequest() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return await prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    // Generate unique credentials and prefix
    const deviceId = crypto.randomBytes(6).toString('hex');
    const prefix = `awtrix_${user.id}_${deviceId}`;
    const rabbitmqUsername = `awtrix_${user.id}_${deviceId}`;
    const rabbitmqPassword = crypto.randomBytes(16).toString('hex');

    // Create RabbitMQ user and permissions
    const ok = await rabbitmqService.createRabbitMQUserAndPermissions(rabbitmqUsername, rabbitmqPassword, prefix);
    if (!ok) return NextResponse.json({ error: 'Failed to create device credentials' }, { status: 500 });

    // Store device in DB
    const device = await prisma.device.create({
      data: {
        userId: user.id,
        name,
        rabbitmqUsername,
        rabbitmqPassword,
        topicPrefix: prefix,
      },
    });

    return NextResponse.json({
      deviceId: device.id,
      name: device.name,
      rabbitmqUsername,
      rabbitmqPassword,
      topicPrefix: prefix,
      broker: process.env.RABBITMQ_BROKER_URL || 'mqtt://your-broker-host:1883',
      port: 1883,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const devices = await prisma.device.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, topicPrefix: true },
    });
    return NextResponse.json({ devices });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { deviceId, name } = await req.json();
    const device = await prisma.device.findFirst({ where: { id: deviceId, userId: user.id } });
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    await prisma.device.update({ where: { id: deviceId }, data: { name } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 