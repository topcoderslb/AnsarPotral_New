<?php
// Statement Categories API
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM statement_categories ORDER BY sort_order ASC");
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();
    $stmt = $db->prepare("INSERT INTO statement_categories (name, sort_order) VALUES (?, ?)");
    $stmt->execute([$body['name'] ?? '', $body['order'] ?? 0]);
    jsonResponse(['id' => $db->lastInsertId(), 'name' => $body['name']], 201);
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM statement_categories WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
