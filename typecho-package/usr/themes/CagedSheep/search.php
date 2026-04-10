<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$this->need('header.php');
?>
<div class="layout">
    <section class="main-col">
        <section class="hero">
            <h1>搜索结果</h1>
            <p>关键词：<?php echo csEscape((string) $this->request->filter('search')->s); ?></p>
        </section>
        <?php if ($this->have()): ?>
            <section class="post-list mode-card">
                <?php while ($this->next()): ?>
                    <article class="post-card">
                        <h2 class="post-title"><a href="<?php $this->permalink(); ?>"><?php $this->title(); ?></a></h2>
                        <p class="post-meta"><?php $this->date('Y-m-d'); ?></p>
                        <p class="post-excerpt"><?php $this->excerpt(120, '...'); ?></p>
                    </article>
                <?php endwhile; ?>
            </section>
            <nav class="pagination"><?php $this->pageNav('上一页', '下一页', 2, '...'); ?></nav>
        <?php else: ?>
            <article class="empty-card">未找到匹配内容。</article>
        <?php endif; ?>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
