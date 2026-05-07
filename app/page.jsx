'use client';

import { useEffect, useState } from 'react';

const DATA_URL = 'https://api.jsonbin.io/v3/b/69fd176aadc21f119a6b6924/latest';
const MASTER_KEY = '$2a$10$D6Z3kC4Zxmfqhzb64GPSfOmzZKuHCdJkf3XTrBIL3gpxVbQEEx2sK';

export default function SimpleDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(DATA_URL, {
          headers: { 'X-Master-Key': MASTER_KEY }
        });
        const json = await res.json();
        setStats(json.record.stats);
      } catch(e) {
        setError(e.message);
      }
    }
    load();
  }, []);

  if (error) return <div style={{ color: 'red', padding: 20 }}>Error: {error}</div>;
  if (!stats) return <div style={{ color: '#ffd700', padding: 20 }}>Loading...</div>;

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', padding: 20, minHeight: '100vh', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#ffd700' }}>🦅 ARCHITECT CG-223</h1>
      <p style={{ color: '#2ecc71' }}>📍 BAMAKO_223 🇲🇱</p>
      <hr style={{ borderColor: '#333' }} />
      <p>🌍 Servers: <strong>{stats.guilds}</strong></p>
      <p>👥 Users: <strong>{stats.users}</strong></p>
      <p>⚡ Commands: <strong>{stats.commands}</strong></p>
      <p>📡 Ping: <strong>{stats.wsPing}ms</strong></p>
      <p>💾 Heap: <strong>{stats.memory?.heapUsed} MB</strong></p>
    </div>
  );
}