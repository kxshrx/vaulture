# 🔄 Migration from Supabase to Simple Stack

## Summary of Changes

Vaulture has been migrated from Supabase to a simpler, free-tier friendly stack:

### ✅ What Changed

| Before (Supabase) | After (Simple Stack) |
|-------------------|---------------------|
| Supabase PostgreSQL | **SQLite** (local) + **PostgreSQL on Render** (production) |
| Supabase Storage | **Local file storage** (uploads folder) |
| Supabase client library | **No external dependencies** |
| Complex setup | **Zero config** for local dev |

---

## 🎯 Benefits

1. **✅ Zero Setup for Local Development**
   - Just run `uvicorn main:app --reload`
   - SQLite database auto-creates
   - No external services needed

2. **✅ Free Production Deployment**
   - Render PostgreSQL (256MB free)
   - Render Web Service (free tier)
   - No storage costs

3. **✅ Simpler Architecture**
   - Fewer dependencies
   - Easier to understand
   - Less complexity

4. **✅ Easy Migration Path**
   - Can upgrade to paid storage later
   - Can switch to S3/Cloudinary when needed
   - Database structure unchanged

---

## 📝 Files Modified

### Removed:
- `backend/core/supabase.py` - Supabase client (no longer needed)
- `supabase>=2.0.0` from requirements.txt

### Updated:
- `backend/services/storage_service.py` - Simplified to local-only storage
- `backend/core/config.py` - Removed Supabase configuration
- `backend/requirements.txt` - Removed supabase dependency
- `backend/models/product.py` - Updated comments

### Created:
- `backend/.env.example` - Clean configuration template
- `RENDER_DEPLOYMENT.md` - Step-by-step Render deployment guide
- `LOCAL_SETUP.md` - Quick start for local development
- `MIGRATION.md` - This file

---

## 🚀 Quick Start

### Local Development (SQLite):
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set JWT_SECRET
uvicorn main:app --reload
```

### Production Deployment (PostgreSQL on Render):
See `RENDER_DEPLOYMENT.md` for full guide.

**Key steps:**
1. Create PostgreSQL database on Render (free tier)
2. Create Web Service on Render
3. Set environment variables (including DATABASE_URL)
4. Deploy!

---

## ⚠️ Important Notes

### File Storage Limitations

**Free Tier (Render):**
- Files stored on **ephemeral disk**
- Files are **deleted on service restart** (every 15 min of inactivity)
- Perfect for **demos and showcasing**
- NOT suitable for long-term production use

**Solutions for Production:**
1. **Render Paid Plan** ($7/month) - Persistent disk
2. **Cloudinary** (25GB free) - For images/media
3. **AWS S3** (5GB free) - All file types
4. **Backblaze B2** (10GB free) - Cheaper alternative

### Database Limits

**Free Tier (Render PostgreSQL):**
- **256MB storage** 
- Enough for ~50,000-100,000 products
- Perfect for showcasing!

---

## 🔧 Environment Variables

### Required (Minimum):
```bash
DATABASE_URL=sqlite:///./creators_platform.db  # Local
JWT_SECRET=your_random_secret_here
```

### Recommended (Production):
```bash
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=secure_random_string
API_BASE_URL=https://your-app.onrender.com
CORS_ORIGINS=https://your-frontend.vercel.app
UPLOAD_FOLDER=/opt/render/project/src/uploads
```

### Optional (Stripe Payments):
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SUCCESS_URL=https://your-site.com/success
STRIPE_CANCEL_URL=https://your-site.com/cancel
```

---

## 🧪 Testing the Migration

1. **Delete old database:**
   ```bash
   rm backend/creators_platform.db
   ```

2. **Start fresh:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

3. **Check logs:**
   - Should see: "✅ Using local file storage at: ..."
   - Should NOT see: "Using Supabase storage"

4. **Test upload:**
   - Create creator account
   - Upload a product
   - Check `backend/uploads/` folder
   - File should be there!

5. **Test download:**
   - View product as buyer
   - Download link should work
   - File should download successfully

---

## 🔙 Rollback (If Needed)

If you need to go back to Supabase:

1. **Restore supabase.py:**
   ```bash
   git checkout HEAD~1 backend/core/supabase.py
   ```

2. **Restore requirements.txt:**
   ```bash
   git checkout HEAD~1 backend/requirements.txt
   ```

3. **Restore storage_service.py:**
   ```bash
   git checkout HEAD~1 backend/services/storage_service.py
   ```

4. **Reinstall:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 📚 Documentation

- **Local Setup:** See `LOCAL_SETUP.md`
- **Render Deployment:** See `RENDER_DEPLOYMENT.md`
- **Environment Config:** See `backend/.env.example`

---

## 🎉 Result

You now have:
- ✅ Simple local development (just SQLite)
- ✅ Free production deployment (Render)
- ✅ No external dependencies
- ✅ Easy to showcase products
- ✅ Easy upgrade path for production

**Perfect for demos, MVPs, and showcasing your platform!** 🚀
