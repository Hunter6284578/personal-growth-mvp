<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

class CagedSheep_Hardening_Plugin implements Typecho_Plugin_Interface
{
    public static function activate()
    {
        Typecho_Plugin::factory('admin/login.php')->begin = [__CLASS__, 'guardAdminLoginPath'];
        Typecho_Plugin::factory('admin/common.php')->begin = [__CLASS__, 'guardAdminAccess'];
        Typecho_Plugin::factory('Widget_Feedback')->comment = [__CLASS__, 'filterComment'];
        Typecho_Plugin::factory('Widget_Archive')->header = [__CLASS__, 'guardRequest'];
        return _t('CagedSheep_Hardening activated');
    }

    public static function deactivate()
    {
        return _t('CagedSheep_Hardening deactivated');
    }

    public static function config(Typecho_Widget_Helper_Form $form)
    {
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('adminEntryToken', null, '【后台入口令牌】', _t('后台入口令牌')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('adminOnly', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('仅管理员可访问后台')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea('spamKeywords', null, "赌博\n色情\n代开发票\n引流", _t('评论敏感词')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('maxCommentLinks', null, '2', _t('评论最大外链数')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('sameOriginPost', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('POST 同源校验')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('blockTraversal', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('目录遍历拦截')));
    }

    public static function personalConfig(Typecho_Widget_Helper_Form $form)
    {
    }

    public static function guardAdminLoginPath()
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Hardening');
        $token = trim((string) $opts->adminEntryToken);
        $entry = trim((string) Typecho_Request::getInstance()->get('entry'));
        if ($token !== '' && !hash_equals($token, $entry)) {
            self::deny404();
        }
    }

    public static function guardAdminAccess()
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Hardening');
        $user = Typecho_Widget::widget('Widget_User');
        if (!$user->hasLogin()) {
            return;
        }
        if ((string) $opts->adminOnly === '1' && (string) $user->group !== 'administrator') {
            self::deny403('仅管理员可访问后台');
        }
    }

    public static function filterComment($comment, $post, $result)
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Hardening');
        $textRaw = trim((string) ($comment['text'] ?? ''));
        if ($textRaw === '') {
            throw new Typecho_Exception(_t('评论不能为空'));
        }

        $maxLinks = (int) $opts->maxCommentLinks;
        if ($maxLinks < 0) {
            $maxLinks = 2;
        }
        preg_match_all('/https?:\/\/|www\./i', $textRaw, $matches);
        if (count($matches[0]) > $maxLinks) {
            throw new Typecho_Exception(_t('评论外链过多，已拦截'));
        }

        $words = preg_split('/\r\n|\r|\n/', (string) $opts->spamKeywords);
        if (is_array($words)) {
            foreach ($words as $word) {
                $word = trim((string) $word);
                if ($word !== '' && mb_stripos($textRaw, $word, 0, 'UTF-8') !== false) {
                    throw new Typecho_Exception(_t('评论包含敏感词，已拦截'));
                }
            }
        }

        $comment['text'] = htmlspecialchars(strip_tags($textRaw), ENT_QUOTES, 'UTF-8');
        $comment['author'] = htmlspecialchars(trim((string) ($comment['author'] ?? '')), ENT_QUOTES, 'UTF-8');
        $comment['mail'] = filter_var((string) ($comment['mail'] ?? ''), FILTER_VALIDATE_EMAIL) ?: '';
        $comment['url'] = self::safeUrl((string) ($comment['url'] ?? ''));
        return $comment;
    }

    public static function guardRequest()
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Hardening');
        $uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
        if ((string) $opts->blockTraversal === '1' && preg_match('/(\.\.\/|%2e%2e|%252e%252e|%00)/i', $uri) === 1) {
            self::deny403('非法请求');
        }
        if ((string) $opts->sameOriginPost === '1' && strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'POST') {
            $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
            $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
            if ($origin !== '') {
                $originHost = parse_url($origin, PHP_URL_HOST);
                if (!is_string($originHost) || !hash_equals($host, $originHost)) {
                    self::deny403('跨站请求已拦截');
                }
            }
        }
    }

    private static function safeUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }
        if (preg_match('/^https?:\/\//i', $url) !== 1) {
            return '';
        }
        return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
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
