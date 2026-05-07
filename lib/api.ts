const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export interface BotStats {
  guilds: number;
  users: number;
  commands: number;
  aliases: number;
  wsPing: number;
  uptime: number;
  version?: string;
  memory: { heapUsed: string; heapTotal: string; rss: string };
  database: { size: string; walSize: string };
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  members: number;
  ownerId: string;
  boostTier: number;
}

export interface ServerSettings {
  prefix: string;
  language: string;
  welcomeChannel: string | null;
  goodbyeChannel: string | null;
  logChannel: string | null;
  xpMultiplier: number;
  xpCooldown: number;
  afkEnabled: boolean;
  marketEnabled: boolean;
  aiEnabled: boolean;
  autoModEnabled: boolean;
  [key: string]: any;
}

export interface Command {
  name: string;
  category: string;
  description: string;
  aliases: string[];
  hasSlash: boolean;
}

async function fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getStats(): Promise<BotStats> {
  return fetchAPI('/api/stats');
}

export async function getServers(): Promise<Server[]> {
  return fetchAPI('/api/servers');
}

export async function getServerSettings(guildId: string): Promise<ServerSettings> {
  return fetchAPI(`/api/settings/${guildId}`);
}

export async function updateServerSetting(guildId: string, setting: string, value: any) {
  return fetchAPI(`/api/settings/${guildId}`, 'PUT', { setting, value });
}

export async function getCommands(): Promise<Command[]> {
  return fetchAPI('/api/commands');
}

export async function pingAPI() {
  const res = await fetch(`${API_URL}/api/ping`);
  return res.json();
}