import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NextAuth) as any;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database using session user ID
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's devices
    const devices = await prisma.device.findMany({
      where: { userId: user.id },
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