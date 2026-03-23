<?php
// News API
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $activeOnly = getParam('active_only', '0');
    $sql = "SELECT * FROM news";
    if ($activeOnly === '1') $sql .= " WHERE is_active = 1";
    $sql .= " ORDER BY published_at DESC, id DESC";
    $stmt = $db->query($sql);
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();
    $title = $body['title'] ?? '';
    $content = $body['content'] ?? '';
    $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? null;
    $isActive = $body['isActive'] ?? $body['is_active'] ?? 1;
    $publishedAt = $body['publishedAt'] ?? $body['published_at'] ?? date('Y-m-d H:i:s');

    if (!$title || !$content) {
        jsonResponse(['error' => 'Title and content are required'], 400);
    }

    $stmt = $db->prepare(
        "INSERT INTO news (title, content, image_url, is_active, published_at) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$title, $content, $imageUrl, $isActive, $publishedAt]);
    $newId = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM news WHERE id = ?");
    $stmt->execute([$newId]);
    jsonResponse($stmt->fetch(), 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $body = getJsonBody();
    $title = $body['title'] ?? '';
    $content = $body['content'] ?? '';
    $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? null;
    $isActive = $body['isActive'] ?? $body['is_active'] ?? 1;
    $publishedAt = $body['publishedAt'] ?? $body['published_at'] ?? date('Y-m-d H:i:s');

    $stmt = $db->prepare(
        "UPDATE news SET title = ?, content = ?, image_url = ?, is_active = ?, published_at = ? WHERE id = ?"
    );
    $stmt->execute([$title, $content, $imageUrl, $isActive, $publishedAt, $id]);
    $stmt = $db->prepare("SELECT * FROM news WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse($stmt->fetch());
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
