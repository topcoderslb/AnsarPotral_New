<?php
// Dashboard Stats API
require_once __DIR__ . '/../config.php';

$method = getMethod();
if ($method !== 'GET') jsonResponse(['error' => 'Method not allowed'], 405);

requireAuth();
$db = getDB();

$storesCount = $db->query("SELECT COUNT(*) FROM stores")->fetchColumn();
$statementsCount = $db->query("SELECT COUNT(*) FROM statements")->fetchColumn();
$landmarksCount = $db->query("SELECT COUNT(*) FROM landmarks")->fetchColumn();
$complaintsCount = $db->query("SELECT COUNT(*) FROM complaints")->fetchColumn();
$newComplaints = $db->query("SELECT COUNT(*) FROM complaints WHERE status = 'new'")->fetchColumn();

// Recent complaints
$stmt = $db->query("SELECT * FROM complaints ORDER BY created_at DESC LIMIT 5");
$recentComplaints = $stmt->fetchAll();

jsonResponse([
    'storesCount' => (int)$storesCount,
    'statementsCount' => (int)$statementsCount,
    'landmarksCount' => (int)$landmarksCount,
    'complaintsCount' => (int)$complaintsCount,
    'newComplaints' => (int)$newComplaints,
    'recentComplaints' => $recentComplaints,
]);
