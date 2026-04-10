<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$this->need('header.php');
$commentSystem = (string) ($this->options->commentSystem ?? 'native');
$commentConfig = csCommentConfig((string) ($this->options->commentSystemConfig ?? '{}'));
?>
<div class="layout">
    <section class="main-col">
        <article class="single">
            <header>
                <h1><?php $this->title(); ?></h1>
                <p class="post-meta"><?php $this->date('Y-m-d'); ?> · <?php $this->category(','); ?></p>
            </header>
            <section class="single-content"><?php $this->content(); ?></section>
            <footer class="single-footer">
                <?php if ($this->tags): ?><p>标签：<?php $this->tags(', ', true, '无'); ?></p><?php endif; ?>
            </footer>
        </article>
        <nav class="post-nav"><div>上一篇：<?php $this->thePrev('%s', '没有了'); ?></div><div>下一篇：<?php $this->theNext('%s', '没有了'); ?></div></nav>
        <?php if ($commentSystem === 'native'): ?>
            <?php $this->need('comments.php'); ?>
        <?php elseif ($commentSystem === 'disqus' && !empty($commentConfig['disqusShortname'])): ?>
            <section class="comments"><h2>评论</h2><div id="disqus_thread"></div>
                <script>window.disqus_config=function(){this.page.url="<?php $this->permalink(); ?>";this.page.identifier="post-<?php echo (int) $this->cid; ?>";};(function(){var d=document,s=d.createElement("script");s.src="https://<?php echo csEscape((string) $commentConfig['disqusShortname']); ?>.disqus.com/embed.js";s.setAttribute("data-timestamp",String(+new Date()));d.body.appendChild(s);})();</script>
            </section>
        <?php elseif ($commentSystem === 'utterances' && !empty($commentConfig['utterancesRepo'])): ?>
            <section class="comments"><h2>评论</h2>
                <script src="https://utteranc.es/client.js" repo="<?php echo csEscape((string) $commentConfig['utterancesRepo']); ?>" issue-term="<?php echo csEscape((string) ($commentConfig['utterancesIssueTerm'] ?? 'pathname')); ?>" theme="<?php echo csEscape((string) ($commentConfig['utterancesTheme'] ?? 'github-light')); ?>" crossorigin="anonymous" async></script>
            </section>
        <?php endif; ?>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
