import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GitHubService } from '@/lib/github-service';

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { personalAccessToken } = await request.json();

    if (!personalAccessToken) {
      return NextResponse.json(
        { error: 'Personal access token is required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate the token by trying to fetch user data
    try {
      const testQuery = `
        query {
          viewer {
            login
            name
            email
          }
        }
      `;

      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${personalAccessToken}`
        },
        body: JSON.stringify({ query: testQuery })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Invalid token: ${data.errors[0]?.message || 'Unknown error'}`);
      }

      // Token is valid, store as plain text
      await prisma.user.update({
        where: { id: user.id },
        data: {
          personalAccessToken: personalAccessToken,
          patUpdatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Personal access token updated successfully',
        hasPrivateAccess: true
      });

    } catch (error) {
      console.error('Error validating personal access token:', error);
      return NextResponse.json(
        { 
          error: 'Invalid personal access token',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating personal access token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update personal access token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email },
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove personal access token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        personalAccessToken: null,
        patUpdatedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Personal access token removed successfully'
    });

  } catch (error) {
    console.error('Error removing personal access token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove personal access token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 