'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      textAlign: 'center',
      background: '#0a0a0a'
    }}>
      <h1 style={{ color: '#ffd700', fontSize: '2rem' }}>🦅 ARCHITECT CG-223</h1>
      <p style={{ color: '#2ecc71' }}>📍 BAMAKO_223 🇲🇱</p>
      <p style={{ color: '#888' }}>Dashboard is live!</p>
    </div>
  );
}