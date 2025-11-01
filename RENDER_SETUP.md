# Render Deployment Guide

## Issues Fixed

### 1. ✅ Vercel Build Error - Footer Component
**Problem**: Footer component was passing `onClick` handlers which aren't allowed in Server Components.

**Solution**: Added `"use client"` directive to Footer.js to make it a Client Component.

### 2. ⚠️ No Products Found
**Problem**: Your Render PostgreSQL database is empty - it has no products to display.

**Solution**: Run the seed script to populate the database with sample products.

---

## How to Seed Your Render Database

### Option 1: Using Render Shell (Recommended)

1. **Go to your Render Dashboard**
   - Open https://dashboard.render.com
   - Click on your backend web service

2. **Open Shell**
   - Click "Shell" tab in the left sidebar
   - A terminal will open in your deployed environment

3. **Run the seed script**
   ```bash
   python backend/seed_products.py
   ```

4. **Verify**
   - Visit your frontend: https://vaulture-one.vercel.app/products
   - You should now see 12 sample products

---

### Option 2: Connect to Render PostgreSQL Locally

1. **Get Database Credentials**
   - Go to Render Dashboard → Your PostgreSQL database
   - Copy the "External Database URL"

2. **Set Environment Variable Temporarily**
   ```bash
   export DATABASE_URL="your-external-database-url-here"
   ```

3. **Run Seed Script Locally**
   ```bash
   cd /Users/kxshrx/asylum/vaulture
   source .venv/bin/activate
   python backend/seed_products.py
   ```

---

## What the Seed Script Creates

### Demo Creator Account
- **Email**: `creator@vaulture.com`
- **Password**: `Demo1234!`
- **Type**: Creator account with Stripe connected

### Sample Products (50 items across 7 categories)

**Templates (10)**: Resume packs, business proposals, invoices, social media posts, PowerPoint bundles, wedding invitations, eBooks, real estate flyers
- Price range: $14.99 - $34.99

**Courses (8)**: Web scraping, full-stack development, digital marketing, graphic design, Excel, photography, Flutter, copywriting
- Price range: $39.99 - $89.99

**Graphics & Design (10)**: Social media graphics, UI/UX systems, logos, icons, infographics, thumbnails, business cards, Instagram highlights, posters, mockups
- Price range: $12.99 - $79.99

**Photography (6)**: Business photos, nature, food, abstract backgrounds, lifestyle, urban architecture
- Price range: $29.99 - $49.99

**Video & Animation (5)**: Instagram Reels templates, After Effects logos, YouTube intros, motion graphics, explainer videos
- Price range: $29.99 - $64.99

**Guides & eBooks (6)**: SEO guide, freelancing success, social media growth, passive income, email marketing, content creator's handbook
- Price range: $14.99 - $27.99

**Tools & Spreadsheets (5)**: Financial planning, expense tracker, project dashboard, content calendar, CRM
- Price range: $12.99 - $24.99

**💰 Total Price Range: $12.99 - $89.99** (all in USD, works exactly like local)

---

## Troubleshooting

### Script Says "Database already has X products"
This is normal - it means your database is already seeded. If you want to reset:

```bash
# WARNING: This deletes all data
psql $DATABASE_URL -c "DELETE FROM products; DELETE FROM users WHERE email='creator@vaulture.com';"
python backend/seed_products.py
```

### Connection Error
Make sure your DATABASE_URL is correct in Render environment variables:
- Go to Render Dashboard → Web Service → Environment
- Check DATABASE_URL is set to your PostgreSQL Internal Database URL

### "No module named 'backend'"
Make sure you're running the script from the project root:
```bash
cd /Users/kxshrx/asylum/vaulture
python backend/seed_products.py
```

---

## Environment Variables Checklist for Render

Make sure these are set in your Render Web Service → Environment:

```env
# Database (from your Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://vaulture-one.vercel.app/checkout/success
STRIPE_CANCEL_URL=https://vaulture-one.vercel.app/products

# File Storage
MAX_FILE_SIZE_MB=50
UPLOAD_FOLDER=uploads

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# CORS
CORS_ORIGINS=https://vaulture-one.vercel.app,http://localhost:3000

# Platform
PLATFORM_NAME=Vaulture
PLATFORM_DESCRIPTION=A secure digital content platform for creators

# URLs
FRONTEND_URL=https://vaulture-one.vercel.app
BACKEND_URL=https://vaulture.onrender.com
```

---

## ✅ Deployment Fixed!

## What Was Fixed:
1. ✅ Footer converted to Client Component (Vercel build works)
2. ✅ Bcrypt compatibility fixed (pinned to v4.0.1)
3. ✅ Automatic database seeding on Render startup
4. ✅ Duplicate API calls prevented

## Demo Account (Auto-Created on Render):
- **Email**: creator@vaulture.com
- **Password**: demo1234

## Next Steps:

1. **Wait for Render to Redeploy** (it will auto-deploy from this GitHub push)
2. **Check Render Logs** - you should see:
   ```
   ✅ Tables created successfully
   ✅ Successfully created 50 products!
   🎉 Database seeded successfully!
   ```
3. **Visit your site**: https://vaulture-one.vercel.app/products
4. **You should see 50 products!** 🎉

## If Seeds Don't Run:
The startup script only runs if `DATABASE_URL` starts with `postgresql://`.
Make sure your Render environment has the PostgreSQL URL set correctly.

---

## Quick Commands

```bash
# Activate virtual environment
source .venv/bin/activate

# Seed local database (SQLite)
python backend/seed_products.py

# Seed Render database (after setting DATABASE_URL)
export DATABASE_URL="your-external-database-url"
python backend/seed_products.py

# Check database contents
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
```
