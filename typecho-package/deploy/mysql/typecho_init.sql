CREATE DATABASE IF NOT EXISTS `【typecho_db】`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '【typecho_user】'@'localhost' IDENTIFIED BY '【请替换为高强度数据库密码】';

GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER
ON `【typecho_db】`.* TO '【typecho_user】'@'localhost';

FLUSH PRIVILEGES;

DELETE FROM mysql.user WHERE User='root' AND Host!='localhost';
FLUSH PRIVILEGES;
