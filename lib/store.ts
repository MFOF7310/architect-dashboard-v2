// Simple state store for language & theme
type Store = {
  language: 'en' | 'fr';
  theme: 'dark' | 'light';
  setLanguage: (lang: 'en' | 'fr') => void;
  setTheme: (theme: 'dark' | 'light') => void;
};

// Client-side store
export function getStore(): Store {
  if (typeof window === 'undefined') {
    return { language: 'en', theme: 'dark', setLanguage: () => {}, setTheme: () => {} };
  }
  
  return {
    get language() {
      return (localStorage.getItem('architect-lang') as 'en' | 'fr') || 'en';
    },
    get theme() {
      return (localStorage.getItem('architect-theme') as 'dark' | 'light') || 'dark';
    },
    setLanguage(lang: 'en' | 'fr') {
      localStorage.setItem('architect-lang', lang);
      window.location.reload();
    },
    setTheme(theme: 'dark' | 'light') {
      localStorage.setItem('architect-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
    },
  };
}

export const translations = {
  en: {
    dashboard: 'DASHBOARD',
    servers: 'SERVERS',
    settings: 'SETTINGS',
    commands: 'COMMANDS',
    logs: 'LOGS',
    online: 'ONLINE',
    offline: 'OFFLINE',
    memory: 'MEMORY',
    uptime: 'UPTIME',
    ping: 'PING',
    save: 'SAVE',
    cancel: 'CANCEL',
    refresh: 'REFRESH',
    loading: 'Connecting to BAMAKO_223 node...',
    error: 'CONNECTION LOST',
    retry: 'RETRY',
    footer: 'Built by Moussa Fofana • Bamako, Mali',
    quote: 'The grid adapts. The grid survives. The grid prevails.',
    theme: 'THEME',
    language: 'LANGUE',
    dark: 'DARK',
    light: 'LIGHT',
    serversList: 'CONNECTED SERVERS',
    commandsList: 'COMMAND CATEGORIES',
    members: 'Members',
    boost: 'Boost Tier',
    selectServer: 'Select a server to manage settings',
    noServers: 'No servers connected',
    settingSaved: 'Setting saved successfully!',
    settingError: 'Failed to save setting',
    prefix: 'Prefix',
    welcomeChannel: 'Welcome Channel',
    goodbyeChannel: 'Goodbye Channel',
    logChannel: 'Log Channel',
    xpMultiplier: 'XP Multiplier',
    xpCooldown: 'XP Cooldown (s)',
    afkEnabled: 'AFK System',
    marketEnabled: 'Market',
    aiEnabled: 'Lydia AI',
    autoModEnabled: 'Auto Mod',
    enabled: 'Enabled',
    disabled: 'Disabled',
  },
  fr: {
    dashboard: 'TABLEAU DE BORD',
    servers: 'SERVEURS',
    settings: 'PARAMÈTRES',
    commands: 'COMMANDES',
    logs: 'JOURNAUX',
    online: 'EN LIGNE',
    offline: 'HORS LIGNE',
    memory: 'MÉMOIRE',
    uptime: 'DISPONIBILITÉ',
    ping: 'LATENCE',
    save: 'SAUVEGARDER',
    cancel: 'ANNULER',
    refresh: 'ACTUALISER',
    loading: 'Connexion au nœud BAMAKO_223...',
    error: 'CONNEXION PERDUE',
    retry: 'RÉESSAYER',
    footer: 'Construit par Moussa Fofana • Bamako, Mali',
    quote: 'La grille s\'adapte. La grille survit. La grille prévaut.',
    theme: 'THÈME',
    language: 'LANGUAGE',
    dark: 'SOMBRE',
    light: 'CLAIR',
    serversList: 'SERVEURS CONNECTÉS',
    commandsList: 'CATÉGORIES DE COMMANDES',
    members: 'Membres',
    boost: 'Niveau Boost',
    selectServer: 'Sélectionnez un serveur à gérer',
    noServers: 'Aucun serveur connecté',
    settingSaved: 'Paramètre sauvegardé !',
    settingError: 'Échec de la sauvegarde',
    prefix: 'Préfixe',
    welcomeChannel: 'Salon Bienvenue',
    goodbyeChannel: 'Salon Au Revoir',
    logChannel: 'Salon Logs',
    xpMultiplier: 'Multiplicateur XP',
    xpCooldown: 'Cooldown XP (s)',
    afkEnabled: 'Système AFK',
    marketEnabled: 'Marché',
    aiEnabled: 'Lydia AI',
    autoModEnabled: 'Auto Mod',
    enabled: 'Activé',
    disabled: 'Désactivé',
  }
};