# 🚀 Render Deployment Guide for Vaulture

This guide will help you deploy your Vaulture backend to Render using their **FREE tier** with PostgreSQL database.

---

## 📋 Prerequisites

1. A [Render account](https://render.com) (free)
2. Your GitHub repository connected to Render
3. Stripe API keys (from [Stripe Dashboard](https://dashboard.stripe.com/apikeys))
4. A secure JWT secret (generate with: `openssl rand -hex 32`)

---

## 🗄️ Step 1: Create PostgreSQL Database on Render

1. **Log in to Render** and go to your [Dashboard](https://dashboard.render.com/)

2. **Click "New +"** → Select **"PostgreSQL"**

3. **Configure your database:**
   - **Name:** `vaulture-db` (or any name you prefer)
   - **Database:** `vaulture_db`
   - **User:** `vaulture_user`
   - **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Plan:** Select **"Free"** (256MB database, enough for showcasing)

4. **Click "Create Database"**

5. **Copy the connection details:**
   - After creation, you'll see database info
   - **IMPORTANT:** Copy the **"Internal Database URL"** (starts with `postgresql://`)
   - It looks like: `postgresql://vaulture_user:password@dpg-xxxxx-postgres.render.com/vaulture_db`
   - Keep this safe - you'll need it in the next step!

---

## 🌐 Step 2: Deploy Backend Web Service

1. **Go back to Dashboard** → Click **"New +"** → Select **"Web Service"**

2. **Connect your repository:**
   - If not already connected, authorize Render to access your GitHub
   - Select your `vaulture` repository

3. **Configure the web service:**
   ```
   Name: vaulture-backend
   Region: Same as your database (e.g., Oregon)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

4. **Add Environment Variables:**
   
   Click **"Advanced"** → **"Add Environment Variable"** and add each of these:

   ```bash
   # Database (use Internal Database URL from Step 1)
   DATABASE_URL=postgresql://vaulture_user:password@dpg-xxxxx-postgres.render.com/vaulture_db
   
   # JWT Security (generate: openssl rand -hex 32)
   JWT_SECRET=your_secure_random_string_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Stripe Payment
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_SUCCESS_URL=https://your-frontend.vercel.app/checkout/success
   STRIPE_CANCEL_URL=https://your-frontend.vercel.app/checkout/cancel
   
   # API Configuration
   API_BASE_URL=https://vaulture-backend.onrender.com
   DEBUG=false
   
   # CORS (add your frontend URL)
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   
   # File Upload
   MAX_FILE_SIZE_MB=500
   UPLOAD_FOLDER=/opt/render/project/src/uploads
   
   # Pagination
   DEFAULT_PAGE_SIZE=10
   MAX_PAGE_SIZE=100
   
   # Platform Info
   PLATFORM_NAME=Vaulture
   PLATFORM_DESCRIPTION=A secure digital content platform for creators
   ```

5. **Create Web Service** → Render will automatically build and deploy!

---

## ✅ Step 3: Verify Deployment

1. **Wait for build to complete** (usually 2-5 minutes)

2. **Check the logs:**
   - Click on your service → **"Logs"** tab
   - Look for: `✅ Using local file storage at: /opt/render/project/src/uploads`
   - And: `INFO: Application startup complete`

3. **Test the API:**
   - Your API will be available at: `https://vaulture-backend.onrender.com`
   - Test endpoint: `https://vaulture-backend.onrender.com/docs` (FastAPI docs)

4. **Verify database connection:**
   - In logs, you should NOT see database connection errors
   - Tables should be auto-created on first startup

---

## 📦 Step 4: Important Notes About File Storage

### ⚠️ File Storage Limitations on Free Tier

**IMPORTANT:** Render's free tier uses **ephemeral storage**, meaning:
- Files uploaded by creators are stored on disk
- **Files are DELETED when the service restarts** (every 15 min of inactivity, or on redeploy)
- This is suitable for **demos and showcasing**, but not production

### 🎯 Solutions for Production:

If you need persistent file storage later, you have these options:

1. **Upgrade to Render Paid Plan ($7/month)** - Gets persistent disk storage
2. **Use Cloudinary (Free tier: 25GB)** - For images/media files
3. **Use AWS S3 (Free tier: 5GB)** - For all file types
4. **Use Backblaze B2 (Free: 10GB)** - Cheaper S3 alternative

For now, the free tier is perfect for **showcasing products and testing**!

---

## 🔄 Step 5: Connect Frontend to Backend

Update your frontend's API configuration:

**In `frontend/src/lib/api.js`:**

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vaulture-backend.onrender.com';
```

**Create `frontend/.env.local`:**

```bash
NEXT_PUBLIC_API_URL=https://vaulture-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

---

## 🐛 Troubleshooting

### Database Connection Errors

**Error:** "FATAL: Tenant or user not found"
- **Solution:** Make sure you copied the **Internal Database URL**, not external
- **Check:** URL should be `postgresql://` not `postgres://` (PostgreSQL vs Postgres driver)

### Service Keeps Sleeping

**Problem:** Free tier services sleep after 15 minutes of inactivity
- **Solution:** Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com/) to ping every 10 minutes
- **Note:** First request after sleep takes ~30 seconds to wake up

### File Upload Errors

**Error:** "Permission denied" or "Cannot create directory"
- **Solution:** Make sure `UPLOAD_FOLDER=/opt/render/project/src/uploads` in environment variables
- **Check:** Logs should show "Using local file storage at: /opt/render/project/src/uploads"

### Build Failures

**Error:** "No module named 'backend'"
- **Solution:** Make sure **Root Directory** is set to `backend` in Render settings
- **Check:** Build command should be run from the `backend` folder

---

## 💡 Tips for Free Tier

1. **Database Limit:** 256MB database = ~50,000-100,000 products (plenty for showcasing!)
2. **Service Limit:** Free web services sleep after 15 min inactivity
3. **Build Minutes:** 500 free build minutes/month
4. **Bandwidth:** 100GB/month free egress

---

## 🎉 You're Done!

Your Vaulture backend is now deployed on Render with PostgreSQL!

**Next Steps:**
1. Test your API at: `https://vaulture-backend.onrender.com/docs`
2. Create a test product through the frontend
3. Set up Stripe webhook endpoint (if using payments)
4. Deploy frontend to Vercel/Netlify

---

## 🔗 Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [Render Web Services Docs](https://render.com/docs/web-services)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Need help?** Check the Render logs first - they usually show the exact error!
