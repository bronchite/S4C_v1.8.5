// ─── Contact page ────────────────────────────────────────────────────────────
import { supabase } from '../../lib/supabase';
import { app, FOOTER_HTML, currentUser, setCurrentUser, attachNavToggle } from '../modules/state';
import { getThemeButtonsHtml, attachThemeListeners } from '../modules/theme';
import { attachNavListeners } from './router';
import { renderAuth } from './auth';

export function renderContact() {
  const loggedIn = !!currentUser;
  const headerNav = loggedIn ? `
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists">Mes listes</a>
      <a href="#" data-view="contact" class="nav-active nav-active--contact">Contact</a>
    </nav>
    <div class="header-right">${getThemeButtonsHtml()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>`
  : `
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <span class="nav-disabled" title="Indisponible">Colis archivés</span>
      <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
      <span class="nav-disabled" title="Indisponible">Mes listes</span>
      <a href="#" data-view="contact" class="nav-active nav-active--contact">Contact</a>
    </nav>
    <div class="header-right">${getThemeButtonsHtml()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>`;

  app.innerHTML = `
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${headerNav}
      </div>
    </header>
    <main class="container">
      <div class="contact-page">
        <div class="contact-hero">
          <h1 class="contact-hero-title">Contactez-nous</h1>
          <p class="contact-hero-sub">Une question, une suggestion ou un problème ? Notre équipe vous répondra dans les plus brefs délais.</p>
        </div>
        <div class="contact-layout">
          <div class="contact-info-panel">
            <div class="contact-info-block">
              <div class="contact-info-icon">&#9993;</div>
              <div><div class="contact-info-label">Email</div><div class="contact-info-value">support@ship4cheap.fr</div></div>
            </div>
            <div class="contact-info-block">
              <div class="contact-info-icon">&#9998;</div>
              <div><div class="contact-info-label">Réponse</div><div class="contact-info-value">Sous 24&nbsp;h ouvrées</div></div>
            </div>
            <div class="contact-info-block">
              <div class="contact-info-icon">&#128205;</div>
              <div><div class="contact-info-label">Localisation</div><div class="contact-info-value">France</div></div>
            </div>
          </div>
          <form id="contactForm" class="contact-form" novalidate>
            <div class="contact-form-row">
              <div class="field-group">
                <label for="contactName">Nom complet <span class="contact-required">*</span></label>
                <input type="text" id="contactName" placeholder="Jean Dupont" maxlength="100" />
                <span class="contact-field-error" id="contactNameError"></span>
              </div>
              <div class="field-group">
                <label for="contactEmail">Adresse email <span class="contact-required">*</span></label>
                <input type="email" id="contactEmail" placeholder="votre@email.com" maxlength="150" />
                <span class="contact-field-error" id="contactEmailError"></span>
              </div>
            </div>
            <div class="field-group">
              <label for="contactSubject">Sujet <span class="contact-required">*</span></label>
              <input type="text" id="contactSubject" placeholder="Ex : Question sur le calcul volumétrique" maxlength="150" />
              <span class="contact-field-error" id="contactSubjectError"></span>
            </div>
            <div class="field-group">
              <label for="contactMessage">Message <span class="contact-required">*</span></label>
              <textarea id="contactMessage" placeholder="Décrivez votre demande en détail..." rows="6" maxlength="2000"></textarea>
              <span class="contact-field-error" id="contactMessageError"></span>
            </div>
            <div id="contactFormMsg" class="contact-form-msg" style="display:none;"></div>
            <div class="contact-form-footer">
              <span class="contact-required-note"><span class="contact-required">*</span> Champs obligatoires</span>
              <button type="submit" id="contactSubmitBtn" class="btn btn-primary contact-submit-btn">Envoyer le message</button>
            </div>
          </form>
        </div>
      </div>
    </main>
    ${FOOTER_HTML}`;

  attachNavListeners();
  attachThemeListeners();
  attachNavToggle();

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut(); setCurrentUser(null); renderAuth('login');
  });
  document.getElementById('loginBtn')?.addEventListener('click', e => { e.preventDefault(); renderAuth('login'); });

  const nameIn    = document.getElementById('contactName')    as HTMLInputElement;
  const emailIn   = document.getElementById('contactEmail')   as HTMLInputElement;
  const subjectIn = document.getElementById('contactSubject') as HTMLInputElement;
  const msgIn     = document.getElementById('contactMessage') as HTMLTextAreaElement;
  const nameErr   = document.getElementById('contactNameError')!;
  const emailErr  = document.getElementById('contactEmailError')!;
  const subjectErr = document.getElementById('contactSubjectError')!;
  const msgErr    = document.getElementById('contactMessageError')!;
  const formMsg   = document.getElementById('contactFormMsg')!;
  const submitBtn = document.getElementById('contactSubmitBtn') as HTMLButtonElement;

  if (loggedIn) {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) emailIn.value = data.user.email;
    });
  }

  document.getElementById('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = nameIn.value.trim();
    const email   = emailIn.value.trim();
    const subject = subjectIn.value.trim();
    const message = msgIn.value.trim();
    let valid = true;
    nameErr.textContent = emailErr.textContent = subjectErr.textContent = msgErr.textContent = '';
    [nameIn, emailIn, subjectIn, msgIn].forEach(el => el.classList.remove('error'));

    if (!name)                              { nameErr.textContent    = 'Veuillez entrer votre nom.'; nameIn.classList.add('error'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailErr.textContent   = 'Adresse email invalide.'; emailIn.classList.add('error'); valid = false; }
    if (!subject)                           { subjectErr.textContent = 'Veuillez entrer un sujet.'; subjectIn.classList.add('error'); valid = false; }
    if (message.length < 10)               { msgErr.textContent     = 'Le message doit contenir au moins 10 caractères.'; msgIn.classList.add('error'); valid = false; }
    if (!valid) return;

    submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours…';
    const { error } = await supabase.from('contact_messages').insert({
      name, email, subject, message, user_id: currentUser || null,
    });
    if (error) {
      formMsg.textContent = 'Une erreur est survenue. Veuillez réessayer.';
      formMsg.className   = 'contact-form-msg contact-form-msg--error';
      formMsg.style.display = 'block';
      submitBtn.disabled = false; submitBtn.textContent = 'Envoyer le message';
    } else {
      formMsg.textContent = 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.';
      formMsg.className   = 'contact-form-msg contact-form-msg--success';
      formMsg.style.display = 'block';
      (document.getElementById('contactForm') as HTMLFormElement).reset();
      submitBtn.textContent = 'Message envoyé';
    }
  });
}
