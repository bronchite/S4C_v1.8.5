// ─── Parcels page (main app view) ───────────────────────────────────────────
import { supabase } from '../../lib/supabase';
import type { Parcel, ParcelInsert } from '../../lib/types';
import {
  app, FOOTER_HTML, GUEST_STORAGE_KEY,
  currentUser, setCurrentUser,
  globalListenersAttached, markGlobalListenersAttached,
  attachNavToggle,
} from '../modules/state';
import { getThemeButtonsHtml, attachThemeListeners } from '../modules/theme';
import { calculateVolumetricWeight, calculateBilledWeight, generateId } from '../modules/utils';
import { getGuestParcels, saveGuestParcels, type GuestParcel } from '../modules/guest';
import { getCurrentUser } from '../modules/api/auth';
import {
  fetchParcels, updateParcelDb, emptyTrashDb, deleteParcelDb, insertParcelAfterIndex,
} from '../modules/api/parcels';
import { showRenameModal, showAddToListModal } from '../modules/modals';

import { renderAuth } from './auth';

// ── Icône colis : positionnement et animation ─────────────────────────────────

/** ID du colis dont l'icône doit tourner après le prochain renderParcelsGrid */
let pendingAnimationId: string | null = null;

// Valeur fixe calculée depuis le layout connu :
// page 1700px, container 900px, padding 24px → gouttière = (1700-900)/2 + 24 = 424px → centre = 212px
// Avec transform translateX(±50%), left/right: -212px centre l'élément dans sa gouttière.
const GUTTER_CENTER_PX = (1700 - 900) / 4 + 12; // = 212px

/**
 * Applique left: -212px sur chaque .icone-colis-wrapper.
 * Valeur fixe → aucun mouvement au resize ou au scroll.
 */
function positionParcelIcons(): void {
  document.querySelectorAll<HTMLElement>('.icone-colis-wrapper').forEach(icon => {
    icon.style.left = `-${GUTTER_CENTER_PX}px`;
  });
}

/**
 * Déclenche l'animation de rotation uniquement sur l'icône du colis donné.
 */
function triggerParcelAnimation(id: string): void {
  const grid = document.getElementById('parcelsGrid');
  if (!grid) return;
  const card = grid.querySelector<HTMLElement>(`.parcel-card[data-id="${id}"]`);
  if (!card) return;
  const svg = card.querySelector<Element>('.rotate-3d');
  if (!svg) return;
  svg.classList.remove('rotate-3d--active');
  void (svg as HTMLElement).offsetWidth; // Force reflow pour relancer l'animation
  svg.classList.add('rotate-3d--active');
  svg.addEventListener('animationend', () => svg.classList.remove('rotate-3d--active'), { once: true });
}

// ── Animation Comparaison Poids (gouttière droite) ───────────────────────────
//    Portage direct du code Python matplotlib (comparaison_pr_pv_v_3.py)

const PA_R      = 12.0;                                       // Rayon du cercle de référence
const PA_AIRE   = (3 * Math.sqrt(3) / 4) * (PA_R ** 2);      // ≈ 374.12 – aire inscrite de référence
const PA_SIZE   = 268;                                        // Taille du canvas (px) – 400 × 0.67 = −33 %

/** Map canvas → id de la RAF en cours (pour annulation propre) */
const activePoidsAnims = new Map<HTMLCanvasElement, number>();

/** Évite d'attacher plusieurs fois l'observateur de thème */
let poidsThemeObserverAttached = false;

/**
 * Observe les changements de classe sur <html> (ex: ajout/retrait de theme-ups)
 * et redessine tous les canvas pour appliquer les nouvelles couleurs.
 */
function attachPoidsThemeObserver(): void {
  if (poidsThemeObserverAttached) return;
  poidsThemeObserverAttached = true;
  new MutationObserver(() => initPoidsAnimations()).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ['class'] },
  );
}

/** Couleurs des formes selon le thème actif */
function getPoidsColors() {
  if (document.documentElement.classList.contains('theme-ups')) {
    // Thème UPS : cercle or, triangle brun — triangle 50 % plus transparent (0.55 × 0.5 = 0.275)
    return { cF: '#d4880a', cS: '#b5720a', tF: '#351c15', tS: '#6b3a2a', lC: '#b5720a', lT: '#4a2010', tAlpha: 0.275 };
  }
  // Thème par défaut : cercle blanc pur + contour bleu, triangle bleu très clair
  return { cF: '#ffffff', cS: '#93c5fd', tF: '#bfdbfe', tS: '#3b82f6', lC: '#1d4ed8', lT: '#1e40af', tAlpha: 0.55 };
}

/**
 * Porte le calcul Python :
 * – Triangle équilatéral final (inscrit dans le cercle quand ratio = 1)
 * – Triangle scalène de départ (même aire, forme initiale de l'animation)
 * – Échelle dynamique : les formes s'adaptent à n'importe quel ratio
 */
function computePoidsPoints(poidsReel: number, poidsVol: number) {
  const ratio = poidsVol / poidsReel;
  const aireT = PA_AIRE * ratio;

  // ── Triangle équilatéral (état final) ────────────────────────────────────
  const cote = Math.sqrt((4 * aireT) / Math.sqrt(3));
  const h    = cote * Math.sqrt(3) / 2;
  const ptsEq: [number, number][] = [
    [-cote / 2, -h / 3],
    [ cote / 2, -h / 3],
    [0,          2 * h / 3],
  ];

  // ── Triangle scalène (état initial, même aire) ────────────────────────────
  // Même géométrie scalène que le Python (côtés 60, 30, 40 → centré sur (0,0))
  const x3s = (60 * 60 + 30 * 30 - 40 * 40) / (2 * 60);          // ≈ 26.67
  const y3s = Math.sqrt(30 * 30 - x3s * x3s);                     // ≈ 14.91
  const f   = Math.sqrt(aireT / (0.5 * 60 * y3s));
  const raw: [number, number][] = [[0, 0], [60 * f, 0], [x3s * f, y3s * f]];
  const gcx = (raw[0][0] + raw[1][0] + raw[2][0]) / 3;
  const gcy = (raw[0][1] + raw[1][1] + raw[2][1]) / 3;
  const ptsSc: [number, number][] = raw.map(p => [p[0] - gcx, p[1] - gcy] as [number, number]);

  // ── Échelle dynamique ─────────────────────────────────────────────────────
  // Les formes sont centrées au milieu du canvas (PA_SIZE/2).
  // 70 % du demi-canvas dédié aux formes → laisse ~30 % pour les labels en bas.
  const half  = PA_SIZE / 2 * 0.70;                          // ≈ 94 px pour PA_SIZE = 268
  const maxE  = PA_R * Math.max(1, Math.sqrt(ratio));
  const scale = (half * 0.80) / maxE;

  return { ptsSc, ptsEq, scale };
}

/** Dessine une frame (cercle + triangle + labels) sur le canvas */
function drawPoidsFrame(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  scale: number,
  col: ReturnType<typeof getPoidsColors>,
  pr: number,
  pv: number,
): void {
  const cx = PA_SIZE / 2;
  const cy = PA_SIZE / 2;  // Centre vrai du cadre (plus de PA_VIZ_H décalé)

  ctx.clearRect(0, 0, PA_SIZE, PA_SIZE);

  // ── Cercle (poids réel) ───────────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(cx, cy, PA_R * scale, 0, 2 * Math.PI);
  ctx.globalAlpha = 0.85; ctx.fillStyle   = col.cF; ctx.fill();
  ctx.globalAlpha = 1;    ctx.strokeStyle = col.cS;
  ctx.lineWidth = 2; ctx.stroke();

  // ── Triangle (poids volumétrique) ─────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(cx + pts[0][0] * scale, cy - pts[0][1] * scale);
  ctx.lineTo(cx + pts[1][0] * scale, cy - pts[1][1] * scale);
  ctx.lineTo(cx + pts[2][0] * scale, cy - pts[2][1] * scale);
  ctx.closePath();
  ctx.globalAlpha = col.tAlpha; ctx.fillStyle   = col.tF; ctx.fill();
  ctx.globalAlpha = 1;    ctx.strokeStyle = col.tS;
  ctx.lineWidth = 2; ctx.stroke();

  // ── Labels (positionnés sous les formes, au bas du cadre) ─────────────────
  // Les formes s'étendent jusqu'à cy + half * 0.80 (≈ cy + 75px pour PA_SIZE 268).
  // Les labels commencent juste en dessous.
  const shapeBottom = cy + PA_SIZE / 2 * 0.70 * 0.80;
  ctx.font = `600 10px 'Outfit','Segoe UI',sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = col.lC;
  ctx.fillText(`● Poids réel : ${pr.toFixed(2)} kg`,        cx, Math.round(shapeBottom + 14));
  ctx.fillStyle = col.lT;
  ctx.fillText(`▲ P. volumétrique : ${pv.toFixed(2)} kg`,   cx, Math.round(shapeBottom + 28));
}

/** Lance l'animation scalène → équilatéral sur le canvas du colis donné */
function animatePoidsComparaison(canvas: HTMLCanvasElement, pr: number, pv: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const existing = activePoidsAnims.get(canvas);
  if (existing) cancelAnimationFrame(existing);

  const { ptsSc, ptsEq, scale } = computePoidsPoints(pr, pv);
  const col      = getPoidsColors();
  const DURATION = 3000; // ms – synchronisé avec la rotation CSS (3s)
  let startTime  = -1;

  function step(timestamp: number) {
    if (startTime < 0) startTime = timestamp;
    const t   = Math.min((timestamp - startTime) / DURATION, 1.0);
    const cur: [number, number][] = ptsSc.map((p, i) => [
      p[0] * (1 - t) + ptsEq[i][0] * t,
      p[1] * (1 - t) + ptsEq[i][1] * t,
    ]);
    drawPoidsFrame(ctx!, cur, scale, col, pr, pv);
    if (t < 1) {
      activePoidsAnims.set(canvas, requestAnimationFrame(step));
    } else {
      activePoidsAnims.delete(canvas);
    }
  }
  activePoidsAnims.set(canvas, requestAnimationFrame(step));
}

/** Dessine l'état final statique pour les colis déjà calculés (page load) */
function initPoidsAnimations(): void {
  document.querySelectorAll<HTMLElement>('.anim-poids-wrapper').forEach(w => {
    const canvas = w.querySelector<HTMLCanvasElement>('.anim-poids-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pr = parseFloat(w.dataset.poidsReel || '0');
    const pv = parseFloat(w.dataset.poidsVol  || '0');
    if (pr > 0 && pv > 0) {
      const { ptsEq, scale } = computePoidsPoints(pr, pv);
      drawPoidsFrame(ctx, ptsEq, scale, getPoidsColors(), pr, pv);
    }
  });
}

/** Applique right: -212px sur chaque .anim-poids-wrapper — valeur fixe, symétrique au côté gauche */
function positionPoidsAnimations(): void {
  document.querySelectorAll<HTMLElement>('.anim-poids-wrapper').forEach(anim => {
    anim.style.right = `-${GUTTER_CENTER_PX}px`;
  });
}

/** Déclenche l'animation comparaison poids sur le colis spécifié */
function triggerPoidsAnimation(id: string): void {
  const grid = document.getElementById('parcelsGrid');
  if (!grid) return;
  const card = grid.querySelector<HTMLElement>(`.parcel-card[data-id="${id}"]`);
  if (!card) return;
  const w = card.querySelector<HTMLElement>('.anim-poids-wrapper');
  if (!w) return;
  const canvas = w.querySelector<HTMLCanvasElement>('.anim-poids-canvas');
  if (!canvas) return;
  const pr = parseFloat(w.dataset.poidsReel || '0');
  const pv = parseFloat(w.dataset.poidsVol  || '0');
  if (pr > 0 && pv > 0) animatePoidsComparaison(canvas, pr, pv);
}

// ── Render ───────────────────────────────────────────────────────────────────

export async function renderApp() {
  let user;
  try { user = await getCurrentUser(); } catch { user = null; }
  setCurrentUser(user?.id || null);

  const parcels = currentUser ? await fetchParcels('active') : getGuestParcels();

  const headerNav = currentUser ? `
    <nav id="mainNav">
      <a href="#" data-view="home">Accueil</a>
      <a href="#" data-view="active">Colis actifs</a>
      <a href="#" data-view="archived">Colis archivés</a>
      <a href="#" data-view="deleted">Colis supprimés</a>
      <a href="#" data-view="lists">Mes listes</a>
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
    <main class="container container--parcels">
      <div class="page-title"><h1>Calculateur de poids volumétrique</h1></div>
      ${!currentUser ? `<p class="guest-notice">Mode invité - Connectez-vous pour profiter de toutes les fonctionnalités</p>` : ''}
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
    ${currentUser ? `
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
      </div>` : ''}
    ${FOOTER_HTML}`;

  setupEventListeners();
  renderParcelsGrid(parcels);
  attachThemeListeners();
  attachNavToggle();
  if (currentUser) loadSidePanels();
}

// ── Grid ─────────────────────────────────────────────────────────────────────

export function renderParcelsGrid(parcels: GuestParcel[] | Parcel[]) {
  const grid      = document.getElementById('parcelsGrid')!;
  const emptyState = document.getElementById('emptyState')!;
  const recapBtn  = document.getElementById('recapBtn') as HTMLButtonElement | null;
  if (parcels.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    if (recapBtn) recapBtn.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  if (recapBtn) recapBtn.style.display = '';
  grid.innerHTML = parcels.map((p, i) => createParcelCard(p as GuestParcel, i)).join('');

  // Icônes gauche : centrage dans la gouttière
  positionParcelIcons();

  // Animation poids droite : centrage + état initial statique
  positionPoidsAnimations();
  initPoidsAnimations();

  // Animations déclenchées par un calcul spécifique
  if (pendingAnimationId) {
    triggerParcelAnimation(pendingAnimationId);
    triggerPoidsAnimation(pendingAnimationId);
    pendingAnimationId = null;
  }
}

function createParcelCard(parcel: GuestParcel, index: number): string {
  const hasResult = parcel.real_weight !== null && parcel.length !== null;
  let resultHtml   = '';
  let iconeHtml    = '';
  let animPoidsHtml = '';

  if (hasResult) {
    const vw = parcel.volumetric_weight || calculateVolumetricWeight(parcel.length!, parcel.width!, parcel.height!);
    const bw = calculateBilledWeight(parcel.real_weight!, vw);
    const sv = bw - parcel.real_weight!;
    
    // Icône 3D proportionnelle (gouttière gauche)
    if (parcel.length && parcel.width && parcel.height) {
      iconeHtml = genererSvgColisDynamique(parcel.length, parcel.width, parcel.height);
    }

    // Canvas comparaison poids (gouttière droite)
    animPoidsHtml = `
    <div class="anim-poids-wrapper"
         data-poids-reel="${parcel.real_weight}"
         data-poids-vol="${vw.toFixed(4)}">
      <canvas class="anim-poids-canvas" width="268" height="268"></canvas>
    </div>`;

    resultHtml = `
      <div class="parcel-result">
        <div class="result-row result-row--split">
          <div class="result-half"><span class="result-label">Dimensions:</span>
            <span>${parcel.length!.toFixed(1)} cm × ${parcel.width!.toFixed(1)} cm × ${parcel.height!.toFixed(1)} cm</span></div>
          <div class="result-half"><span class="result-label">Poids réel:</span>
            <span>${parcel.real_weight!.toFixed(2)} kg</span></div>
        </div>
        <div class="result-row result-row--split">
          <div class="result-half"><span class="result-label">Poids volumétrique:</span>
            <span>${vw.toFixed(2)} kg</span></div>
          <div class="result-half"><span class="result-label">Poids facturé:</span>
            <span style="color:#7c3aed;font-weight:600;">${bw.toFixed(2)} kg</span></div>
        </div>
        ${sv > 0 ? `<div class="suggestion">Économies possibles: ${sv.toFixed(2)} kg facturables - <span class="suggestion-hint">réduisez la taille de vos colis pour faire des économies</span></div>` : ''}
      </div>`;
  }
  
  const showArchive   = currentUser && hasResult;
  const showDuplicate = currentUser && hasResult;
  const displayName   = (parcel as Parcel).name || `Colis #${index + 1}`;
  const SVG_EDIT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  
  return `
    <div class="parcel-card" data-id="${parcel.id}">
      ${iconeHtml}
      ${animPoidsHtml}
      <div class="parcel-card-header">
        <div class="parcel-card-title-group">
          <h3>${displayName}</h3>
          <button class="btn-rename" data-action="rename" title="Renommer">${SVG_EDIT}</button>
        </div>
        <button class="btn btn-small btn-danger" data-action="delete" title="Supprimer">&times;</button>
      </div>
      <div class="parcel-fields">
        <div class="field-group"><label>Longueur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="length" value="${parcel.length ?? ''}" /></div>
        <span class="dim-separator">×</span>
        <div class="field-group"><label>Largeur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="width" value="${parcel.width ?? ''}" /></div>
        <span class="dim-separator">×</span>
        <div class="field-group"><label>Hauteur (cm)</label>
          <input type="number" step="0.1" min="0" data-field="height" value="${parcel.height ?? ''}" /></div>
        <div class="parcel-fields-separator"></div>
        <div class="field-group"><label>Poids réel (kg)</label>
          <input type="number" step="0.01" min="0" data-field="real_weight" value="${parcel.real_weight ?? ''}" /></div>
        <div class="calculate-inline-wrapper">
          <img src="${import.meta.env.BASE_URL}icon_parcel_1.png" class="calculate-icon" alt="" />
          <button class="btn btn-secondary btn-small calculate-inline" data-action="calculate">Calculer ce colis</button>
        </div>
      </div>
      <div class="parcel-actions">
        ${showArchive   ? `<button class="btn btn-primary btn-small" data-action="archive">Archiver</button>` : ''}
        ${showDuplicate ? `<button class="btn btn-secondary btn-small btn-duplicate" data-action="duplicate">Dupliquer</button>` : ''}
      </div>
      ${resultHtml}
    </div>`;
}

// ── Side panels ──────────────────────────────────────────────────────────────

export async function loadSidePanels() {
  if (!currentUser) return;
  const [archived, deleted] = await Promise.all([fetchParcels('archived'), fetchParcels('deleted')]);
  renderPanel('archivedContent', archived);
  renderPanel('deletedContent', deleted);
}

function renderPanel(containerId: string, parcels: Parcel[]) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (parcels.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#888;">Aucun colis</p>'; return;
  }
  const SVG_EDIT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  container.innerHTML = parcels.map((parcel, index) => {
    const vw  = parcel.volumetric_weight;
    const bw  = parcel.real_weight && vw ? calculateBilledWeight(parcel.real_weight, vw) : '-';
    const sv  = typeof bw === 'number' && parcel.real_weight ? bw - parcel.real_weight : 0;
    const nm  = parcel.name || `Colis #${index + 1}`;
    return `
      <div class="panel-item" data-id="${parcel.id}">
        <div class="panel-item-header">
          <span class="panel-item-name">${nm}</span>
          <button class="btn-rename btn-rename--panel" data-action="rename" title="Renommer">${SVG_EDIT}</button>
        </div>
        <div class="panel-item-row"><span>Dimensions:</span>
          <span>${parcel.length?.toFixed(1) ?? '-'} cm × ${parcel.width?.toFixed(1) ?? '-'} cm × ${parcel.height?.toFixed(1) ?? '-'} cm</span></div>
        <div class="panel-item-row"><span>Poids réel:</span>
          <span>${parcel.real_weight?.toFixed(2) ?? '-'} kg</span></div>
        <div class="panel-item-row"><span>Poids facturé:</span>
          <span style="color:#7c3aed;">${typeof bw === 'number' ? bw.toFixed(2) : bw} kg</span></div>
        ${containerId === 'archivedContent' && sv > 0 ? `
        <div class="panel-item-row" style="color:var(--ups-green);font-weight:600;">
          <span>Économies possibles:</span><span>${sv.toFixed(2)} kg</span>
        </div>` : ''}
        <div class="panel-item-actions">
          <button class="btn btn-small btn-secondary" data-action="restore">Restaurer</button>
          ${containerId === 'archivedContent' ? `
            <button class="btn btn-small btn-add-list" data-action="add-to-list">+ Liste</button>
            <button class="btn btn-small btn-danger" data-action="archive-delete">Supprimer</button>` : ''}
          ${containerId === 'deletedContent' ?
            `<button class="btn btn-small btn-danger" data-action="permanent-delete">Supprimer</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

// ── Duplicate ────────────────────────────────────────────────────────────────

async function duplicateParcel(sourceId: string, sourceName: string | null) {
  const parcels     = await fetchParcels('active');
  const sourceIndex = parcels.findIndex(p => p.id === sourceId);
  if (sourceIndex === -1) return;
  const newParcel = await insertParcelAfterIndex(parcels, sourceIndex);
  if (!newParcel) return;
  const baseName    = sourceName || `Colis #${sourceId.slice(0, 4)}`;
  const refreshed   = await fetchParcels('active');
  renderParcelsGrid(refreshed);
  loadSidePanels();
  showRenameModal(newParcel.id, `${baseName} (copie)`, async () => {
    const ps = await fetchParcels('active'); renderParcelsGrid(ps); loadSidePanels();
  });
}

// ── Recap report ─────────────────────────────────────────────────────────────

function renderRecapReport() {
  const grid    = document.getElementById('parcelsGrid');
  const recapEl = document.getElementById('recapReport');
  if (!grid || !recapEl) return;
  const cards   = grid.querySelectorAll<HTMLElement>('.parcel-card');
  if (cards.length === 0) { recapEl.innerHTML = ''; return; }

  type PS = { name: string; length: number|null; width: number|null; height: number|null;
               realWeight: number|null; volWeight: number|null; billedWeight: number|null;
               invalid: boolean; invalidFields: string[] };

  const summaries: PS[] = [];
  cards.forEach((card, idx) => {
    const name = card.querySelector('.parcel-card-title-group h3')?.textContent?.trim() || `Colis #${idx + 1}`;
    const rv   = (f: string) => {
      const el = card.querySelector<HTMLInputElement>(`input[data-field="${f}"]`);
      if (!el) return null; const v = parseFloat(el.value); return isNaN(v) || v <= 0 ? null : v;
    };
    const length = rv('length'); const width = rv('width');
    const height = rv('height'); const realWeight = rv('real_weight');
    const invalidFields: string[] = [];
    if (!length) invalidFields.push('length'); if (!width)  invalidFields.push('width');
    if (!height) invalidFields.push('height'); if (!realWeight) invalidFields.push('real_weight');
    const invalid = invalidFields.length > 0;
    (['length','width','height','real_weight'] as const).forEach(f => {
      card.querySelector<HTMLInputElement>(`input[data-field="${f}"]`)
        ?.classList.toggle('error', invalidFields.includes(f));
    });
    card.classList.toggle('recap-invalid', invalid);
    const volWeight   = (!invalid) ? calculateVolumetricWeight(length!, width!, height!) : null;
    const billedWeight = (!invalid) ? calculateBilledWeight(realWeight!, volWeight!) : null;
    summaries.push({ name, length, width, height, realWeight, volWeight, billedWeight, invalid, invalidFields });
  });

  const valid   = summaries.filter(s => !s.invalid);
  const invalid = summaries.filter(s => s.invalid);
  const tPr = valid.reduce((a, s) => a + s.realWeight!, 0);
  const tPv = valid.reduce((a, s) => a + s.volWeight!, 0);
  const tPf = valid.reduce((a, s) => a + s.billedWeight!, 0);
  const labels: Record<string,string> = { length:'Longueur', width:'Largeur', height:'Hauteur', real_weight:'Poids réel' };

  const rowsHtml = summaries.map(s => s.invalid
    ? `<tr class="recap-row recap-row--invalid"><td class="recap-cell recap-cell--name">${s.name}</td>
       <td class="recap-cell" colspan="5"><span class="recap-error-tag">Saisies manquantes ou invalides : ${s.invalidFields.map(f => labels[f]).join(', ')}</span></td></tr>`
    : `<tr class="recap-row">
       <td class="recap-cell recap-cell--name">${s.name}</td>
       <td class="recap-cell">${s.length!.toFixed(1)} × ${s.width!.toFixed(1)} × ${s.height!.toFixed(1)} cm</td>
       <td class="recap-cell">${s.realWeight!.toFixed(2)} kg</td>
       <td class="recap-cell">${s.volWeight!.toFixed(2)} kg</td>
       <td class="recap-cell recap-cell--billed">${s.billedWeight!.toFixed(2)} kg</td></tr>`
  ).join('');

  recapEl.innerHTML = `
    <div class="recap-report">
      <div class="recap-header">
        <h2 class="recap-title">Récapitulatif général</h2>
        <span class="recap-count">${summaries.length} colis</span>
        <button class="recap-close" id="recapCloseBtn">&times;</button>
      </div>
      ${invalid.length > 0 ? `<div class="recap-warning">${invalid.length} colis non inclus dans les totaux (données invalides ou manquantes).</div>` : ''}
      <div class="recap-table-wrapper">
        <table class="recap-table">
          <thead><tr><th>Colis</th><th>Dimensions</th><th>Poids réel</th><th>Poids volumétrique</th><th>Poids facturé</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr class="recap-total">
              <td class="recap-cell recap-cell--name"><strong>TOTAL</strong> <span class="recap-total-note">(${valid.length} colis valides)</span></td>
              <td class="recap-cell">—</td>
              <td class="recap-cell"><strong>${tPr.toFixed(2)} kg</strong></td>
              <td class="recap-cell"><strong>${tPv.toFixed(2)} kg</strong></td>
              <td class="recap-cell recap-cell--billed"><strong>${tPf.toFixed(2)} kg</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;

  document.getElementById('recapCloseBtn')?.addEventListener('click', () => {
    recapEl.innerHTML = '';
    grid.querySelectorAll<HTMLElement>('.parcel-card').forEach(c => c.classList.remove('recap-invalid'));
    grid.querySelectorAll<HTMLInputElement>('input[data-field]').forEach(i => i.classList.remove('error'));
  });
  recapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Guest actions ────────────────────────────────────────────────────────────

function handleGuestAction(id: string, action: string, card: HTMLElement | null) {
  const guestParcels = getGuestParcels();
  if (action === 'delete') {
    const filtered = guestParcels.filter(p => p.id !== id);
    saveGuestParcels(filtered);
    renderParcelsGrid(filtered);
    return;
  }
  if (action === 'calculate' && card) {
    const inputs = card.querySelectorAll<HTMLInputElement>('input[data-field]');
    const idx    = guestParcels.findIndex(p => p.id === id);
    if (idx === -1) return;
    let hasInvalid = false;
    inputs.forEach(inp => {
      const v = parseFloat(inp.value); const bad = isNaN(v) || v <= 0;
      if (bad) {
        hasInvalid = true;
        inp.classList.remove('flash-error'); void inp.offsetWidth; inp.classList.add('flash-error');
        inp.addEventListener('animationend', () => inp.classList.remove('flash-error'), { once: true });
      }
    });
    if (hasInvalid) { card.classList.add('invalid'); return; }
    inputs.forEach(inp => {
      const f = inp.dataset.field as keyof GuestParcel; const v = parseFloat(inp.value);
      if (f === 'length' || f === 'width' || f === 'height' || f === 'real_weight')
        guestParcels[idx][f] = v;
    });
    const p = guestParcels[idx];
    if (p.length && p.width && p.height)
      p.volumetric_weight = calculateVolumetricWeight(p.length, p.width, p.height);
    saveGuestParcels(guestParcels);
    pendingAnimationId = id; // L'icône de CE colis tournera après le rendu
    renderParcelsGrid(guestParcels);
  }
}

// ── Event listeners ──────────────────────────────────────────────────────────

function setupEventListeners() {
  // Repositionne les icônes et animations si la fenêtre est redimensionnée
  window.addEventListener('resize', () => {
    positionParcelIcons();
    positionPoidsAnimations();
  });

  // Redessine les canvas quand le thème change (classe sur <html>)
  attachPoidsThemeObserver();

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(GUEST_STORAGE_KEY);
    renderApp();
  });
  document.getElementById('loginBtn')?.addEventListener('click', e => {
    e.preventDefault(); renderAuth('login');
  });

  document.getElementById('addParcelBtn')?.addEventListener('click', async () => {
    if (currentUser) {
      const existing = await fetchParcels('active');
      const lastPos  = existing.length > 0 ? ((existing[existing.length - 1] as any).position ?? existing.length * 10) : 0;
      const insertData: ParcelInsert = { user_id: currentUser, status: 'active' };
      const { data, error } = await supabase
        .from('parcels')
        .insert({ ...insertData, position: lastPos + 10 } as unknown as Record<string, unknown>)
        .select().single();
      if (!error && data) {
        const ps = await fetchParcels('active'); renderParcelsGrid(ps);
      }
    } else {
      const guestParcels = getGuestParcels();
      if (guestParcels.length >= 3) {
        const notice = document.querySelector<HTMLElement>('.guest-notice');
        if (notice) {
          notice.textContent = 'En mode invité la création de colis est limité à 3 - Connectez-vous pour créer plus de colis';
          notice.classList.add('guest-notice--limit');
          setTimeout(() => {
            notice.textContent = 'Mode invité - Connectez-vous pour profiter de toutes les fonctionnalités';
            notice.classList.remove('guest-notice--limit');
          }, 3000);
        }
        return;
      }
      guestParcels.push({ id: generateId(), length: null, width: null, height: null, real_weight: null, volumetric_weight: null });
      saveGuestParcels(guestParcels);
      renderParcelsGrid(guestParcels);
    }
  });

  const syncNavActive = () => {
    const arOpen = document.getElementById('archivedPanel')?.classList.contains('open');
    const dlOpen = document.getElementById('deletedPanel')?.classList.contains('open');
    const none   = !arOpen && !dlOpen;
    document.querySelector('a[data-view="active"]')?.classList.toggle('nav-active', none);
    document.querySelector('a[data-view="active"]')?.classList.toggle('nav-active--active', none);
    document.querySelector('a[data-view="archived"]')?.classList.toggle('nav-active', !!arOpen);
    document.querySelector('a[data-view="archived"]')?.classList.toggle('nav-active--archived', !!arOpen);
    document.querySelector('a[data-view="deleted"]')?.classList.toggle('nav-active', !!dlOpen);
    document.querySelector('a[data-view="deleted"]')?.classList.toggle('nav-active--deleted', !!dlOpen);
  };
  (document as any).__syncNavActive = syncNavActive;

  const closeBothPanels = () => {
    document.getElementById('archivedPanel')?.classList.remove('open');
    document.getElementById('deletedPanel')?.classList.remove('open');
    syncNavActive();
  };

  // Un seul panneau ouvert à la fois (exclusion mutuelle)
  const toggleArchived = () => {
    document.getElementById('deletedPanel')?.classList.remove('open');
    document.getElementById('archivedPanel')?.classList.toggle('open');
    syncNavActive();
  };
  const toggleDeleted = () => {
    document.getElementById('archivedPanel')?.classList.remove('open');
    document.getElementById('deletedPanel')?.classList.toggle('open');
    syncNavActive();
  };

  // Fermeture au chargement si la fenêtre est déjà étroite
  if (window.innerWidth < 750) closeBothPanels();

  document.getElementById('archivedToggle')?.addEventListener('click', toggleArchived);
  document.getElementById('deletedToggle')?.addEventListener('click', toggleDeleted);

  // Nav links — use router for other pages, inline for panels
  document.querySelector('a[data-view="home"]')?.addEventListener('click', e => {
    e.preventDefault(); import('./router').then(r => r.navigateTo('home'));
  });
  document.querySelector('a[data-view="active"]')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('archivedPanel')?.classList.remove('open');
    document.getElementById('deletedPanel')?.classList.remove('open');
    syncNavActive();
  });
  document.querySelector('a[data-view="archived"]')?.addEventListener('click', e => { e.preventDefault(); toggleArchived(); });
  document.querySelector('a[data-view="deleted"]')?.addEventListener('click',  e => { e.preventDefault(); toggleDeleted();  });
  document.querySelector('a[data-view="lists"]')?.addEventListener('click',    e => { e.preventDefault(); import('./router').then(r => r.navigateTo('lists'));   });
  document.querySelector('a[data-view="contact"]')?.addEventListener('click',  e => { e.preventDefault(); import('./router').then(r => r.navigateTo('contact')); });

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const panel = (e.target as HTMLElement).dataset.panel;
      document.getElementById(`${panel}Panel`)?.classList.remove('open');
      syncNavActive();
    });
  });

  // Fermer les panneaux automatiquement si la fenêtre devient trop étroite
  window.addEventListener('resize', () => {
    if (window.innerWidth < 750) closeBothPanels();
  }, { passive: true });

  document.getElementById('emptyTrashBtn')?.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <p class="confirm-text">Voulez-vous vraiment supprimer cette liste ?<br>Elle sera perdue à jamais.</p>
        <div class="confirm-actions">
          <button class="btn btn-danger" id="confirmYes">Oui</button>
          <button class="btn btn-secondary" id="confirmNo">Non</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmNo')?.addEventListener('click', () => overlay.remove());
    document.getElementById('confirmYes')?.addEventListener('click', async () => {
      overlay.remove(); await emptyTrashDb(); await loadSidePanels();
    });
  });

  syncNavActive();
  document.getElementById('recapBtn')?.addEventListener('click', () => renderRecapReport());

  if (!globalListenersAttached) {
    markGlobalListenersAttached();

    document.addEventListener('input', e => {
      const input = e.target as HTMLInputElement;
      if (!input.matches('input[data-field]')) return;
      const v   = parseFloat(input.value);
      const bad = isNaN(v) || v <= 0;
      input.classList.toggle('error', bad);
      if (!bad) {
        const card = input.closest<HTMLElement>('.parcel-card');
        if (card) {
          const still = Array.from(card.querySelectorAll<HTMLInputElement>('input[data-field]'))
            .some(i => { const x = parseFloat(i.value); return isNaN(x) || x <= 0; });
          if (!still) card.classList.remove('flash-invalid');
        }
      }
    });

    document.addEventListener('click', async e => {
      const target    = e.target as HTMLElement;
      const card      = target.closest<HTMLElement>('.parcel-card');
      const panelItem = target.closest<HTMLElement>('.panel-item');
      if (!card && !panelItem) return;
      const id       = card?.dataset.id || panelItem?.dataset.id;
      const actionEl = (target.closest<HTMLElement>('[data-action]')) || target;
      const action   = actionEl.dataset.action;
      if (!id || !action) return;

      if (!currentUser) { handleGuestAction(id, action, card); return; }

      switch (action) {
        case 'delete':           await updateParcelDb(id, { status: 'deleted' });  break;
        case 'archive':          await updateParcelDb(id, { status: 'archived' }); break;
        case 'restore':          await updateParcelDb(id, { status: 'active' });   break;
        case 'archive-delete':   await updateParcelDb(id, { status: 'deleted' });  break;
        case 'permanent-delete': await deleteParcelDb(id);                         break;
        case 'rename': {
          const titleEl = card?.querySelector('.parcel-card-title-group h3') || panelItem?.querySelector('.panel-item-name');
          const current = (titleEl as HTMLElement)?.textContent?.trim() || '';
          showRenameModal(id, current.startsWith('Colis #') ? '' : current, async () => {
            const ps = await fetchParcels('active'); renderParcelsGrid(ps); loadSidePanels();
          });
          return;
        }
        case 'duplicate': {
          const titleEl = card?.querySelector('.parcel-card-title-group h3');
          const current = (titleEl as HTMLElement)?.textContent?.trim() || '';
          await duplicateParcel(id, current.startsWith('Colis #') ? null : current);
          return;
        }
        case 'add-to-list':
          showAddToListModal(id, () => loadSidePanels());
          return;
        case 'calculate': {
          if (card) {
            const inputs  = card.querySelectorAll<HTMLInputElement>('input[data-field]');
            const data: Record<string, number | null> = {};
            let hasInvalid = false;
            inputs.forEach(inp => {
              const v = parseFloat(inp.value); const bad = isNaN(v) || v <= 0;
              if (bad) {
                hasInvalid = true;
                inp.classList.remove('flash-error'); void inp.offsetWidth; inp.classList.add('flash-error');
                inp.addEventListener('animationend', () => inp.classList.remove('flash-error'), { once: true });
              } else { data[inp.dataset.field!] = v; }
            });
            if (hasInvalid) {
              card.classList.remove('flash-invalid'); void card.offsetWidth; card.classList.add('flash-invalid');
              card.addEventListener('animationend', () => card.classList.remove('flash-invalid'), { once: true });
              return;
            }
            pendingAnimationId = id; // L'icône de CE colis tournera après le rendu
            await updateParcelDb(id, data);
          }
          break;
        }
      }
      const ps = await fetchParcels('active'); renderParcelsGrid(ps); loadSidePanels();
    });
  }
}

// ── Génération SVG dynamique 3D (Proportionnel) ─────────────────────────────

function genererSvgColisDynamique(longueur: number, largeur: number, hauteur: number): string {
    const sin30 = 0.5, cos30 = 0.866;

    // Coordonnées réelles du colis
    const L = longueur, l = largeur, h = hauteur;
    const p0x = 0, p0y = 0; 
    const p1x = l * cos30, p1y = l * sin30; 
    const p3x = -L * cos30, p3y = L * sin30; 
    const p2x = (l - L) * cos30, p2y = (l + L) * sin30; 
    const p6x = p1x, p6y = p1y + h; 
    const p5x = p3x, p5y = p3y + h; 
    const p4x = p2x, p4y = p2y + h; 

    // Limites de CE colis précis
    const boxMinX = p3x, boxMaxX = p1x;
    const boxMinY = p0y, boxMaxY = p4y;
    const cx = (boxMinX + boxMaxX) / 2;
    const cy = (boxMinY + boxMaxY) / 2;

    // Pour garantir la proportionnalité, on utilise une "fenêtre" (viewBox) virtuelle de référence
    // équivalente à une boîte de taille moyenne (ex: 60x60x60). 
    // Un colis de 10cm sera dessiné tout petit dans cette fenêtre, un de 60cm la remplira.
    const targetW = Math.max(120, (boxMaxX - boxMinX) + 20);
    const targetH = Math.max(140, (boxMaxY - boxMinY) + 20);

    const minX = cx - targetW / 2;
    const minY = cy - targetH / 2;
    const strokeW = targetW * 0.01125; // Épaisseur du trait (−40 % vs 0.01875)

    return `
    <div class="icone-colis-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${targetW} ${targetH}" class="rotate-3d" fill="none" stroke="var(--primary)" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; overflow: visible;">
            <!-- Face supérieure : p0-p1-p2-p3 -->
            <polygon class="box-face" points="${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}"/>
            <!-- Face droite (côté droit descendant) : p1-p2-p4-p6 -->
            <polygon class="box-face" points="${p1x},${p1y} ${p2x},${p2y} ${p4x},${p4y} ${p6x},${p6y}"/>
            <!-- Face gauche (côté gauche descendant) : p3-p2-p4-p5 -->
            <polygon class="box-face" points="${p3x},${p3y} ${p2x},${p2y} ${p4x},${p4y} ${p5x},${p5y}"/>
            <!-- Arêtes de faîte intérieures -->
            <polyline points="${p3x},${p3y} ${p2x},${p2y} ${p1x},${p1y}"/>
            <!-- Arête arrière verticale -->
            <line x1="${p2x}" y1="${p2y}" x2="${p4x}" y2="${p4y}"/>
        </svg>
    </div>`;
}

