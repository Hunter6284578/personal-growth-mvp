<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$this->need('header.php');
$displayMode = (string) ($this->options->homeDisplayMode ?? 'card');
$displayClass = $displayMode === 'compact' ? 'mode-compact' : 'mode-card';
$portfolioEnabled = ((string) ($this->options->portfolioEnabled ?? '1')) === '1';
$homePageSize = (int) ($this->options->homePageSize ?? 10);
if ($homePageSize < 1 || $homePageSize > 30) {
    $homePageSize = 10;
}
?>
<div class="layout">
    <section class="main-col">
        <section class="hero">
            <h1><?php $this->options->title(); ?></h1>
            <p><?php echo csEscape((string) ($this->options->siteSubtitle ?? $this->options->description)); ?></p>
        </section>
        <?php $this->widget('Widget_Contents_Post_Recent', 'pageSize=' . $homePageSize)->to($homePosts); ?>
        <?php if ($homePosts->have()): ?>
            <section class="post-list <?php echo csEscape($displayClass); ?>" aria-label="文章列表">
                <?php while ($homePosts->next()): ?>
                    <article class="post-card">
                        <h2 class="post-title"><a href="<?php $homePosts->permalink(); ?>"><?php $homePosts->title(); ?></a></h2>
                        <p class="post-meta"><?php $homePosts->date('Y-m-d'); ?> · <?php $homePosts->category(','); ?></p>
                        <p class="post-excerpt"><?php $homePosts->excerpt(140, '...'); ?></p>
                    </article>
                <?php endwhile; ?>
            </section>
        <?php else: ?>
            <article class="empty-card">暂无内容。</article>
        <?php endif; ?>

        <?php if ($portfolioEnabled): ?>
            <?php $this->widget('Widget_Contents_Post_Recent', 'pageSize=24')->to($works); ?>
            <section class="hero"><h2>作品集</h2><p>摄影、艺术与创作。</p></section>
            <section class="portfolio-grid" aria-label="作品集">
                <?php $count = 0; ?>
                <?php while ($works->next()): ?>
                    <?php if ((int) (($works->fields->is_work ?? '0')) !== 1) {
                        continue;
                    } ?>
                    <?php $count++; ?>
                    <?php $cover = csSafeUrl((string) ($works->fields->work_cover ?? ''), (string) $this->options->siteUrl); ?>
                    <article class="work-card">
                        <a href="<?php $works->permalink(); ?>">
                            <?php if ($cover !== ''): ?>
                                <img class="work-cover" src="<?php echo csEscape($cover); ?>" alt="<?php $works->title(); ?>" loading="lazy" decoding="async">
                            <?php endif; ?>
                        </a>
                        <div class="work-body">
                            <h3 class="work-title"><a href="<?php $works->permalink(); ?>"><?php $works->title(); ?></a></h3>
                            <p class="work-time"><?php echo csEscape((string) ($works->fields->work_created_at ?? '')); ?></p>
                        </div>
                    </article>
                <?php endwhile; ?>
                <?php if ($count === 0): ?><article class="empty-card">暂无作品数据。</article><?php endif; ?>
            </section>
        <?php endif; ?>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
