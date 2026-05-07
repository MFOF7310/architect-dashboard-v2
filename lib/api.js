const API_URL = 'http://prem-eu1.bot-hosting.net:20582';
const API_KEY = 'ArchitectBamako223/2025';

async function fetchAPI(endpoint, method = 'GET', body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    mode: 'cors',
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API_URL}${endpoint}`, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch(e) {
    console.error('API Error:', e);
    return null;
  }
}

export async function getStats() { return fetchAPI('/api/stats'); }
export async function getServers() { return fetchAPI('/api/servers'); }
export async function getServerSettings(guildId) { return fetchAPI(`/api/settings/${guildId}`); }
export async function updateServerSetting(guildId, setting, value) {
  return fetchAPI(`/api/settings/${guildId}`, 'PUT', { setting, value });
}
export async function getCommands() { return fetchAPI('/api/commands'); }
export async function pingAPI() {
  const res = await fetch(`${API_URL}/api/ping`);
  return res.json();
}