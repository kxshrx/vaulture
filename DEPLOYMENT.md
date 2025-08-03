# 🚀 Vaulture Deployment Guide

## Pre-Deployment Setup

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon public key
   - Service role key
3. Go to **Storage** and create two buckets:
   - `product-files` (for main product files)
   - `product-images` (for product images)
4. Set both buckets to **Private** (important for security)
5. Copy your **Database URL** from **Settings** → **Database**

### 2. Environment Variables

Update your `.env` file with production values:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT (generate a strong secret)
JWT_SECRET=your-super-long-random-secret-key-here

# Stripe (use live keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Production URLs
STRIPE_SUCCESS_URL=https://yourdomain.com/checkout/success
STRIPE_CANCEL_URL=https://yourdomain.com/checkout/cancel
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Database Migration

```bash
# Install dependencies
pip install -r requirements.txt

# Create database tables
python -c "from backend.db.base import engine, Base; Base.metadata.create_all(bind=engine)"
```

## Deployment Options

### Option 1: Railway (Recommended)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway new`
4. Deploy backend:
   ```bash
   cd /path/to/vaulture
   railway up
   ```
5. Add environment variables in Railway dashboard
6. Deploy frontend to Vercel (see Option 2)

### Option 2: Vercel (Frontend) + Railway (Backend)

**Backend (Railway):**

1. Connect GitHub repo to Railway
2. Set environment variables
3. Deploy automatically on push

**Frontend (Vercel):**

1. Connect GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

### Option 3: DigitalOcean App Platform

1. Connect GitHub repo
2. Configure build settings:
   - **Backend**: Python, run command: `gunicorn backend.main:app`
   - **Frontend**: Node.js, build command: `npm run build`
3. Set environment variables
4. Deploy

### Option 4: Docker Deployment

```bash
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment Checklist

### ✅ Backend Verification

- [ ] Database connection works
- [ ] Supabase storage accessible
- [ ] File uploads working
- [ ] Stripe webhooks configured
- [ ] CORS configured correctly
- [ ] API endpoints responding

### ✅ Frontend Verification

- [ ] API connection working
- [ ] Authentication flow works
- [ ] File uploads functional
- [ ] Payment flow complete
- [ ] Downloads working securely

### ✅ Security Checklist

- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] File buckets set to private
- [ ] CORS origins limited to your domain
- [ ] HTTPS enabled
- [ ] Strong JWT secret configured

## Environment Variables Reference

| Variable            | Development | Production    | Required |
| ------------------- | ----------- | ------------- | -------- |
| `DATABASE_URL`      | SQLite      | PostgreSQL    | ✅       |
| `SUPABASE_URL`      | Optional    | Required      | ✅       |
| `SUPABASE_KEY`      | Optional    | Required      | ✅       |
| `JWT_SECRET`        | Any string  | Strong secret | ✅       |
| `STRIPE_SECRET_KEY` | Test key    | Live key      | ✅       |
| `CORS_ORIGINS`      | `*`         | Your domains  | ✅       |

## Troubleshooting

### Common Issues:

1. **Database connection fails**: Check DATABASE_URL format
2. **File uploads fail**: Verify Supabase buckets exist and are accessible
3. **CORS errors**: Update CORS_ORIGINS with your domain
4. **Stripe webhooks fail**: Update webhook endpoint URL in Stripe dashboard

### Support:

- Check application logs for specific error messages
- Verify all environment variables are set
- Test each service (database, storage, payments) individually
