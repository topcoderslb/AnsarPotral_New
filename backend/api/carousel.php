<?php
// Carousel Images API
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $activeOnly = getParam('active_only', '0');
    $sql = "SELECT * FROM carousel_images";
    if ($activeOnly === '1') $sql .= " WHERE is_active = 1";
    $sql .= " ORDER BY sort_order ASC, id ASC";
    $stmt = $db->query($sql);
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();
    $stmt = $db->prepare("INSERT INTO carousel_images (image_url, is_active, sort_order) VALUES (?, ?, ?)");
    $stmt->execute([
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
    ]);
    $newId = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM carousel_images WHERE id = ?");
    $stmt->execute([$newId]);
    jsonResponse($stmt->fetch(), 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $body = getJsonBody();
    $stmt = $db->prepare("UPDATE carousel_images SET image_url = ?, is_active = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
        $id,
    ]);
    $stmt = $db->prepare("SELECT * FROM carousel_images WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse($stmt->fetch());
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM carousel_images WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
