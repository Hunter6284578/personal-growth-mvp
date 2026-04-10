<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$this->need('header.php');
?>
<div class="layout">
    <section class="main-col">
        <article class="single">
            <header><h1><?php $this->title(); ?></h1></header>
            <section class="single-content"><?php $this->content(); ?></section>
        </article>
        <?php if ($this->allow('comment')): ?><?php $this->need('comments.php'); ?><?php endif; ?>
    </section>
    <?php $this->need('sidebar.php'); ?>
</div>
<?php $this->need('footer.php'); ?>
