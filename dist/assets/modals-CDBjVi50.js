import{C as e,p as t,y as n}from"./index-BFTu4jv3.js";function r(){return`guest_${Date.now()}_${Math.random().toString(36).substring(2,9)}`}function i(e,t,n){return e*t*n/5e3}function a(e,t){return Math.ceil(Math.max(e,t)*2)/2}async function o(){if(!n)return[];let{data:t,error:r}=await e.from(`lists`).select(`*`).eq(`user_id`,n).order(`created_at`,{ascending:!0});return r?[]:t||[]}async function s(t){if(!n)return null;let{data:r,error:i}=await e.from(`lists`).insert({user_id:n,name:t}).select().single();return i?null:r}async function c(t,n){let{error:r}=await e.from(`parcel_list_items`).insert({list_id:t,parcel_id:n});return!r}async function l(t){if(!n)return[];let{data:r,error:i}=await e.from(`parcel_list_items`).select(`parcel_id, position, parcels(*)`).eq(`list_id`,t).order(`position`,{ascending:!0,nullsFirst:!1}).order(`added_at`,{ascending:!0});return i?[]:(r||[]).map(e=>e.parcels).filter(Boolean)}async function u(t,n){let{error:r}=await e.from(`parcel_list_items`).delete().eq(`list_id`,t).eq(`parcel_id`,n);return!r}async function d(t){let{error:n}=await e.from(`lists`).delete().eq(`id`,t);return!n}function f(e){return new Promise(t=>{document.getElementById(`confirmModal`)?.remove();let n=document.createElement(`div`);n.id=`confirmModal`,n.className=`confirm-modal-overlay`,n.innerHTML=`
      <div class="confirm-modal">
        <p class="confirm-modal-msg">${e}</p>
        <div class="confirm-modal-actions">
          <button class="btn btn-danger confirm-modal-yes">Oui</button>
          <button class="btn btn-secondary confirm-modal-no">Non</button>
        </div>
      </div>`,document.body.appendChild(n);let r=e=>{n.remove(),t(e)};n.querySelector(`.confirm-modal-yes`).addEventListener(`click`,()=>r(!0)),n.querySelector(`.confirm-modal-no`).addEventListener(`click`,()=>r(!1)),n.addEventListener(`click`,e=>{e.target===n&&r(!1)})})}function p(e,n,r){document.getElementById(`renameModal`)?.remove();let i=document.createElement(`div`);i.id=`renameModal`,i.className=`list-modal-overlay`,i.innerHTML=`
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer le colis</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameInput" class="list-modal-input" placeholder="Nom du colis" maxlength="60" value="${n}" />
        <div class="rename-modal-actions">
          <button id="renameCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`,document.body.appendChild(i);let a=i.querySelector(`#renameInput`);a.focus(),a.select();let o=()=>i.remove();i.querySelector(`.list-modal-close`)?.addEventListener(`click`,o),i.querySelector(`#renameCancelBtn`)?.addEventListener(`click`,o),i.addEventListener(`click`,e=>{e.target===i&&o()});let s=async()=>{await t(e,{name:a.value.trim()||null}),o(),r?.()};i.querySelector(`#renameSaveBtn`)?.addEventListener(`click`,s),a.addEventListener(`keydown`,e=>{e.key===`Enter`&&s(),e.key===`Escape`&&o()})}function m(t,n,r){document.getElementById(`renameListModal`)?.remove();let i=document.createElement(`div`);i.id=`renameListModal`,i.className=`list-modal-overlay`,i.innerHTML=`
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer la liste</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameListInput" class="list-modal-input" placeholder="Nom de la liste" maxlength="80" value="${n}" />
        <div class="rename-modal-actions">
          <button id="renameListCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameListSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`,document.body.appendChild(i);let a=i.querySelector(`#renameListInput`);a.focus(),a.select();let o=()=>i.remove();i.querySelector(`.list-modal-close`)?.addEventListener(`click`,o),i.querySelector(`#renameListCancelBtn`)?.addEventListener(`click`,o),i.addEventListener(`click`,e=>{e.target===i&&o()});let s=async()=>{let n=a.value.trim();n&&(await e.from(`lists`).update({name:n}).eq(`id`,t),o(),r?.())};i.querySelector(`#renameListSaveBtn`)?.addEventListener(`click`,s),a.addEventListener(`keydown`,e=>{e.key===`Enter`&&s(),e.key===`Escape`&&o()})}function h(e,n,r){document.getElementById(`renameModal`)?.remove();let i=document.createElement(`div`);i.id=`renameModal`,i.className=`list-modal-overlay`,i.innerHTML=`
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer le colis dupliqué</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameInput" class="list-modal-input" placeholder="Nom du colis" maxlength="60" value="${n}" />
        <div class="rename-modal-actions">
          <button id="renameCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`,document.body.appendChild(i);let a=i.querySelector(`#renameInput`);a.focus(),a.select();let o=()=>i.remove();i.querySelector(`.list-modal-close`)?.addEventListener(`click`,o),i.querySelector(`#renameCancelBtn`)?.addEventListener(`click`,o),i.addEventListener(`click`,e=>{e.target===i&&o()});let s=async()=>{await t(e,{name:a.value.trim()||null}),o(),r?.()};i.querySelector(`#renameSaveBtn`)?.addEventListener(`click`,s),a.addEventListener(`keydown`,e=>{e.key===`Enter`&&s(),e.key===`Escape`&&o()})}function g(e,n){document.getElementById(`listModal`)?.remove();let r=document.createElement(`div`);r.id=`listModal`,r.className=`list-modal-overlay`,r.innerHTML=`
    <div class="list-modal">
      <div class="list-modal-header">
        <h3>Ajouter à une liste</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <div id="listModalContent"><p class="list-modal-loading">Chargement...</p></div>
      </div>
    </div>`,document.body.appendChild(r),r.querySelector(`.list-modal-close`)?.addEventListener(`click`,()=>r.remove()),r.addEventListener(`click`,e=>{e.target===r&&r.remove()}),o().then(i=>{let a=document.getElementById(`listModalContent`);i.length===0?a.innerHTML=`
        <p class="list-modal-empty">Aucune liste existante. Créez-en une !</p>
        <div class="list-modal-create">
          <input type="text" id="newListName" class="list-modal-input" placeholder="Nom de la nouvelle liste" maxlength="60" />
          <button id="createAndAddBtn" class="btn btn-list-create">Créer et ajouter</button>
        </div>
        <p id="listModalMsg" class="list-modal-msg" style="display:none;"></p>`:a.innerHTML=`
        <p class="list-modal-label">Choisir une liste :</p>
        <ul class="list-modal-list" id="listPickerItems">
          ${i.map(e=>`<li><button class="list-pick-btn" data-list-id="${e.id}">${e.name}</button></li>`).join(``)}
        </ul>
        <div class="list-modal-divider">ou créer une nouvelle liste</div>
        <div class="list-modal-create">
          <input type="text" id="newListName" class="list-modal-input" placeholder="Nom de la nouvelle liste" maxlength="60" />
          <button id="createAndAddBtn" class="btn btn-list-create">Créer et ajouter</button>
        </div>
        <p id="listModalMsg" class="list-modal-msg" style="display:none;"></p>`;let o=(e,t)=>{let n=document.getElementById(`listModalMsg`);n.textContent=e,n.className=`list-modal-msg list-modal-msg--${t?`success`:`error`}`,n.style.display=`block`};document.querySelectorAll(`.list-pick-btn`).forEach(i=>{i.addEventListener(`click`,async()=>{let a=i.dataset.listId;await c(a,e)?(await t(e,{status:`deleted`}),o(`Colis ajouté à la liste !`,!0),setTimeout(()=>{r.remove(),n?.()},1200)):(o(`Déjà dans cette liste ou erreur.`,!1),setTimeout(()=>r.remove(),1200))})}),document.getElementById(`createAndAddBtn`)?.addEventListener(`click`,async()=>{let i=document.getElementById(`newListName`),a=i.value.trim();if(!a){i.classList.add(`error`);return}let l=await s(a);if(!l){o(`Erreur lors de la création de la liste.`,!1);return}await c(l.id,e)?(await t(e,{status:`deleted`}),o(`Colis ajouté à la liste "${a}" !`,!0),setTimeout(()=>{r.remove(),n?.()},1200)):(o(`Erreur lors de l'ajout du colis.`,!1),setTimeout(()=>r.remove(),1200))})})}export{h as a,l as c,i as d,r as f,p as i,u as l,f as n,d as o,m as r,o as s,g as t,a as u};