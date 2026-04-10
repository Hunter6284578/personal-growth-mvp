<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

class CagedSheep_Portfolio_Plugin implements Typecho_Plugin_Interface
{
    public static function activate()
    {
        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();
        $db->query("CREATE TABLE IF NOT EXISTS `{$prefix}cagedsheep_portfolio` (
            `id` int unsigned NOT NULL AUTO_INCREMENT,
            `title` varchar(255) NOT NULL,
            `slug` varchar(255) NOT NULL,
            `cover` varchar(500) NOT NULL DEFAULT '',
            `gallery` longtext NULL,
            `work_link` varchar(500) NOT NULL DEFAULT '',
            `created_at` varchar(50) NOT NULL DEFAULT '',
            `description` text NULL,
            `category` varchar(100) NOT NULL DEFAULT '',
            `status` tinyint(1) NOT NULL DEFAULT 1,
            `created` int unsigned NOT NULL,
            `modified` int unsigned NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `slug` (`slug`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        Helper::addPanel(3, 'CagedSheep_Portfolio/manage.php', _t('作品集'), _t('作品集管理'), 'administrator');
        Helper::addRoute('cagedsheep_portfolio_list', '/portfolio', 'CagedSheep_Portfolio_Front', 'listPage');
        Helper::addRoute('cagedsheep_portfolio_detail', '/portfolio/[slug]', 'CagedSheep_Portfolio_Front', 'detailPage');
        Typecho_Plugin::factory('Widget_Archive')->footer = [__CLASS__, 'injectHomeModule'];
        return _t('CagedSheep_Portfolio activated');
    }

    public static function deactivate()
    {
        Helper::removePanel(3, 'CagedSheep_Portfolio/manage.php');
        Helper::removeRoute('cagedsheep_portfolio_list');
        Helper::removeRoute('cagedsheep_portfolio_detail');
        return _t('CagedSheep_Portfolio deactivated');
    }

    public static function config(Typecho_Widget_Helper_Form $form)
    {
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('enableHome', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('首页模块')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('homeCount', null, '6', _t('首页展示数量')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Select('sortRule', ['newest' => _t('最新优先'), 'oldest' => _t('最早优先')], 'newest', _t('排序规则')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('moduleTitle', null, '作品集', _t('模块标题')));
    }

    public static function personalConfig(Typecho_Widget_Helper_Form $form)
    {
    }

    public static function injectHomeModule()
    {
        $archive = Typecho_Widget::widget('Widget_Archive');
        if (!$archive->is('index')) {
            return;
        }
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Portfolio');
        if ((string) $opts->enableHome !== '1') {
            return;
        }

        $count = (int) $opts->homeCount;
        if ($count < 1 || $count > 30) {
            $count = 6;
        }
        $order = ((string) $opts->sortRule === 'oldest') ? Typecho_Db::SORT_ASC : Typecho_Db::SORT_DESC;

        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();
        $rows = $db->fetchAll($db->select()->from($prefix . 'cagedsheep_portfolio')->where('status = ?', 1)->order('created', $order)->limit($count));
        if (empty($rows)) {
            return;
        }

        $site = rtrim((string) Typecho_Widget::widget('Widget_Options')->siteUrl, '/');
        echo '<section class="hero"><h2>' . htmlspecialchars((string) $opts->moduleTitle, ENT_QUOTES, 'UTF-8') . '</h2><p><a href="' . $site . '/portfolio">查看全部</a></p></section>';
        echo '<section class="portfolio-grid">';
        foreach ($rows as $row) {
            $title = htmlspecialchars((string) $row['title'], ENT_QUOTES, 'UTF-8');
            $url = $site . '/portfolio/' . rawurlencode((string) $row['slug']);
            $cover = htmlspecialchars((string) $row['cover'], ENT_QUOTES, 'UTF-8');
            $time = htmlspecialchars((string) $row['created_at'], ENT_QUOTES, 'UTF-8');
            echo '<article class="work-card">';
            if ($cover !== '') {
                echo '<a href="' . $url . '"><img class="work-cover" src="' . $cover . '" alt="' . $title . '" loading="lazy" decoding="async"></a>';
            }
            echo '<div class="work-body"><h3 class="work-title"><a href="' . $url . '">' . $title . '</a></h3><p class="work-time">' . $time . '</p></div></article>';
        }
        echo '</section>';
    }
}

class CagedSheep_Portfolio_Front extends Typecho_Widget implements Widget_Interface_Do
{
    public function action()
    {
    }

    public function listPage()
    {
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_Portfolio');
        $order = ((string) $opts->sortRule === 'oldest') ? Typecho_Db::SORT_ASC : Typecho_Db::SORT_DESC;
        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();
        $rows = $db->fetchAll($db->select()->from($prefix . 'cagedsheep_portfolio')->where('status = ?', 1)->order('created', $order)->limit(200));
        $site = rtrim((string) Typecho_Widget::widget('Widget_Options')->siteUrl, '/');

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>作品集</title></head><body><main style="max-width:980px;margin:24px auto;padding:0 16px;"><h1>作品集</h1><p><a href="' . $site . '">返回首页</a></p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">';
        foreach ($rows as $row) {
            $title = htmlspecialchars((string) $row['title'], ENT_QUOTES, 'UTF-8');
            $url = $site . '/portfolio/' . rawurlencode((string) $row['slug']);
            $cover = htmlspecialchars((string) $row['cover'], ENT_QUOTES, 'UTF-8');
            echo '<article style="border:1px solid #e6e6e6;border-radius:10px;overflow:hidden;">';
            if ($cover !== '') {
                echo '<a href="' . $url . '"><img src="' . $cover . '" alt="' . $title . '" loading="lazy" decoding="async" style="width:100%;aspect-ratio:16/10;object-fit:cover;"></a>';
            }
            echo '<div style="padding:12px;"><h3 style="margin:0;"><a href="' . $url . '">' . $title . '</a></h3></div></article>';
        }
        echo '</div></main></body></html>';
        exit;
    }

    public function detailPage()
    {
        $slug = trim((string) $this->request->get('slug'));
        if ($slug === '') {
            $this->response->setStatus(404);
            exit('404 Not Found');
        }

        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();
        $row = $db->fetchRow($db->select()->from($prefix . 'cagedsheep_portfolio')->where('slug = ?', $slug)->where('status = ?', 1)->limit(1));
        if (!$row) {
            $this->response->setStatus(404);
            exit('404 Not Found');
        }

        $site = rtrim((string) Typecho_Widget::widget('Widget_Options')->siteUrl, '/');
        $title = htmlspecialchars((string) $row['title'], ENT_QUOTES, 'UTF-8');
        $cover = htmlspecialchars((string) $row['cover'], ENT_QUOTES, 'UTF-8');
        $desc = nl2br(htmlspecialchars((string) $row['description'], ENT_QUOTES, 'UTF-8'));
        $link = htmlspecialchars((string) $row['work_link'], ENT_QUOTES, 'UTF-8');
        $time = htmlspecialchars((string) $row['created_at'], ENT_QUOTES, 'UTF-8');
        $gallery = json_decode((string) ($row['gallery'] ?? '[]'), true);
        if (!is_array($gallery)) {
            $gallery = [];
        }

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . $title . '</title></head><body><main style="max-width:860px;margin:24px auto;padding:0 16px;"><p><a href="' . $site . '/portfolio">← 返回作品集</a></p><h1>' . $title . '</h1><p style="color:#666;">创作时间：' . $time . '</p>';
        if ($cover !== '') {
            echo '<p><img src="' . $cover . '" alt="' . $title . '" loading="lazy" decoding="async" style="max-width:100%;height:auto;"></p>';
        }
        echo '<div>' . $desc . '</div>';
        if ($link !== '') {
            echo '<p>作品链接：<a href="' . $link . '" target="_blank" rel="noopener noreferrer">' . $link . '</a></p>';
        }
        if (!empty($gallery)) {
            echo '<h2>作品图集</h2>';
            foreach ($gallery as $img) {
                $img = trim((string) $img);
                if (preg_match('#^https?://#i', $img) !== 1) {
                    continue;
                }
                $esc = htmlspecialchars($img, ENT_QUOTES, 'UTF-8');
                echo '<p><img src="' . $esc . '" alt="' . $title . '" loading="lazy" decoding="async" style="max-width:100%;height:auto;"></p>';
            }
        }
        echo '</main></body></html>';
        exit;
    }
}
