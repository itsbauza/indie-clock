import { NextRequest, NextResponse } from 'next/server';
import { mqttService } from '../../../lib/mqtt-service';

export async function POST(req: NextRequest) {
  try {
    // This endpoint is called on application startup
    // It restores all MQTT users from the database to ensure persistence
    
    console.log('🚀 Application startup - restoring MQTT users...');
    
    // Restore all users from database
    await mqttService.restoreUsersFromDatabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'MQTT users restored successfully' 
    });
  } catch (error) {
    console.error('Error during startup user restoration:', error);
    return NextResponse.json({ 
      error: 'Failed to restore MQTT users' 
    }, { status: 500 });
  }
} 