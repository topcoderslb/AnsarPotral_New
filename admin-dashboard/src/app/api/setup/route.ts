import pool from '@/lib/db';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import bcrypt from 'bcryptjs';

export async function OPTIONS() { return corsOptions(); }

export async function GET() {
  try {
    // Create tables
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      whatsapp_number VARCHAR(50),
      image_url TEXT,
      location VARCHAR(255),
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS store_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS statements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      category VARCHAR(255) NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS statement_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      statement_id INT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS statement_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS landmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url TEXT,
      phone_number VARCHAR(50),
      has_call_button TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS carousel_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url TEXT NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS about_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      icon VARCHAR(50) NOT NULL DEFAULT '📋',
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS about_section_content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_id INT NOT NULL,
      content TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      FOREIGN KEY (section_id) REFERENCES about_sections(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      complaint_text TEXT NOT NULL,
      image_url TEXT,
      status ENUM('new', 'reviewed', 'resolved') NOT NULL DEFAULT 'new',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    // Insert default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      "INSERT IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, 'admin')",
      ['admin@ansarportal.com', adminPassword, 'مدير النظام']
    );

    // Insert default settings
    const defaultSettings = [
      ['welcome_text_ar', 'المنصّة الرقميّة لبلدية أنصار'],
      ['welcome_text_en', 'ANSAR PORTAL'],
      ['contact_email', 'topcoders.lb@gmail.com'],
      ['play_store_url', 'https://play.google.com/store/apps/details?id=com.topcoders.ansarportal'],
    ];

    for (const [key, value] of defaultSettings) {
      await pool.query('INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }

    return json({
      success: true,
      message: 'Database setup completed successfully!',
      details: {
        database: 'ansar_portal',
        tables_created: [
          'users', 'stores', 'store_categories',
          'statements', 'statement_images', 'statement_categories',
          'landmarks', 'carousel_images', 'news',
          'about_sections', 'about_section_content',
          'complaints', 'app_settings',
        ],
        default_admin: {
          email: 'admin@ansarportal.com',
          password: 'admin123',
        },
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return json({ success: false, error: 'Setup failed: ' + message }, 500);
  }
}
