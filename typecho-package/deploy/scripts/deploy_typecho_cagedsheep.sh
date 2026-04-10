#!/usr/bin/env bash
set -euo pipefail

DOMAIN="【cagedsheep.cn】"
WWW_DOMAIN="【www.cagedsheep.cn】"
WEB_ROOT="/var/www/${DOMAIN}/public"

DB_NAME="【typecho_db】"
DB_USER="【typecho_user】"
DB_PASS="【请替换为高强度数据库密码】"

SSL_CERT_PATH="【/etc/ssl/certs/your_fullchain.pem】"
SSL_KEY_PATH="【/etc/ssl/private/your_privkey.key】"
TZ="Asia/Shanghai"

if [ "$(id -u)" -ne 0 ]; then
  echo "请使用 root 执行"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y
timedatectl set-timezone "${TZ}"
apt-get install -y ca-certificates curl gnupg lsb-release unzip ufw software-properties-common
apt-get install -y nginx mysql-server php8.1-fpm php8.1-cli php8.1-common php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-intl php8.1-bcmath php8.1-opcache certbot python3-certbot-nginx

mkdir -p "${WEB_ROOT}"
chown -R www-data:www-data "/var/www/${DOMAIN}"
find "/var/www/${DOMAIN}" -type d -exec chmod 755 {} \;
find "/var/www/${DOMAIN}" -type f -exec chmod 644 {} \;

cat > /etc/php/8.1/fpm/conf.d/99-typecho.ini <<'PHPINI'
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php8.1-fpm/typecho-error.log
memory_limit = 256M
max_execution_time = 60
max_input_time = 60
post_max_size = 32M
upload_max_filesize = 32M
max_file_uploads = 20
default_socket_timeout = 60
date.timezone = Asia/Shanghai
cgi.fix_pathinfo = 0
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,pcntl_exec,eval,assert
opcache.enable = 1
opcache.enable_cli = 0
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 1
opcache.revalidate_freq = 60
opcache.fast_shutdown = 1
PHPINI

mkdir -p /var/log/php8.1-fpm
touch /var/log/php8.1-fpm/typecho-error.log
chown -R www-data:www-data /var/log/php8.1-fpm

sed -i 's/^\s*bind-address\s*=.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf || true
grep -q '^local_infile' /etc/mysql/mysql.conf.d/mysqld.cnf || echo 'local_infile = 0' >> /etc/mysql/mysql.conf.d/mysqld.cnf
systemctl restart mysql

cat > /root/typecho_init.sql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
DELETE FROM mysql.user WHERE User='root' AND Host!='localhost';
FLUSH PRIVILEGES;
SQL

mysql < /root/typecho_init.sql
chmod 600 /root/typecho_init.sql

cat > "/etc/nginx/sites-available/${DOMAIN}.conf" <<NGINXCONF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log  /var/log/nginx/${DOMAIN}.error.log warn;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    root ${WEB_ROOT};
    index index.php index.html;
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log  /var/log/nginx/${DOMAIN}.error.log warn;
    ssl_certificate     ${SSL_CERT_PATH};
    ssl_certificate_key ${SSL_KEY_PATH};
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:20m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    client_max_body_size 32m;
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico|css|js|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
NGINXCONF

ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx php8.1-fpm mysql
systemctl restart php8.1-fpm
systemctl restart nginx

ufw --force allow OpenSSH
ufw --force allow 'Nginx Full'
ufw --force enable

echo "部署完成：${WEB_ROOT}"
