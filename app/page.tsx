'use client';

import { useEffect, useState } from 'react';
import { getStats, getServers, getServerSettings, getCommands, updateServerSetting, BotStats, Server, ServerSettings, Command } from '@/lib/api';
import { getStore, translations } from '@/lib/store';
import './globals.css';

type Tab = 'dashboard' | 'servers' | 'settings' | 'commands';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [serverSettings, setServerSettings] = useState<ServerSettings | null>(null);
  const [toast, setToast] = useState('');

  const store = getStore();
  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    setLang(store.language);
    setTheme(store.theme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  async function loadData() {
    try {
      const [s, sv, c] = await Promise.all([
        getStats(),
        getServers(),
        getCommands(),
      ]);
      setStats(s);
      setServers(sv || []);
      setCommands(c || []);
      setError('');
    } catch (e) {
      setError('Cannot connect to BAMAKO_223 API');
    } finally {
      setLoading(false);
    }
  }

  async function loadServerSettings(guildId: string) {
    try {
      const settings = await getServerSettings(guildId);
      setServerSettings(settings);
      setSelectedServer(guildId);
    } catch (e) {
      showToast(t.settingError);
    }
  }

  async function handleSettingChange(setting: string, value: any) {
    if (!selectedServer) return;
    try {
      await updateServerSetting(selectedServer, setting, value);
      showToast(t.settingSaved);
      setServerSettings((prev: any) => prev ? { ...prev, [setting]: value } : null);
    } catch (e) {
      showToast(t.settingError);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    store.setTheme(newTheme);
  }

  function toggleLang() {
    const newLang = lang === 'en' ? 'fr' : 'en';
    setLang(newLang);
    store.setLanguage(newLang);
  }

  if (!mounted) return null;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-gold)', fontSize: '2rem' }}>🦅 ARCHITECT CG-223</h1>
          <p style={{ color: 'var(--accent-green)' }}>{t.loading}</p>
          <div style={styles.loadingBar}>
            <div className="pulse" style={styles.loadingFill} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-red)' }}>⚠️ {t.error}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  const categoryCount: Record<string, number> = {};
  commands.forEach((c: Command) => {
    const cat = c.category || 'OTHER';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* TOAST */}
      {toast && (
        <div style={styles.toast} className="slide-in">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: '1.5rem' }}>🦅</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-gold)' }}>ARCHITECT CG-223</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accent-green)' }}>📍 BAMAKO_223 🇲🇱</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={{ ...styles.statusDot, background: stats ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: 15 }}>{t.online}</span>
          <button onClick={toggleLang} style={styles.iconBtn} title={t.language}>
            {lang === 'en' ? '🇫🇷' : '🇬🇧'}
          </button>
          <button onClick={toggleTheme} style={styles.iconBtn} title={t.theme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* NAV TABS */}
      <nav style={styles.nav}>
        {(['dashboard', 'servers', 'settings', 'commands'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.navBtn,
              ...(activeTab === tab ? styles.navBtnActive : {}),
            }}
          >
            {tab === 'dashboard' && '📊'} {tab === 'servers' && '🌍'} {tab === 'settings' && '⚙️'} {tab === 'commands' && '⚡'}
            {' '}{t[tab]}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} servers={servers} commands={commands} categoryCount={categoryCount} t={t} lang={lang} />
        )}
        {activeTab === 'servers' && (
          <ServersTab servers={servers} t={t} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            servers={servers}
            selectedServer={selectedServer}
            serverSettings={serverSettings}
            onSelectServer={loadServerSettings}
            onSettingChange={handleSettingChange}
            t={t}
            lang={lang}
          />
        )}
        {activeTab === 'commands' && (
          <CommandsTab commands={commands} t={t} />
        )}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>🏗️ ARCHITECT CG-223 • {t.footer} • 🇲🇱</p>
        <p style={{ color: 'var(--accent-gold)', marginTop: 5 }}>"{t.quote}"</p>
      </footer>
    </div>
  );
}

// ==================== DASHBOARD TAB ====================
function DashboardTab({ stats, servers, commands, categoryCount, t, lang }: any) {
  if (!stats) return null;

  const uptimeDays = Math.floor(stats.uptime / 86400);
  const uptimeHours = Math.floor((stats.uptime % 86400) / 3600);
  const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60);

  return (
    <div className="fade-in">
      {/* STAT CARDS */}
      <div style={styles.cardGrid}>
        <StatCard emoji="🌍" label={lang === 'fr' ? 'SERVEURS' : 'SERVERS'} value={stats.guilds} color="var(--accent-blue)" />
        <StatCard emoji="👥" label={lang === 'fr' ? 'UTILISATEURS' : 'USERS'} value={stats.users?.toLocaleString()} color="var(--accent-green)" />
        <StatCard emoji="⚡" label={lang === 'fr' ? 'COMMANDES' : 'COMMANDS'} value={stats.commands} color="var(--accent-purple)" />
        <StatCard emoji="📡" label="WS PING" value={`${stats.wsPing}ms`} color="var(--accent-orange)" />
        <StatCard emoji="💾" label={lang === 'fr' ? 'MÉMOIRE' : 'HEAP'} value={`${stats.memory?.heapUsed || 0} MB`} color="var(--accent-red)" />
        <StatCard emoji="📊" label="DB" value={stats.database?.size || 'N/A'} color="#1abc9c" />
      </div>

      {/* UPTIME */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>⏱️ {t.uptime}</h3>
        <p style={{ color: 'var(--accent-green)', fontSize: '1.8rem', margin: '10px 0', textAlign: 'center' }}>
          {uptimeDays}d {uptimeHours}h {uptimeMinutes}m
        </p>
      </div>

      {/* SERVERS + COMMANDS */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🌍 {t.serversList} ({servers.length})</h3>
          {servers.slice(0, 8).map((s: Server, i: number) => (
            <div key={s.id} style={styles.listItem}>
              <span>#{i + 1} {s.name.substring(0, 30)}</span>
              <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem' }}>{s.members?.toLocaleString()} 👥</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚡ {t.commandsList}</h3>
          {Object.entries(categoryCount).map(([cat, count]: any) => (
            <div key={cat} style={styles.listItem}>
              <span>📂 {cat}</span>
              <span style={{ color: 'var(--accent-purple)', fontSize: '0.8rem' }}>{count} commands</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== SERVERS TAB ====================
function ServersTab({ servers, t }: { servers: Server[]; t: any }) {
  return (
    <div className="fade-in">
      <div style={styles.cardGrid}>
        {servers.map((server: Server) => (
          <div key={server.id} style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {server.icon ? (
                <img src={server.icon} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌍</div>
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-gold)' }}>{server.name}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {server.id}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>👥 {server.members?.toLocaleString()}</span>
              <span>⭐ Tier {server.boostTier || 0}</span>
            </div>
          </div>
        ))}
      </div>
      {servers.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>{t.noServers}</p>
      )}
    </div>
  );
}

// ==================== SETTINGS TAB ====================
function SettingsTab({ servers, selectedServer, serverSettings, onSelectServer, onSettingChange, t, lang }: any) {
  return (
    <div className="fade-in">
      {/* SERVER SELECTOR */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🖥️ {lang === 'fr' ? 'SÉLECTIONNER UN SERVEUR' : 'SELECT SERVER'}</h3>
        <select
          value={selectedServer}
          onChange={(e) => onSelectServer(e.target.value)}
          style={styles.select}
        >
          <option value="">-- {t.selectServer} --</option>
          {servers.map((s: Server) => (
            <option key={s.id} value={s.id}>{s.name} ({s.members} members)</option>
          ))}
        </select>
      </div>

      {/* SETTINGS FORM */}
      {serverSettings && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚙️ {lang === 'fr' ? 'PARAMÈTRES' : 'SETTINGS'} - {servers.find((s: Server) => s.id === selectedServer)?.name}</h3>
          
          <div style={styles.settingGrid}>
            <SettingRow label={t.prefix} value={serverSettings.prefix} onChange={(v: string) => onSettingChange('prefix', v)} />
            <SettingRow label={`${t.xpMultiplier} (0.5-5.0)`} value={String(serverSettings.xpMultiplier)} onChange={(v: string) => onSettingChange('xpboost', v)} type="number" />
            <SettingRow label={`${t.xpCooldown}`} value={String(serverSettings.xpCooldown)} onChange={(v: string) => onSettingChange('xp_cooldown', v)} type="number" />
            
            <ToggleRow label={t.afkEnabled} value={serverSettings.afkEnabled} onChange={(v: boolean) => onSettingChange('afk', v ? '1' : '0')} />
            <ToggleRow label={t.marketEnabled} value={serverSettings.marketEnabled} onChange={(v: boolean) => onSettingChange('marketenabled', v ? '1' : '0')} />
            <ToggleRow label={t.aiEnabled} value={serverSettings.aiEnabled} onChange={(v: boolean) => onSettingChange('ai', v ? '1' : '0')} />
            <ToggleRow label={t.autoModEnabled} value={serverSettings.autoModEnabled} onChange={(v: boolean) => onSettingChange('automod', v ? '1' : '0')} />
          </div>

          <div style={{ marginTop: 15, padding: 10, background: 'var(--bg-hover)', borderRadius: 'var(--radius)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 {lang === 'fr' ? 'Les modifications sont appliquées instantanément au bot.' : 'Changes are applied instantly to the bot.'}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMMANDS TAB ====================
function CommandsTab({ commands, t }: { commands: Command[]; t: any }) {
  return (
    <div className="fade-in">
      <div style={styles.cardGrid}>
        {commands.map((cmd: Command) => (
          <div key={cmd.name} style={{ ...styles.card, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>.{cmd.name}</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, background: cmd.hasSlash ? 'var(--accent-green)22' : 'var(--text-muted)22', color: cmd.hasSlash ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {cmd.hasSlash ? 'SLASH' : 'PREFIX'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
              {cmd.description || 'No description'}
            </p>
            <div style={{ marginTop: 5 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-purple)' }}>📂 {cmd.category}</span>
              {cmd.aliases?.length > 0 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 10 }}>
                  🔀 {cmd.aliases.slice(0, 3).join(', ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== REUSABLE COMPONENTS ====================
function StatCard({ emoji, label, value, color }: any) {
  return (
    <div style={{ ...styles.card, textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <div style={{ color, fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 5 }}>{label}</div>
    </div>
  );
}

function SettingRow({ label, value, onChange, type = 'text' }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function ToggleRow({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          ...styles.toggle,
          background: value ? 'var(--accent-green)' : 'var(--text-muted)',
        }}
      >
        <span style={{ marginLeft: value ? 20 : 2, transition: 'all 0.3s' }}>●</span>
      </button>
    </div>
  );
}

// ==================== STYLES ====================
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: 'var(--bg-primary)',
  },
  loadingBar: {
    width: 200, height: 4, background: 'var(--bg-hover)',
    margin: '20px auto', borderRadius: 2, overflow: 'hidden',
  },
  loadingFill: {
    width: '60%', height: '100%',
    background: 'var(--accent-gold)', borderRadius: 2,
  },
  retryBtn: {
    marginTop: 20, padding: '12px 40px',
    background: 'var(--accent-gold)', color: '#000',
    border: 'none', borderRadius: 'var(--radius)',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
  },
  toast: {
    position: 'fixed', top: 20, right: 20, zIndex: 1000,
    padding: '12px 24px', borderRadius: 'var(--radius)',
    background: 'var(--accent-green)', color: '#000',
    fontWeight: 'bold', fontSize: '0.85rem',
    boxShadow: 'var(--shadow)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', background: 'var(--bg-secondary)',
    borderBottom: '2px solid var(--accent-gold)',
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  statusDot: {
    width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
  },
  iconBtn: {
    padding: '8px 12px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'transparent',
    cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-primary)',
  },
  nav: {
    display: 'flex', gap: 5, padding: '10px 20px',
    background: 'var(--bg-secondary)', flexWrap: 'wrap',
    borderBottom: '1px solid var(--border)',
  },
  navBtn: {
    padding: '10px 18px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'transparent',
    cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)',
    transition: 'var(--transition)',
  },
  navBtnActive: {
    background: 'var(--accent-gold)', color: '#000',
    borderColor: 'var(--accent-gold)', fontWeight: 'bold',
  },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 15, marginBottom: 20,
  },
  card: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius)',
    padding: 20, border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
  },
  cardTitle: {
    color: 'var(--accent-gold)', margin: '0 0 15px',
    fontSize: '0.9rem', textTransform: 'uppercase',
  },
  twoCol: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20,
  },
  listItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border-light)',
    fontSize: '0.8rem', color: 'var(--text-secondary)',
  },
  select: {
    width: '100%', padding: '12px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
    marginTop: 10,
  },
  settingGrid: {
    marginTop: 10,
  },
  input: {
    padding: '8px 12px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '0.85rem', width: 120,
    textAlign: 'right' as const,
  },
  toggle: {
    width: 48, height: 26, borderRadius: 13, border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    padding: 2, transition: 'all 0.3s', color: '#fff', fontSize: '0.7rem',
  },
  footer: {
    textAlign: 'center', padding: '20px',
    borderTop: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: '0.7rem',
    marginTop: 40,
  },
};