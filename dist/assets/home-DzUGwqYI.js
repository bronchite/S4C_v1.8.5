import{C as e,S as t,_ as n,a as r,h as i,n as a,o,t as s,v as c,y as l}from"./index-BnqpxyRl.js";function u(){n.innerHTML=`
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${l?`
        <nav id="mainNav">
          <a href="#" data-view="home" class="nav-active nav-active--home">Accueil</a>
          <a href="#" data-view="active">Colis actifs</a>
          <a href="#" data-view="archived">Colis archivés</a>
          <a href="#" data-view="deleted">Colis supprimés</a>
          <a href="#" data-view="lists">Mes listes</a>
          <a href="#" data-view="contact">Contact</a>
        </nav>
        <div class="header-right">${o()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>
        `:`
        <nav id="mainNav">
          <a href="#" data-view="home" class="nav-active nav-active--home">Accueil</a>
          <a href="#" data-view="active">Colis actifs</a>
          <span class="nav-disabled" title="Indisponible">Colis archivés</span>
          <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
          <span class="nav-disabled" title="Indisponible">Mes listes</span>
          <a href="#" data-view="contact">Contact</a>
        </nav>
        <div class="header-right">${o()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>
        `}
      </div>
    </header>
    <main class="container">
      <div class="page-title"><h1>Accueil</h1></div>
      <p style="color:var(--ups-brown);">Page en cours de construction.</p>
    </main>
    ${i}`,a(),r(),c(),document.getElementById(`logoutBtn`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),t(null),s(`login`)}),document.getElementById(`loginBtn`)?.addEventListener(`click`,e=>{e.preventDefault(),s(`login`)})}export{u as renderHome};