<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}
?>
<section class="comments" id="comments">
    <h2>评论</h2>
    <?php $this->comments()->to($comments); ?>
    <?php if ($comments->have()): ?>
        <?php $comments->listComments([
            'before' => '<ol class="comment-list">',
            'after' => '</ol>',
            'maxNestingLevels' => 3,
            'callback' => 'csCommentCallback',
        ]); ?>
        <nav class="pagination"><?php $comments->pageNav('上一页', '下一页'); ?></nav>
    <?php else: ?>
        <p>还没有评论。</p>
    <?php endif; ?>

    <?php if ($this->allow('comment')): ?>
        <div id="<?php $this->respondId(); ?>">
            <form class="comment-form" method="post" action="<?php $this->commentUrl(); ?>">
                <?php if (!$this->user->hasLogin()): ?>
                    <label for="author">昵称 *</label>
                    <input id="author" name="author" type="text" maxlength="80" value="<?php echo csEscape((string) $this->remember('author')); ?>" required>
                    <label for="mail">邮箱 *</label>
                    <input id="mail" name="mail" type="email" maxlength="120" value="<?php echo csEscape((string) $this->remember('mail')); ?>" required>
                    <label for="url">网址</label>
                    <input id="url" name="url" type="url" maxlength="255" value="<?php echo csEscape((string) $this->remember('url')); ?>">
                <?php endif; ?>
                <label for="textarea">评论内容 *</label>
                <textarea id="textarea" name="text" maxlength="3000" required><?php echo csEscape((string) $this->remember('text')); ?></textarea>
                <button type="submit">提交评论</button>
            </form>
        </div>
    <?php else: ?>
        <p>评论已关闭。</p>
    <?php endif; ?>
</section>
