<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$socialLinks = csParseSocialLinks((string) ($this->options->socialLinks ?? ''));
?>
<aside id="siteSidebar" class="sidebar" aria-label="侧边栏">
    <div class="sidebar-head">
        <strong>侧栏</strong>
        <button id="sidebarToggle" class="sidebar-toggle" type="button" aria-label="折叠侧边栏">—</button>
    </div>
    <div class="sidebar-body">
        <section class="sidebar-block">
            <h3>搜索</h3>
            <form class="search-form" method="get" action="<?php $this->options->siteUrl(); ?>">
                <input type="text" name="s" value="<?php echo csEscape((string) $this->request->filter('search')->s); ?>" placeholder="输入关键词">
                <button type="submit">搜索</button>
            </form>
        </section>
        <section class="sidebar-block">
            <h3>最新文章</h3>
            <?php $this->widget('Widget_Contents_Post_Recent', 'pageSize=6')->to($recent); ?>
            <ul><?php while ($recent->next()): ?><li><a href="<?php $recent->permalink(); ?>"><?php $recent->title(); ?></a></li><?php endwhile; ?></ul>
        </section>
        <?php if (!empty($socialLinks)): ?>
            <section class="sidebar-block">
                <h3>社交</h3>
                <ul><?php foreach ($socialLinks as $social): ?><li><a href="<?php echo csEscape($social['url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo csEscape($social['name']); ?></a></li><?php endforeach; ?></ul>
            </section>
        <?php endif; ?>
    </div>
</aside>
