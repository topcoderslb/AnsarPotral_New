<?php
// File Upload API - Local file storage (replaces imgbb)
require_once __DIR__ . '/../config.php';

$method = getMethod();
if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);

// Ensure upload directory exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Check if file was uploaded
if (empty($_FILES['image'])) {
    jsonResponse(['error' => 'No image file provided'], 400);
}

$file = $_FILES['image'];

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'Upload error: ' . $file['error']], 400);
}

// Validate size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['error' => 'File too large. Maximum 5MB allowed.'], 400);
}

// Validate type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    jsonResponse(['error' => 'Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.'], 400);
}

// Generate unique filename
$extension = match ($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    default => 'jpg',
};

$filename = uniqid('img_', true) . '.' . $extension;
$destination = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonResponse(['error' => 'Failed to save file'], 500);
}

$imageUrl = UPLOAD_URL . $filename;

jsonResponse([
    'success' => true,
    'url' => $imageUrl,
    'filename' => $filename,
]);
