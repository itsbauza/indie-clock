import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"
import { mqttService } from '@/lib/mqtt-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
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

    const { appName } = await req.json();
    
    if (!appName) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 });
    }

    // Use the user's GitHub username or email as the username for MQTT service
    const username = user.githubUsername || user.email?.split('@')[0] || user.id;
    const success = await mqttService.switchToApp(username, appName);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Switched to app: ${appName}` 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to switch app. No devices found or MQTT not connected.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error switching app:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 