<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

function themeConfig(Typecho_Widget_Helper_Form $form): void
{
    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'logoUrl',
        null,
        '',
        _t('Logo 地址'),
        _t('建议填写 HTTPS 图片地址。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'faviconUrl',
        null,
        '',
        _t('Favicon 地址'),
        _t('浏览器标签页图标。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'siteSubtitle',
        null,
        '在有限之境，记录生长与微光。',
        _t('站点副标题'),
        _t('显示在头部与首页。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'icpNo',
        null,
        '',
        _t('ICP备案号'),
        _t('底部自动链接工信部备案平台。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'publicSecurityNo',
        null,
        '',
        _t('公安备案号（可选）'),
        _t('示例：沪公网安备xxxxxxxx号。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea(
        'navItems',
        null,
        "首页|/|_self\n归档|/archives/|_self",
        _t('自定义导航'),
        _t('每行一项：名称|链接|target，例如：摄影|/category/photo/|_self')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio(
        'homeDisplayMode',
        ['card' => _t('卡片模式'), 'compact' => _t('紧凑模式')],
        'card',
        _t('首页列表模式')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'homePageSize',
        null,
        '10',
        _t('首页每页展示数量'),
        _t('建议 6-12。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio(
        'portfolioEnabled',
        ['1' => _t('开启'), '0' => _t('关闭')],
        '1',
        _t('作品集模块')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'primaryColor',
        null,
        '#2f2f2f',
        _t('主题主色调'),
        _t('HEX 格式，例如 #2f2f2f。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Radio(
        'darkModeEnabled',
        ['1' => _t('开启'), '0' => _t('关闭')],
        '1',
        _t('暗黑模式')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Text(
        'analyticsScriptUrl',
        null,
        '',
        _t('统计脚本 URL'),
        _t('HTTPS 地址，留空则不注入。')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea(
        'socialLinks',
        null,
        "GitHub|https://github.com/",
        _t('社交链接'),
        _t('每行一项：名称|链接')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Select(
        'commentSystem',
        ['native' => _t('Typecho 原生'), 'disqus' => _t('Disqus'), 'utterances' => _t('Utterances')],
        'native',
        _t('评论系统')
    ));

    $form->addInput(new Typecho_Widget_Helper_Form_Element_Textarea(
        'commentSystemConfig',
        null,
        '{"disqusShortname":"","utterancesRepo":"","utterancesIssueTerm":"pathname","utterancesTheme":"github-light"}',
        _t('评论系统配置 JSON')
    ));
}

function themeFields(Typecho_Widget_Helper_Layout $layout): void
{
    $layout->addItem(new Typecho_Widget_Helper_Form_Element_Radio(
        'is_work',
        ['0' => _t('否'), '1' => _t('是')],
        '0',
        _t('是否作为作品')
    ));

    $layout->addItem(new Typecho_Widget_Helper_Form_Element_Text(
        'work_cover',
        null,
        '',
        _t('作品封面 URL')
    ));

    $layout->addItem(new Typecho_Widget_Helper_Form_Element_Textarea(
        'work_gallery',
        null,
        '',
        _t('作品图集'),
        _t('每行一个图片 URL')
    ));

    $layout->addItem(new Typecho_Widget_Helper_Form_Element_Text(
        'work_link',
        null,
        '',
        _t('作品外链')
    ));

    $layout->addItem(new Typecho_Widget_Helper_Form_Element_Text(
        'work_created_at',
        null,
        '',
        _t('创作时间')
    ));
}

function csEscape(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function csSafeUrl(string $url, string $siteUrl = ''): string
{
    $url = trim($url);
    if ($url === '') {
        return '';
    }

    if (preg_match('/^https?:\/\//i', $url) === 1) {
        return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
    }

    if (str_starts_with($url, '/')) {
        return rtrim($siteUrl, '/') . $url;
    }

    return '';
}

function csSafeColor(string $value): string
{
    $value = trim($value);
    if (preg_match('/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $value) === 1) {
        return $value;
    }

    return '#2f2f2f';
}

function csParseNavItems(?string $raw, string $siteUrl): array
{
    $items = [];
    $lines = preg_split('/\r\n|\r|\n/', (string) $raw);
    if (!is_array($lines)) {
        return $items;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        $parts = array_map('trim', explode('|', $line));
        $name = $parts[0] ?? '';
        $url = csSafeUrl($parts[1] ?? '', $siteUrl);
        $target = ($parts[2] ?? '_self') === '_blank' ? '_blank' : '_self';

        if ($name === '' || $url === '') {
            continue;
        }

        $items[] = ['name' => $name, 'url' => $url, 'target' => $target];
    }

    return $items;
}

function csParseSocialLinks(?string $raw): array
{
    $items = [];
    $lines = preg_split('/\r\n|\r|\n/', (string) $raw);
    if (!is_array($lines)) {
        return $items;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        $parts = array_map('trim', explode('|', $line));
        $name = $parts[0] ?? '';
        $url = $parts[1] ?? '';

        if ($name === '' || preg_match('/^https?:\/\//i', $url) !== 1 || !filter_var($url, FILTER_VALIDATE_URL)) {
            continue;
        }

        $items[] = ['name' => $name, 'url' => $url];
    }

    return $items;
}

function csCommentConfig(?string $json): array
{
    $decoded = json_decode((string) $json, true);
    return is_array($decoded) ? $decoded : [];
}

function csCommentCallback(Typecho_Widget_Comments_Archive $comments, array $options): void
{
    ?>
    <li id="li-<?php $comments->theId(); ?>" class="comment-body comment-level-<?php $comments->levelsAlt(); ?>">
        <div id="<?php $comments->theId(); ?>">
            <div>
                <span class="comment-author"><?php $comments->author(); ?></span>
                <span class="comment-meta"><?php $comments->date('Y-m-d H:i'); ?></span>
            </div>
            <?php if ($comments->status === 'waiting'): ?>
                <div class="comment-awaiting"><?php _e('评论正在审核中'); ?></div>
            <?php endif; ?>
            <div class="comment-content"><?php $comments->content(); ?></div>
            <div class="comment-reply"><?php $comments->reply(_t('回复')); ?></div>
        </div>
    <?php
}
