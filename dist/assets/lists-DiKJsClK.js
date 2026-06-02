const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./jspdf.es.min-CKW1BDYU.js","./index-BFTu4jv3.js","./index-DNwTOPjC.css","./typeof-B5XbjTb1.js"])))=>i.map(i=>d[i]);
import{C as e,S as t,_ as n,a as r,h as i,m as a,n as o,o as s,p as c,t as l,v as u,w as d,y as f}from"./index-BFTu4jv3.js";import{a as p,c as m,i as h,l as g,n as _,o as v,r as y,s as b,u as x}from"./modals-CDBjVi50.js";async function S(){t((await a())?.id||null);let d=f?await b():[];n.innerHTML=`
    <header>
      <div class="header-content">
        <span class="header-brand">Ship4Cheap</span>
        <button class="nav-toggle" id="navToggle" aria-label="Menu navigation"><span></span><span></span><span></span></button>
        ${f?`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists" class="nav-active nav-active--lists">Mes listes</a>
      <a href="#" data-view="contact">Contact</a>
    </nav>
    <div class="header-right">${s()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>`:`
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <span class="nav-disabled" title="Indisponible">Colis archivés</span>
      <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
      <span class="nav-disabled" title="Indisponible">Mes listes</span>
      <a href="#" data-view="contact">Contact</a>
    </nav>
    <div class="header-right">${s()}<button id="loginBtn" class="btn btn-primary btn-logout btn-login">Connexion</button></div>`}
      </div>
    </header>
    <main class="container container--lists">
      <div id="listsContainer">
        ${d.length===0?`<div class="empty-state"><div class="empty-icon">📋</div><p>Aucune liste pour le moment.<br/>Ajoutez un colis à une liste depuis les panneaux Archivés ou Corbeille.</p></div>`:d.map(e=>`
            <div class="list-card" data-list-id="${e.id}">
              <div class="list-card-header">
                <div class="list-card-title-wrapper">
                  <h3 class="list-card-title">${e.name}</h3>
                  <button class="btn-rename-list" data-action="rename-list" data-list-id="${e.id}" title="Renommer la liste">&#9998;</button>
                </div>
                <div class="list-sort-bar">
                  <span class="list-sort-label">Trier :</span>
                  <button class="btn-sort" data-list-id="${e.id}" data-sort-field="pr" data-sort-dir="desc">poids réel</button>
                  <button class="btn-sort" data-list-id="${e.id}" data-sort-field="pv" data-sort-dir="desc">poids vol.</button>
                  <button class="btn-sort" data-list-id="${e.id}" data-sort-field="pf" data-sort-dir="desc">poids fact.</button>
                  <button class="btn-sort" data-list-id="${e.id}" data-sort-field="vol" data-sort-dir="desc">vol.</button>
                </div>
                <div class="list-card-header-actions">
                  <button class="btn btn-small btn-csv" data-action="export-csv" data-list-id="${e.id}">export .csv</button>
                  <button class="btn btn-small btn-pdf" data-action="print-pdf" data-list-id="${e.id}">Imp. en .pdf</button>
                  <button class="btn btn-small btn-danger" data-action="delete-list" data-list-id="${e.id}">Supprimer</button>
                </div>
              </div>
              <div class="list-body">
                <div class="list-summary" id="listSummary_${e.id}">
                  <div class="list-summary-title">rapport générale</div>
                  <div class="list-summary-grid">
                    <span>Pr total : <strong>–</strong></span>
                    <span>Pv total : <strong>–</strong></span>
                    <span>Pf total : <strong>–</strong></span>
                    <span>Vol total : <strong>–</strong></span>
                  </div>
                  <div class="list-summary-eco">éco possible : <strong>–</strong></div>
                  <div class="list-summary-count">nbr : <strong>– colis</strong></div>
                </div>
                <div class="list-parcels" id="listParcels_${e.id}">
                  <p class="list-loading">Chargement...</p>
                </div>
              </div>
            </div>`).join(``)}
      </div>
    </main>
    ${i}`,o(),r(),u(),document.getElementById(`logoutBtn`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),t(null),l(`login`)}),document.getElementById(`loginBtn`)?.addEventListener(`click`,e=>{e.preventDefault(),l(`login`)});let p={},E=(e,t)=>t===`pr`?e.real_weight??0:t===`pv`?e.volumetric_weight??0:t===`pf`?e.real_weight&&e.volumetric_weight?x(e.real_weight,e.volumetric_weight):0:t===`vol`&&e.length&&e.width&&e.height?e.length*e.width*e.height:0,D={},O=(e,t)=>{let n=document.getElementById(`listParcels_${e}`);if(!n)return;if(t.length===0){n.innerHTML=`<p style="color:#888;font-size:0.85rem;">Aucun colis dans cette liste.</p>`;return}let r=p[e];n.innerHTML=(r?[...t].sort((e,t)=>{let n=E(e,r.field),i=E(t,r.field);return r.dir===`desc`?i-n:n-i}):t).map((t,n)=>{let r=t.volumetric_weight,i=t.real_weight&&r?x(t.real_weight,r):null,a=i!==null&&t.real_weight?i-t.real_weight:null,o=t.length&&t.width&&t.height?`${t.length.toFixed(0)}cm x ${t.width.toFixed(0)}cm x ${t.height.toFixed(0)}cm`:`-`;return`
        <div class="list-parcel-card" data-parcel-id="${t.id}">
          <div class="list-parcel-num-row">
            <div class="list-parcel-num">${n+1}</div>
            ${t.name?`<span class="list-parcel-name">${t.name}</span>`:``}
            <button class="btn-rename btn-rename--list" data-action="rename-list-parcel" data-parcel-id="${t.id}" title="Renommer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          </div>
          <div class="list-parcel-dim">Dim : <strong>${o}</strong></div>
          <div class="list-parcel-row">
            <span>Pr : <strong>${t.real_weight?.toFixed(1)??`-`}kg</strong></span>
            <span>Pv : <strong>${r?.toFixed(1)??`-`}kg</strong></span>
          </div>
          <div class="list-parcel-pf">Pf : <strong>${i?.toFixed(1)??`-`}kg</strong></div>
          <div class="list-parcel-eco ${a!==null&&a>0?`has-eco`:``}">
            ${a!==null&&a>0?`éco possible : <strong>${a.toFixed(1)}kg fact</strong>`:`pas d'éco possible`}
          </div>
          <div class="list-parcel-btns">
            <button class="btn btn-small btn-danger list-parcel-remove" data-action="remove-from-list" data-list-id="${e}" data-parcel-id="${t.id}">Retirer</button>
            <button class="btn btn-small btn-secondary list-parcel-archive" data-action="archive-from-list" data-list-id="${e}" data-parcel-id="${t.id}">Archiver</button>
            <button class="btn btn-small btn-duplicate-list" data-action="duplicate-from-list" data-parcel-id="${t.id}">x2</button>
          </div>
        </div>`}).join(``)};if(document.querySelectorAll(`.btn-sort`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.listId,n=e.dataset.sortField,r=p[t],i=r?.field===n&&r.dir===`desc`?`asc`:`desc`;p[t]={field:n,dir:i},document.querySelectorAll(`.btn-sort[data-list-id="${t}"]`).forEach(e=>e.classList.remove(`btn-sort--active`,`btn-sort--asc`,`btn-sort--desc`)),e.classList.add(`btn-sort--active`,`btn-sort--${i}`),D[t]&&O(t,D[t])})}),f)for(let e of d){let t=await m(e.id);D[e.id]=t;let n=t.reduce((e,t)=>e+(t.real_weight??0),0),r=t.reduce((e,t)=>e+(t.volumetric_weight??0),0),i=t.reduce((e,t)=>!t.real_weight||!t.volumetric_weight?e:e+x(t.real_weight,t.volumetric_weight),0),a=t.reduce((e,t)=>{if(!t.real_weight||!t.volumetric_weight)return e;let n=x(t.real_weight,t.volumetric_weight)-t.real_weight;return e+(n>0?n:0)},0),o=t.reduce((e,t)=>!t.length||!t.width||!t.height?e:e+t.length*t.width*t.height/1e6,0),s=document.getElementById(`listSummary_${e.id}`);s&&(s.innerHTML=`
        <div class="list-summary-title">rapport générale</div>
        <div class="list-summary-grid">
          <span>Pr total : <strong>${n.toFixed(1)}kg</strong></span>
          <span>Pv total : <strong>${r.toFixed(1)}kg</strong></span>
          <span>Pf total : <strong>${i.toFixed(1)}kg</strong></span>
          <span>Vol total : <strong>${o.toFixed(2)}m³</strong></span>
        </div>
        <div class="list-summary-eco">éco possible : <strong>${a.toFixed(1)}kg fact</strong></div>
        <div class="list-summary-count">nbr : <strong>${t.length} colis</strong></div>`),O(e.id,t)}document.addEventListener(`click`,async function e(t){if(!document.getElementById(`listsContainer`)){document.removeEventListener(`click`,e);return}let n=t.target,r=n.closest(`[data-action]`)||n,i=r.dataset.action;if(i){if(i===`export-csv`){await w(r.dataset.listId);return}if(i===`print-pdf`){await T(r.dataset.listId);return}if(i===`rename-list`){let e=(r.closest(`.list-card-title-wrapper`)?.querySelector(`.list-card-title`))?.textContent?.trim()||``;y(r.dataset.listId,e,()=>S());return}if(i===`delete-list`){await _(`Voulez-vous vraiment supprimer cette liste ?<br>Elle sera perdue à jamais.`)&&(await v(r.dataset.listId),S());return}if(i===`rename-list-parcel`){let e=(r.closest(`.list-parcel-num-row`)?.querySelector(`.list-parcel-name`))?.textContent?.trim()||``;h(r.dataset.parcelId,e,()=>S());return}if(i===`remove-from-list`){await g(r.dataset.listId,r.dataset.parcelId),S();return}if(i===`archive-from-list`){await c(r.dataset.parcelId,{status:`archived`}),await g(r.dataset.listId,r.dataset.parcelId),S();return}if(i===`duplicate-from-list`){let e=r.closest(`.list-card`)?.getAttribute(`data-list-id`)||``,t=(r.closest(`.list-parcel-card`)?.querySelector(`.list-parcel-name`))?.textContent?.trim()||``;await C(r.dataset.parcelId,t||null,e);return}}})}async function C(t,n,r){let{data:i,error:a}=await e.from(`parcels`).select(`*`).eq(`id`,t).maybeSingle();if(a||!i)return;let o=i,{data:s}=await e.from(`parcel_list_items`).select(`id, parcel_id, position, added_at`).eq(`list_id`,r).order(`position`,{ascending:!0,nullsFirst:!1}).order(`added_at`,{ascending:!0}),c=s||[];for(let t=0;t<c.length;t++)await e.from(`parcel_list_items`).update({position:(t+1)*10}).eq(`id`,c[t].id);let l=c.findIndex(e=>e.parcel_id===t),u=(l+1)*10;for(let t=l+1;t<c.length;t++)await e.from(`parcel_list_items`).update({position:(t+1)*10+10}).eq(`id`,c[t].id);let{data:d,error:m}=await e.from(`parcels`).insert({user_id:f,length:o.length,width:o.width,height:o.height,real_weight:o.real_weight,status:`archived`}).select().single();if(m||!d)return;let h=d;await e.from(`parcel_list_items`).insert({list_id:r,parcel_id:h.id,position:u+5}),p(h.id,n||o.name||``,()=>S())}async function w(e){let t=document.querySelector(`.list-card[data-list-id="${e}"] .list-card-title`)?.textContent?.trim()||`liste`,n=await m(e),r=[`N°`,`Longueur (cm)`,`Largeur (cm)`,`Hauteur (cm)`,`Poids réel (kg)`,`Poids volumétrique (kg)`,`Poids facturé (kg)`,`Éco possible (kg)`],i=n.map((e,t)=>{let n=e.volumetric_weight??null,r=e.real_weight&&n?x(e.real_weight,n):null,i=r!==null&&e.real_weight?Math.max(0,r-e.real_weight):null;return[t+1,e.length??``,e.width??``,e.height??``,e.real_weight??``,n??``,r===null?``:r.toFixed(2),i===null?``:i.toFixed(2)]}),a=n.reduce((e,t)=>e+(t.real_weight??0),0),o=n.reduce((e,t)=>e+(t.volumetric_weight??0),0),s=n.reduce((e,t)=>!t.real_weight||!t.volumetric_weight?e:e+x(t.real_weight,t.volumetric_weight),0),c=n.reduce((e,t)=>!t.real_weight||!t.volumetric_weight?e:e+Math.max(0,x(t.real_weight,t.volumetric_weight)-t.real_weight),0),l=n.reduce((e,t)=>!t.length||!t.width||!t.height?e:e+t.length*t.width*t.height/1e6,0),u=[`Rapport générale`,`Pr total (kg)`,`Pv total (kg)`,`Pf total (kg)`,`Vol total (m³)`,`Éco possible (kg)`,`Nombre de colis`],d=[`TOTAL`,a.toFixed(2),o.toFixed(2),s.toFixed(2),l.toFixed(4),c.toFixed(2),n.length],f=e=>`"${String(e).replace(/"/g,`""`)}"`,p=[r,...i].map(e=>e.map(f).join(`;`)).concat([``,u.map(f).join(`;`),d.map(f).join(`;`)]).join(`
`),h=URL.createObjectURL(new Blob([`﻿`+p],{type:`text/csv;charset=utf-8;`})),g=document.createElement(`a`);g.href=h,g.download=`${t.replace(/[^a-z0-9_\-]/gi,`_`)}.csv`,g.click(),URL.revokeObjectURL(h)}async function T(e){let{default:t}=await d(async()=>{let{default:e}=await import(`./jspdf.es.min-CKW1BDYU.js`);return{default:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),n=document.querySelector(`.list-card[data-list-id="${e}"] .list-card-title`)?.textContent?.trim()||`Liste`,r=await m(e),i=r.reduce((e,t)=>e+(t.real_weight??0),0),a=r.reduce((e,t)=>e+(t.volumetric_weight??0),0),o=r.reduce((e,t)=>!t.real_weight||!t.volumetric_weight?e:e+x(t.real_weight,t.volumetric_weight),0),s=r.reduce((e,t)=>!t.real_weight||!t.volumetric_weight?e:e+Math.max(0,x(t.real_weight,t.volumetric_weight)-t.real_weight),0),c=r.reduce((e,t)=>!t.length||!t.width||!t.height?e:e+t.length*t.width*t.height/1e6,0),l=getComputedStyle(document.documentElement),u=(e,t)=>l.getPropertyValue(e).trim()||t,f=e=>{let t=e.replace(`#`,``);return[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)]},[p,h,g]=f(u(`--primary`,`#2563eb`)),[_,v,y]=f(u(`--navy`,`#1a2744`)),[b,S,C]=f(u(`--surface`,`#ffffff`)),[w,T,E]=f(u(`--border`,`#dde3ef`)),[D,O,k]=f(u(`--slate`,`#64748b`)),[A,j,M]=f(u(`--text`,`#111827`)),N=new t({orientation:`portrait`,unit:`mm`,format:`a4`,compress:!0}),P=()=>N.setTextColor(p,h,g),F=()=>N.setTextColor(_,v,y),I=()=>N.setTextColor(D,O,k),L=()=>N.setTextColor(A,j,M),R=()=>N.setTextColor(255,255,255),z=12;N.setFillColor(p,h,g),N.rect(14,z,14,14,`F`),N.setFillColor(Math.min(p+60,255),Math.min(h+60,255),Math.min(g+60,255)),N.rect(16,z+2,4,4,`F`),R(),N.setFont(`helvetica`,`bold`),N.setFontSize(5.5),N.text(`SHIP`,15.8,z+5.2),N.setFontSize(7),N.text(`4`,19.5,z+9.2),N.setFontSize(5),N.text(`CHEAP`,15.5,z+13),F(),N.setFont(`helvetica`,`bold`),N.setFontSize(11),N.text(`Ship4Cheap`,31,z+6.5),I(),N.setFont(`helvetica`,`normal`),N.setFontSize(6.5),N.text(`save space save money`,31,z+11.5),F(),N.setFont(`helvetica`,`bold`),N.setFontSize(18),N.text(n,210/2,z+7.5,{align:`center`}),I(),N.setFont(`helvetica`,`normal`),N.setFontSize(8),N.text(`Imprimé le ${new Date().toLocaleDateString(`fr-FR`,{day:`2-digit`,month:`long`,year:`numeric`})}`,210/2,z+13.5,{align:`center`}),z+=19,N.setDrawColor(p,h,g),N.setLineWidth(.6),N.line(14,z,196,z),N.setLineWidth(.2),z+=7,N.setFillColor(b,S,C),N.setDrawColor(w,T,E),N.roundedRect(14,z,182,48,2,2,`FD`),P(),N.setFont(`helvetica`,`bold`),N.setFontSize(10),N.text(`RAPPORT GÉNÉRAL`,20,z+9),N.setDrawColor(p,h,g),N.setLineWidth(.4),N.line(20,z+11,190,z+11),N.setLineWidth(.2);let B=z+19;[{label:`Poids réel total :`,value:`${i.toFixed(2)} kg`},{label:`Poids volumétrique total :`,value:`${a.toFixed(2)} kg`},{label:`Poids facturé total :`,value:`${o.toFixed(2)} kg`},{label:`Volume total :`,value:`${c.toFixed(3)} m³`}].forEach((e,t)=>{let n=t%2,r=Math.floor(t/2),i=20+n*91,a=B+r*8;I(),N.setFont(`helvetica`,`normal`),N.setFontSize(8),N.text(e.label,i,a),F(),N.setFont(`helvetica`,`bold`),N.text(e.value,i+N.getTextWidth(e.label)+2,a)});let V=z+48-7.5;P(),N.setFont(`helvetica`,`bold`),N.setFontSize(8.5),N.text(`Économie possible : ${s.toFixed(2)} kg facturés`,20,V),I(),N.setFont(`helvetica`,`normal`),N.setFontSize(8),N.text(`Nombre de colis : ${r.length}`,190,V,{align:`right`}),z+=56;let H=r.map((e,t)=>{let n=e.volumetric_weight??null,r=e.real_weight&&n?x(e.real_weight,n):null,i=r!==null&&e.real_weight?r-e.real_weight:null;return{name:e.name||`Colis #${t+1}`,dimStr:e.length&&e.width&&e.height?`${e.length.toFixed(0)} x ${e.width.toFixed(0)} x ${e.height.toFixed(0)} cm`:null,realW:e.real_weight??null,volW:n,billedW:r,savings:i}}),U=6.5,W=e=>10+[e.dimStr,e.realW,e.volW,e.billedW].filter(e=>e!==null).length*U+(e.savings!==null&&e.savings>0?10:0)+4,G=0,K=z,q=0;for(let e=0;e<H.length;e++){let t=H[e],n=W(t);if(G===0){let t=e+1<H.length?W(H[e+1]):0;q=Math.max(n,t),z+q>277?(N.addPage(),z=12,K=z):K=z}let r=G===0?14:108;N.setFillColor(b,S,C),N.setDrawColor(w,T,E),N.setLineWidth(.25),N.roundedRect(r,K,88,n,2,2,`FD`),N.setFont(`helvetica`,`bold`),N.setFontSize(7);let i=Math.min(N.getTextWidth(t.name)+8,78);N.setFillColor(p,h,g),N.roundedRect(r+4,K+2,i,6,2,2,`F`),R();let a=t.name;for(;a.length>1&&N.getTextWidth(a)>i-4;)a=a.slice(0,-1);a!==t.name&&(a=a.slice(0,-1)+`…`),N.text(a,r+4+i/2,K+2+6-1.5,{align:`center`});let o=K+6+4+2,s=r+5,c=r+88-5,l=(e,t,n=!1)=>{I(),N.setFont(`helvetica`,`normal`),N.setFontSize(7.5),N.text(e,s,o),n?F():L(),N.setFont(`helvetica`,`bold`),N.text(t,c,o,{align:`right`}),o+=U};t.dimStr!==null&&l(`Dimensions`,t.dimStr),t.realW!==null&&l(`Poids réel`,`${t.realW.toFixed(2)} kg`),t.volW!==null&&l(`Poids volumétrique`,`${t.volW.toFixed(2)} kg`),t.billedW!==null&&l(`Poids facturé`,`${t.billedW.toFixed(2)} kg`,!0),t.savings!==null&&t.savings>0&&(N.setDrawColor(w,T,E),N.setLineWidth(.2),N.line(s,o,c,o),o+=3.5,P(),N.setFont(`helvetica`,`bold`),N.setFontSize(7.5),N.text(`Économie possible : ${t.savings.toFixed(2)} kg fact.`,s,o)),G===0?G=1:(G=0,z=K+q+5)}let J=N.getNumberOfPages();for(let e=1;e<=J;e++)N.setPage(e),I(),N.setFont(`helvetica`,`normal`),N.setFontSize(8),N.text(`Page ${e} / ${J}`,210/2,291,{align:`center`});N.save(`${n}.pdf`)}export{S as renderLists};