// ─── Shared application state ──────────────────────────────────────────────
export const FOOTER_HTML = `<footer class="site-footer">Ship4Cheap.fr &copy; 2026 - Tous droits réservés</footer>`;
export const GUEST_STORAGE_KEY = 'guest_parcels';

export const app = document.getElementById('app')!;

export let currentUser: string | null = null;
export function setCurrentUser(id: string | null) { currentUser = id; }

export let globalListenersAttached = false;
export function markGlobalListenersAttached() { globalListenersAttached = true; }

/**
 * Menu hamburger mobile.
 * Ordre dropdown : header-right (thèmes + bouton) EN HAUT, nav EN DESSOUS.
 * position: fixed pour éviter le clipping du header sticky.
 */
export function attachNavToggle(): void {
  const btn = document.getElementById('navToggle') as HTMLButtonElement | null;
  if (!btn) return;
  const nav = document.getElementById('mainNav') as HTMLElement | null;
  const hdr = document.querySelector<HTMLElement>('header .header-right');
  const isMobile = () => window.innerWidth <= 768;

  const close = () => {
    btn.classList.remove('open');
    if (nav) { nav.style.display = ''; nav.style.top = ''; }
    if (hdr) { hdr.style.display = ''; hdr.style.top = ''; }
  };

  const open_ = () => {
    btn.classList.add('open');
    // 1. Afficher header-right en premier (56px header + 50px gap = 106px)
    if (hdr) {
      hdr.style.top    = '106px';
      hdr.style.display = 'flex';
    }
    // 2. Après rendu, mesurer header-right et placer nav juste en dessous
    requestAnimationFrame(() => {
      const hdrH = hdr ? hdr.offsetHeight : 0;
      if (nav) {
        nav.style.top    = (106 + hdrH) + 'px';
        nav.style.display = 'flex';
      }
    });
  };

  btn.addEventListener('click', () => btn.classList.contains('open') ? close() : open_());
  document.querySelectorAll('#mainNav a[data-view]').forEach(a => a.addEventListener('click', close));
  window.addEventListener('resize', () => { if (!isMobile()) close(); }, { passive: true });
}
