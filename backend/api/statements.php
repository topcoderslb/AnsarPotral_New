<?php
// Statements API - Full CRUD with images
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

// Helper to get statement with images
function getStatementWithImages(PDO $db, int $id): ?array {
    $stmt = $db->prepare("SELECT * FROM statements WHERE id = ?");
    $stmt->execute([$id]);
    $statement = $stmt->fetch();
    if (!$statement) return null;

    $imgStmt = $db->prepare("SELECT image_url FROM statement_images WHERE statement_id = ? ORDER BY sort_order ASC");
    $imgStmt->execute([$id]);
    $statement['imageUrls'] = array_column($imgStmt->fetchAll(), 'image_url');
    return $statement;
}

function getAllStatements(PDO $db, bool $activeOnly = false): array {
    $sql = "SELECT * FROM statements";
    if ($activeOnly) $sql .= " WHERE is_active = 1";
    $sql .= " ORDER BY sort_order ASC, id ASC";

    $statements = $db->query($sql)->fetchAll();

    // Batch fetch all images
    $ids = array_column($statements, 'id');
    if (empty($ids)) return [];

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $imgStmt = $db->prepare("SELECT statement_id, image_url FROM statement_images WHERE statement_id IN ($placeholders) ORDER BY sort_order ASC");
    $imgStmt->execute($ids);
    $images = $imgStmt->fetchAll();

    $imageMap = [];
    foreach ($images as $img) {
        $imageMap[$img['statement_id']][] = $img['image_url'];
    }

    foreach ($statements as &$s) {
        $s['imageUrls'] = $imageMap[$s['id']] ?? [];
    }

    return $statements;
}

if ($method === 'GET') {
    $id = getParam('id');
    if ($id) {
        $statement = getStatementWithImages($db, (int)$id);
        if (!$statement) jsonResponse(['error' => 'Statement not found'], 404);
        jsonResponse($statement);
    }

    $activeOnly = getParam('active_only', '0') === '1';
    jsonResponse(getAllStatements($db, $activeOnly));
}

if ($method === 'POST') {
    requireAuth();
    $body = getJsonBody();

    $stmt = $db->prepare("INSERT INTO statements (title, description, category, date, is_active, sort_order) VALUES (?, ?, ?, NOW(), ?, ?)");
    $stmt->execute([
        $body['title'] ?? '',
        $body['description'] ?? '',
        $body['category'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
    ]);

    $newId = $db->lastInsertId();

    // Insert images
    $imageUrls = $body['imageUrls'] ?? $body['image_urls'] ?? [];
    if (!empty($imageUrls)) {
        $imgStmt = $db->prepare("INSERT INTO statement_images (statement_id, image_url, sort_order) VALUES (?, ?, ?)");
        foreach ($imageUrls as $i => $url) {
            $imgStmt->execute([$newId, $url, $i]);
        }
    }

    jsonResponse(getStatementWithImages($db, (int)$newId), 201);
}

if ($method === 'PUT') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);

    $body = getJsonBody();

    $stmt = $db->prepare("UPDATE statements SET title = ?, description = ?, category = ?, is_active = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $body['title'] ?? '',
        $body['description'] ?? '',
        $body['category'] ?? '',
        $body['isActive'] ?? $body['is_active'] ?? 1,
        $body['order'] ?? $body['sort_order'] ?? 0,
        $id,
    ]);

    // Replace images
    $db->prepare("DELETE FROM statement_images WHERE statement_id = ?")->execute([$id]);
    $imageUrls = $body['imageUrls'] ?? $body['image_urls'] ?? [];
    if (!empty($imageUrls)) {
        $imgStmt = $db->prepare("INSERT INTO statement_images (statement_id, image_url, sort_order) VALUES (?, ?, ?)");
        foreach ($imageUrls as $i => $url) {
            $imgStmt->execute([$id, $url, $i]);
        }
    }

    jsonResponse(getStatementWithImages($db, (int)$id));
}

if ($method === 'DELETE') {
    requireAuth();
    $id = getParam('id');
    if (!$id) jsonResponse(['error' => 'ID required'], 400);

    $stmt = $db->prepare("DELETE FROM statements WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'Statement deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
