<?php
// Landmarks API - Full CRUD
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $id = getParam('id');
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM landmarks WHERE id = ?");
        $stmt->execute([$id]);
        $landmark = $stmt->fetch();
        if (!$landmark) jsonResponse(['error' => 'Landmark not found'], 404);
        jsonResponse($landmark);
    }

    $activeOnly = getParam('active_only', '0');
    $sql = "SELECT * FROM landmarks";
    if ($activeOnly === '1') $sql .= " WHERE is_active = 1";
    $sql .= " ORDER BY sort_order ASC, id ASC";

    $stmt = $db->query($sql);
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();

    $stmt = $db->prepare("INSERT INTO landmarks (title, image_url, phone_number, has_call_button, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $body['title'] ?? '',
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['phoneNumber'] ?? $body['phone_number'] ?? '',
        $body['hasCallButton'] ?? $body['has_call_button'] ?? 0,
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
    ]);

    $newId = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM landmarks WHERE id = ?");
    $stmt->execute([$newId]);
    jsonResponse($stmt->fetch(), 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $body = getJsonBody();

    $stmt = $db->prepare("UPDATE landmarks SET title = ?, image_url = ?, phone_number = ?, has_call_button = ?, is_active = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $body['title'] ?? '',
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['phoneNumber'] ?? $body['phone_number'] ?? '',
        $body['hasCallButton'] ?? $body['has_call_button'] ?? 0,
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
        $id,
    ]);

    $stmt = $db->prepare("SELECT * FROM landmarks WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse($stmt->fetch());
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM landmarks WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
