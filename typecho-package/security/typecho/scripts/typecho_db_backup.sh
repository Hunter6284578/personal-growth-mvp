#!/usr/bin/env bash
set -euo pipefail
umask 077

source /etc/cagedsheep/backup.env

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

TS="$(date +%F_%H%M%S)"
FILE="${BACKUP_DIR}/typecho_${DB_NAME}_${TS}.sql.gz"
SUM="${FILE}.sha256"

mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --password="${DB_PASS}" \
  --single-transaction \
  --quick \
  --default-character-set=utf8mb4 \
  "${DB_NAME}" | gzip -9 > "${FILE}"

sha256sum "${FILE}" > "${SUM}"
rclone copy "${FILE}" "${RCLONE_REMOTE}:${RCLONE_PATH}/"
rclone copy "${SUM}" "${RCLONE_REMOTE}:${RCLONE_PATH}/"
find "${BACKUP_DIR}" -type f -name "typecho_${DB_NAME}_*.sql.gz*" -mtime +30 -delete
rclone delete "${RCLONE_REMOTE}:${RCLONE_PATH}/" --min-age 30d --include "typecho_${DB_NAME}_*.sql.gz*"
