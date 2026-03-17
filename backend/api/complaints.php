<?php
// Complaints API - CRUD with status management
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $id = getParam('id');
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM complaints WHERE id = ?");
        $stmt->execute([$id]);
        $complaint = $stmt->fetch();
        if (!$complaint) jsonResponse(['error' => 'Complaint not found'], 404);
        jsonResponse($complaint);
    }

    // List - optionally filter by status
    $status = getParam('status');
    $sql = "SELECT * FROM complaints";
    $params = [];
    if ($status && in_array($status, ['new', 'reviewed', 'resolved'])) {
        $sql .= " WHERE status = ?";
        $params[] = $status;
    }
    $sql .= " ORDER BY created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// POST - submit complaint (public - no auth required for citizens)
if ($method === 'POST') {
    $body = getJsonBody();

    $name = trim($body['name'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $complaintText = trim($body['complaintText'] ?? $body['complaint_text'] ?? '');

    if (empty($name) || empty($phone) || empty($complaintText)) {
        jsonResponse(['error' => 'Name, phone, and complaint text are required'], 400);
    }

    $stmt = $db->prepare("INSERT INTO complaints (name, phone, complaint_text, image_url, status) VALUES (?, ?, ?, ?, 'new')");
    $stmt->execute([
        $name,
        $phone,
        $complaintText,
        $body['imageUrl'] ?? $body['image_url'] ?? null,
    ]);

    jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

// PUT - update complaint status (admin only)
if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);

    $body = getJsonBody();
    $status = $body['status'] ?? null;
    $notes = $body['notes'] ?? null;

    if ($status && !in_array($status, ['new', 'reviewed', 'resolved'])) {
        jsonResponse(['error' => 'Invalid status'], 400);
    }

    $updates = [];
    $params = [];
    if ($status) { $updates[] = "status = ?"; $params[] = $status; }
    if ($notes !== null) { $updates[] = "notes = ?"; $params[] = $notes; }

    if (empty($updates)) jsonResponse(['error' => 'Nothing to update'], 400);

    $params[] = $id;
    $stmt = $db->prepare("UPDATE complaints SET " . implode(', ', $updates) . " WHERE id = ?");
    $stmt->execute($params);

    $stmt = $db->prepare("SELECT * FROM complaints WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse($stmt->fetch());
}

// DELETE - delete complaint (admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM complaints WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
