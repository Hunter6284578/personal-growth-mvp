<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

Typecho_Widget::widget('Widget_User')->pass('subscriber');
require_once __DIR__ . '/Totp.php';

$opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
$security = Typecho_Widget::widget('Widget_Security');
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $security->protect();
    $code = (string) ($_POST['totp_code'] ?? '');
    if (!CagedSheep_Security_Totp::verifyCode(trim((string) $opts->totpSecret), $code, 1)) {
        $error = '动态码错误';
    } else {
        setcookie('cs_2fa_ok', '1', 0, '/');
        $message = '验证通过，正在跳转...';
        header('Refresh: 1;url=' . Typecho_Common::url('admin/', Typecho_Widget::widget('Widget_Options')->siteUrl));
    }
}
?>
<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>2FA 验证</title></head>
<body>
<main style="max-width:480px;margin:60px auto;padding:20px;border:1px solid #e6e6e6;border-radius:10px;">
    <h2>二次验证</h2>
    <?php if ($message !== ''): ?><p style="color:#0a7a2e;"><?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></p><?php endif; ?>
    <?php if ($error !== ''): ?><p style="color:#b13a3a;"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p><?php endif; ?>
    <form method="post">
        <input type="text" name="totp_code" maxlength="6" pattern="\d{6}" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
        <button type="submit" style="margin-top:10px;width:100%;padding:10px;border:1px solid #2f2f2f;background:#2f2f2f;color:#fff;border-radius:6px;">验证</button>
    </form>
</main>
</body>
</html>
