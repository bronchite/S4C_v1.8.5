const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./router-DQGQbAys.js","./index-BnqpxyRl.js","./index-C8nvwK9B.css"])))=>i.map(i=>d[i]);
import{C as e,S as t,_ as n,a as r,b as i,c as a,d as o,f as s,g as c,h as l,l as u,m as d,o as f,p,s as m,t as h,u as g,v as _,w as v,x as y,y as b}from"./index-BnqpxyRl.js";import{d as x,f as S,i as C,t as w,u as T}from"./modals-Dm8fOYj6.js";var E=null,D=212;function O(){document.querySelectorAll(`.icone-colis-wrapper`).forEach(e=>{e.style.left=`-${D}px`})}function k(e){let t=document.getElementById(`parcelsGrid`);if(!t)return;let n=t.querySelector(`.parcel-card[data-id="${e}"]`);if(!n)return;let r=n.querySelector(`.rotate-3d`);r&&(r.classList.remove(`rotate-3d--active`),r.offsetWidth,r.classList.add(`rotate-3d--active`),r.addEventListener(`animationend`,()=>r.classList.remove(`rotate-3d--active`),{once:!0}))}var A=12,j=3*Math.sqrt(3)/4*A**2,M=268,N=new Map,P=!1;function F(){P||(P=!0,new MutationObserver(()=>B()).observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}))}function I(){return document.documentElement.classList.contains(`theme-ups`)?{cF:`#d4880a`,cS:`#b5720a`,tF:`#351c15`,tS:`#6b3a2a`,lC:`#b5720a`,lT:`#4a2010`,tAlpha:.275}:{cF:`#ffffff`,cS:`#93c5fd`,tF:`#bfdbfe`,tS:`#3b82f6`,lC:`#1d4ed8`,lT:`#1e40af`,tAlpha:.55}}function L(e,t){let n=t/e,r=j*n,i=Math.sqrt(4*r/Math.sqrt(3)),a=i*Math.sqrt(3)/2,o=[[-i/2,-a/3],[i/2,-a/3],[0,2*a/3]],s=2900/120,c=Math.sqrt(900-s*s),l=Math.sqrt(r/(.5*60*c)),u=[[0,0],[60*l,0],[s*l,c*l]],d=(u[0][0]+u[1][0]+u[2][0])/3,f=(u[0][1]+u[1][1]+u[2][1])/3,p=u.map(e=>[e[0]-d,e[1]-f]),m=M/2*.7,h=A*Math.max(1,Math.sqrt(n));return{ptsSc:p,ptsEq:o,scale:m*.8/h}}function R(e,t,n,r,i,a){let o=M/2,s=M/2;e.clearRect(0,0,M,M),e.beginPath(),e.arc(o,s,A*n,0,2*Math.PI),e.globalAlpha=.85,e.fillStyle=r.cF,e.fill(),e.globalAlpha=1,e.strokeStyle=r.cS,e.lineWidth=2,e.stroke(),e.beginPath(),e.moveTo(o+t[0][0]*n,s-t[0][1]*n),e.lineTo(o+t[1][0]*n,s-t[1][1]*n),e.lineTo(o+t[2][0]*n,s-t[2][1]*n),e.closePath(),e.globalAlpha=r.tAlpha,e.fillStyle=r.tF,e.fill(),e.globalAlpha=1,e.strokeStyle=r.tS,e.lineWidth=2,e.stroke(),e.font=`600 10px 'Outfit','Segoe UI',sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillStyle=r.lC,e.fillText(`● Poids réel : ${i.toFixed(2)} kg`,o,223),e.fillStyle=r.lT,e.fillText(`▲ P. volumétrique : ${a.toFixed(2)} kg`,o,237)}function z(e,t,n){let r=e.getContext(`2d`);if(!r)return;let i=N.get(e);i&&cancelAnimationFrame(i);let{ptsSc:a,ptsEq:o,scale:s}=L(t,n),c=I(),l=-1;function u(i){l<0&&(l=i);let d=Math.min((i-l)/3e3,1);R(r,a.map((e,t)=>[e[0]*(1-d)+o[t][0]*d,e[1]*(1-d)+o[t][1]*d]),s,c,t,n),d<1?N.set(e,requestAnimationFrame(u)):N.delete(e)}N.set(e,requestAnimationFrame(u))}function B(){document.querySelectorAll(`.anim-poids-wrapper`).forEach(e=>{let t=e.querySelector(`.anim-poids-canvas`);if(!t)return;let n=t.getContext(`2d`);if(!n)return;let r=parseFloat(e.dataset.poidsReel||`0`),i=parseFloat(e.dataset.poidsVol||`0`);if(r>0&&i>0){let{ptsEq:e,scale:t}=L(r,i);R(n,e,t,I(),r,i)}})}function V(){document.querySelectorAll(`.anim-poids-wrapper`).forEach(e=>{e.style.right=`-${D}px`})}function H(e){let t=document.getElementById(`parcelsGrid`);if(!t)return;let n=t.querySelector(`.parcel-card[data-id="${e}"]`);if(!n)return;let r=n.querySelector(`.anim-poids-wrapper`);if(!r)return;let i=r.querySelector(`.anim-poids-canvas`);if(!i)return;let a=parseFloat(r.dataset.poidsReel||`0`),o=parseFloat(r.dataset.poidsVol||`0`);a>0&&o>0&&z(i,a,o)}async function U(){let e;try{e=await d()}catch{e=null}t(e?.id||null);let i=b?await o(`active`):m();n.innerHTML=`
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${b?`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists">Mes listes</a>
      <a href="#" data-view="contact">Contact</a>
    </nav>
    <div class="header-right">${f()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>`:`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <span class="nav-disabled" title="Indisponible">Colis archivés</span>
      <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
      <span class="nav-disabled" title="Indisponible">Mes listes</span>
      <a href="#" data-view="contact">Contact</a>
    </nav>
    <div class="header-right">${f()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>`}
      </div>
    </header>
    <main class="container container--parcels">
      <div class="page-title"><h1>Calculateur de poids volumétrique</h1></div>
      ${b?``:`<p class="guest-notice">Mode invité - Connectez-vous pour profiter de toutes les fonctionnalités</p>`}
      <div class="parcels-grid-toolbar">
        <button id="recapBtn" class="btn btn-recap" style="display:none;">Récap' générale</button>
      </div>
      <div id="parcelsGrid" class="parcels-grid"></div>
      <div id="emptyState" class="empty-state" style="display:none;">
        <div class="empty-icon">📦</div>
        <p>Aucun colis pour le moment</p>
      </div>
      <div class="add-parcel-wrapper">
        <button id="addParcelBtn" class="btn btn-primary">+ Ajouter un colis</button>
      </div>
      <div id="recapReport"></div>
    </main>
    ${b?`
      <div id="archivedPanel" class="side-panel">
        <div class="side-panel-header">
          <h2>Colis archivés</h2>
          <button class="close-btn" data-panel="archived">&times;</button>
        </div>
        <div id="archivedContent" class="side-panel-content"></div>
      </div>
      <div id="deletedPanel" class="side-panel">
        <div class="side-panel-header">
          <div style="display:flex;align-items:center;gap:0;flex:1;">
            <h2>Corbeille</h2>
            <button class="btn btn-small btn-danger" id="emptyTrashBtn" style="margin-left:10px;">Vider</button>
          </div>
          <button class="close-btn" data-panel="deleted">&times;</button>
        </div>
        <div id="deletedContent" class="side-panel-content"></div>
      </div>`:``}
    ${l}`,Z(),W(i),r(),_(),b&&K()}function W(e){let t=document.getElementById(`parcelsGrid`),n=document.getElementById(`emptyState`),r=document.getElementById(`recapBtn`);if(e.length===0){t.innerHTML=``,n.style.display=`block`,r&&(r.style.display=`none`);return}n.style.display=`none`,r&&(r.style.display=``),t.innerHTML=e.map((e,t)=>G(e,t)).join(``),O(),V(),B(),E&&=(k(E),H(E),null)}function G(e,t){let n=e.real_weight!==null&&e.length!==null,r=``,i=``,a=``;if(n){let t=e.volumetric_weight||x(e.length,e.width,e.height),n=T(e.real_weight,t),o=n-e.real_weight;e.length&&e.width&&e.height&&(i=Q(e.length,e.width,e.height)),a=`
    <div class="anim-poids-wrapper"
         data-poids-reel="${e.real_weight}"
         data-poids-vol="${t.toFixed(4)}">
      <canvas class="anim-poids-canvas" width="268" height="268"></canvas>
    </div>`,r=`
      <div class="parcel-result">
        <div class="result-row result-row--split">
          <div class="result-half"><span class="result-label">Dimensions:</span>
            <span>${e.length.toFixed(1)} cm × ${e.width.toFixed(1)} cm × ${e.height.toFixed(1)} cm</span></div>
          <div class="result-half"><span class="result-label">Poids réel:</span>
            <span>${e.real_weight.toFixed(2)} kg</span></div>
        </div>
        <div class="result-row result-row--split">
          <div class="result-half"><span class="result-label">Poids volumétrique:</span>
            <span>${t.toFixed(2)} kg</span></div>
          <div class="result-half"><span class="result-label">Poids facturé:</span>
            <span style="color:#7c3aed;font-weight:600;">${n.toFixed(2)} kg</span></div>
        </div>
        ${o>0?`<div class="suggestion">Économies possibles: ${o.toFixed(2)} kg facturables - <span class="suggestion-hint">réduisez la taille de vos colis pour faire des économies</span></div>`:``}
      </div>`}let o=b&&n,s=b&&n,c=e.name||`Colis #${t+1}`;return`
    <div class="parcel-card" data-id="${e.id}">
      ${i}
      ${a}
      <div class="parcel-card-header">
        <div class="parcel-card-title-group">
          <h3>${c}</h3>
          <button class="btn-rename" data-action="rename" title="Renommer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        </div>
        <button class="btn btn-small btn-danger" data-action="delete" title="Supprimer">&times;</button>
      </div>
      <div class="parcel-fields">
        <div class="field-group"><label>Longueur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="length" value="${e.length??``}" /></div>
        <span class="dim-separator">×</span>
        <div class="field-group"><label>Largeur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="width" value="${e.width??``}" /></div>
        <span class="dim-separator">×</span>
        <div class="field-group"><label>Hauteur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="height" value="${e.height??``}" /></div>
        <div class="parcel-fields-separator"></div>
        <div class="field-group"><label>Poids réel (kg)</label>
          <input type="number" step="0.01" min="0" data-field="real_weight" value="${e.real_weight??``}" /></div>
        <div class="calculate-inline-wrapper">
          <img src="./icon_parcel_1.png" class="calculate-icon" alt="" />
          <button class="btn btn-secondary btn-small calculate-inline" data-action="calculate">Calculer ce colis</button>
        </div>
      </div>
      <div class="parcel-actions">
        ${o?`<button class="btn btn-primary btn-small" data-action="archive">Archiver</button>`:``}
        ${s?`<button class="btn btn-secondary btn-small btn-duplicate" data-action="duplicate">Dupliquer</button>`:``}
      </div>
      ${r}
    </div>`}async function K(){if(!b)return;let[e,t]=await Promise.all([o(`archived`),o(`deleted`)]);q(`archivedContent`,e),q(`deletedContent`,t)}function q(e,t){let n=document.getElementById(e);if(n){if(t.length===0){n.innerHTML=`<p style="text-align:center;color:#888;">Aucun colis</p>`;return}n.innerHTML=t.map((t,n)=>{let r=t.volumetric_weight,i=t.real_weight&&r?T(t.real_weight,r):`-`,a=typeof i==`number`&&t.real_weight?i-t.real_weight:0,o=t.name||`Colis #${n+1}`;return`
      <div class="panel-item" data-id="${t.id}">
        <div class="panel-item-header">
          <span class="panel-item-name">${o}</span>
          <button class="btn-rename btn-rename--panel" data-action="rename" title="Renommer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        </div>
        <div class="panel-item-row"><span>Dimensions:</span>
          <span>${t.length?.toFixed(1)??`-`} cm × ${t.width?.toFixed(1)??`-`} cm × ${t.height?.toFixed(1)??`-`} cm</span></div>
        <div class="panel-item-row"><span>Poids réel:</span>
          <span>${t.real_weight?.toFixed(2)??`-`} kg</span></div>
        <div class="panel-item-row"><span>Poids facturé:</span>
          <span style="color:#7c3aed;">${typeof i==`number`?i.toFixed(2):i} kg</span></div>
        ${e===`archivedContent`&&a>0?`
        <div class="panel-item-row" style="color:var(--ups-green);font-weight:600;">
          <span>Économies possibles:</span><span>${a.toFixed(2)} kg</span>
        </div>`:``}
        <div class="panel-item-actions">
          <button class="btn btn-small btn-secondary" data-action="restore">Restaurer</button>
          ${e===`archivedContent`?`
            <button class="btn btn-small btn-add-list" data-action="add-to-list">+ Liste</button>
            <button class="btn btn-small btn-danger" data-action="archive-delete">Supprimer</button>`:``}
          ${e===`deletedContent`?`<button class="btn btn-small btn-danger" data-action="permanent-delete">Supprimer</button>`:``}
        </div>
      </div>`}).join(``)}}async function J(e,t){let n=await o(`active`),r=n.findIndex(t=>t.id===e);if(r===-1)return;let i=await s(n,r);if(!i)return;let a=t||`Colis #${e.slice(0,4)}`;W(await o(`active`)),K(),C(i.id,`${a} (copie)`,async()=>{W(await o(`active`)),K()})}function Y(){let e=document.getElementById(`parcelsGrid`),t=document.getElementById(`recapReport`);if(!e||!t)return;let n=e.querySelectorAll(`.parcel-card`);if(n.length===0){t.innerHTML=``;return}let r=[];n.forEach((e,t)=>{let n=e.querySelector(`.parcel-card-title-group h3`)?.textContent?.trim()||`Colis #${t+1}`,i=t=>{let n=e.querySelector(`input[data-field="${t}"]`);if(!n)return null;let r=parseFloat(n.value);return isNaN(r)||r<=0?null:r},a=i(`length`),o=i(`width`),s=i(`height`),c=i(`real_weight`),l=[];a||l.push(`length`),o||l.push(`width`),s||l.push(`height`),c||l.push(`real_weight`);let u=l.length>0;[`length`,`width`,`height`,`real_weight`].forEach(t=>{e.querySelector(`input[data-field="${t}"]`)?.classList.toggle(`error`,l.includes(t))}),e.classList.toggle(`recap-invalid`,u);let d=u?null:x(a,o,s),f=u?null:T(c,d);r.push({name:n,length:a,width:o,height:s,realWeight:c,volWeight:d,billedWeight:f,invalid:u,invalidFields:l})});let i=r.filter(e=>!e.invalid),a=r.filter(e=>e.invalid),o=i.reduce((e,t)=>e+t.realWeight,0),s=i.reduce((e,t)=>e+t.volWeight,0),c=i.reduce((e,t)=>e+t.billedWeight,0),l={length:`Longueur`,width:`Largeur`,height:`Hauteur`,real_weight:`Poids réel`},u=r.map(e=>e.invalid?`<tr class="recap-row recap-row--invalid"><td class="recap-cell recap-cell--name">${e.name}</td>
       <td class="recap-cell" colspan="5"><span class="recap-error-tag">Saisies manquantes ou invalides : ${e.invalidFields.map(e=>l[e]).join(`, `)}</span></td></tr>`:`<tr class="recap-row">
       <td class="recap-cell recap-cell--name">${e.name}</td>
       <td class="recap-cell">${e.length.toFixed(1)} × ${e.width.toFixed(1)} × ${e.height.toFixed(1)} cm</td>
       <td class="recap-cell">${e.realWeight.toFixed(2)} kg</td>
       <td class="recap-cell">${e.volWeight.toFixed(2)} kg</td>
       <td class="recap-cell recap-cell--billed">${e.billedWeight.toFixed(2)} kg</td></tr>`).join(``);t.innerHTML=`
    <div class="recap-report">
      <div class="recap-header">
        <h2 class="recap-title">Récapitulatif général</h2>
        <span class="recap-count">${r.length} colis</span>
        <button class="recap-close" id="recapCloseBtn">&times;</button>
      </div>
      ${a.length>0?`<div class="recap-warning">${a.length} colis non inclus dans les totaux (données invalides ou manquantes).</div>`:``}
      <div class="recap-table-wrapper">
        <table class="recap-table">
          <thead><tr><th>Colis</th><th>Dimensions</th><th>Poids réel</th><th>Poids volumétrique</th><th>Poids facturé</th></tr></thead>
          <tbody>${u}</tbody>
          <tfoot>
            <tr class="recap-total">
              <td class="recap-cell recap-cell--name"><strong>TOTAL</strong> <span class="recap-total-note">(${i.length} colis valides)</span></td>
              <td class="recap-cell">—</td>
              <td class="recap-cell"><strong>${o.toFixed(2)} kg</strong></td>
              <td class="recap-cell"><strong>${s.toFixed(2)} kg</strong></td>
              <td class="recap-cell recap-cell--billed"><strong>${c.toFixed(2)} kg</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`,document.getElementById(`recapCloseBtn`)?.addEventListener(`click`,()=>{t.innerHTML=``,e.querySelectorAll(`.parcel-card`).forEach(e=>e.classList.remove(`recap-invalid`)),e.querySelectorAll(`input[data-field]`).forEach(e=>e.classList.remove(`error`))}),t.scrollIntoView({behavior:`smooth`,block:`start`})}function X(e,t,n){let r=m();if(t===`delete`){let t=r.filter(t=>t.id!==e);a(t),W(t);return}if(t===`calculate`&&n){let t=n.querySelectorAll(`input[data-field]`),i=r.findIndex(t=>t.id===e);if(i===-1)return;let o=!1;if(t.forEach(e=>{let t=parseFloat(e.value);(isNaN(t)||t<=0)&&(o=!0,e.classList.remove(`flash-error`),e.offsetWidth,e.classList.add(`flash-error`),e.addEventListener(`animationend`,()=>e.classList.remove(`flash-error`),{once:!0}))}),o){n.classList.add(`invalid`);return}t.forEach(e=>{let t=e.dataset.field,n=parseFloat(e.value);(t===`length`||t===`width`||t===`height`||t===`real_weight`)&&(r[i][t]=n)});let s=r[i];s.length&&s.width&&s.height&&(s.volumetric_weight=x(s.length,s.width,s.height)),a(r),E=e,W(r)}}function Z(){window.addEventListener(`resize`,()=>{O(),V()}),F(),document.getElementById(`logoutBtn`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),localStorage.removeItem(c),U()}),document.getElementById(`loginBtn`)?.addEventListener(`click`,e=>{e.preventDefault(),h(`login`)}),document.getElementById(`addParcelBtn`)?.addEventListener(`click`,async()=>{if(b){let t=await o(`active`),n=t.length>0?t[t.length-1].position??t.length*10:0,r={user_id:b,status:`active`},{data:i,error:a}=await e.from(`parcels`).insert({...r,position:n+10}).select().single();!a&&i&&W(await o(`active`))}else{let e=m();if(e.length>=3){let e=document.querySelector(`.guest-notice`);e&&(e.textContent=`En mode invité la création de colis est limité à 3 - Connectez-vous pour créer plus de colis`,e.classList.add(`guest-notice--limit`),setTimeout(()=>{e.textContent=`Mode invité - Connectez-vous pour profiter de toutes les fonctionnalités`,e.classList.remove(`guest-notice--limit`)},3e3));return}e.push({id:S(),length:null,width:null,height:null,real_weight:null,volumetric_weight:null}),a(e),W(e)}});let t=()=>{let e=document.getElementById(`archivedPanel`)?.classList.contains(`open`),t=document.getElementById(`deletedPanel`)?.classList.contains(`open`),n=!e&&!t;document.querySelector(`a[data-view="active"]`)?.classList.toggle(`nav-active`,n),document.querySelector(`a[data-view="active"]`)?.classList.toggle(`nav-active--active`,n),document.querySelector(`a[data-view="archived"]`)?.classList.toggle(`nav-active`,!!e),document.querySelector(`a[data-view="archived"]`)?.classList.toggle(`nav-active--archived`,!!e),document.querySelector(`a[data-view="deleted"]`)?.classList.toggle(`nav-active`,!!t),document.querySelector(`a[data-view="deleted"]`)?.classList.toggle(`nav-active--deleted`,!!t)};document.__syncNavActive=t;let n=()=>{document.getElementById(`archivedPanel`)?.classList.remove(`open`),document.getElementById(`deletedPanel`)?.classList.remove(`open`),t()},r=()=>{document.getElementById(`deletedPanel`)?.classList.remove(`open`),document.getElementById(`archivedPanel`)?.classList.toggle(`open`),t()},s=()=>{document.getElementById(`archivedPanel`)?.classList.remove(`open`),document.getElementById(`deletedPanel`)?.classList.toggle(`open`),t()};window.innerWidth<750&&n(),document.getElementById(`archivedToggle`)?.addEventListener(`click`,r),document.getElementById(`deletedToggle`)?.addEventListener(`click`,s),document.querySelector(`a[data-view="home"]`)?.addEventListener(`click`,e=>{e.preventDefault(),v(()=>import(`./router-DQGQbAys.js`).then(e=>e.navigateTo(`home`)),__vite__mapDeps([0,1,2]),import.meta.url)}),document.querySelector(`a[data-view="active"]`)?.addEventListener(`click`,e=>{e.preventDefault(),document.getElementById(`archivedPanel`)?.classList.remove(`open`),document.getElementById(`deletedPanel`)?.classList.remove(`open`),t()}),document.querySelector(`a[data-view="archived"]`)?.addEventListener(`click`,e=>{e.preventDefault(),r()}),document.querySelector(`a[data-view="deleted"]`)?.addEventListener(`click`,e=>{e.preventDefault(),s()}),document.querySelector(`a[data-view="lists"]`)?.addEventListener(`click`,e=>{e.preventDefault(),v(()=>import(`./router-DQGQbAys.js`).then(e=>e.navigateTo(`lists`)),__vite__mapDeps([0,1,2]),import.meta.url)}),document.querySelector(`a[data-view="contact"]`)?.addEventListener(`click`,e=>{e.preventDefault(),v(()=>import(`./router-DQGQbAys.js`).then(e=>e.navigateTo(`contact`)),__vite__mapDeps([0,1,2]),import.meta.url)}),document.querySelectorAll(`.close-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let n=e.target.dataset.panel;document.getElementById(`${n}Panel`)?.classList.remove(`open`),t()})}),window.addEventListener(`resize`,()=>{window.innerWidth<750&&n()},{passive:!0}),document.getElementById(`emptyTrashBtn`)?.addEventListener(`click`,()=>{let e=document.createElement(`div`);e.className=`confirm-overlay`,e.innerHTML=`
      <div class="confirm-dialog">
        <p class="confirm-text">Voulez-vous vraiment supprimer cette liste ?<br>Elle sera perdue à jamais.</p>
        <div class="confirm-actions">
          <button class="btn btn-danger" id="confirmYes">Oui</button>
          <button class="btn btn-secondary" id="confirmNo">Non</button>
        </div>
      </div>`,document.body.appendChild(e),document.getElementById(`confirmNo`)?.addEventListener(`click`,()=>e.remove()),document.getElementById(`confirmYes`)?.addEventListener(`click`,async()=>{e.remove(),await g(),await K()})}),t(),document.getElementById(`recapBtn`)?.addEventListener(`click`,()=>Y()),i||(y(),document.addEventListener(`input`,e=>{let t=e.target;if(!t.matches(`input[data-field]`))return;let n=parseFloat(t.value),r=isNaN(n)||n<=0;if(t.classList.toggle(`error`,r),!r){let e=t.closest(`.parcel-card`);e&&(Array.from(e.querySelectorAll(`input[data-field]`)).some(e=>{let t=parseFloat(e.value);return isNaN(t)||t<=0})||e.classList.remove(`flash-invalid`))}}),document.addEventListener(`click`,async e=>{let t=e.target,n=t.closest(`.parcel-card`),r=t.closest(`.panel-item`);if(!n&&!r)return;let i=n?.dataset.id||r?.dataset.id,a=(t.closest(`[data-action]`)||t).dataset.action;if(!(!i||!a)){if(!b){X(i,a,n);return}switch(a){case`delete`:await p(i,{status:`deleted`});break;case`archive`:await p(i,{status:`archived`});break;case`restore`:await p(i,{status:`active`});break;case`archive-delete`:await p(i,{status:`deleted`});break;case`permanent-delete`:await u(i);break;case`rename`:{let e=(n?.querySelector(`.parcel-card-title-group h3`)||r?.querySelector(`.panel-item-name`))?.textContent?.trim()||``;C(i,e.startsWith(`Colis #`)?``:e,async()=>{W(await o(`active`)),K()});return}case`duplicate`:{let e=(n?.querySelector(`.parcel-card-title-group h3`))?.textContent?.trim()||``;await J(i,e.startsWith(`Colis #`)?null:e);return}case`add-to-list`:w(i,()=>K());return;case`calculate`:if(n){let e=n.querySelectorAll(`input[data-field]`),t={},r=!1;if(e.forEach(e=>{let n=parseFloat(e.value);isNaN(n)||n<=0?(r=!0,e.classList.remove(`flash-error`),e.offsetWidth,e.classList.add(`flash-error`),e.addEventListener(`animationend`,()=>e.classList.remove(`flash-error`),{once:!0})):t[e.dataset.field]=n}),r){n.classList.remove(`flash-invalid`),n.offsetWidth,n.classList.add(`flash-invalid`),n.addEventListener(`animationend`,()=>n.classList.remove(`flash-invalid`),{once:!0});return}E=i,await p(i,t)}break}W(await o(`active`)),K()}}))}function Q(e,t,n){let r=.5,i=.866,a=e,o=t,s=n,c=o*i,l=o*r,u=-a*i,d=a*r,f=(o-a)*i,p=(o+a)*r,m=c,h=l+s,g=u,_=d+s,v=f,y=p+s,b=u,x=c,S=y,C=(b+x)/2,w=(0+S)/2,T=Math.max(120,x-b+20),E=Math.max(140,S-0+20);return`
    <div class="icone-colis-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${C-T/2} ${w-E/2} ${T} ${E}" class="rotate-3d" fill="none" stroke="var(--primary)" stroke-width="${T*.01125}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; overflow: visible;">
            <!-- Face supérieure : p0-p1-p2-p3 -->
            <polygon class="box-face" points="0,0 ${c},${l} ${f},${p} ${u},${d}"/>
            <!-- Face droite (côté droit descendant) : p1-p2-p4-p6 -->
            <polygon class="box-face" points="${c},${l} ${f},${p} ${v},${y} ${m},${h}"/>
            <!-- Face gauche (côté gauche descendant) : p3-p2-p4-p5 -->
            <polygon class="box-face" points="${u},${d} ${f},${p} ${v},${y} ${g},${_}"/>
            <!-- Arêtes de faîte intérieures -->
            <polyline points="${u},${d} ${f},${p} ${c},${l}"/>
            <!-- Arête arrière verticale -->
            <line x1="${f}" y1="${p}" x2="${v}" y2="${y}"/>
        </svg>
    </div>`}export{U as renderApp};