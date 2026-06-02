// ─── Theme management ───────────────────────────────────────────────────────

export let currentTheme: 'default' | 'ups' = 'default';

export const DEFAULT_THEME_VARS: Record<string, string> = {
  '--bg': '#f0f4fa', '--surface': '#ffffff', '--border': '#dde3ef',
  '--border-focus': '#2563eb', '--primary': '#2563eb', '--primary-dark': '#1d4ed8',
  '--primary-xlt': '#eff6ff', '--primary-lt': '#dbeafe', '--navy': '#1a2744',
  '--slate': '#64748b', '--text': '#111827', '--text-muted': '#6b7280',
  '--ups-brown': '#1a2744', '--ups-gold': '#2563eb', '--ups-red': '#e63946',
  '--ups-green': '#16a34a', '--ups-border': '#dde3ef', '--ups-light': '#f4f7fd',
  '--ups-bg': '#ffffff', '--ups-darkgray': '#64748b',
};

export function applyTheme(theme: 'default' | 'ups') {
  currentTheme = theme;
  const root = document.documentElement;
  if (theme === 'ups') {
    root.classList.add('theme-ups');
    for (const k of Object.keys(DEFAULT_THEME_VARS)) root.style.removeProperty(k);
  } else {
    root.classList.remove('theme-ups');
    for (const [k, v] of Object.entries(DEFAULT_THEME_VARS)) root.style.setProperty(k, v);
  }
  localStorage.setItem('s4c_theme', theme);
  updateThemeButtons();
}

export function updateThemeButtons() {
  document.getElementById('themeDefaultBtn')?.classList.toggle('btn-theme-active', currentTheme === 'default');
  document.getElementById('themeUpsBtn')?.classList.toggle('btn-theme-active', currentTheme === 'ups');
}

export function attachThemeListeners() {
  document.getElementById('themeDefaultBtn')?.addEventListener('click', () => applyTheme('default'));
  document.getElementById('themeUpsBtn')?.addEventListener('click', () => applyTheme('ups'));
}

export function getThemeButtonsHtml(): string {
  return `<span class="theme-label">Thèmes</span>
    <button class="btn-theme-round btn-theme-default ${currentTheme === 'default' ? 'btn-theme-active' : ''}" id="themeDefaultBtn" title="Thème de base"></button>
    <button class="btn-theme-round btn-theme-ups ${currentTheme === 'ups' ? 'btn-theme-active' : ''}" id="themeUpsBtn" title="Thème UPS"></button>`;
}

// Restore saved theme immediately on module load
;(function () {
  const saved = localStorage.getItem('s4c_theme') as 'default' | 'ups' | null;
  if (saved === 'ups') {
    currentTheme = 'ups';
    document.documentElement.classList.add('theme-ups');
  }
})();
