export const translations = {
  en: {
    dashboard: 'DASHBOARD', servers: 'SERVERS', settings: 'SETTINGS',
    commands: 'COMMANDS', admin: 'ADMIN', online: 'ONLINE', offline: 'OFFLINE',
    memory: 'MEMORY', uptime: 'UPTIME', ping: 'PING', save: 'SAVE',
    cancel: 'CANCEL', refresh: 'REFRESH', loading: 'Connecting to BAMAKO_223...',
    error: 'CONNECTION LOST', retry: 'RETRY', theme: 'THEME', language: 'LANGUE',
    dark: 'DARK', light: 'LIGHT', serversList: 'CONNECTED SERVERS',
    commandsList: 'COMMAND CATEGORIES', members: 'Members', boost: 'Boost Tier',
    selectServer: 'Select a server to manage', noServers: 'No servers connected',
    settingSaved: '✅ Setting saved!', settingError: '❌ Failed to save',
    prefix: 'Prefix', xpMultiplier: 'XP Multiplier', xpCooldown: 'XP Cooldown (s)',
    afkEnabled: 'AFK System', marketEnabled: 'Market', aiEnabled: 'Lydia AI',
    autoModEnabled: 'Auto Mod', enabled: 'Enabled', disabled: 'Disabled',
    discordLogin: 'Login with Discord', logout: 'Logout', loggedAs: 'Logged in as',
    footer: 'Built by Moussa Fofana • Bamako, Mali',
    quote: 'The grid adapts. The grid survives. The grid prevails.',
    users: 'USERS', dbSize: 'DB SIZE', heap: 'HEAP',
  },
  fr: {
    dashboard: 'TABLEAU DE BORD', servers: 'SERVEURS', settings: 'PARAMÈTRES',
    commands: 'COMMANDES', admin: 'ADMIN', online: 'EN LIGNE', offline: 'HORS LIGNE',
    memory: 'MÉMOIRE', uptime: 'DISPONIBILITÉ', ping: 'LATENCE', save: 'SAUVEGARDER',
    cancel: 'ANNULER', refresh: 'ACTUALISER', loading: 'Connexion au nœud BAMAKO_223...',
    error: 'CONNEXION PERDUE', retry: 'RÉESSAYER', theme: 'THÈME', language: 'LANGUAGE',
    dark: 'SOMBRE', light: 'CLAIR', serversList: 'SERVEURS CONNECTÉS',
    commandsList: 'CATÉGORIES', members: 'Membres', boost: 'Niveau Boost',
    selectServer: 'Sélectionnez un serveur', noServers: 'Aucun serveur',
    settingSaved: '✅ Paramètre sauvegardé!', settingError: '❌ Échec sauvegarde',
    prefix: 'Préfixe', xpMultiplier: 'Multiplicateur XP', xpCooldown: 'Cooldown XP (s)',
    afkEnabled: 'Système AFK', marketEnabled: 'Marché', aiEnabled: 'Lydia AI',
    autoModEnabled: 'Auto Mod', enabled: 'Activé', disabled: 'Désactivé',
    discordLogin: 'Connexion Discord', logout: 'Déconnexion', loggedAs: 'Connecté en tant que',
    footer: 'Construit par Moussa Fofana • Bamako, Mali',
    quote: 'La grille s\'adapte. La grille survit. La grille prévaut.',
    users: 'UTILISATEURS', dbSize: 'TAILLE DB', heap: 'MÉMOIRE',
  }
};

export function getStore() {
  if (typeof window === 'undefined') return { lang: 'en', theme: 'dark' };
  return {
    get lang() { return localStorage.getItem('architect-lang') || 'en'; },
    get theme() { return localStorage.getItem('architect-theme') || 'dark'; },
    setLang(v) { localStorage.setItem('architect-lang', v); },
    setTheme(v) { localStorage.setItem('architect-theme', v); document.documentElement.setAttribute('data-theme', v); },
    get user() { try { return JSON.parse(localStorage.getItem('architect-user')); } catch { return null; } },
    setUser(v) { localStorage.setItem('architect-user', JSON.stringify(v)); },
    clearUser() { localStorage.removeItem('architect-user'); },
  };
}