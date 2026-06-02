// ─── Auth pages ─────────────────────────────────────────────────────────────
import { supabase } from '../../lib/supabase';
import { app, FOOTER_HTML, attachNavToggle } from '../modules/state';
import { getThemeButtonsHtml, attachThemeListeners } from '../modules/theme';
import { attachNavListeners } from './router';

function guestHeader() {
  return `
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        <nav id="mainNav">
          <a href="#" data-view="home">Accueil</a>
          <a href="#" data-view="active">Colis actifs</a>
          <span class="nav-disabled" title="Indisponible">Colis archivés</span>
          <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
          <span class="nav-disabled" title="Indisponible">Mes listes</span>
          <a href="#" data-view="contact">Contact</a>
        </nav>
        <div class="header-right">${getThemeButtonsHtml()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>
      </div>
    </header>`;
}

function wireGuestNav() {
  attachNavListeners();
  document.getElementById('loginBtn')?.addEventListener('click', e => { e.preventDefault(); renderAuth('login'); });
  attachThemeListeners();
  attachNavToggle();
}

// ── Login / Signup ──────────────────────────────────────────────────────────

export function renderAuth(mode: 'login' | 'signup' = 'login') {
  const isLogin = mode === 'login';
  app.innerHTML = `
    ${guestHeader()}
    <div class="auth-container">
      <h1 class="auth-title">${isLogin ? 'Connexion' : 'Créer un compte'}</h1>
      <form id="authForm" class="auth-form" novalidate>
        <div class="field-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="votre@email.com" />
        </div>
        <div class="field-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" placeholder="Mot de passe" />
          <span id="passwordError" class="password-error" style="display:none;">Le mot de passe doit contenir au moins 8 caractères dont au moins un chiffre et un caractère spécial</span>
          <span id="passwordMismatchError" class="password-error" style="display:none;">Le mot de passe et l'adresse email ne correspondent pas</span>
        </div>
        ${!isLogin ? `
        <div class="field-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input type="password" id="confirmPassword" placeholder="Répétez le mot de passe" />
          <span id="confirmPasswordError" class="password-error" style="display:none;">Les mots de passe ne correspondent pas</span>
        </div>` : ''}
        <button type="submit" class="btn btn-primary">${isLogin ? 'Se connecter' : "S'inscrire"}</button>
        ${isLogin ? `<p class="auth-switch"><a id="forgotPassword">Mot de passe oublié ?</a></p>` : ''}
        <p class="auth-switch">
          ${isLogin ? "Pas de compte ? <a id='switchAuth'>Créer un compte</a>" : "Déjà un compte ? <a id='switchAuth'>Se connecter</a>"}
        </p>
      </form>
      <p style="text-align:center;margin-top:1.5rem;color:var(--ups-darkgray);font-size:0.875rem;">
        Connectez-vous pour sauvegarder vos colis, les archiver et y accéder depuis n'importe quel appareil.
      </p>
    </div>
    ${FOOTER_HTML}`;

  wireGuestNav();
  document.getElementById('switchAuth')?.addEventListener('click', () => renderAuth(isLogin ? 'signup' : 'login'));
  document.getElementById('forgotPassword')?.addEventListener('click', () => renderForgotPassword());

  const emailIn  = document.getElementById('email') as HTMLInputElement;
  const pwIn     = document.getElementById('password') as HTMLInputElement;
  const cfIn     = document.getElementById('confirmPassword') as HTMLInputElement | null;
  const pwErr    = document.getElementById('passwordError') as HTMLElement;
  const pwMis    = document.getElementById('passwordMismatchError') as HTMLElement;
  const cfErr    = document.getElementById('confirmPasswordError') as HTMLElement | null;

  emailIn?.addEventListener('input', () => emailIn.classList.remove('error'));
  pwIn?.addEventListener('input', () => { pwIn.classList.remove('error'); pwErr.style.display = 'none'; pwMis.style.display = 'none'; });
  cfIn?.addEventListener('input', () => { cfIn.classList.remove('error'); if (cfErr) cfErr.style.display = 'none'; });

  document.getElementById('authForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = emailIn.value;
    const password = pwIn.value;
    const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwOk     = password.length >= 8 && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password);
    if (!emailOk) emailIn.classList.add('error');
    if (!pwOk) { pwIn.classList.add('error'); pwErr.style.display = 'block'; }
    if (!isLogin && cfIn && password !== cfIn.value) {
      cfIn.classList.add('error'); if (cfErr) cfErr.style.display = 'block'; return;
    }
    if (!emailOk || !pwOk) return;
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credentials') || error.status === 400) {
          pwIn.classList.add('error'); pwMis.style.display = 'block';
        } else alert('Erreur de connexion: ' + error.message);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert('Erreur: ' + error.message);
    }
  });
}

// ── Forgot password ─────────────────────────────────────────────────────────

export function renderForgotPassword() {
  app.innerHTML = `
    ${guestHeader()}
    <div class="auth-container">
      <h1 class="auth-title">Mot de passe oublié</h1>
      <p style="text-align:center;color:var(--ups-darkgray);font-size:0.875rem;margin-bottom:1.5rem;">
        Saisissez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
      </p>
      <form id="forgotForm" class="auth-form" novalidate>
        <div class="field-group">
          <label for="resetEmail">Email</label>
          <input type="email" id="resetEmail" placeholder="votre@email.com" />
        </div>
        <div id="forgotMsg" style="display:none;text-align:center;font-size:0.875rem;font-weight:600;padding:0.75rem;border-radius:6px;"></div>
        <button type="submit" class="btn btn-primary">Envoyer le lien</button>
        <p class="auth-switch"><a id="backToLoginLink">Retour à la connexion</a></p>
      </form>
    </div>
    ${FOOTER_HTML}`;

  wireGuestNav();
  document.getElementById('backToLoginLink')?.addEventListener('click', () => renderAuth('login'));
  document.getElementById('forgotForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const emailIn = document.getElementById('resetEmail') as HTMLInputElement;
    const msgEl   = document.getElementById('forgotMsg') as HTMLElement;
    const email   = emailIn.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailIn.classList.add('error'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    if (error) {
      msgEl.textContent = 'Erreur: ' + error.message;
      msgEl.style.background = 'rgba(204,58,58,0.1)'; msgEl.style.color = 'var(--ups-red)';
    } else {
      msgEl.textContent = 'Un lien de réinitialisation a été envoyé à ' + email;
      msgEl.style.background = 'rgba(40,167,69,0.1)'; msgEl.style.color = 'var(--ups-green)';
      (document.getElementById('forgotForm') as HTMLFormElement).querySelector('button')!.setAttribute('disabled', 'true');
    }
    msgEl.style.display = 'block';
  });
}

// ── Reset password ──────────────────────────────────────────────────────────

export function renderResetPassword() {
  app.innerHTML = `
    ${guestHeader()}
    <div class="auth-container">
      <h1 class="auth-title">Nouveau mot de passe</h1>
      <form id="resetForm" class="auth-form" novalidate>
        <div class="field-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <input type="password" id="newPassword" placeholder="Nouveau mot de passe" />
          <span id="newPasswordError" class="password-error" style="display:none;">Le mot de passe doit contenir au moins 8 caractères dont au moins un chiffre et un caractère spécial</span>
        </div>
        <div class="field-group">
          <label for="confirmNewPassword">Confirmer le mot de passe</label>
          <input type="password" id="confirmNewPassword" placeholder="Répétez le mot de passe" />
          <span id="confirmNewPasswordError" class="password-error" style="display:none;">Les mots de passe ne correspondent pas</span>
        </div>
        <div id="resetMsg" style="display:none;text-align:center;font-size:0.875rem;font-weight:600;padding:0.75rem;border-radius:6px;"></div>
        <button type="submit" class="btn btn-primary">Enregistrer</button>
      </form>
    </div>
    ${FOOTER_HTML}`;

  wireGuestNav();
  document.getElementById('resetForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const newPw  = (document.getElementById('newPassword') as HTMLInputElement).value;
    const cfPw   = (document.getElementById('confirmNewPassword') as HTMLInputElement).value;
    const pwErr  = document.getElementById('newPasswordError') as HTMLElement;
    const cfErr  = document.getElementById('confirmNewPasswordError') as HTMLElement;
    const msgEl  = document.getElementById('resetMsg') as HTMLElement;
    const valid  = newPw.length >= 8 && /\d/.test(newPw) && /[^a-zA-Z0-9]/.test(newPw);
    if (!valid) { pwErr.style.display = 'block'; return; } pwErr.style.display = 'none';
    if (newPw !== cfPw) { cfErr.style.display = 'block'; return; } cfErr.style.display = 'none';
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      msgEl.textContent = 'Erreur: ' + error.message;
      msgEl.style.background = 'rgba(204,58,58,0.1)'; msgEl.style.color = 'var(--ups-red)';
    } else {
      msgEl.textContent = 'Mot de passe mis à jour avec succès !';
      msgEl.style.background = 'rgba(40,167,69,0.1)'; msgEl.style.color = 'var(--ups-green)';
      setTimeout(async () => { const { renderApp } = await import('./parcels'); renderApp(); }, 1500);
    }
    msgEl.style.display = 'block';
  });
}
