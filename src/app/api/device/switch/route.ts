import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mqttService } from '@/lib/mqtt-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appName } = await request.json();
    
    if (!appName) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 });
    }

    // Use the user's email as the username for MQTT service
    const success = await mqttService.switchToApp(session.user.email, appName);
    
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