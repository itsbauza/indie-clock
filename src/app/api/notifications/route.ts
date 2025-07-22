import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mqttService } from '@/lib/mqtt-service';
import type { AwtrixMessage } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const username = session.user.email.split('@')[0];
    
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