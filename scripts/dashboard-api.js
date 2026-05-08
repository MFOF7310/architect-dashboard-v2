const fetch = require('node-fetch');

module.exports = function setupDashboardAPI(app, client, db) {
    
    // ==================== PUBLIC ENDPOINTS ====================
    
    // Health check — no auth needed
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ONLINE',
            node: 'BAMAKO_223',
            uptime: process.uptime(),
            servers: client.guilds.cache.size,
            users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            commands: client.commands.size,
            memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
            wsPing: client.ws.ping
        });
    });
    
    // ==================== AUTH ENDPOINTS ====================
    
    // Login redirect
    app.get('/api/login', (req, res) => {
        const url = 'https://discord.com/api/oauth2/authorize?' +
            `client_id=${process.env.CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(process.env.DASHBOARD_REDIRECT || 'https://architect-dashboard-v2.pages.dev/callback')}` +
            '&response_type=code' +
            '&scope=identify%20guilds';
        res.redirect(url);
    });
    
    // OAuth2 callback — Discord sends user here after login
    app.get('/callback', async (req, res) => {
        const { code } = req.query;
        if (!code) return res.status(400).send('Missing authorization code');
        
        try {
            // Exchange code for access token
            const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: process.env.DASHBOARD_REDIRECT || 'https://architect-dashboard-v2.pages.dev/callback'
                })
            });
            
            const tokenData = await tokenRes.json();
            
            if (tokenData.error) {
                return res.status(400).send(`OAuth error: ${tokenData.error_description}`);
            }
            
            // Set token as HTTP-only cookie
            res.cookie('discord_token', tokenData.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Redirect to dashboard home
            res.redirect('/');
            
        } catch (err) {
            res.status(500).send('Authentication failed');
        }
    });
    
    // Logout
    app.get('/api/logout', (req, res) => {
        res.clearCookie('discord_token');
        res.redirect('/');
    });
    
    // ==================== AUTH MIDDLEWARE ====================
    
    async function requireAuth(req, res, next) {
        const token = req.cookies?.discord_token;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });
        
        try {
            const userRes = await fetch('https://discord.com/api/users/@me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!userRes.ok) return res.status(401).json({ error: 'Invalid session' });
            
            req.user = await userRes.json();
            req.token = token;
            next();
        } catch {
            res.status(401).json({ error: 'Auth failed' });
        }
    }
    
    // ==================== PROTECTED ENDPOINTS ====================
    
    // Current user info
    app.get('/api/me', requireAuth, (req, res) => {
        res.json(req.user);
    });
    
    // User's servers (only ones they manage + bot is in)
    app.get('/api/servers', requireAuth, async (req, res) => {
        try {
            const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: { 'Authorization': `Bearer ${req.token}` }
            });
            const userGuilds = await guildsRes.json();
            
            // Filter: user must have MANAGE_GUILD (0x20) AND bot must be in the server
            const managed = userGuilds
                .filter(g => (g.permissions & 0x20) === 0x20)
                .filter(g => client.guilds.cache.has(g.id))
                .map(g => {
                    const botGuild = client.guilds.cache.get(g.id);
                    return {
                        id: g.id,
                        name: g.name,
                        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
                        members: botGuild?.memberCount || 0,
                        owner: g.owner
                    };
                });
            
            res.json(managed);
        } catch {
            res.status(500).json({ error: 'Failed to fetch servers' });
        }
    });
    
    // Server settings (GET)
    app.get('/api/server/:guildId/settings', requireAuth, async (req, res) => {
        const { guildId } = req.params;
        
        // Verify user has MANAGE_GUILD in this server
        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { 'Authorization': `Bearer ${req.token}` }
        });
        const userGuilds = await guildsRes.json();
        const userGuild = userGuilds.find(g => g.id === guildId);
        
        if (!userGuild || (userGuild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'You do not manage this server' });
        }
        
        const settings = client.getServerSettings(guildId);
        res.json(settings);
    });
    
    // Server settings (POST) — instant sync
    app.post('/api/server/:guildId/settings', requireAuth, async (req, res) => {
        const { guildId } = req.params;
        const { setting, value } = req.body;
        
        // Verify user has MANAGE_GUILD
        const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { 'Authorization': `Bearer ${req.token}` }
        });
        const userGuilds = await guildsRes.json();
        const userGuild = userGuilds.find(g => g.id === guildId);
        
        if (!userGuild || (userGuild.permissions & 0x20) !== 0x20) {
            return res.status(403).json({ error: 'You do not manage this server' });
        }
        
        const success = client.updateServerSetting(guildId, setting, value);
        if (success) {
            res.json({ ok: true, setting, value });
        } else {
            res.status(400).json({ error: 'Invalid setting' });
        }
    });
    
    console.log('\x1b[36m[DASHBOARD]\x1b[0m API routes registered');
};