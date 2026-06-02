// ─── Home page ───────────────────────────────────────────────────────────────
import { supabase } from '../../lib/supabase';
import { app, FOOTER_HTML, currentUser, setCurrentUser, attachNavToggle } from '../modules/state';
import { getThemeButtonsHtml, attachThemeListeners } from '../modules/theme';
import { attachNavListeners } from './router';
import { renderAuth } from './auth';

export function renderHome() {
  const loggedIn = !!currentUser;
  app.innerHTML = `
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${loggedIn ? `
        <nav id="mainNav">
          <a href="#" data-view="home" class="nav-active nav-active--home">Accueil</a>
          <a href="#" data-view="active">Colis actifs</a>
          <a href="#" data-view="archived">Colis archivés</a>
          <a href="#" data-view="deleted">Colis supprimés</a>
          <a href="#" data-view="lists">Mes listes</a>
          <a href="#" data-view="contact">Contact</a>
        </nav>
        <div class="header-right">${getThemeButtonsHtml()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>
        ` : `
        <nav id="mainNav">
          <a href="#" data-view="home" class="nav-active nav-active--home">Accueil</a>
          <a href="#" data-view="active">Colis actifs</a>
          <span class="nav-disabled" title="Indisponible">Colis archivés</span>
          <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
          <span class="nav-disabled" title="Indisponible">Mes listes</span>
          <a href="#" data-view="contact">Contact</a>
        </nav>
        <div class="header-right">${getThemeButtonsHtml()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>
        `}
      </div>
    </header>
    <main class="container">
      <div class="page-title"><h1>Accueil</h1></div>
      <p style="color:var(--ups-brown);">Page en cours de construction.</p>
    </main>
    ${FOOTER_HTML}`;

  attachNavListeners();
  attachThemeListeners();
  attachNavToggle();

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    renderAuth('login');
  });
  document.getElementById('loginBtn')?.addEventListener('click', e => { e.preventDefault(); renderAuth('login'); });
}
