import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
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
      }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Get device settings from the database
    const deviceSettings = await prisma.deviceSettings.findUnique({
      where: { deviceId: deviceId }
    });

    // Return default settings if none exist
    const settings = deviceSettings?.settings || {
      brightness: 50,
      volume: 50,
      autoBrightness: true,
      timezone: 'UTC',
      language: 'en',
      displayTimeout: 30,
      ledCount: 256,
      matrixWidth: 32,
      matrixHeight: 8,
      wifiSSID: '',
      wifiPassword: '',
      mqttEnabled: true,
      mqttBroker: '',
      mqttPort: 1883,
      mqttUsername: '',
      mqttPassword: '',
      mqttTopic: '',
      ntpServer: 'pool.ntp.org',
      timeFormat: '24h',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'celsius',
      soundEnabled: true,
      startupAnimation: true,
      powerSaveMode: false,
      customApps: [],
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching device settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    // Upsert device settings (create if doesn't exist, update if it does)
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
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving device settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 