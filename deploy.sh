#!/bin/bash
# Deploy standalone build to ECS.
# Usage: ./deploy.sh <server-ip> [ssh-user] [ssh-port]

set -e

SERVER_IP="${1:-118.31.169.161}"
SSH_USER="${2:-root}"
SSH_PORT="${3:-22}"
PROJECT_DIR="/var/www/personal-growth-mvp"
APP_NAME="personal-growth-mvp"
ARTIFACT="/tmp/personal-growth-mvp-standalone.zip"
PACK_DIR="/tmp/personal-growth-mvp-standalone"
SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

echo "========================================"
echo "Deploy standalone build to ECS"
echo "Server: $SERVER_IP"
echo "Project dir: $PROJECT_DIR"
echo "========================================"

echo "[1/6] Verify current commit..."
git rev-parse --is-inside-work-tree >/dev/null

echo "[2/6] Build locally..."
npm run build

echo "[3/6] Package standalone output..."
rm -rf "$PACK_DIR" "$ARTIFACT"
mkdir -p "$PACK_DIR/.next"
cp -R .next/standalone/. "$PACK_DIR/"
cp -R .next/static "$PACK_DIR/.next/static"
if [ -d public ]; then
  cp -R public "$PACK_DIR/public"
fi
cp ecosystem.config.js "$PACK_DIR/ecosystem.config.js"
(cd "$PACK_DIR" && zip -qr "$ARTIFACT" .)
rm -rf "$PACK_DIR"

echo "[4/6] Upload artifact..."
scp -P "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$ARTIFACT" "$SSH_USER@$SERVER_IP:/tmp/personal-growth-mvp-standalone.zip"
rm -f "$ARTIFACT"

echo "[5/6] Switch release and restart PM2..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_IP" "PROJECT_DIR='$PROJECT_DIR' APP_NAME='$APP_NAME' bash -s" <<'REMOTE_EOF'
set -e

RELEASE_DIR="/tmp/${APP_NAME}-release-$(date +%Y%m%d%H%M%S)"
BACKUP_DIR="/tmp/${APP_NAME}-env-backup"
OLD_DIR="${PROJECT_DIR}.backup-$(date +%Y%m%d%H%M%S)"

rm -rf "$RELEASE_DIR" "$BACKUP_DIR"
mkdir -p "$RELEASE_DIR" "$BACKUP_DIR"

if [ -d "$PROJECT_DIR/logs" ]; then
  cp -a "$PROJECT_DIR/logs" "$RELEASE_DIR/logs"
else
  mkdir -p "$RELEASE_DIR/logs"
fi

for env_file in .env .env.local .env.production; do
  if [ -f "$PROJECT_DIR/$env_file" ]; then
    cp "$PROJECT_DIR/$env_file" "$BACKUP_DIR/$env_file"
  fi
done

unzip -q /tmp/personal-growth-mvp-standalone.zip -d "$RELEASE_DIR"
rm -f /tmp/personal-growth-mvp-standalone.zip

for env_file in .env .env.local .env.production; do
  if [ -f "$BACKUP_DIR/$env_file" ]; then
    cp "$BACKUP_DIR/$env_file" "$RELEASE_DIR/$env_file"
  fi
done

mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR" ]; then
  mv "$PROJECT_DIR" "$OLD_DIR"
fi
mv "$RELEASE_DIR" "$PROJECT_DIR"

cd "$PROJECT_DIR"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
REMOTE_EOF

echo "[6/6] Verify service..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_IP" "pm2 list && curl -s -o /dev/null -w 'localhost:3000 HTTP %{http_code}\n' http://127.0.0.1:3000/"

echo "Deploy finished."
