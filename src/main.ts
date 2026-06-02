// ─── Entry point ─────────────────────────────────────────────────────────────
import './style.css';
import { supabase } from '../lib/supabase';
import { app, GUEST_STORAGE_KEY, setCurrentUser } from './modules/state';
import { getCurrentUser } from './modules/api/auth';
import { createParcelFromGuest } from './modules/api/parcels';
import { getGuestParcels } from './modules/guest';
import { renderResetPassword } from './pages/auth';
import { initRouter, navigateTo } from './pages/router';

// ── Auth state listener ──────────────────────────────────────────────────────

supabase.auth.onAuthStateChange((event) => {
  // Cas spécial : réinitialisation de mot de passe (lien magique Supabase)
  // Pas de hash ici — c'est une vue transitoire hors routing normal.
  if (event === 'PASSWORD_RECOVERY') {
    renderResetPassword();
    return;
  }

  (async () => {
    if (event === 'SIGNED_IN') {
      // Migration des colis invités éventuels
      const guestParcels = getGuestParcels();
      if (guestParcels.length > 0) {
        const hasData = guestParcels.some(p => p.length || p.width || p.height || p.real_weight);
        if (hasData) {
          const migrate = confirm(
            `Vous avez ${guestParcels.length} colis(s) en mode invité. Voulez-vous les sauvegarder dans votre compte ?`
          );
          if (migrate) {
            const user = await getCurrentUser();
            if (user) {
              setCurrentUser(user.id);
              for (const parcel of guestParcels) {
                if (parcel.length || parcel.width || parcel.height || parcel.real_weight)
                  await createParcelFromGuest(parcel);
              }
              localStorage.removeItem(GUEST_STORAGE_KEY);
            }
          }
        }
      }
      // Après connexion → toujours atterrir sur les colis actifs
      navigateTo('active');
    } else if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
      navigateTo('active');
    }
  })();
});

// ── Boot ─────────────────────────────────────────────────────────────────────

app.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#1a2744;font-size:1.1rem;">Chargement...</div>`;

// initRouter lit le hash courant et rend la bonne vue.
// Un lien partagé (ex: #/lists) atterrit directement sur la bonne page.
initRouter();
