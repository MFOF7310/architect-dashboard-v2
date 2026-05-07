const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { code } = event.queryStringParameters || {};

  if (!code) {
    // Redirect to Discord login
    const clientId = process.env.DISCORD_CLIENT_ID || '1472707869257367676';
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://architect-cg-223.netlify.app/.netlify/functions/auth-callback';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    
    return {
      statusCode: 302,
      headers: { Location: discordAuthUrl },
    };
  }

  // Exchange code for token
  const clientId = process.env.DISCORD_CLIENT_ID || '1472707869257367676';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://architect-cg-223.netlify.app/.netlify/functions/auth-callback';

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: tokenData.error_description || 'OAuth failed' }),
      };
    }

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    // Store in cookie-safe format & redirect to dashboard
    const userParam = encodeURIComponent(JSON.stringify({
      username: userData.username,
      avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
      id: userData.id,
    }));

    return {
      statusCode: 302,
      headers: {
        Location: `/?user=${userParam}`,
        'Set-Cookie': `architect_user=${encodeURIComponent(JSON.stringify({ username: userData.username, id: userData.id }))}; Path=/; Max-Age=86400; SameSite=Lax`,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OAuth failed' }),
    };
  }
};