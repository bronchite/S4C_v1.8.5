// ─── Central router (hash-based) ────────────────────────────────────────────
// • navigateTo(view)  → met à jour location.hash ET rend la vue
// • initRouter()      → à appeler une fois au boot ; lit le hash courant
//                       et installe le listener hashchange (bouton retour)
// • attachNavListeners() → wire les liens <a data-view="…"> de la page courante

export type View = 'home' | 'active' | 'archived' | 'deleted' | 'lists' | 'contact';

const VALID_VIEWS: View[] = ['home', 'active', 'archived', 'deleted', 'lists', 'contact'];

// ── Parsing ──────────────────────────────────────────────────────────────────

function parseHash(hash: string): View {
  const path = hash.replace(/^#\/?/, '');          // retire "#/" ou "#"
  return VALID_VIEWS.includes(path as View) ? path as View : 'active';
}

// ── Render dispatch (interne) ────────────────────────────────────────────────

async function renderView(view: View): Promise<void> {
  switch (view) {
    case 'home': {
      const { renderHome } = await import('./home');
      renderHome();
      break;
    }
    case 'active': {
      const { renderApp } = await import('./parcels');
      await renderApp();
      break;
    }
    case 'archived': {
      const { renderApp } = await import('./parcels');
      await renderApp();
      document.getElementById('archivedPanel')?.classList.add('open');
      (document as any).__syncNavActive?.();
      break;
    }
    case 'deleted': {
      const { renderApp } = await import('./parcels');
      await renderApp();
      document.getElementById('deletedPanel')?.classList.add('open');
      (document as any).__syncNavActive?.();
      break;
    }
    case 'lists': {
      const { renderLists } = await import('./lists');
      await renderLists();
      break;
    }
    case 'contact': {
      const { renderContact } = await import('./contact');
      renderContact();
      break;
    }
  }
}

// ── API publique ─────────────────────────────────────────────────────────────

/**
 * Navigue vers une vue :
 * - met à jour location.hash → le bouton retour mémorise l'étape
 * - si on est déjà sur ce hash, re-rend quand même (rechargement manuel)
 */
export function navigateTo(view: View): void {
  const newHash = `#/${view}`;
  if (location.hash !== newHash) {
    // Le changement de hash déclenche hashchange → renderView()
    location.hash = newHash;
  } else {
    // Même hash : hashchange ne se déclenche pas, on rend directement
    renderView(view);
  }
}

/**
 * À appeler UNE SEULE FOIS au démarrage.
 * - Installe le listener hashchange (bouton retour / avant)
 * - Rend la vue correspondant au hash courant (support des liens partagés)
 */
export function initRouter(): void {
  window.addEventListener('hashchange', () => {
    renderView(parseHash(location.hash));
  });

  // Remplace un hash vide par #/active pour que l'URL soit toujours propre
  if (!location.hash || location.hash === '#') {
    history.replaceState(null, '', '#/active');
  }

  renderView(parseHash(location.hash));
}

/** Wire up tous les liens <a data-view="…"> de la page courante. */
export function attachNavListeners() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-view]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(a.dataset.view as View);
    });
  });
}
