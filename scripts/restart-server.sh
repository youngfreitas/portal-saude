#!/bin/sh
# Reinicia `next start` local (uso em testes). PID em /tmp/portal-next.pid
[ -f /tmp/portal-next.pid ] && kill "$(cat /tmp/portal-next.pid)" 2>/dev/null
sleep 1
set -a; . ./.env; set +a
nohup ./node_modules/.bin/next start -p 3000 > /tmp/start.log 2>&1 &
echo $! > /tmp/portal-next.pid
sleep 4
