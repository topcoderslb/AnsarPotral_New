<?php
// Authentication API
require_once __DIR__ . '/../config.php';

$method = getMethod();

if ($method === 'POST') {
    $body = getJsonBody();
    $action = getParam('action', 'login');

    if ($action === 'login') {
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            jsonResponse(['error' => 'Email and password are required'], 400);
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['error' => 'Invalid email or password'], 401);
        }

        $token = generateToken([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name'],
        ]);

        jsonResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
            ],
        ]);
    }

    if ($action === 'verify') {
        $user = authenticate();
        if ($user) {
            jsonResponse(['success' => true, 'user' => $user]);
        } else {
            jsonResponse(['error' => 'Invalid token'], 401);
        }
    }
}

jsonResponse(['error' => 'Method not allowed'], 405);
