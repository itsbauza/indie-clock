import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"
import { mqttService } from '../../../../../../lib/mqtt-service';

export async function POST(
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
    const { settings } = await req.json();

    // Find the device and ensure it belongs to the user
    const device = await prisma.device.findFirst({
      where: { 
        id: deviceId, 
        userId: user.id 
      }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Apply settings to device via MQTT
    const success = await mqttService.applyDeviceSettings(device.topicPrefix, settings);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to apply settings to device. Device may be offline or MQTT connection failed.' 
      }, { status: 500 });
    }

    // Save settings to database as well
    await prisma.deviceSettings.upsert({
      where: { deviceId: deviceId },
      update: { settings },
      create: { 
        deviceId: deviceId,
        settings 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Settings applied to device successfully' 
    });
  } catch (error) {
    console.error('Error applying device settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 