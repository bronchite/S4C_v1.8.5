#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build_and_zip.sh  –  Compile le projet Vite + TypeScript et génère un ZIP
#                      prêt à déployer sur votre serveur/hébergement.
#
# Usage :   bash build_and_zip.sh
# Prérequis: Node.js ≥ 18  et  npm
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Arrête le script à la première erreur

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VERSION="1.8.4"
OUT_ZIP="S4C_v${VERSION}_dist.zip"

echo "─────────────────────────────────────────────────"
echo "  Ship4Cheap v${VERSION}  –  Build & Zip"
echo "─────────────────────────────────────────────────"

# 1. Installation des dépendances
echo ""
echo "▶ 1/3  npm install…"
npm install

# 2. Compilation TypeScript + bundle Vite (→ dossier dist/)
echo ""
echo "▶ 2/3  npm run build (tsc + vite build)…"
npm run build

# 3. Compression du dossier dist/
echo ""
echo "▶ 3/3  Compression de dist/ → ${OUT_ZIP}…"
rm -f "${OUT_ZIP}"
(cd dist && zip -r "../${OUT_ZIP}" . -q)

echo ""
echo "✅  ZIP prêt : ${SCRIPT_DIR}/${OUT_ZIP}"
echo "    Déployez son contenu à la racine de votre serveur web."
echo "─────────────────────────────────────────────────"
