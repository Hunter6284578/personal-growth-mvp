#!/bin/bash
# 服务器环境安装脚本
# 在服务器上运行一次即可

set -e

echo "========================================"
echo "开始安装服务器环境"
echo "========================================"

# 1. 更新系统
echo "[1/7] 更新系统包..."
apt update && apt upgrade -y

# 2. 安装基础工具
echo "[2/7] 安装基础工具..."
apt install -y curl wget git unzip vim certbot python3-certbot-nginx

# 3. 安装 Node.js 20 LTS
echo "[3/7] 安装 Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证 Node.js 安装
node --version
npm --version

# 4. 安装 PM2
echo "[4/7] 安装 PM2..."
npm install -g pm2

# 5. 安装 Nginx
echo "[5/7] 安装 Nginx..."
apt install -y nginx

# 6. 配置防火墙
echo "[6/7] 配置防火墙 (ufw)..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 7. 创建项目目录和日志目录
echo "[7/7] 创建目录和基础运行环境..."
mkdir -p /var/www/personal-growth-mvp/logs
mkdir -p /etc/letsencrypt

if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "========================================"
echo "环境安装完成！"
echo "========================================"
echo "下一步：运行部署脚本"
echo "========================================"
