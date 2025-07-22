import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import NextAuth from "@/lib/auth"
import { mqttService } from '@/lib/mqtt-service';
import type { AwtrixMessage } from '@/lib/mqtt-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(NextAuth) as any;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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

    const body = await request.json();
    const { text, icon, color, duration, effect } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create notification message
    const notificationMessage: AwtrixMessage = {
      text,
      icon: icon || 'bell',
      color: color || '#ffffff',
      duration: duration || 5,
      effect: effect || 'scroll',
      fade: true,
      rainbow: false,
      stack: false,
      wake: false,
      sound: '',
      volume: 0,
      rtttl: '',
      loop: false,
      scrollSpeed: 50,
      autoscale: true,
    };

    // Get username from email
    const username = user.email?.split('@')[0] || 'user';
    
    // Send notification
    const success = await mqttService.sendNotification(username, notificationMessage);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send notification. No devices found or MQTT not connected.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 