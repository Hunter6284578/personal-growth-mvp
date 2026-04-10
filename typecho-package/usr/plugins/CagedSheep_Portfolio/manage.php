<?php

declare(strict_types=1);

if (!defined('__TYPECHO_ROOT_DIR__')) {
    exit;
}

Typecho_Widget::widget('Widget_User')->pass('administrator');
$security = Typecho_Widget::widget('Widget_Security');
$db = Typecho_Db::get();
$prefix = $db->getPrefix();

function cs_pf_clean_text($value, $max = 255)
{
    $v = trim(strip_tags((string) $value));
    if (mb_strlen($v, 'UTF-8') > $max) {
        $v = mb_substr($v, 0, $max, 'UTF-8');
    }
    return $v;
}

function cs_pf_clean_url($value)
{
    $v = trim((string) $value);
    if ($v === '') {
        return '';
    }
    return (preg_match('#^https?://#i', $v) === 1 && filter_var($v, FILTER_VALIDATE_URL)) ? $v : '';
}

$action = trim((string) ($_GET['action'] ?? 'list'));
$id = (int) ($_GET['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $security->protect();
    $title = cs_pf_clean_text($_POST['title'] ?? '', 255);
    $slug = cs_pf_clean_text($_POST['slug'] ?? '', 255);
    $cover = cs_pf_clean_url($_POST['cover'] ?? '');
    $workLink = cs_pf_clean_url($_POST['work_link'] ?? '');
    $createdAt = cs_pf_clean_text($_POST['created_at'] ?? '', 50);
    $category = cs_pf_clean_text($_POST['category'] ?? '', 100);
    $description = htmlspecialchars(trim((string) ($_POST['description'] ?? '')), ENT_QUOTES, 'UTF-8');

    $gallery = [];
    $lines = preg_split('/\r\n|\r|\n/', (string) ($_POST['gallery'] ?? ''));
    if (is_array($lines)) {
        foreach ($lines as $line) {
            $url = cs_pf_clean_url($line);
            if ($url !== '') {
                $gallery[] = $url;
            }
        }
    }

    if ($title === '' || $slug === '') {
        exit('标题与 Slug 不能为空');
    }

    $now = time();
    if ($action === 'create') {
        $db->query($db->insert($prefix . 'cagedsheep_portfolio')->rows([
            'title' => $title,
            'slug' => $slug,
            'cover' => $cover,
            'gallery' => json_encode($gallery, JSON_UNESCAPED_UNICODE),
            'work_link' => $workLink,
            'created_at' => $createdAt,
            'description' => $description,
            'category' => $category,
            'status' => 1,
            'created' => $now,
            'modified' => $now,
        ]));
    } elseif ($action === 'edit' && $id > 0) {
        $db->query($db->update($prefix . 'cagedsheep_portfolio')->rows([
            'title' => $title,
            'slug' => $slug,
            'cover' => $cover,
            'gallery' => json_encode($gallery, JSON_UNESCAPED_UNICODE),
            'work_link' => $workLink,
            'created_at' => $createdAt,
            'description' => $description,
            'category' => $category,
            'modified' => $now,
        ])->where('id = ?', $id));
    }

    header('Location: ' . Typecho_Common::url('admin/extending.php?panel=CagedSheep_Portfolio/manage.php', Typecho_Widget::widget('Widget_Options')->siteUrl));
    exit;
}

if ($action === 'delete' && $id > 0) {
    $security->protect();
    $db->query($db->delete($prefix . 'cagedsheep_portfolio')->where('id = ?', $id));
    header('Location: ' . Typecho_Common::url('admin/extending.php?panel=CagedSheep_Portfolio/manage.php', Typecho_Widget::widget('Widget_Options')->siteUrl));
    exit;
}

$editing = null;
if ($action === 'edit' && $id > 0) {
    $editing = $db->fetchRow($db->select()->from($prefix . 'cagedsheep_portfolio')->where('id = ?', $id)->limit(1));
}

$rows = $db->fetchAll($db->select()->from($prefix . 'cagedsheep_portfolio')->order('created', Typecho_Db::SORT_DESC)->limit(500));
?>
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>作品集管理</title>
    <style>
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;margin:20px}
        .box{border:1px solid #e6e6e6;border-radius:10px;padding:16px;margin-bottom:16px}
        input,textarea,button{width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-top:6px}
        button{background:#2f2f2f;color:#fff;cursor:pointer}
        table{width:100%;border-collapse:collapse}
        th,td{border-bottom:1px solid #eee;padding:8px;text-align:left}
    </style>
</head>
<body>
<div class="box">
    <h2><?php echo $editing ? '编辑作品' : '新增作品'; ?></h2>
    <form method="post" action="?panel=CagedSheep_Portfolio/manage.php&action=<?php echo $editing ? 'edit&id=' . (int) $editing['id'] : 'create'; ?>">
        <label>标题</label><input name="title" required maxlength="255" value="<?php echo htmlspecialchars((string) ($editing['title'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>Slug</label><input name="slug" required maxlength="255" value="<?php echo htmlspecialchars((string) ($editing['slug'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>封面 URL</label><input name="cover" maxlength="500" value="<?php echo htmlspecialchars((string) ($editing['cover'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>多图组（每行一个 URL）</label><textarea name="gallery" rows="5"><?php
            $g = [];
            if (!empty($editing['gallery'])) {
                $tmp = json_decode((string) $editing['gallery'], true);
                if (is_array($tmp)) {
                    $g = $tmp;
                }
            }
            echo htmlspecialchars(implode("\n", $g), ENT_QUOTES, 'UTF-8');
        ?></textarea>
        <label>作品链接</label><input name="work_link" maxlength="500" value="<?php echo htmlspecialchars((string) ($editing['work_link'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>创作时间</label><input name="created_at" maxlength="50" value="<?php echo htmlspecialchars((string) ($editing['created_at'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>分类</label><input name="category" maxlength="100" value="<?php echo htmlspecialchars((string) ($editing['category'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>">
        <label>描述</label><textarea name="description" rows="5"><?php echo htmlspecialchars((string) ($editing['description'] ?? ''), ENT_QUOTES, 'UTF-8'); ?></textarea>
        <button type="submit"><?php echo $editing ? '保存修改' : '新增作品'; ?></button>
    </form>
</div>

<div class="box">
    <h2>作品列表</h2>
    <table>
        <thead><tr><th>ID</th><th>标题</th><th>Slug</th><th>创作时间</th><th>操作</th></tr></thead>
        <tbody>
        <?php foreach ($rows as $r): ?>
            <tr>
                <td><?php echo (int) $r['id']; ?></td>
                <td><?php echo htmlspecialchars((string) $r['title'], ENT_QUOTES, 'UTF-8'); ?></td>
                <td><?php echo htmlspecialchars((string) $r['slug'], ENT_QUOTES, 'UTF-8'); ?></td>
                <td><?php echo htmlspecialchars((string) $r['created_at'], ENT_QUOTES, 'UTF-8'); ?></td>
                <td>
                    <a href="?panel=CagedSheep_Portfolio/manage.php&action=edit&id=<?php echo (int) $r['id']; ?>">编辑</a> |
                    <a href="?panel=CagedSheep_Portfolio/manage.php&action=delete&id=<?php echo (int) $r['id']; ?>&<?php echo Typecho_Widget::widget('Widget_Security')->getTokenUrl(''); ?>" onclick="return confirm('确认删除？');">删除</a>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
</body>
</html>
