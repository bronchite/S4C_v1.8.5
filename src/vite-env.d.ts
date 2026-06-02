/// <reference types="vite/client" />

// ─── Déclarations de modules non-TypeScript ──────────────────────────────────
// Permet d'importer ./style.css sans erreur TS2882
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

// ─── Extension de l'environnement Vite ───────────────────────────────────────
// On ÉTEND seulement ImportMetaEnv (fusion d'interface TypeScript).
// Ne PAS redéclarer "interface ImportMeta" : vite/client le fait déjà et une
// double déclaration de la propriété "env" crée un conflit qui rend
// import.meta.env invisible dans tous les fichiers hors de src/.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // BASE_URL, MODE, DEV, PROD, SSR sont déjà fournis par vite/client
}
