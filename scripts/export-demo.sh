#!/usr/bin/env bash
# Gera portal-saude-demo-cloudflare.zip (site estático). Requer o banco com a demo carregada (npm run db:seed:demo).
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${EXPORT_PORT:-3100}"
export SITE_URL="${DEMO_SITE_URL:-https://portal-saude-demo.pages.dev}"
export EXPORT_BASE="http://localhost:$PORT"
npm run build
npx next start -p "$PORT" >/tmp/portal-export-server.log 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT
for i in $(seq 1 60); do curl -sf "$EXPORT_BASE/" >/dev/null && break; sleep 1; done
curl -sf "$EXPORT_BASE/" >/dev/null || { echo "Servidor não subiu; veja /tmp/portal-export-server.log"; exit 1; }
node scripts/export-static.mjs
