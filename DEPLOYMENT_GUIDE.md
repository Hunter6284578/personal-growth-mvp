# ECS 部署指南

这个项目推荐部署到 Ubuntu ECS：`Nginx -> PM2 -> Next.js`。

当前部署脚本会在本地构建 Next.js standalone 产物，然后上传到 ECS。2 核 2G 机器不适合直接跑 `next build`，这样能减少服务器卡死风险。

## 1. 服务器初始化

第一次部署前，在 ECS 上执行一次：

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/你的仓库地址/main/server-setup.sh
bash server-setup.sh
```

如果暂时没有把仓库推到 GitHub，也可以手动上传 `server-setup.sh` 后执行：

```bash
bash server-setup.sh
```

脚本会安装：

- Node.js 20
- PM2
- Nginx
- Certbot
- 基础工具和 2G swap

## 2. 配置环境变量

在服务器上创建 `/var/www/personal-growth-mvp/.env.production`：

```bash
mkdir -p /var/www/personal-growth-mvp
nano /var/www/personal-growth-mvp/.env.production
```

内容示例：

```env
NEXT_PUBLIC_SITE_URL=https://cagedsheep.cn
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service role key
REVALIDATE_TOKEN=自己生成一个长随机字符串
SITE_OWNER_EMAIL=你的登录邮箱
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=你的 Umami 网站 ID
```

部署脚本会保留服务器上的 `.env`、`.env.local`、`.env.production`，不会用本地环境变量覆盖线上配置。

## 3. 配置站主账号

执行 `supabase/migrations/004_owner_only_posts_and_comments.sql` 后，需要把你的 Supabase 用户 ID 写入 `site_admins`：

```sql
insert into public.site_admins (user_id)
values ('你的 auth.users.id')
on conflict (user_id) do nothing;
```

这样只有你能进入 `/dashboard`、发布文章和上传图片。访客只能阅读公开文章。

## 3.1 启用访问统计

访问统计推荐 Umami：在 Umami Cloud 或自托管 Umami 中添加 `https://cagedsheep.cn`，把生成的脚本地址和网站 ID 写入上面的两个环境变量。两项变量缺一时，站点不会加载统计脚本。

## 4. 提交代码

在本地项目目录执行：

```powershell
cd D:\个人网页\personal-growth-mvp
npm run lint
npm run build
git status
git add -A
git commit -m "Refine personal blog and ECS deployment"
```

## 5. 部署到 ECS

Windows PowerShell：

```powershell
.\deploy.ps1 -ServerIP 118.31.169.161 -SSHUser root -SSHPort 22
```

Linux / macOS / Git Bash：

```bash
./deploy.sh 118.31.169.161 root 22
```

部署脚本会执行：

1. 在本地执行 `npm run build`
2. 打包 `.next/standalone`、`.next/static`、`public` 和 `ecosystem.config.js`
3. 上传到 `/tmp/personal-growth-mvp-standalone.zip`
4. 在服务器临时目录解压新版本
5. 保留服务器已有环境变量和日志
6. 替换旧站点目录并用 PM2 重启 `personal-growth-mvp`

## 6. Nginx 配置

如果你已经配置过 Nginx，通常不用每次部署都改。

推荐配置：

```nginx
server {
    listen 80;
    server_name cagedsheep.cn www.cagedsheep.cn 118.31.169.161;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用后检查：

```bash
nginx -t
systemctl reload nginx
```

HTTPS 可以在域名解析到 ECS 后执行：

```bash
certbot --nginx -d cagedsheep.cn -d www.cagedsheep.cn
```

## 7. 常用命令

```bash
pm2 list
pm2 logs personal-growth-mvp
pm2 restart personal-growth-mvp
systemctl status nginx
tail -f /var/log/nginx/error.log
curl -I http://127.0.0.1:3000
```

## 8. 常见问题

### 部署后还是旧页面

先确认本地是否已经 commit：

```bash
git log --oneline -1
```

部署脚本只打包 `HEAD`，没有 commit 的改动不会上传。

### 构建时找不到 Supabase 环境变量

检查服务器上的环境变量文件：

```bash
ls -la /var/www/personal-growth-mvp/.env*
cat /var/www/personal-growth-mvp/.env.production
```

### PM2 正常但公网打不开

依次检查：

```bash
curl -I http://127.0.0.1:3000
nginx -t
systemctl status nginx
ufw status
```
