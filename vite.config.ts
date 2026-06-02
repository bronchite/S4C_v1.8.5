import { defineConfig } from 'vite';

export default defineConfig({
  // './' = chemins relatifs : fonctionne en local ET sur GitHub Pages
  // (sous-répertoire quelconque sans avoir à coder le nom du dépôt en dur)
  base: './',
  server: {
    port: 5173
  }
});
