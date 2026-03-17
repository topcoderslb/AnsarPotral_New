<?php
// Database Configuration for Ansar Portal API
// Runs on XAMPP MySQL

define('DB_HOST', 'localhost');
define('DB_NAME', 'ansar_portal');
define('DB_USER', 'root');
define('DB_PASS', '');
define('JWT_SECRET', 'ansar_portal_secret_key_2024_change_in_production');
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', 'http://localhost/ansar_portal_api/uploads/');
define('API_URL', 'http://localhost/ansar_portal_api/');

// CORS Headers - allow requests from admin panel and mobile app
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit();
        }
    }
    return $pdo;
}

// JSON response helper
function jsonResponse($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Get JSON body
function getJsonBody(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

// JWT Functions
function generateToken(array $payload): string {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    $payloadEncoded = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET);
    return "$header.$payloadEncoded.$signature";
}

function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;
    $expectedSignature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);

    if (!hash_equals($expectedSignature, $signature)) return null;

    $data = json_decode(base64_decode($payload), true);
    if (!$data || ($data['exp'] ?? 0) < time()) return null;

    return $data;
}

// Auth middleware - returns user data or null
function authenticate(): ?array {
    $authHeader = '';

    // Try multiple sources for the Authorization header (Apache may strip it)
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
        return verifyToken($matches[1]);
    }
    return null;
}

// Require authentication
function requireAuth(): array {
    $user = authenticate();
    if (!$user) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    return $user;
}

// Get request method
function getMethod(): string {
    return $_SERVER['REQUEST_METHOD'];
}

// Get query parameter
function getParam(string $key, $default = null) {
    return $_GET[$key] ?? $default;
}
