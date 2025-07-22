import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        rabbitmqUsername: true,
        rabbitmqPassword: true,
        topicPrefix: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      devices,
      broker: process.env.RABBITMQ_BROKER_URL || 'mqtt://localhost:1883',
    });
  } catch (error) {
    console.error('Error fetching device credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 