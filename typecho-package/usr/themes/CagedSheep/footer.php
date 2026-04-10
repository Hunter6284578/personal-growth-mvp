<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

$icpNo = csEscape((string) ($this->options->icpNo ?? ''));
$publicSecurityNo = csEscape((string) ($this->options->publicSecurityNo ?? ''));
$analyticsScriptUrl = csSafeUrl((string) ($this->options->analyticsScriptUrl ?? ''), (string) $this->options->siteUrl);
?>
</main>
<footer class="site-footer">
    <div class="container footer-row">
        <span>© <?php echo date('Y'); ?> <?php $this->options->title(); ?></span>
        <?php if ($icpNo !== ''): ?><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer nofollow"><?php echo $icpNo; ?></a><?php endif; ?>
        <?php if ($publicSecurityNo !== ''): ?><span><?php echo $publicSecurityNo; ?></span><?php endif; ?>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js" defer></script>
<script src="<?php $this->options->themeUrl('assets/js/main.js'); ?>" defer></script>
<?php if ($analyticsScriptUrl !== ''): ?><script src="<?php echo csEscape($analyticsScriptUrl); ?>" defer></script><?php endif; ?>
<?php $this->footer(); ?>
</body>
</html>
