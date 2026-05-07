'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStats, getServers, getServerSettings, getCommands, updateServerSetting } from '@/lib/api';
import { getStore, translations } from '@/lib/store';
import './globals.css';

// ==================== MAIN DASHBOARD ====================
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [servers, setServers] = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [selectedServer, setSelectedServer] = useState('');
  const [serverSettings, setServerSettings] = useState(null);
  const [toast, setToast] = useState('');
  const [discordUser, setDiscordUser] = useState(null);
  const [adminMode, setAdminMode] = useState(false);

  const store = getStore();
  const t = translations[lang] || translations.en;

  useEffect(() => {
    setMounted(true);
    setLang(store.lang);
    setTheme(store.theme);
    const u = store.user;
    if (u) setDiscordUser(u);
    const am = localStorage.getItem('architect-admin') === 'true';
    setAdminMode(am);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [s, sv, c] = await Promise.all([getStats(), getServers(), getCommands()]);
      setStats(s); setServers(sv || []); setCommands(c || []); setError('');
    } catch { setError('Cannot connect to BAMAKO_223 API'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (mounted) { loadData(); const i = setInterval(loadData, 15000); return () => clearInterval(i); } }, [mounted, loadData]);

  async function loadSettings(gid) {
    try { const s = await getServerSettings(gid); setServerSettings(s); setSelectedServer(gid); }
    catch { showToast(t.settingError); }
  }

  async function handleSetting(s, v) {
    if (!selectedServer) return;
    try { await updateServerSetting(selectedServer, s, v); showToast(t.settingSaved); setServerSettings(p => p ? { ...p, [s]: v } : null); }
    catch { showToast(t.settingError); }
  }

  function showToast(m) { setToast(m); setTimeout(() => setToast(''), 3000); }

  function toggleTheme() { const nt = theme === 'dark' ? 'light' : 'dark'; setTheme(nt); store.setTheme(nt); }
  function toggleLang() { const nl = lang === 'en' ? 'fr' : 'en'; setLang(nl); store.setLang(nl); }

  function simulateDiscordLogin() {
    const fakeUser = { username: 'Architect_' + Math.random().toString(36).slice(2, 7), avatar: null, id: Math.random().toString(36).slice(2, 10) };
    setDiscordUser(fakeUser);
    store.setUser(fakeUser);
    setAdminMode(true);
    localStorage.setItem('architect-admin', 'true');
    showToast('✅ ' + (lang === 'fr' ? 'Connecté en tant qu\'administrateur' : 'Logged in as administrator'));
  }

  function logout() {
    setDiscordUser(null); store.clearUser(); setAdminMode(false);
    localStorage.removeItem('architect-admin');
    showToast(lang === 'fr' ? 'Déconnecté' : 'Logged out');
  }

  if (!mounted) return null;

  if (loading) {
    return (
      <div style={s.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--gold)', fontSize: '2rem' }}>🦅 ARCHITECT CG-223</h1>
          <p style={{ color: 'var(--green)' }}>{t.loading}</p>
          <div style={s.loadingBar}><div className="pulse" style={s.loadingFill} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--red)' }}>⚠️ {t.error}</h1>
          <p style={{ color: 'var(--text2)' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={s.retryBtn}>{t.retry}</button>
        </div>
      </div>
    );
  }

  const catCount = {};
  commands.forEach(c => { const cat = c.category || 'OTHER'; catCount[cat] = (catCount[cat] || 0) + 1; });

  const tabs = ['dashboard', 'servers', 'settings', 'commands'];
  if (adminMode) tabs.push('admin');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {toast && <div className="slide-down" style={s.toast}>{toast}</div>}

      {/* HEADER */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🦅</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--gold)' }}>ARCHITECT CG-223</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--green)' }}>📍 BAMAKO_223 🇲🇱</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stats ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
          <span style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>{t.online}</span>

          {discordUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 'bold' }}>
                {discordUser.username.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: 'var(--text2)', fontSize: '0.7rem' }}>{discordUser.username}</span>
              <button onClick={logout} style={s.smallBtn}>{t.logout}</button>
            </div>
          ) : (
            <button onClick={simulateDiscordLogin} style={{ ...s.smallBtn, background: '#5865F2', color: '#fff', border: 'none' }}>
              🔐 {t.discordLogin}
            </button>
          )}

          <button onClick={toggleLang} style={s.iconBtn}>{lang === 'en' ? '🇫🇷' : '🇬🇧'}</button>
          <button onClick={toggleTheme} style={s.iconBtn}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </header>

      {/* NAV */}
      <nav style={s.nav}>
        {tabs.map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ ...s.navBtn, ...(tab === tb ? s.navBtnActive : {}) }}>
            {{dashboard:'📊',servers:'🌍',settings:'⚙️',commands:'⚡',admin:'🔐'}[tb]} {t[tb] || tb.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        {tab === 'dashboard' && <DashboardTab stats={stats} servers={servers} catCount={catCount} t={t} lang={lang} />}
        {tab === 'servers' && <ServersTab servers={servers} t={t} />}
        {tab === 'settings' && <SettingsTab servers={servers} selected={selectedServer} settings={serverSettings} onSelect={loadSettings} onChange={handleSetting} t={t} lang={lang} />}
        {tab === 'commands' && <CommandsTab commands={commands} t={t} />}
        {tab === 'admin' && <AdminTab t={t} lang={lang} discordUser={discordUser} />}
      </main>

      {/* FOOTER */}
      <footer style={s.footer}>
        <p>🏗️ ARCHITECT CG-223 • {t.footer} • 🇲🇱</p>
        <p style={{ color: 'var(--gold)', marginTop: 5 }}>"{t.quote}"</p>
      </footer>
    </div>
  );
}

// ==================== TAB COMPONENTS ====================
function DashboardTab({ stats, servers, catCount, t, lang }) {
  if (!stats) return null;
  const d = Math.floor(stats.uptime / 86400);
  const h = Math.floor((stats.uptime % 86400) / 3600);
  const m = Math.floor((stats.uptime % 3600) / 60);

  return (
    <div className="fade-in">
      <div style={s.grid}>
        <Card emoji="🌍" label={t.servers} value={stats.guilds} color="var(--blue)" />
        <Card emoji="👥" label={t.users} value={stats.users?.toLocaleString()} color="var(--green)" />
        <Card emoji="⚡" label={t.commands} value={stats.commands} color="var(--purple)" />
        <Card emoji="📡" label="WS PING" value={`${stats.wsPing}ms`} color="var(--orange)" />
        <Card emoji="💾" label={t.heap} value={`${stats.memory?.heapUsed || 0} MB`} color="var(--red)" />
        <Card emoji="📊" label={t.dbSize} value={stats.database?.size || 'N/A'} color="#1abc9c" />
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>⏱️ {t.uptime}</h3>
        <p style={{ color: 'var(--green)', fontSize: '1.6rem', textAlign: 'center', margin: '10px 0' }}>{d}d {h}h {m}m</p>
      </div>

      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>🌍 {t.serversList} ({servers.length})</h3>
          {servers.slice(0, 8).map((sv, i) => (
            <div key={sv.id} style={s.row}>
              <span>#{i+1} {sv.name?.substring(0, 28)}</span>
              <span style={{ color: 'var(--green)', fontSize: '0.8rem' }}>{sv.members?.toLocaleString()} 👥</span>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>⚡ {t.commandsList}</h3>
          {Object.entries(catCount).map(([cat, cnt]) => (
            <div key={cat} style={s.row}>
              <span>📂 {cat}</span>
              <span style={{ color: 'var(--purple)', fontSize: '0.8rem' }}>{cnt} {lang === 'fr' ? 'cmd' : 'cmds'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServersTab({ servers, t }) {
  return (
    <div className="fade-in">
      <div style={s.grid}>
        {servers.map(sv => (
          <div key={sv.id} style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {sv.icon ? <img src={sv.icon} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : '🌍'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--gold)', fontSize: '0.9rem' }}>{sv.name}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text2)' }}>ID: {sv.id}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text2)' }}>
              <span>👥 {sv.members?.toLocaleString()}</span>
              <span>⭐ T{sv.boostTier || 0}</span>
            </div>
          </div>
        ))}
      </div>
      {servers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>{t.noServers}</p>}
    </div>
  );
}

function SettingsTab({ servers, selected, settings, onSelect, onChange, t, lang }) {
  return (
    <div className="fade-in">
      <div style={s.card}>
        <h3 style={s.cardTitle}>🖥️ {lang === 'fr' ? 'SÉLECTIONNER UN SERVEUR' : 'SELECT SERVER'}</h3>
        <select value={selected} onChange={e => onSelect(e.target.value)} style={s.select}>
          <option value="">-- {t.selectServer} --</option>
          {servers.map(sv => <option key={sv.id} value={sv.id}>{sv.name} ({sv.members})</option>)}
        </select>
      </div>

      {settings && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>⚙️ {lang === 'fr' ? 'PARAMÈTRES' : 'SETTINGS'}</h3>
          <SettingRow label={t.prefix} value={settings.prefix} onChange={v => onChange('prefix', v)} />
          <SettingRow label={`${t.xpMultiplier} (0.5-5.0)`} value={String(settings.xpMultiplier)} onChange={v => onChange('xpboost', v)} type="number" />
          <SettingRow label={`${t.xpCooldown}`} value={String(settings.xpCooldown)} onChange={v => onChange('xp_cooldown', v)} type="number" />
          <ToggleRow label={t.afkEnabled} value={settings.afkEnabled} onChange={v => onChange('afk', v ? '1' : '0')} />
          <ToggleRow label={t.marketEnabled} value={settings.marketEnabled} onChange={v => onChange('marketenabled', v ? '1' : '0')} />
          <ToggleRow label={t.aiEnabled} value={settings.aiEnabled} onChange={v => onChange('ai', v ? '1' : '0')} />
          <ToggleRow label={t.autoModEnabled} value={settings.autoModEnabled} onChange={v => onChange('automod', v ? '1' : '0')} />
          <div style={{ marginTop: 15, padding: 10, background: 'var(--border)', borderRadius: 'var(--radius)', fontSize: '0.7rem', color: 'var(--text2)' }}>
            💡 {lang === 'fr' ? 'Modifications instantanées sur le bot.' : 'Changes applied instantly to the bot.'}
          </div>
        </div>
      )}
    </div>
  );
}

function CommandsTab({ commands, t }) {
  return (
    <div className="fade-in">
      <div style={s.grid}>
        {commands.map(cmd => (
          <div key={cmd.name} style={{ ...s.card, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>.{cmd.name}</span>
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 10, background: cmd.hasSlash ? 'var(--green)22' : 'var(--text2)22', color: cmd.hasSlash ? 'var(--green)' : 'var(--text2)' }}>
                {cmd.hasSlash ? 'SLASH' : 'TEXT'}
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text2)', margin: '4px 0' }}>{cmd.description || 'No description'}</p>
            <span style={{ fontSize: '0.6rem', color: 'var(--purple)' }}>📂 {cmd.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTab({ t, lang, discordUser }) {
  return (
    <div className="fade-in">
      <div style={s.card}>
        <h3 style={s.cardTitle}>🔐 {lang === 'fr' ? 'PANNEAU ADMIN' : 'ADMIN PANEL'}</h3>
        {discordUser ? (
          <div>
            <p style={{ color: 'var(--green)', marginBottom: 15 }}>
              ✅ {t.loggedAs}: <strong>{discordUser.username}</strong>
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 15, background: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <p style={{ color: 'var(--gold)', fontWeight: 'bold', marginBottom: 5 }}>
                  {lang === 'fr' ? '🛡️ Permissions' : '🛡️ Permissions'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                  {lang === 'fr' ? 'Accès complet aux paramètres du serveur' : 'Full access to server settings'}
                </p>
              </div>
              <div style={{ padding: 15, background: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <p style={{ color: 'var(--gold)', fontWeight: 'bold', marginBottom: 5 }}>
                  {lang === 'fr' ? '📋 Logs' : '📋 Logs'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                  {lang === 'fr' ? 'Consultez les journaux de modération' : 'View moderation logs'}
                </p>
              </div>
              <div style={{ padding: 15, background: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <p style={{ color: 'var(--gold)', fontWeight: 'bold', marginBottom: 5 }}>
                  {lang === 'fr' ? '🔄 Synchronisation' : '🔄 Sync'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                  {lang === 'fr' ? 'Paramètres synchronisés en temps réel' : 'Settings synced in real-time'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text2)' }}>{lang === 'fr' ? 'Connectez-vous pour accéder au panneau admin' : 'Login to access admin panel'}</p>
        )}
      </div>
    </div>
  );
}

// ==================== REUSABLE COMPONENTS ====================
function Card({ emoji, label, value, color }) {
  return (
    <div style={{ ...s.card, textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <div style={{ color, fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: 'var(--text2)', fontSize: '0.65rem', marginTop: 5 }}>{label}</div>
    </div>
  );
}

function SettingRow({ label, value, onChange, type = 'text' }) {
  return (
    <div style={s.settingRow}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{label}</span>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} style={s.input} />
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={s.settingRow}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ ...s.toggle, background: value ? 'var(--green)' : '#555' }}>
        <span style={{ marginLeft: value ? 20 : 2, transition: 'all 0.3s', fontSize: '0.6rem' }}>●</span>
      </button>
    </div>
  );
}

// ==================== STYLES ====================
const s = {
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' },
  loadingBar: { width: 200, height: 4, background: 'var(--border)', margin: '20px auto', borderRadius: 2, overflow: 'hidden' },
  loadingFill: { width: '60%', height: '100%', background: 'var(--gold)', borderRadius: 2 },
  retryBtn: { marginTop: 20, padding: '12px 40px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 'bold' },
  toast: { position: 'fixed', top: 20, right: 20, zIndex: 1000, padding: '12px 24px', borderRadius: 'var(--radius)', background: 'var(--green)', color: '#000', fontWeight: 'bold', fontSize: '0.85rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--bg2)', borderBottom: '2px solid var(--gold)', flexWrap: 'wrap', gap: 10 },
  iconBtn: { padding: '6px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem' },
  smallBtn: { padding: '4px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text)' },
  nav: { display: 'flex', gap: 4, padding: '8px 20px', background: 'var(--bg2)', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' },
  navBtn: { padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text2)', transition: 'all 0.2s' },
  navBtnActive: { background: 'var(--gold)', color: '#000', borderColor: 'var(--gold)', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 },
  card: { background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 16, border: '1px solid var(--border)' },
  cardTitle: { color: 'var(--gold)', margin: '0 0 12px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text2)' },
  select: { width: '100%', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer', marginTop: 8 },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  input: { padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: '0.8rem', width: 100, textAlign: 'right' },
  toggle: { width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2, transition: 'all 0.3s', color: '#fff' },
  footer: { textAlign: 'center', padding: '15px', borderTop: '1px solid var(--border)', color: 'var(--text2)', fontSize: '0.65rem', marginTop: 30 },
};