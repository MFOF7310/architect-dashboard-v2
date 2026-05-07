const DATA_URL = 'https://api.jsonbin.io/v3/b/69fd176aadc21f119a6b6924/latest';
const MASTER_KEY = '$2a$10$D6Z3kC4Zxmfqhzb64GPSfOmzZKuHCdJkf3XTrBIL3gpxVbQEEx2sK';

async function fetchData() {
  try {
    const res = await fetch(DATA_URL, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    const json = await res.json();
    return json.record;
  } catch(e) {
    return null;
  }
}

export async function getStats() {
  try {
    const data = await fetchData();
    return data?.stats || { guilds: 0, users: 0, commands: 0 };
  } catch(e) { return null; }
}

export async function getServers() {
  try {
    const data = await fetchData();
    return data?.servers || [];
  } catch(e) { return []; }
}

export async function getCommands() {
  try {
    const data = await fetchData();
    return data?.commands || [];
  } catch(e) { return []; }
}

export async function getServerSettings(guildId) {
  return null;
}

export async function updateServerSetting(guildId, setting, value) {
  return { success: false };
}

export async function pingAPI() {
  return { ping: 'pong!', node: 'BAMAKO_223', online: true };
}