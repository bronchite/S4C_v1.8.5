// ─── Lists page ─────────────────────────────────────────────────────────────
import { supabase } from '../../lib/supabase';
import type { Parcel } from '../../lib/types';
import { app, FOOTER_HTML, currentUser, setCurrentUser, attachNavToggle } from '../modules/state';
import { getThemeButtonsHtml, attachThemeListeners } from '../modules/theme';
import { calculateBilledWeight } from '../modules/utils';
import { getCurrentUser } from '../modules/api/auth';
import { updateParcelDb } from '../modules/api/parcels';
import { fetchLists, fetchParcelsInList, removeParcelFromList, deleteList } from '../modules/api/lists';
import { showConfirmModal, showRenameListModal, showRenameModal, showRenameModalForList } from '../modules/modals';
import { attachNavListeners } from './router';
import { renderAuth } from './auth';

export async function renderLists() {
  const user = await getCurrentUser();
  setCurrentUser(user?.id || null);
  const lists = currentUser ? await fetchLists() : [];

  const headerNav = currentUser ? `
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists" class="nav-active nav-active--lists">Mes listes</a>
      <a href="#" data-view="contact">Contact</a>
    </nav>
    <div class="header-right">${getThemeButtonsHtml()}<button id="logoutBtn" class="btn btn-danger btn-logout">Déconnexion</button></div>`
  : `
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <span class="nav-disabled" title="Indisponible">Colis archivés</span>
      <span class="nav-disabled" title="Indisponible">Colis supprimés</span>
      <span class="nav-disabled" title="Indisponible">Mes listes</span>
      <a href="#" data-view="contact">Contact</a>
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
    <main class="container container--lists">
      <div id="listsContainer">
        ${lists.length === 0
          ? `<div class="empty-state"><div class="empty-icon">📋</div><p>Aucune liste pour le moment.<br/>Ajoutez un colis à une liste depuis les panneaux Archivés ou Corbeille.</p></div>`
          : lists.map(list => `
            <div class="list-card" data-list-id="${list.id}">
              <div class="list-card-header">
                <div class="list-card-title-wrapper">
                  <h3 class="list-card-title">${list.name}</h3>
                  <button class="btn-rename-list" data-action="rename-list" data-list-id="${list.id}" title="Renommer la liste">&#9998;</button>
                </div>
                <div class="list-sort-bar">
                  <span class="list-sort-label">Trier :</span>
                  <button class="btn-sort" data-list-id="${list.id}" data-sort-field="pr" data-sort-dir="desc">poids réel</button>
                  <button class="btn-sort" data-list-id="${list.id}" data-sort-field="pv" data-sort-dir="desc">poids vol.</button>
                  <button class="btn-sort" data-list-id="${list.id}" data-sort-field="pf" data-sort-dir="desc">poids fact.</button>
                  <button class="btn-sort" data-list-id="${list.id}" data-sort-field="vol" data-sort-dir="desc">vol.</button>
                </div>
                <div class="list-card-header-actions">
                  <button class="btn btn-small btn-csv" data-action="export-csv" data-list-id="${list.id}">export .csv</button>
                  <button class="btn btn-small btn-pdf" data-action="print-pdf" data-list-id="${list.id}">Imp. en .pdf</button>
                  <button class="btn btn-small btn-danger" data-action="delete-list" data-list-id="${list.id}">Supprimer</button>
                </div>
              </div>
              <div class="list-body">
                <div class="list-summary" id="listSummary_${list.id}">
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
                <div class="list-parcels" id="listParcels_${list.id}">
                  <p class="list-loading">Chargement...</p>
                </div>
              </div>
            </div>`).join('')}
      </div>
    </main>
    ${FOOTER_HTML}`;

  // ── Nav listeners ────────────────────────────────────────────────────────
  attachNavListeners();
  attachThemeListeners();
  attachNavToggle();
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut(); setCurrentUser(null); renderAuth('login');
  });
  document.getElementById('loginBtn')?.addEventListener('click', e => { e.preventDefault(); renderAuth('login'); });

  // ── Sorting state ────────────────────────────────────────────────────────
  const sortState: Record<string, { field: string; dir: 'asc'|'desc' }> = {};
  const sortVal = (p: Parcel, f: string): number => {
    if (f === 'pr') return p.real_weight ?? 0;
    if (f === 'pv') return p.volumetric_weight ?? 0;
    if (f === 'pf') return p.real_weight && p.volumetric_weight ? calculateBilledWeight(p.real_weight, p.volumetric_weight) : 0;
    if (f === 'vol') return (p.length && p.width && p.height) ? p.length * p.width * p.height : 0;
    return 0;
  };
  const parcelsCache: Record<string, Parcel[]> = {};

  const renderParcelsForList = (listId: string, parcels: Parcel[]) => {
    const container = document.getElementById(`listParcels_${listId}`);
    if (!container) return;
    if (parcels.length === 0) {
      container.innerHTML = `<p style="color:#888;font-size:0.85rem;">Aucun colis dans cette liste.</p>`; return;
    }
    const sort   = sortState[listId];
    const sorted = sort ? [...parcels].sort((a, b) => {
      const va = sortVal(a, sort.field); const vb = sortVal(b, sort.field);
      return sort.dir === 'desc' ? vb - va : va - vb;
    }) : parcels;
    const SVG_EDIT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    container.innerHTML = sorted.map((parcel, idx) => {
      const vw = parcel.volumetric_weight;
      const bw = parcel.real_weight && vw ? calculateBilledWeight(parcel.real_weight, vw) : null;
      const sv = bw !== null && parcel.real_weight ? bw - parcel.real_weight : null;
      const dimStr = (parcel.length && parcel.width && parcel.height)
        ? `${parcel.length.toFixed(0)}cm x ${parcel.width.toFixed(0)}cm x ${parcel.height.toFixed(0)}cm` : '-';
      return `
        <div class="list-parcel-card" data-parcel-id="${parcel.id}">
          <div class="list-parcel-num-row">
            <div class="list-parcel-num">${idx + 1}</div>
            ${parcel.name ? `<span class="list-parcel-name">${parcel.name}</span>` : ''}
            <button class="btn-rename btn-rename--list" data-action="rename-list-parcel" data-parcel-id="${parcel.id}" title="Renommer">${SVG_EDIT}</button>
          </div>
          <div class="list-parcel-dim">Dim : <strong>${dimStr}</strong></div>
          <div class="list-parcel-row">
            <span>Pr : <strong>${parcel.real_weight?.toFixed(1) ?? '-'}kg</strong></span>
            <span>Pv : <strong>${vw?.toFixed(1) ?? '-'}kg</strong></span>
          </div>
          <div class="list-parcel-pf">Pf : <strong>${bw?.toFixed(1) ?? '-'}kg</strong></div>
          <div class="list-parcel-eco ${sv !== null && sv > 0 ? 'has-eco' : ''}">
            ${sv !== null && sv > 0 ? `éco possible : <strong>${sv.toFixed(1)}kg fact</strong>` : `pas d'éco possible`}
          </div>
          <div class="list-parcel-btns">
            <button class="btn btn-small btn-danger list-parcel-remove" data-action="remove-from-list" data-list-id="${listId}" data-parcel-id="${parcel.id}">Retirer</button>
            <button class="btn btn-small btn-secondary list-parcel-archive" data-action="archive-from-list" data-list-id="${listId}" data-parcel-id="${parcel.id}">Archiver</button>
            <button class="btn btn-small btn-duplicate-list" data-action="duplicate-from-list" data-parcel-id="${parcel.id}">x2</button>
          </div>
        </div>`;
    }).join('');
  };

  document.querySelectorAll<HTMLButtonElement>('.btn-sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const listId = btn.dataset.listId!; const field = btn.dataset.sortField!;
      const cur = sortState[listId];
      const dir: 'asc'|'desc' = (cur?.field === field && cur.dir === 'desc') ? 'asc' : 'desc';
      sortState[listId] = { field, dir };
      document.querySelectorAll<HTMLButtonElement>(`.btn-sort[data-list-id="${listId}"]`)
        .forEach(b => b.classList.remove('btn-sort--active','btn-sort--asc','btn-sort--desc'));
      btn.classList.add('btn-sort--active', `btn-sort--${dir}`);
      if (parcelsCache[listId]) renderParcelsForList(listId, parcelsCache[listId]);
    });
  });

  // ── Load each list's parcels + summary ───────────────────────────────────
  if (currentUser) {
    for (const list of lists) {
      const parcels = await fetchParcelsInList(list.id);
      parcelsCache[list.id] = parcels;
      const tPr  = parcels.reduce((s,p) => s + (p.real_weight ?? 0), 0);
      const tPv  = parcels.reduce((s,p) => s + (p.volumetric_weight ?? 0), 0);
      const tPf  = parcels.reduce((s,p) => (!p.real_weight || !p.volumetric_weight) ? s : s + calculateBilledWeight(p.real_weight, p.volumetric_weight), 0);
      const tEco = parcels.reduce((s,p) => {
        if (!p.real_weight || !p.volumetric_weight) return s;
        const eco = calculateBilledWeight(p.real_weight, p.volumetric_weight) - p.real_weight;
        return s + (eco > 0 ? eco : 0);
      }, 0);
      const tVol = parcels.reduce((s,p) => (!p.length||!p.width||!p.height) ? s : s + (p.length*p.width*p.height)/1000000, 0);
      const sumEl = document.getElementById(`listSummary_${list.id}`);
      if (sumEl) sumEl.innerHTML = `
        <div class="list-summary-title">rapport générale</div>
        <div class="list-summary-grid">
          <span>Pr total : <strong>${tPr.toFixed(1)}kg</strong></span>
          <span>Pv total : <strong>${tPv.toFixed(1)}kg</strong></span>
          <span>Pf total : <strong>${tPf.toFixed(1)}kg</strong></span>
          <span>Vol total : <strong>${tVol.toFixed(2)}m³</strong></span>
        </div>
        <div class="list-summary-eco">éco possible : <strong>${tEco.toFixed(1)}kg fact</strong></div>
        <div class="list-summary-count">nbr : <strong>${parcels.length} colis</strong></div>`;
      renderParcelsForList(list.id, parcels);
    }
  }

  // ── Delegated list actions ───────────────────────────────────────────────
  document.addEventListener('click', async function listsClickHandler(e) {
    // Remove listener when navigating away (when this container is gone)
    if (!document.getElementById('listsContainer')) {
      document.removeEventListener('click', listsClickHandler);
      return;
    }
    const target   = e.target as HTMLElement;
    const actionEl = target.closest<HTMLElement>('[data-action]') || target;
    const action   = actionEl.dataset.action;
    if (!action) return;

    if (action === 'export-csv')   { await exportListCsv(actionEl.dataset.listId!);  return; }
    if (action === 'print-pdf')    { await printListPdf(actionEl.dataset.listId!);   return; }
    if (action === 'rename-list') {
      const titleEl = actionEl.closest('.list-card-title-wrapper')?.querySelector('.list-card-title');
      const current = (titleEl as HTMLElement)?.textContent?.trim() || '';
      showRenameListModal(actionEl.dataset.listId!, current, () => renderLists()); return;
    }
    if (action === 'delete-list') {
      const confirmed = await showConfirmModal('Voulez-vous vraiment supprimer cette liste ?<br>Elle sera perdue à jamais.');
      if (confirmed) { await deleteList(actionEl.dataset.listId!); renderLists(); } return;
    }
    if (action === 'rename-list-parcel') {
      const nameEl  = actionEl.closest('.list-parcel-num-row')?.querySelector('.list-parcel-name');
      const current = (nameEl as HTMLElement)?.textContent?.trim() || '';
      showRenameModal(actionEl.dataset.parcelId!, current, () => renderLists()); return;
    }
    if (action === 'remove-from-list') {
      await removeParcelFromList(actionEl.dataset.listId!, actionEl.dataset.parcelId!);
      renderLists(); return;
    }
    if (action === 'archive-from-list') {
      await updateParcelDb(actionEl.dataset.parcelId!, { status: 'archived' });
      await removeParcelFromList(actionEl.dataset.listId!, actionEl.dataset.parcelId!);
      renderLists(); return;
    }
    if (action === 'duplicate-from-list') {
      const listId  = actionEl.closest('.list-card')?.getAttribute('data-list-id') || '';
      const nameEl  = actionEl.closest('.list-parcel-card')?.querySelector('.list-parcel-name');
      const current = (nameEl as HTMLElement)?.textContent?.trim() || '';
      await duplicateParcelInList(actionEl.dataset.parcelId!, current || null, listId); return;
    }
  });
}

// ── Duplicate parcel within a list ───────────────────────────────────────────

async function duplicateParcelInList(sourceId: string, sourceName: string | null, listId: string) {
  const { data: src, error: srcErr } = await supabase.from('parcels').select('*').eq('id', sourceId).maybeSingle();
  if (srcErr || !src) return;
  const source = src as Parcel;

  const { data: itemsData } = await supabase
    .from('parcel_list_items').select('id, parcel_id, position, added_at')
    .eq('list_id', listId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('added_at', { ascending: true });
  const items: { id: string; parcel_id: string; position: number|null; added_at: string }[] = itemsData || [];

  for (let j = 0; j < items.length; j++)
    await supabase.from('parcel_list_items').update({ position: (j + 1) * 10 }).eq('id', items[j].id);

  const srcIdx = items.findIndex(it => it.parcel_id === sourceId);
  const srcPos = (srcIdx + 1) * 10;
  for (let i = srcIdx + 1; i < items.length; i++)
    await supabase.from('parcel_list_items').update({ position: (i + 1) * 10 + 10 }).eq('id', items[i].id);

  const { data: newP, error: newErr } = await supabase.from('parcels')
    .insert({ user_id: currentUser!, length: source.length, width: source.width,
              height: source.height, real_weight: source.real_weight, status: 'archived' } as unknown as Record<string, unknown>)
    .select().single();
  if (newErr || !newP) return;
  const newParcel = newP as Parcel;
  await supabase.from('parcel_list_items').insert({ list_id: listId, parcel_id: newParcel.id, position: srcPos + 5 });
  showRenameModalForList(newParcel.id, sourceName || source.name || '', () => renderLists());
}

// ── CSV export ───────────────────────────────────────────────────────────────

export async function exportListCsv(listId: string) {
  const listName = document.querySelector<HTMLElement>(`.list-card[data-list-id="${listId}"] .list-card-title`)?.textContent?.trim() || 'liste';
  const parcels  = await fetchParcelsInList(listId);
  const headers  = ['N°','Longueur (cm)','Largeur (cm)','Hauteur (cm)','Poids réel (kg)','Poids volumétrique (kg)','Poids facturé (kg)','Éco possible (kg)'];
  const rows     = parcels.map((p, idx) => {
    const vw = p.volumetric_weight ?? null;
    const bw = p.real_weight && vw ? calculateBilledWeight(p.real_weight, vw) : null;
    const eco = bw !== null && p.real_weight ? Math.max(0, bw - p.real_weight) : null;
    return [idx+1, p.length??'', p.width??'', p.height??'', p.real_weight??'', vw??'',
            bw !== null ? bw.toFixed(2) : '', eco !== null ? eco.toFixed(2) : ''];
  });
  const tPr  = parcels.reduce((s,p) => s + (p.real_weight ?? 0), 0);
  const tPv  = parcels.reduce((s,p) => s + (p.volumetric_weight ?? 0), 0);
  const tPf  = parcels.reduce((s,p) => (!p.real_weight||!p.volumetric_weight) ? s : s + calculateBilledWeight(p.real_weight, p.volumetric_weight), 0);
  const tEco = parcels.reduce((s,p) => (!p.real_weight||!p.volumetric_weight) ? s : s + Math.max(0, calculateBilledWeight(p.real_weight,p.volumetric_weight) - p.real_weight), 0);
  const tVol = parcels.reduce((s,p) => (!p.length||!p.width||!p.height) ? s : s + (p.length*p.width*p.height)/1000000, 0);
  const sumH = ['Rapport générale','Pr total (kg)','Pv total (kg)','Pf total (kg)','Vol total (m³)','Éco possible (kg)','Nombre de colis'];
  const sumR = ['TOTAL', tPr.toFixed(2), tPv.toFixed(2), tPf.toFixed(2), tVol.toFixed(4), tEco.toFixed(2), parcels.length];
  const cell = (v: unknown) => `"${String(v).replace(/"/g,'""')}"`;
  const csv  = [headers, ...rows].map(r => r.map(cell).join(';'))
    .concat(['', sumH.map(cell).join(';'), sumR.map(cell).join(';')]).join('\n');
  const url  = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
  const a    = document.createElement('a');
  a.href = url; a.download = `${listName.replace(/[^a-z0-9_\-]/gi,'_')}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export ───────────────────────────────────────────────────────────────

export async function printListPdf(listId: string) {
  const { default: jsPDF } = await import('jspdf');
  const listName = document.querySelector<HTMLElement>(`.list-card[data-list-id="${listId}"] .list-card-title`)?.textContent?.trim() || 'Liste';
  const parcels  = await fetchParcelsInList(listId);
  const tPr  = parcels.reduce((s,p) => s + (p.real_weight ?? 0), 0);
  const tPv  = parcels.reduce((s,p) => s + (p.volumetric_weight ?? 0), 0);
  const tPf  = parcels.reduce((s,p) => (!p.real_weight||!p.volumetric_weight)?s:s+calculateBilledWeight(p.real_weight,p.volumetric_weight), 0);
  const tEco = parcels.reduce((s,p) => (!p.real_weight||!p.volumetric_weight)?s:s+Math.max(0,calculateBilledWeight(p.real_weight,p.volumetric_weight)-p.real_weight), 0);
  const tVol = parcels.reduce((s,p) => (!p.length||!p.width||!p.height)?s:s+(p.length*p.width*p.height)/1_000_000, 0);

  const cs = getComputedStyle(document.documentElement);
  const cv = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  const h2r = (h: string): [number,number,number] => { const c=h.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; };
  const [pR,pG,pB]    = h2r(cv('--primary','#2563eb'));
  const [nR,nG,nB]    = h2r(cv('--navy','#1a2744'));
  const [bgR,bgG,bgB] = h2r(cv('--surface','#ffffff'));
  const [brR,brG,brB] = h2r(cv('--border','#dde3ef'));
  const [sR,sG,sB]    = h2r(cv('--slate','#64748b'));
  const [tR,tG,tB]    = h2r(cv('--text','#111827'));

  const PW=210,PH=297,MX=14,MY=12,CW=PW-MX*2,COLW=(CW-6)/2,COL_R=MX+COLW+6,BOTTOM=PH-MY-8;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4', compress:true });
  const cPrim=()=>pdf.setTextColor(pR,pG,pB), cNavy=()=>pdf.setTextColor(nR,nG,nB),
        cSlate=()=>pdf.setTextColor(sR,sG,sB), cBody=()=>pdf.setTextColor(tR,tG,tB),
        cWhite=()=>pdf.setTextColor(255,255,255);
  let y=MY;

  // Header
  const LOGO_SZ=14;
  pdf.setFillColor(pR,pG,pB); pdf.rect(MX,y,LOGO_SZ,LOGO_SZ,'F');
  pdf.setFillColor(Math.min(pR+60,255),Math.min(pG+60,255),Math.min(pB+60,255)); pdf.rect(MX+2,y+2,4,4,'F');
  cWhite(); pdf.setFont('helvetica','bold');
  pdf.setFontSize(5.5); pdf.text('SHIP',MX+1.8,y+5.2); pdf.setFontSize(7); pdf.text('4',MX+5.5,y+9.2);
  pdf.setFontSize(5); pdf.text('CHEAP',MX+1.5,y+13);
  cNavy(); pdf.setFont('helvetica','bold'); pdf.setFontSize(11); pdf.text('Ship4Cheap',MX+LOGO_SZ+3,y+6.5);
  cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(6.5); pdf.text('save space save money',MX+LOGO_SZ+3,y+11.5);
  cNavy(); pdf.setFont('helvetica','bold'); pdf.setFontSize(18); pdf.text(listName,PW/2,y+7.5,{align:'center'});
  cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(8);
  pdf.text(`Imprimé le ${new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}`,PW/2,y+13.5,{align:'center'});
  y+=LOGO_SZ+5;
  pdf.setDrawColor(pR,pG,pB); pdf.setLineWidth(0.6); pdf.line(MX,y,MX+CW,y); pdf.setLineWidth(0.2); y+=7;

  // Summary card
  const SUM_H=48;
  pdf.setFillColor(bgR,bgG,bgB); pdf.setDrawColor(brR,brG,brB); pdf.roundedRect(MX,y,CW,SUM_H,2,2,'FD');
  cPrim(); pdf.setFont('helvetica','bold'); pdf.setFontSize(10); pdf.text('RAPPORT GÉNÉRAL',MX+6,y+9);
  pdf.setDrawColor(pR,pG,pB); pdf.setLineWidth(0.4); pdf.line(MX+6,y+11,MX+CW-6,y+11); pdf.setLineWidth(0.2);
  const halfW=(CW-16)/2, SY=y+19;
  [{label:'Poids réel total :',value:`${tPr.toFixed(2)} kg`},{label:'Poids volumétrique total :',value:`${tPv.toFixed(2)} kg`},
   {label:'Poids facturé total :',value:`${tPf.toFixed(2)} kg`},{label:'Volume total :',value:`${tVol.toFixed(3)} m³`}]
  .forEach((item,i)=>{
    const col=i%2, row=Math.floor(i/2), sx=MX+6+col*(halfW+8), sy=SY+row*8;
    cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(8); pdf.text(item.label,sx,sy);
    cNavy(); pdf.setFont('helvetica','bold'); pdf.text(item.value,sx+pdf.getTextWidth(item.label)+2,sy);
  });
  const sfY=y+SUM_H-7.5;
  cPrim(); pdf.setFont('helvetica','bold'); pdf.setFontSize(8.5);
  pdf.text(`Économie possible : ${tEco.toFixed(2)} kg facturés`,MX+6,sfY);
  cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(8);
  pdf.text(`Nombre de colis : ${parcels.length}`,MX+CW-6,sfY,{align:'right'});
  y+=SUM_H+8;

  // Parcel cards
  interface CardData { name:string; dimStr:string|null; realW:number|null; volW:number|null; billedW:number|null; savings:number|null; }
  const cards: CardData[] = parcels.map((p,idx)=>{
    const vw=p.volumetric_weight??null; const bw=p.real_weight&&vw?calculateBilledWeight(p.real_weight,vw):null;
    const sv=bw!==null&&p.real_weight?bw-p.real_weight:null;
    return { name:p.name||`Colis #${idx+1}`, dimStr:(p.length&&p.width&&p.height)?`${p.length.toFixed(0)} x ${p.width.toFixed(0)} x ${p.height.toFixed(0)} cm`:null,
             realW:p.real_weight??null, volW:vw, billedW:bw, savings:sv };
  });
  const BADGE_H=6, ROW_H=6.5, CARD_PAD=4, ROW_GAP=5;
  const getCardH=(c:CardData)=>{
    const rows=[c.dimStr,c.realW,c.volW,c.billedW].filter(v=>v!==null).length;
    return BADGE_H+CARD_PAD+rows*ROW_H+(c.savings!==null&&c.savings>0?10:0)+4;
  };
  let col=0, rowTopY=y, rowMaxH=0;
  for (let i=0;i<cards.length;i++) {
    const c=cards[i]; const ch=getCardH(c);
    if (col===0) {
      const nh=i+1<cards.length?getCardH(cards[i+1]):0; rowMaxH=Math.max(ch,nh);
      if (y+rowMaxH>BOTTOM) { pdf.addPage(); y=MY; rowTopY=y; } else { rowTopY=y; }
    }
    const cx=col===0?MX:COL_R;
    pdf.setFillColor(bgR,bgG,bgB); pdf.setDrawColor(brR,brG,brB); pdf.setLineWidth(0.25);
    pdf.roundedRect(cx,rowTopY,COLW,ch,2,2,'FD');
    pdf.setFont('helvetica','bold'); pdf.setFontSize(7);
    const labelW=Math.min(pdf.getTextWidth(c.name)+8,COLW-10);
    pdf.setFillColor(pR,pG,pB); pdf.roundedRect(cx+4,rowTopY+2,labelW,BADGE_H,2,2,'F');
    cWhite();
    let dn=c.name;
    while (dn.length>1&&pdf.getTextWidth(dn)>labelW-4) dn=dn.slice(0,-1);
    if (dn!==c.name) dn=dn.slice(0,-1)+'…';
    pdf.text(dn,cx+4+labelW/2,rowTopY+2+BADGE_H-1.5,{align:'center'});
    let ry=rowTopY+BADGE_H+CARD_PAD+2;
    const LX=cx+5, RX=cx+COLW-5;
    const drawRow=(label:string,value:string,bold=false)=>{
      cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(7.5); pdf.text(label,LX,ry);
      if(bold) cNavy(); else cBody(); pdf.setFont('helvetica','bold'); pdf.text(value,RX,ry,{align:'right'}); ry+=ROW_H;
    };
    if (c.dimStr!==null) drawRow('Dimensions',c.dimStr);
    if (c.realW!==null)  drawRow('Poids réel',`${c.realW.toFixed(2)} kg`);
    if (c.volW!==null)   drawRow('Poids volumétrique',`${c.volW.toFixed(2)} kg`);
    if (c.billedW!==null) drawRow('Poids facturé',`${c.billedW.toFixed(2)} kg`,true);
    if (c.savings!==null&&c.savings>0) {
      pdf.setDrawColor(brR,brG,brB); pdf.setLineWidth(0.2); pdf.line(LX,ry,RX,ry); ry+=3.5;
      cPrim(); pdf.setFont('helvetica','bold'); pdf.setFontSize(7.5);
      pdf.text(`Économie possible : ${c.savings.toFixed(2)} kg fact.`,LX,ry);
    }
    if (col===0) { col=1; } else { col=0; y=rowTopY+rowMaxH+ROW_GAP; }
  }
  // Page numbers
  const totalPages=pdf.getNumberOfPages();
  for (let p=1;p<=totalPages;p++) {
    pdf.setPage(p); cSlate(); pdf.setFont('helvetica','normal'); pdf.setFontSize(8);
    pdf.text(`Page ${p} / ${totalPages}`,PW/2,PH-6,{align:'center'});
  }
  pdf.save(`${listName}.pdf`);
}
