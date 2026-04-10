<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

class CagedSheep_Security_Plugin implements Typecho_Plugin_Interface
{
    public static function activate()
    {
        Typecho_Plugin::factory('admin/login.php')->begin = [__CLASS__, 'guardLoginEntry'];
        Typecho_Plugin::factory('admin/common.php')->begin = [__CLASS__, 'enforceAdminGuard'];
        Typecho_Plugin::factory('Widget_User')->loginFail = [__CLASS__, 'onLoginFail'];
        Typecho_Plugin::factory('Widget_User')->loginSucceed = [__CLASS__, 'onLoginSuccess'];
        Typecho_Plugin::factory('Widget_Feedback')->comment = [__CLASS__, 'filterComment'];
        Typecho_Plugin::factory('Widget_Archive')->header = [__CLASS__, 'blockBadUa'];
        Helper::addPanel(3, 'CagedSheep_Security/verify.php', _t('安全验证'), _t('安全验证'), 'subscriber');
        return _t('CagedSheep_Security activated');
    }

    public static function deactivate()
    {
        Helper::removePanel(3, 'CagedSheep_Security/verify.php');
        return _t('CagedSheep_Security deactivated');
    }

    public static function config(Typecho_Widget_Helper_Form $form)
    {
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('loginGate', null, 'sheepgate', _t('后台登录口令'), _t('访问 /admin/login.php?gate=口令')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('maxFails', null, '5', _t('失败阈值')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('lockMinutes', null, '30', _t('锁定分钟')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('enableTotp', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('TOTP')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('totpSecret', null, 'JBSWY3DPEHPK3PXP', _t('TOTP Secret(Base32)')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea('badWords', null, "赌博\n色情\n代开发票", _t('评论敏感词')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea('badUa', null, "sqlmap\nnmap\nnikto", _t('恶意 UA 关键词')));
    }

    public static function personalConfig(Typecho_Widget_Helper_Form $form)
    {
    }

    public static function guardLoginEntry()
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        $req = Typecho_Request::getInstance();
        $ip = self::clientIp();
        if (self::isLocked($ip, (int) $opts->lockMinutes)) {
            self::deny403('IP 已锁定');
        }
        $gate = trim((string) $req->get('gate'));
        $expected = trim((string) $opts->loginGate);
        if ($expected !== '' && !hash_equals($expected, $gate)) {
            self::deny404();
        }
    }

    public static function enforceAdminGuard()
    {
        self::checkUa();
        $user = Typecho_Widget::widget('Widget_User');
        if (!$user->hasLogin()) {
            return;
        }
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        if ((string) $opts->enableTotp === '1' && (($_COOKIE['cs_2fa_ok'] ?? '0') !== '1')) {
            header('Location: ' . Typecho_Common::url('admin/extending.php?panel=CagedSheep_Security/verify.php', Typecho_Widget::widget('Widget_Options')->siteUrl));
            exit;
        }
    }

    public static function onLoginFail($name)
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        $ip = self::clientIp();
        $max = (int) $opts->maxFails;
        if ($max < 1) {
            $max = 5;
        }
        $data = self::loadFailData();
        if (!isset($data[$ip])) {
            $data[$ip] = ['count' => 0, 'time' => time()];
        }
        $data[$ip]['count']++;
        $data[$ip]['time'] = time();
        self::saveFailData($data);
        if ((int) $data[$ip]['count'] >= $max) {
            self::deny403('登录失败次数过多');
        }
    }

    public static function onLoginSuccess($name, $isRemember)
    {
        $ip = self::clientIp();
        $data = self::loadFailData();
        unset($data[$ip]);
        self::saveFailData($data);
        setcookie('cs_2fa_ok', '0', 0, '/');
    }

    public static function filterComment($comment, $post, $result)
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        $text = trim(strip_tags((string) ($comment['text'] ?? '')));
        $words = preg_split('/\r\n|\r|\n/', (string) $opts->badWords);
        if (is_array($words)) {
            foreach ($words as $w) {
                $w = trim((string) $w);
                if ($w !== '' && mb_stripos($text, $w, 0, 'UTF-8') !== false) {
                    throw new Typecho_Exception(_t('评论含敏感词，已拦截'));
                }
            }
        }
        $comment['text'] = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        return $comment;
    }

    public static function blockBadUa()
    {
        self::checkUa();
    }

    private static function checkUa(): void
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        $ua = strtolower((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
        $rules = preg_split('/\r\n|\r|\n/', (string) $opts->badUa);
        if (!is_array($rules)) {
            return;
        }
        foreach ($rules as $rule) {
            $rule = strtolower(trim((string) $rule));
            if ($rule !== '' && strpos($ua, $rule) !== false) {
                self::deny403('Forbidden');
            }
        }
    }

    private static function dataFile(): string
    {
        $dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        return $dir . DIRECTORY_SEPARATOR . 'fail_lock.json';
    }

    private static function loadFailData(): array
    {
        $file = self::dataFile();
        if (!is_file($file)) {
            return [];
        }
        $raw = file_get_contents($file);
        if ($raw === false || $raw === '') {
            return [];
        }
        $arr = json_decode($raw, true);
        return is_array($arr) ? $arr : [];
    }

    private static function saveFailData(array $data): void
    {
        file_put_contents(self::dataFile(), json_encode($data, JSON_UNESCAPED_UNICODE));
    }

    private static function isLocked(string $ip, int $lockMinutes): bool
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Security');
        $max = (int) $opts->maxFails;
        if ($max < 1) {
            $max = 5;
        }
        if ($lockMinutes < 1) {
            $lockMinutes = 30;
        }
        $data = self::loadFailData();
        if (!isset($data[$ip])) {
            return false;
        }
        $row = $data[$ip];
        $over = ((int) $row['count'] >= $max);
        $alive = (time() - (int) $row['time']) < ($lockMinutes * 60);
        if ($over && $alive) {
            return true;
        }
        if (!$alive) {
            unset($data[$ip]);
            self::saveFailData($data);
        }
        return false;
    }

    private static function clientIp(): string
    {
        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    private static function deny403(string $msg): void
    {
        header('HTTP/1.1 403 Forbidden');
        echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
        exit;
    }

    private static function deny404(): void
    {
        header('HTTP/1.1 404 Not Found');
        echo '404 Not Found';
        exit;
    }
}
