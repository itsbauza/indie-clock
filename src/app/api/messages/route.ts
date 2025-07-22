import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const topic = searchParams.get('topic')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!topic) {
      return NextResponse.json({ error: 'Topic parameter is required' }, { status: 400 })
    }

    // Fetch messages for the specific topic
    const messages = await prisma.rabbitMQMessage.findMany({
      where: {
        topic: {
          contains: topic
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            username: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        topic: msg.topic,
        message: msg.message,
        sentAt: msg.sentAt.toISOString(),
        userId: msg.userId,
        user: msg.user
      })),
      total: messages.length,
      topic
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 