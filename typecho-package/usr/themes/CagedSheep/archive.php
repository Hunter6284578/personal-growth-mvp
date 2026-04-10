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
            <h1><?php $this->archiveTitle(['category' => _t('分类：%s'), 'search' => _t('搜索：%s'), 'tag' => _t('标签：%s'), 'author' => _t('作者：%s')], '', ''); ?></h1>
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
            <article class="empty-card">暂无归档内容。</article>
        <?php endif; ?>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
