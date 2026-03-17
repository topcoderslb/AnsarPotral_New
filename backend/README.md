# Ansar Portal Backend API

## Setup

1. Copy the `backend/` folder to your XAMPP htdocs:
   ```
   Copy to: C:\xampp\htdocs\ansar_portal_api\
   ```

2. Start XAMPP (Apache + MySQL)

3. Run the setup script to create the database and tables:
   ```
   Visit: http://localhost/ansar_portal_api/setup.php
   ```

4. Default admin credentials:
   - Email: `admin@ansarportal.com`
   - Password: `admin123`

## API Endpoints

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth.php` | POST | No | Login |
| `/api/stores.php` | GET/POST/PUT/DELETE | GET=Public, Others=Admin | Stores CRUD |
| `/api/store-categories.php` | GET/POST/DELETE | GET=Public, Others=Admin | Store categories |
| `/api/statements.php` | GET/POST/PUT/DELETE | GET=Public, Others=Admin | Statements CRUD |
| `/api/statement-categories.php` | GET/POST/DELETE | GET=Public, Others=Admin | Statement categories |
| `/api/landmarks.php` | GET/POST/PUT/DELETE | GET=Public, Others=Admin | Landmarks CRUD |
| `/api/carousel.php` | GET/POST/PUT/DELETE | GET=Public, Others=Admin | Carousel images |
| `/api/about.php` | GET/POST/PUT/DELETE | GET=Public, Others=Admin | About sections CRUD |
| `/api/complaints.php` | GET/POST/PUT/DELETE | POST=Public, Others=Admin | Complaints |
| `/api/settings.php` | GET/PUT | GET=Public, PUT=Admin | App settings |
| `/api/dashboard.php` | GET | Admin | Dashboard stats |
| `/api/upload.php` | POST | No | Image upload |

## Query Parameters

- `?id=X` - Get/update/delete specific item
- `?active_only=1` - Filter active items only (for mobile app)
- `?status=new|reviewed|resolved` - Filter complaints by status
- `?action=login|verify` - Auth actions
