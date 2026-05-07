const API_URL = '';
const API_KEY = 'ArchitectBamako223/2025';

async function fetchAPI(endpoint, method = 'GET', body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(endpoint, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getStats() { return fetchAPI('/api/stats'); }
export async function getServers() { return fetchAPI('/api/servers'); }
export async function getServerSettings(guildId) { return fetchAPI(`/api/settings/${guildId}`); }
export async function updateServerSetting(guildId, setting, value) {
  return fetchAPI(`/api/settings/${guildId}`, 'PUT', { setting, value });
}
export async function getCommands() { return fetchAPI('/api/commands'); }
export async function pingAPI() {
  const res = await fetch('/api/ping');
  return res.json();
}