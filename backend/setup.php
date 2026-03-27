<?php
// Database Setup Script - Creates database, tables, and default admin
// Run this once: http://localhost/ansar_portal_api/setup.php

header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'ansar_portal';

try {
    // Connect without database to create it
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");

    // Users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Stores table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `stores` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `category` VARCHAR(255) NOT NULL,
        `phone_number` VARCHAR(50),
        `whatsapp_number` VARCHAR(50),
        `image_url` TEXT,
        `location` VARCHAR(255),
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Store categories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `store_categories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `sort_order` INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB");

    // Statements table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `statements` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(500) NOT NULL,
        `description` TEXT,
        `category` VARCHAR(255) NOT NULL,
        `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Statement images table (one-to-many)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `statement_images` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `statement_id` INT NOT NULL,
        `image_url` TEXT NOT NULL,
        `sort_order` INT NOT NULL DEFAULT 0,
        FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    // Statement categories
    $pdo->exec("CREATE TABLE IF NOT EXISTS `statement_categories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `sort_order` INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB");

    // Landmarks table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `landmarks` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `image_url` TEXT,
        `phone_number` VARCHAR(50),
        `has_call_button` TINYINT(1) NOT NULL DEFAULT 0,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Carousel images table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `carousel_images` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `image_url` TEXT NOT NULL,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // News table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `news` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(500) NOT NULL,
        `content` TEXT NOT NULL,
        `image_url` TEXT,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // About sections table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `about_sections` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `icon` VARCHAR(50) NOT NULL DEFAULT '📋',
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // About section content items (one-to-many)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `about_section_content` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `section_id` INT NOT NULL,
        `content` TEXT NOT NULL,
        `sort_order` INT NOT NULL DEFAULT 0,
        FOREIGN KEY (`section_id`) REFERENCES `about_sections`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    // Complaints table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `complaints` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `complaint_text` TEXT NOT NULL,
        `image_url` TEXT,
        `device_id` VARCHAR(255) DEFAULT NULL,
        `device_name` VARCHAR(255) DEFAULT NULL,
        `device_model` VARCHAR(255) DEFAULT NULL,
        `os_version` VARCHAR(255) DEFAULT NULL,
        `ip_address` VARCHAR(45) DEFAULT NULL,
        `status` ENUM('new', 'reviewed', 'resolved') NOT NULL DEFAULT 'new',
        `notes` TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Blocked devices table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `blocked_devices` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `device_id` VARCHAR(255) NOT NULL UNIQUE,
        `device_name` VARCHAR(255) DEFAULT NULL,
        `device_model` VARCHAR(255) DEFAULT NULL,
        `os_version` VARCHAR(255) DEFAULT NULL,
        `ip_address` VARCHAR(45) DEFAULT NULL,
        `reason` TEXT,
        `blocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // App settings table (key-value)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `app_settings` (
        `setting_key` VARCHAR(100) PRIMARY KEY,
        `setting_value` TEXT,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Insert default admin user (password: admin123)
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO `users` (`email`, `password`, `name`, `role`) VALUES (?, ?, ?, 'admin')");
    $stmt->execute(['admin@ansarportal.com', $adminPassword, 'مدير النظام']);

    // Insert default settings
    $defaultSettings = [
        ['welcome_text_ar', 'المنصّة الرقميّة لبلدية أنصار'],
        ['welcome_text_en', 'ANSAR PORTAL'],
        ['contact_email', 'topcoders.lb@gmail.com'],
        ['play_store_url', 'https://play.google.com/store/apps/details?id=com.topcoders.ansarportal'],
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO `app_settings` (`setting_key`, `setting_value`) VALUES (?, ?)");
    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database setup completed successfully!',
        'details' => [
            'database' => $dbname,
            'tables_created' => [
                'users', 'stores', 'store_categories',
                'statements', 'statement_images', 'statement_categories',
                'landmarks', 'carousel_images',
                'about_sections', 'about_section_content',
                'complaints', 'app_settings'
            ],
            'default_admin' => [
                'email' => 'admin@ansarportal.com',
                'password' => 'admin123',
            ],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Setup failed: ' . $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
