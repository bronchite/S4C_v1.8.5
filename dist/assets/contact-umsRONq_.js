import{C as e,S as t,_ as n,a as r,h as i,n as a,o,t as s,v as c,y as l}from"./index-BnqpxyRl.js";function u(){let u=!!l;n.innerHTML=`
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${u?`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists">Mes listes</a>
      <a href="#" data-view="contact" class="nav-active nav-active--contact">Contact</a>
    </nav>
    <div class="header-right">${o()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>`:`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <span class="nav-disabled" title="Indisponible">Colis archivés</span>
      <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
      <span class="nav-disabled" title="Indisponible">Mes listes</span>
      <a href="#" data-view="contact" class="nav-active nav-active--contact">Contact</a>
    </nav>
    <div class="header-right">${o()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>`}
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
    ${i}`,a(),r(),c(),document.getElementById(`logoutBtn`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),t(null),s(`login`)}),document.getElementById(`loginBtn`)?.addEventListener(`click`,e=>{e.preventDefault(),s(`login`)});let d=document.getElementById(`contactName`),f=document.getElementById(`contactEmail`),p=document.getElementById(`contactSubject`),m=document.getElementById(`contactMessage`),h=document.getElementById(`contactNameError`),g=document.getElementById(`contactEmailError`),_=document.getElementById(`contactSubjectError`),v=document.getElementById(`contactMessageError`),y=document.getElementById(`contactFormMsg`),b=document.getElementById(`contactSubmitBtn`);u&&e.auth.getUser().then(({data:e})=>{e.user?.email&&(f.value=e.user.email)}),document.getElementById(`contactForm`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=d.value.trim(),r=f.value.trim(),i=p.value.trim(),a=m.value.trim(),o=!0;if(h.textContent=g.textContent=_.textContent=v.textContent=``,[d,f,p,m].forEach(e=>e.classList.remove(`error`)),n||(h.textContent=`Veuillez entrer votre nom.`,d.classList.add(`error`),o=!1),(!r||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r))&&(g.textContent=`Adresse email invalide.`,f.classList.add(`error`),o=!1),i||(_.textContent=`Veuillez entrer un sujet.`,p.classList.add(`error`),o=!1),a.length<10&&(v.textContent=`Le message doit contenir au moins 10 caractères.`,m.classList.add(`error`),o=!1),!o)return;b.disabled=!0,b.textContent=`Envoi en cours…`;let{error:s}=await e.from(`contact_messages`).insert({name:n,email:r,subject:i,message:a,user_id:l||null});s?(y.textContent=`Une erreur est survenue. Veuillez réessayer.`,y.className=`contact-form-msg contact-form-msg--error`,y.style.display=`block`,b.disabled=!1,b.textContent=`Envoyer le message`):(y.textContent=`Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.`,y.className=`contact-form-msg contact-form-msg--success`,y.style.display=`block`,document.getElementById(`contactForm`).reset(),b.textContent=`Message envoyé`)})}export{u as renderContact};