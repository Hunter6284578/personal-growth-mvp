<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

class CagedSheep_SEO_Plugin implements Typecho_Plugin_Interface
{
    public static function activate()
    {
        Typecho_Plugin::factory('Widget_Archive')->header = [__CLASS__, 'injectHead'];
        Helper::addRoute('cagedsheep_seo_sitemap', '/sitemap.xml', 'CagedSheep_SEO_Action', 'sitemap');
        return _t('CagedSheep_SEO activated');
    }

    public static function deactivate()
    {
        Helper::removeRoute('cagedsheep_seo_sitemap');
        return _t('CagedSheep_SEO deactivated');
    }

    public static function config(Typecho_Widget_Helper_Form $form)
    {
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('siteTitleSuffix', null, '', _t('全局标题后缀')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea('defaultDescription', null, '', _t('全局默认描述')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('defaultKeywords', null, '', _t('全局默认关键词')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('enableCanonical', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('Canonical')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio('enableJsonLd', ['1' => _t('开启'), '0' => _t('关闭')], '1', _t('JSON-LD')));
        $form->addInput(new Typecho_Widget_Helper_Form_Element_Text('sitemapPageSize', null, '500', _t('Sitemap 数量上限')));
    }

    public static function personalConfig(Typecho_Widget_Helper_Form $form)
    {
    }

    public static function injectHead()
    {
        $archive = Typecho_Widget::widget('Widget_Archive');
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_SEO');

        $seoTitle = self::safe((string) ($archive->fields->seo_title ?? ''));
        $seoDesc = self::safe((string) ($archive->fields->seo_description ?? ''));
        $seoKeywords = self::safe((string) ($archive->fields->seo_keywords ?? ''));

        $title = $seoTitle !== '' ? $seoTitle : self::safe((string) $archive->title) . ' ' . trim((string) $opts->siteTitleSuffix);
        $desc = $seoDesc !== '' ? $seoDesc : self::safe((string) $opts->defaultDescription);
        $keywords = $seoKeywords !== '' ? $seoKeywords : self::safe((string) $opts->defaultKeywords);

        if ($desc !== '') {
            echo '<meta name="description" content="' . self::esc($desc) . '">' . PHP_EOL;
        }
        if ($keywords !== '') {
            echo '<meta name="keywords" content="' . self::esc($keywords) . '">' . PHP_EOL;
        }
        if ($title !== '') {
            echo '<meta property="og:title" content="' . self::esc($title) . '">' . PHP_EOL;
        }

        if ((string) $opts->enableCanonical === '1') {
            echo '<link rel="canonical" href="' . self::esc((string) $archive->permalink) . '">' . PHP_EOL;
        }

        if ((string) $opts->enableJsonLd === '1' && ($archive->is('post') || $archive->is('page'))) {
            $json = [
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => self::safe((string) $archive->title),
                'datePublished' => date('c', (int) $archive->created),
                'dateModified' => date('c', (int) $archive->modified),
                'mainEntityOfPage' => (string) $archive->permalink,
                'description' => $desc,
            ];
            echo '<script type="application/ld+json">' . json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' . PHP_EOL;
        }
    }

    private static function safe(string $value): string
    {
        return trim(strip_tags($value));
    }

    private static function esc(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}

class CagedSheep_SEO_Action extends Typecho_Widget implements Widget_Interface_Do
{
    public function action()
    {
    }

    public function sitemap()
    {
        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();
        $opts = Typecho_Widget::widget('Widget_Options')->plugin('CagedSheep_SEO');
        $siteUrl = rtrim((string) Typecho_Widget::widget('Widget_Options')->siteUrl, '/');
        $limit = (int) $opts->sitemapPageSize;
        if ($limit < 1 || $limit > 5000) {
            $limit = 500;
        }

        $rows = $db->fetchAll(
            $db->select('cid', 'slug', 'modified', 'type')
                ->from($prefix . 'contents')
                ->where('status = ?', 'publish')
                ->where('type IN ?', ['post', 'page'])
                ->order('modified', Typecho_Db::SORT_DESC)
                ->limit($limit)
        );

        header('Content-Type: application/xml; charset=UTF-8');
        echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        echo '<url><loc>' . self::x($siteUrl . '/') . '</loc></url>' . PHP_EOL;

        foreach ($rows as $row) {
            $path = ($row['type'] === 'page') ? '/index.php/' . $row['slug'] . '/' : '/index.php/archives/' . $row['cid'] . '/';
            $url = $siteUrl . $path;
            echo '<url><loc>' . self::x($url) . '</loc><lastmod>' . self::x(date('c', (int) $row['modified'])) . '</lastmod></url>' . PHP_EOL;
        }

        echo '</urlset>';
        exit;
    }

    private static function x(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
