<?php
// Stores API - Full CRUD
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

// GET - list all stores (public) or single store
if ($method === 'GET') {
    $id = getParam('id');

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM stores WHERE id = ?");
        $stmt->execute([$id]);
        $store = $stmt->fetch();
        if (!$store) jsonResponse(['error' => 'Store not found'], 404);
        jsonResponse($store);
    }

    // List stores
    $activeOnly = getParam('active_only', '0');
    $sql = "SELECT * FROM stores";
    if ($activeOnly === '1') {
        $sql .= " WHERE is_active = 1";
    }
    $sql .= " ORDER BY sort_order ASC, id ASC";

    $stmt = $db->query($sql);
    jsonResponse($stmt->fetchAll());
}

// POST - create store (admin only)
if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();

    $stmt = $db->prepare("INSERT INTO stores (name, description, category, phone_number, whatsapp_number, image_url, location, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $body['name'] ?? '',
        $body['description'] ?? '',
        $body['category'] ?? '',
        $body['phoneNumber'] ?? $body['phone_number'] ?? '',
        $body['whatsappNumber'] ?? $body['whatsapp_number'] ?? '',
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['location'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
    ]);

    $newId = $db->lastInsertId();
    $stmt = $db->prepare("SELECT * FROM stores WHERE id = ?");
    $stmt->execute([$newId]);
    jsonResponse($stmt->fetch(), 201);
}

// PUT - update store (admin only)
if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID is required'], 400);

    $body = getJsonBody();

    $stmt = $db->prepare("UPDATE stores SET name = ?, description = ?, category = ?, phone_number = ?, whatsapp_number = ?, image_url = ?, location = ?, is_active = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $body['name'] ?? '',
        $body['description'] ?? '',
        $body['category'] ?? '',
        $body['phoneNumber'] ?? $body['phone_number'] ?? '',
        $body['whatsappNumber'] ?? $body['whatsapp_number'] ?? '',
        $body['imageUrl'] ?? $body['image_url'] ?? '',
        $body['location'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
        $id,
    ]);

    $stmt = $db->prepare("SELECT * FROM stores WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse($stmt->fetch());
}

// DELETE - delete store (admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID is required'], 400);

    $stmt = $db->prepare("DELETE FROM stores WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'Store deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
