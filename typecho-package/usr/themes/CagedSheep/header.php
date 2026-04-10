<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$siteTitle = (string) $this->options->title;
$siteSubtitle = csEscape((string) ($this->options->siteSubtitle ?? $this->options->description));
$logoUrl = csSafeUrl((string) ($this->options->logoUrl ?? ''), (string) $this->options->siteUrl);
$faviconUrl = csSafeUrl((string) ($this->options->faviconUrl ?? ''), (string) $this->options->siteUrl);
$primaryColor = csSafeColor((string) ($this->options->primaryColor ?? '#2f2f2f'));
$darkEnabled = ((string) ($this->options->darkModeEnabled ?? '1')) === '1';
$navItems = csParseNavItems((string) ($this->options->navItems ?? ''), (string) $this->options->siteUrl);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="<?php $this->options->charset(); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title><?php $this->archiveTitle(['category' => _t('分类 %s'), 'search' => _t('搜索 %s'), 'tag' => _t('标签 %s'), 'author' => _t('作者 %s')], '', ' - '); ?><?php $this->options->title(); ?></title>
    <meta name="description" content="<?php echo csEscape((string) ($this->options->description ?: $siteSubtitle)); ?>">
    <meta name="theme-color" content="#f7f7f5">
    <?php if ($faviconUrl !== ''): ?><link rel="icon" href="<?php echo csEscape($faviconUrl); ?>"><?php endif; ?>
    <link rel="canonical" href="<?php $this->permalink(); ?>">
    <link rel="stylesheet" href="<?php $this->options->themeUrl('style.css'); ?>">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">
    <style>:root{--primary:<?php echo csEscape($primaryColor); ?>;}</style>
    <?php $this->header(); ?>
</head>
<body data-dark-enabled="<?php echo $darkEnabled ? '1' : '0'; ?>">
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="<?php $this->options->siteUrl(); ?>">
            <?php if ($logoUrl !== ''): ?><img src="<?php echo csEscape($logoUrl); ?>" alt="<?php echo csEscape($siteTitle); ?>"><?php endif; ?>
            <span><strong><?php echo csEscape($siteTitle); ?></strong><span class="brand-sub"><?php echo $siteSubtitle; ?></span></span>
        </a>
        <div class="header-actions">
            <?php if ($darkEnabled): ?><button id="themeToggle" class="theme-toggle" type="button" aria-label="切换主题">◐</button><?php endif; ?>
            <button id="menuToggle" class="menu-toggle" type="button" aria-label="切换导航">☰</button>
        </div>
        <nav id="siteNav" class="site-nav" aria-label="主导航">
            <?php foreach ($navItems as $item): ?>
                <a href="<?php echo csEscape($item['url']); ?>" target="<?php echo csEscape($item['target']); ?>"<?php if ($item['target'] === '_blank'): ?> rel="noopener noreferrer"<?php endif; ?>><?php echo csEscape($item['name']); ?></a>
            <?php endforeach; ?>
        </nav>
    </div>
</header>
<main class="site-main container">

