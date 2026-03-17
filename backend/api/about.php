<?php
// About Sections API - Full CRUD with content items
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

function getSectionWithContent(PDO $db, int $id): ?array {
    $stmt = $db->prepare("SELECT * FROM about_sections WHERE id = ?");
    $stmt->execute([$id]);
    $section = $stmt->fetch();
    if (!$section) return null;

    $contentStmt = $db->prepare("SELECT content FROM about_section_content WHERE section_id = ? ORDER BY sort_order ASC");
    $contentStmt->execute([$id]);
    $section['content'] = array_column($contentStmt->fetchAll(), 'content');
    return $section;
}

function getAllSections(PDO $db, bool $activeOnly = false): array {
    $sql = "SELECT * FROM about_sections";
    if ($activeOnly) $sql .= " WHERE is_active = 1";
    $sql .= " ORDER BY sort_order ASC, id ASC";

    $sections = $db->query($sql)->fetchAll();
    $ids = array_column($sections, 'id');
    if (empty($ids)) return [];

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $contentStmt = $db->prepare("SELECT section_id, content FROM about_section_content WHERE section_id IN ($placeholders) ORDER BY sort_order ASC");
    $contentStmt->execute($ids);

    $contentMap = [];
    foreach ($contentStmt->fetchAll() as $item) {
        $contentMap[$item['section_id']][] = $item['content'];
    }

    foreach ($sections as &$s) {
        $s['content'] = $contentMap[$s['id']] ?? [];
    }

    return $sections;
}

if ($method === 'GET') {
    $id = getParam('id');
    if ($id) {
        $section = getSectionWithContent($db, (int)$id);
        if (!$section) jsonResponse(['error' => 'Section not found'], 404);
        jsonResponse($section);
    }

    $activeOnly = getParam('active_only', '0') === '1';
    jsonResponse(getAllSections($db, $activeOnly));
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();

    $stmt = $db->prepare("INSERT INTO about_sections (title, icon, is_active, sort_order) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $body['title'] ?? '',
        $body['icon'] ?? '📋',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
    ]);

    $newId = $db->lastInsertId();

    $contentItems = $body['content'] ?? [];
    if (!empty($contentItems)) {
        $contentStmt = $db->prepare("INSERT INTO about_section_content (section_id, content, sort_order) VALUES (?, ?, ?)");
        foreach ($contentItems as $i => $item) {
            $contentStmt->execute([$newId, $item, $i]);
        }
    }

    jsonResponse(getSectionWithContent($db, (int)$newId), 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $body = getJsonBody();

    $stmt = $db->prepare("UPDATE about_sections SET title = ?, icon = ?, is_active = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $body['title'] ?? '',
        $body['icon'] ?? '📋',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
        $id,
    ]);

    // Replace content
    $db->prepare("DELETE FROM about_section_content WHERE section_id = ?")->execute([$id]);
    $contentItems = $body['content'] ?? [];
    if (!empty($contentItems)) {
        $contentStmt = $db->prepare("INSERT INTO about_section_content (section_id, content, sort_order) VALUES (?, ?, ?)");
        foreach ($contentItems as $i => $item) {
            $contentStmt->execute([$id, $item, $i]);
        }
    }

    jsonResponse(getSectionWithContent($db, (int)$id));
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM about_sections WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
