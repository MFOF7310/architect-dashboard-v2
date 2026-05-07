const DATA_URL = 'https://api.jsonbin.io/v3/b/69fd176aadc21f119a6b6924/latest';
const MASTER_KEY = '$2a$10$9YXIuGhOisYzI8TLRKAzKeAELjWfZPFkAK7HDOjMkpzr9nF.xxLSG';

async function fetchData() {
  try {
    const res = await fetch(DATA_URL, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    if (!res.ok) throw new Error('Failed');
    const json = await res.json();
    return json.record;
  } catch(e) {
    return null;
  }
}

export async function getStats() {
  const data = await fetchData();
  return data?.stats || null;
}

export async function getServers() {
  const data = await fetchData();
  return data?.servers || [];
}

export async function getCommands() {
  const data = await fetchData();
  return data?.commands || [];
}

export async function getServerSettings(guildId) {
  const data = await fetchData();
  return data?.serverSettings?.[guildId] || null;
}

export async function updateServerSetting(guildId, setting, value) {
  const data = await fetchData();
  if (!data) return { success: false };
  if (!data.serverSettings) data.serverSettings = {};
  if (!data.serverSettings[guildId]) data.serverSettings[guildId] = {};
  data.serverSettings[guildId][setting] = value;
  
  try {
    await fetch(`https://api.jsonbin.io/v3/b/69fd176aadc21f119a6b6924`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY,
      },
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch(e) {
    return { success: false };
  }
}

export async function pingAPI() {
  return { ping: 'pong!', node: 'BAMAKO_223', online: true };
}