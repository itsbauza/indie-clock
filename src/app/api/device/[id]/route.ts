import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: deviceId } = await params;

    // Find the device and ensure it belongs to the user
    const device = await prisma.device.findFirst({
      where: { 
        id: deviceId, 
        userId: user.id 
      },
      select: {
        id: true,
        name: true,
        topicPrefix: true,
        createdAt: true,
      }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ device });
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 