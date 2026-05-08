export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    const clientId = '1472707869257367676';
    const redirectUri = 'https://5fcd4430.architect-dashboard-v2.pages.dev/functions/auth-callback';
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    return Response.redirect(discordUrl);
  }

  // Exchange code for token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '1472707869257367676',
      client_secret: 'YOUR_DISCORD_CLIENT_SECRET',
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://5fcd4430.architect-dashboard-v2.pages.dev/functions/auth-callback',
    }),
  });

  const tokenData = await tokenRes.json();
  
  // Get user info
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  const userParam = encodeURIComponent(JSON.stringify({
    username: userData.username,
    avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
    id: userData.id,
  }));

  return Response.redirect(`https://5fcd4430.architect-dashboard-v2.pages.dev/?user=${userParam}`);
}