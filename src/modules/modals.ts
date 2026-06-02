// ─── Modal components ────────────────────────────────────────────────────────
// Callbacks are used instead of direct page imports to stay decoupled.
import { supabase } from '../../lib/supabase';
import { updateParcelDb } from './api/parcels';
import { fetchLists, createList, addParcelToList } from './api/lists';

// ── Confirm dialog ─────────────────────────────────────────────────────────

export function showConfirmModal(message: string): Promise<boolean> {
  return new Promise(resolve => {
    document.getElementById('confirmModal')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'confirmModal';
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <p class="confirm-modal-msg">${message}</p>
        <div class="confirm-modal-actions">
          <button class="btn btn-danger confirm-modal-yes">Oui</button>
          <button class="btn btn-secondary confirm-modal-no">Non</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const done = (r: boolean) => { overlay.remove(); resolve(r); };
    overlay.querySelector('.confirm-modal-yes')!.addEventListener('click', () => done(true));
    overlay.querySelector('.confirm-modal-no')!.addEventListener('click', () => done(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) done(false); });
  });
}

// ── Rename parcel ──────────────────────────────────────────────────────────

/**
 * @param onAfterSave Called after the DB write so the caller can refresh the UI.
 */
export function showRenameModal(
  parcelId: string, currentName: string, onAfterSave?: () => void
) {
  document.getElementById('renameModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'renameModal';
  modal.className = 'list-modal-overlay';
  modal.innerHTML = `
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer le colis</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameInput" class="list-modal-input" placeholder="Nom du colis" maxlength="60" value="${currentName}" />
        <div class="rename-modal-actions">
          <button id="renameCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const input = modal.querySelector('#renameInput') as HTMLInputElement;
  input.focus(); input.select();
  const close = () => modal.remove();
  modal.querySelector('.list-modal-close')?.addEventListener('click', close);
  modal.querySelector('#renameCancelBtn')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const save = async () => {
    await updateParcelDb(parcelId, { name: input.value.trim() || null });
    close();
    onAfterSave?.();
  };
  modal.querySelector('#renameSaveBtn')?.addEventListener('click', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); });
}

// ── Rename list ────────────────────────────────────────────────────────────

export function showRenameListModal(
  listId: string, currentName: string, onAfterSave?: () => void
) {
  document.getElementById('renameListModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'renameListModal';
  modal.className = 'list-modal-overlay';
  modal.innerHTML = `
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer la liste</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameListInput" class="list-modal-input" placeholder="Nom de la liste" maxlength="80" value="${currentName}" />
        <div class="rename-modal-actions">
          <button id="renameListCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameListSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const input = modal.querySelector('#renameListInput') as HTMLInputElement;
  input.focus(); input.select();
  const close = () => modal.remove();
  modal.querySelector('.list-modal-close')?.addEventListener('click', close);
  modal.querySelector('#renameListCancelBtn')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const save = async () => {
    const name = input.value.trim();
    if (!name) return;
    await supabase.from('lists').update({ name }).eq('id', listId);
    close();
    onAfterSave?.();
  };
  modal.querySelector('#renameListSaveBtn')?.addEventListener('click', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); });
}

// ── Rename duplicated parcel (list context) ────────────────────────────────

export function showRenameModalForList(
  parcelId: string, currentName: string, onAfterSave?: () => void
) {
  document.getElementById('renameModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'renameModal';
  modal.className = 'list-modal-overlay';
  modal.innerHTML = `
    <div class="list-modal list-modal--rename">
      <div class="list-modal-header">
        <h3>Renommer le colis dupliqué</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <input type="text" id="renameInput" class="list-modal-input" placeholder="Nom du colis" maxlength="60" value="${currentName}" />
        <div class="rename-modal-actions">
          <button id="renameCancelBtn" class="btn btn-secondary">Annuler</button>
          <button id="renameSaveBtn" class="btn btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const input = modal.querySelector('#renameInput') as HTMLInputElement;
  input.focus(); input.select();
  const close = () => modal.remove();
  modal.querySelector('.list-modal-close')?.addEventListener('click', close);
  modal.querySelector('#renameCancelBtn')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  const save = async () => {
    await updateParcelDb(parcelId, { name: input.value.trim() || null });
    close();
    onAfterSave?.();
  };
  modal.querySelector('#renameSaveBtn')?.addEventListener('click', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); });
}

// ── Add to list ────────────────────────────────────────────────────────────

export function showAddToListModal(parcelId: string, onAfterSave?: () => void) {
  document.getElementById('listModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'listModal';
  modal.className = 'list-modal-overlay';
  modal.innerHTML = `
    <div class="list-modal">
      <div class="list-modal-header">
        <h3>Ajouter à une liste</h3>
        <button class="list-modal-close">&times;</button>
      </div>
      <div class="list-modal-body">
        <div id="listModalContent"><p class="list-modal-loading">Chargement...</p></div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('.list-modal-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  fetchLists().then(lists => {
    const content = document.getElementById('listModalContent')!;
    if (lists.length === 0) {
      content.innerHTML = `
        <p class="list-modal-empty">Aucune liste existante. Créez-en une !</p>
        <div class="list-modal-create">
          <input type="text" id="newListName" class="list-modal-input" placeholder="Nom de la nouvelle liste" maxlength="60" />
          <button id="createAndAddBtn" class="btn btn-list-create">Créer et ajouter</button>
        </div>
        <p id="listModalMsg" class="list-modal-msg" style="display:none;"></p>`;
    } else {
      content.innerHTML = `
        <p class="list-modal-label">Choisir une liste :</p>
        <ul class="list-modal-list" id="listPickerItems">
          ${lists.map(l => `<li><button class="list-pick-btn" data-list-id="${l.id}">${l.name}</button></li>`).join('')}
        </ul>
        <div class="list-modal-divider">ou créer une nouvelle liste</div>
        <div class="list-modal-create">
          <input type="text" id="newListName" class="list-modal-input" placeholder="Nom de la nouvelle liste" maxlength="60" />
          <button id="createAndAddBtn" class="btn btn-list-create">Créer et ajouter</button>
        </div>
        <p id="listModalMsg" class="list-modal-msg" style="display:none;"></p>`;
    }

    const showMsg = (text: string, ok: boolean) => {
      const msg = document.getElementById('listModalMsg')!;
      msg.textContent = text;
      msg.className = `list-modal-msg list-modal-msg--${ok ? 'success' : 'error'}`;
      msg.style.display = 'block';
    };

    document.querySelectorAll('.list-pick-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const listId = (btn as HTMLElement).dataset.listId!;
        const ok = await addParcelToList(listId, parcelId);
        if (ok) {
          await updateParcelDb(parcelId, { status: 'deleted' });
          showMsg('Colis ajouté à la liste !', true);
          setTimeout(() => { modal.remove(); onAfterSave?.(); }, 1200);
        } else {
          showMsg('Déjà dans cette liste ou erreur.', false);
          setTimeout(() => modal.remove(), 1200);
        }
      });
    });

    document.getElementById('createAndAddBtn')?.addEventListener('click', async () => {
      const nameInput = document.getElementById('newListName') as HTMLInputElement;
      const name = nameInput.value.trim();
      if (!name) { nameInput.classList.add('error'); return; }
      const list = await createList(name);
      if (!list) { showMsg('Erreur lors de la création de la liste.', false); return; }
      const ok = await addParcelToList(list.id, parcelId);
      if (ok) {
        await updateParcelDb(parcelId, { status: 'deleted' });
        showMsg(`Colis ajouté à la liste "${name}" !`, true);
        setTimeout(() => { modal.remove(); onAfterSave?.(); }, 1200);
      } else {
        showMsg("Erreur lors de l'ajout du colis.", false);
        setTimeout(() => modal.remove(), 1200);
      }
    });
  });
}
