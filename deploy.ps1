# Deploy standalone build to ECS from Windows PowerShell.
# Usage:
#   .\deploy.ps1
#   .\deploy.ps1 -ServerIP 118.31.169.161 -SSHUser root -SSHPort 22

param(
    [string]$ServerIP = "118.31.169.161",
    [string]$SSHUser = "root",
    [int]$SSHPort = 22,
    [string]$ProjectDir = "/var/www/personal-growth-mvp",
    [string]$AppName = "personal-growth-mvp"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy standalone build to ECS" -ForegroundColor Cyan
Write-Host "Server: $ServerIP" -ForegroundColor Cyan
Write-Host "Project dir: $ProjectDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($command in @("git", "ssh", "scp", "npm")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Command not found: $command."
    }
}

$ScriptDir = $PSScriptRoot
Set-Location $ScriptDir

Write-Host "[1/6] Verify current commit..." -ForegroundColor Green
$isGitRepo = git rev-parse --is-inside-work-tree
if ($isGitRepo.Trim() -ne "true") {
    throw "Current directory is not a Git repository."
}

Write-Host "[2/6] Build locally..." -ForegroundColor Green
npm run build

$TempRoot = Join-Path $env:TEMP "personal-growth-mvp-standalone"
$TempZip = Join-Path $env:TEMP "personal-growth-mvp-standalone.zip"
if (Test-Path $TempRoot) { Remove-Item -LiteralPath $TempRoot -Recurse -Force }
if (Test-Path $TempZip) { Remove-Item -LiteralPath $TempZip -Force }
New-Item -ItemType Directory -Path $TempRoot | Out-Null

Write-Host "[3/6] Package standalone output..." -ForegroundColor Green
Copy-Item -LiteralPath ".next\standalone\*" -Destination $TempRoot -Recurse -Force
New-Item -ItemType Directory -Path (Join-Path $TempRoot ".next") -Force | Out-Null
Copy-Item -LiteralPath ".next\static" -Destination (Join-Path $TempRoot ".next\static") -Recurse -Force
if (Test-Path "public") {
    Copy-Item -LiteralPath "public" -Destination (Join-Path $TempRoot "public") -Recurse -Force
}
Copy-Item -LiteralPath "ecosystem.config.js" -Destination (Join-Path $TempRoot "ecosystem.config.js") -Force
Compress-Archive -Path (Join-Path $TempRoot "*") -DestinationPath $TempZip -Force
Remove-Item -LiteralPath $TempRoot -Recurse -Force

Write-Host "[4/6] Upload artifact..." -ForegroundColor Green
$Target = "$SSHUser@$ServerIP"
$SshOptions = @("-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new")
scp -P $SSHPort @SshOptions $TempZip "${Target}:/tmp/personal-growth-mvp-standalone.zip"
Remove-Item -LiteralPath $TempZip -Force

Write-Host "[5/6] Switch release and restart PM2..." -ForegroundColor Green
$RemoteScript = @"
set -e

PROJECT_DIR="$ProjectDir"
APP_NAME="$AppName"
RELEASE_DIR="/tmp/`$APP_NAME-release-`$(date +%Y%m%d%H%M%S)"
BACKUP_DIR="/tmp/`$APP_NAME-env-backup"
OLD_DIR="`$PROJECT_DIR.backup-`$(date +%Y%m%d%H%M%S)"

rm -rf "`$RELEASE_DIR" "`$BACKUP_DIR"
mkdir -p "`$RELEASE_DIR" "`$BACKUP_DIR"

if [ -d "`$PROJECT_DIR/logs" ]; then
  cp -a "`$PROJECT_DIR/logs" "`$RELEASE_DIR/logs"
else
  mkdir -p "`$RELEASE_DIR/logs"
fi

for env_file in .env .env.local .env.production; do
  if [ -f "`$PROJECT_DIR/`$env_file" ]; then
    cp "`$PROJECT_DIR/`$env_file" "`$BACKUP_DIR/`$env_file"
  fi
done

unzip -q /tmp/personal-growth-mvp-standalone.zip -d "`$RELEASE_DIR"
rm -f /tmp/personal-growth-mvp-standalone.zip

for env_file in .env .env.local .env.production; do
  if [ -f "`$BACKUP_DIR/`$env_file" ]; then
    cp "`$BACKUP_DIR/`$env_file" "`$RELEASE_DIR/`$env_file"
  fi
done

mkdir -p "`$(dirname "`$PROJECT_DIR")"
if [ -d "`$PROJECT_DIR" ]; then
  mv "`$PROJECT_DIR" "`$OLD_DIR"
fi
mv "`$RELEASE_DIR" "`$PROJECT_DIR"

cd "`$PROJECT_DIR"
pm2 delete "`$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
"@

$RemoteScript | ssh -p $SSHPort @SshOptions $Target "bash -s"

Write-Host "[6/6] Verify service..." -ForegroundColor Green
ssh -p $SSHPort @SshOptions $Target "pm2 list && curl -s -o /dev/null -w 'localhost:3000 HTTP %{http_code}\n' http://127.0.0.1:3000/"

Write-Host ""
Write-Host "Deploy finished." -ForegroundColor Green
