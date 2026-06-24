#!/bin/bash
# Next.js 网站部署脚本
# 用法: ./deploy.sh <服务器IP> [SSH用户] [SSH端口]

set -e

SERVER_IP="${1:-118.31.169.161}"
SSH_USER="${2:-root}"
SSH_PORT="${3:-22}"
PROJECT_DIR="/var/www/personal-growth-mvp"
APP_NAME="personal-growth-mvp"
ARCHIVE="/tmp/personal-growth-mvp-$(date +%Y%m%d%H%M%S).zip"
SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

echo "========================================"
echo "部署 personal-growth-mvp 到 ECS"
echo "服务器: $SERVER_IP"
echo "项目目录: $PROJECT_DIR"
echo "========================================"

echo "[1/5] 打包当前 commit..."
git archive --format=zip --output "$ARCHIVE" HEAD

echo "[2/5] 上传代码包..."
scp -P "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$ARCHIVE" "$SSH_USER@$SERVER_IP:/tmp/personal-growth-mvp.zip"
rm -f "$ARCHIVE"

echo "[3/5] 安装依赖并构建..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_IP" "PROJECT_DIR='$PROJECT_DIR' APP_NAME='$APP_NAME' bash -s" <<'REMOTE_EOF'
set -e

mkdir -p "$PROJECT_DIR/logs"

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

unzip -q /tmp/personal-growth-mvp.zip -d "$RELEASE_DIR"
rm -f /tmp/personal-growth-mvp.zip

for env_file in .env .env.local .env.production; do
  if [ -f "$BACKUP_DIR/$env_file" ]; then
    cp "$BACKUP_DIR/$env_file" "$RELEASE_DIR/$env_file"
  fi
done

cd "$RELEASE_DIR"
npm ci
npm run build
npm prune --omit=dev

mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR" ]; then
  mv "$PROJECT_DIR" "$OLD_DIR"
fi
mv "$RELEASE_DIR" "$PROJECT_DIR"
REMOTE_EOF

echo "[4/5] 重启 PM2..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_IP" "cd '$PROJECT_DIR' && pm2 delete '$APP_NAME' 2>/dev/null || true && pm2 start ecosystem.config.js --env production && pm2 save"

echo "[5/5] 验证服务..."
ssh "${SSH_OPTS[@]}" "$SSH_USER@$SERVER_IP" "pm2 list && curl -s -o /dev/null -w 'localhost:3000 HTTP %{http_code}\n' http://127.0.0.1:3000/"

echo "========================================"
echo "部署完成！"
echo "========================================"
echo "网站地址: https://cagedsheep.cn"
echo "备选地址: http://118.31.169.161"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs $APP_NAME"
echo "  重启应用: pm2 restart $APP_NAME"
echo "  查看状态: pm2 list"
echo "========================================"
