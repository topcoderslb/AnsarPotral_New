<?php
// App Settings API
require_once __DIR__ . '/../config.php';

$method = getMethod();
$db = getDB();

if ($method === 'GET') {
    $stmt = $db->query("SELECT setting_key, setting_value FROM app_settings");
    $rows = $stmt->fetchAll();

    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    jsonResponse($settings);
}

if ($method === 'PUT' || $method === 'POST') {
    requireAuth();
    $body = getJsonBody();

    $stmt = $db->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

    foreach ($body as $key => $value) {
        if (is_string($key) && strlen($key) <= 100) {
            $stmt->execute([$key, is_string($value) ? $value : json_encode($value)]);
        }
    }

    // Return updated settings
    $stmt = $db->query("SELECT setting_key, setting_value FROM app_settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    jsonResponse(['success' => true, 'settings' => $settings]);
}

jsonResponse(['error' => 'Method not allowed'], 405);
