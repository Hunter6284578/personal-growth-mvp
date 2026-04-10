<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$this->need('header.php');
?>
<div class="layout">
    <section class="main-col">
        <article class="empty-card">
            <h1>404</h1>
            <p>你访问的页面不存在。</p>
            <p><a href="<?php $this->options->siteUrl(); ?>">返回首页</a></p>
        </article>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
