# Creators Platform - Digital Content Platform with Secure File Delivery

A FastAPI-based platform that allows creators to upload digital content and buyers to purchase and securely download files.

## Features

- **Role-based Authentication**: Separate registration for creators and buyers
- **Secure File Storage**: Files stored in Supabase private buckets
- **Payment Processing**: Stripe integration for payments (test mode)
- **Secure Downloads**: Time-limited signed URLs for purchased content
- **Creator Analytics**: Revenue and sales tracking

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: JWT with python-jose and passlib
- **File Storage**: Supabase Storage (Private Bucket)
- **Payments**: Stripe (Test Mode)

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.template` to `.env` and fill in your credentials:

```bash
cp .env.template .env
```

Update the following variables in `.env`:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -hex 32`
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase service role key
- `STRIPE_SECRET_KEY`: Your Stripe test secret key

### 3. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Storage and create a bucket named `products`
3. Set the bucket type to **Private**
4. Get your project URL and service role key

### 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test)
2. Ensure you're in Test Mode
3. Get your test secret key from the API keys section

### 5. Run the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /auth/register/creator` - Register as creator
- `POST /auth/register/buyer` - Register as buyer
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Creator (requires creator role)

- `POST /creator/upload` - Upload product with file and optional thumbnail
- `GET /creator/products` - List your products
- `GET /creator/stats` - View sales analytics

### Buyer

- `GET /products` - Browse all products with search, filtering, sorting, and pagination
- `GET /products/categories` - Get available categories with counts
- `GET /products/category/{category}` - Get products by category
- `POST /purchase/{product_id}` - Purchase a product
- `GET /purchase/mypurchases` - View purchased items

### Download (requires authentication + purchase)

- `GET /download/{product_id}` - Get secure download link

## New Features

### 🔍 Advanced Search & Filtering

- **Text Search**: Search in titles, descriptions, tags, and creator names
- **Category Filtering**: Filter by product categories (Digital Art, Photography, Music, etc.)
- **Price Range**: Filter by minimum and maximum price
- **Tag-based Search**: Search by comma-separated tags
- **Creator Filtering**: Find products by specific creators

### 📄 Pagination & Sorting

- **Pagination**: Configurable page size (1-100 items per page)
- **Sorting**: Sort by creation date, price, title, or category
- **Sort Direction**: Ascending or descending order
- **Navigation**: Previous/next page indicators

### 🏷️ Product Categories

- **Predefined Categories**: Digital Art, Photography, Music, Video, eBooks, Software, Templates, Courses, Fonts, Graphics, Other
- **Category Stats**: View product count per category
- **Category Browsing**: Browse products by category

### 🖼️ Image Thumbnails

- **Product Images**: Upload optional thumbnail images for products
- **File Validation**: Automatic file type and size validation
- **Multiple Formats**: Support for various image formats

### ✅ Enhanced Validation

- **Input Validation**: Comprehensive Pydantic validation for all inputs
- **File Type Restrictions**: Configurable allowed file types via environment variables
- **File Size Limits**: Configurable maximum file size limits
- **Password Validation**: Strong password requirements with character and number requirements
- **Price Validation**: Logical price limits and formatting

## Database Schema

### Users Table

- `id` (Primary Key)
- `email` (Unique)
- `hashed_password`
- `is_creator` (Boolean)
- `created_at`

### Products Table

- `id` (Primary Key)
- `creator_id` (Foreign Key to Users)
- `title`
- `description`
- `price`
- `file_url` (Supabase path)
- `created_at`

### Purchases Table

- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `product_id` (Foreign Key to Products)
- `created_at`

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Private file storage with signed URLs
- Purchase verification for downloads
- Time-limited download links (60 seconds)

## Development

The application uses SQLite by default for development. For production, configure a PostgreSQL database URL.

### Running Tests

```bash
# Add test commands here when tests are implemented
```

## Deployment

The application is ready for deployment on platforms like:

- Render.com
- Heroku
- Railway
- Any platform supporting Python/FastAPI

Make sure to:

1. Set all environment variables securely
2. Use a production PostgreSQL database
3. Configure CORS appropriately
4. Set up proper Stripe webhooks for production payments

## API Documentation

Once running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
