const API_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('http://prem-eu1.bot-hosting.net:20582');
const API_KEY = 'ArchitectBamako223/2025';

async function fetchAPI(endpoint, method = 'GET', body) {
  const url = `${API_URL}${endpoint}`;
  const opts = {
    method,
    headers: { 
      'Content-Type': 'application/json', 
      'x-api-key': API_KEY,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return JSON.parse(text);
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
  const text = await res.text();
  return JSON.parse(text);
}