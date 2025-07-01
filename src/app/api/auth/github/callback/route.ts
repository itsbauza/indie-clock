import { NextRequest, NextResponse } from 'next/server';
import { GitHubUser, validateGitHubUser } from '@/lib/github-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('GitHub OAuth error from GitHub:', error);
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  console.log('Received authorization code, attempting to exchange for token...');

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_APP_CLIENT_ID,
        client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
        code: code,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    
    const tokenData = await tokenResponse.json();
    console.log('Token response data:', JSON.stringify(tokenData, null, 2));

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return NextResponse.redirect(new URL(`/?error=token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error)}`, request.url));
    }

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData);
      return NextResponse.redirect(new URL('/?error=no_access_token', request.url));
    }

    const { access_token } = tokenData;
    console.log('Successfully obtained access token, fetching user data...');

    // Get user data with the access token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      console.error('Failed to fetch user data:', userResponse.status, userResponse.statusText);
      return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
    }

    const userData = await userResponse.json();
    console.log('User data received:', JSON.stringify(userData, null, 2));

    // Get user email
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    console.log('Email response status:', emailResponse.status);
    
    const emailData = await emailResponse.json();
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || '';

    // Create user info object
    const userInfo: GitHubUser = {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      email: primaryEmail,
      avatar_url: userData.avatar_url,
    };

    // Validate user data
    if (!validateGitHubUser(userInfo)) {
      console.error('Invalid user data received from GitHub:', userInfo);
      return NextResponse.redirect(new URL('/?error=invalid_user_data', request.url));
    }

    console.log('User validation passed, redirecting with user data...');

    // Store user data in session or redirect with user info
    // For now, we'll redirect back to the main page with user data
    // You might want to store this in a session or database
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('user', JSON.stringify(userInfo));
    redirectUrl.searchParams.set('access_token', access_token);
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
} 