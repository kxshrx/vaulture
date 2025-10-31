# 🏠 Local Development Setup for Vaulture

Quick guide to get Vaulture running locally without any external services.

---

## 📋 Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed  
- Git installed

---

## 🚀 Quick Start

### 1. Clone & Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and set at minimum:
# JWT_SECRET=your_random_secret_here
# (Generate with: openssl rand -hex 32)

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- Database: SQLite file `creators_platform.db` (auto-created)
- Uploads: `uploads/` folder (auto-created)

---

### 2. Setup Frontend

```bash
# Open new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

---

## 🗄️ Database

### SQLite (Default)

- **Location:** `backend/creators_platform.db`
- **Auto-created** on first run
- **No setup required!**
- **View data:** Use [DB Browser for SQLite](https://sqlitebrowser.org/) or [SQLite Viewer VSCode extension](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)

### Tables Created Automatically:

- `users` - User accounts (buyers & creators)
- `products` - Digital products created by creators
- `purchases` - Purchase history and transactions

---

## 📁 File Storage

- **Location:** `backend/uploads/`
- **Auto-created** on first run
- All uploaded files (products, images) are stored here locally
- Files are served through authenticated endpoints

---

## 🧪 Testing the Platform

### Create a Creator Account:

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Register with email/password
4. Check "I'm a Creator" checkbox
5. Complete signup

### Upload a Product:

1. After login, go to "Creator Dashboard"
2. Click "Upload Product"
3. Fill in product details
4. Upload files (any type up to 500MB)
5. Set a price
6. Publish!

### Test as Buyer:

1. Open incognito/private window
2. Go to http://localhost:3000
3. Browse products (no login required)
4. Sign up as regular user (no creator checkbox)
5. View product details

---

## 🔧 Configuration Options

Edit `backend/.env` to customize:

```bash
# Database
DATABASE_URL=sqlite:///./creators_platform.db

# File Upload Limits
MAX_FILE_SIZE_MB=500          # Max file size
UPLOAD_FOLDER=uploads          # Storage folder

# JWT Settings
JWT_SECRET=your_secret         # Change this!
ACCESS_TOKEN_EXPIRE_MINUTES=30 # Token expiry

# Pagination
DEFAULT_PAGE_SIZE=10           # Products per page
MAX_PAGE_SIZE=100             # Max products per page

# API
API_HOST=localhost
API_PORT=8000
DEBUG=true                     # Enable debug mode
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** "No module named 'fastapi'"
- **Solution:** Make sure virtual environment is activated and run `pip install -r requirements.txt`

### Database errors

**Error:** "table users already exists"
- **Solution:** Delete `creators_platform.db` and restart server (fresh database)

### File upload fails

**Error:** "Permission denied"
- **Solution:** Make sure `uploads/` folder has write permissions:
  ```bash
  chmod 755 uploads
  ```

### Frontend can't connect to backend

**Error:** "Network request failed"
- **Solution:** 
  1. Check backend is running at http://localhost:8000
  2. Check `frontend/.env.local` has correct `NEXT_PUBLIC_API_URL`
  3. Clear browser cache and restart frontend

---

## 📦 Project Structure

```
vaulture/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env                # Configuration (create from .env.example)
│   ├── creators_platform.db # SQLite database (auto-created)
│   ├── uploads/            # File storage (auto-created)
│   ├── api/                # API endpoints
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── core/               # Configuration & utilities
│
└── frontend/
    ├── package.json        # Node dependencies
    ├── .env.local         # Frontend config
    ├── src/
    │   ├── app/           # Next.js pages
    │   ├── components/    # React components
    │   └── lib/           # Utilities
    └── public/            # Static assets
```

---

## 🎯 Next Steps

1. **Add Stripe (Optional):** For payments
   - Sign up at https://stripe.com
   - Add keys to `.env`
   - Test with Stripe test mode

2. **Customize UI:** Dark theme with neon accents already applied!

3. **Add More Features:**
   - Product reviews
   - Creator profiles
   - Analytics dashboard
   - Social sharing

4. **Deploy to Production:** See `RENDER_DEPLOYMENT.md`

---

## 💡 Tips

- **Reset Database:** Just delete `creators_platform.db` and restart
- **View Logs:** Backend logs show all API requests and errors
- **Test API:** Use http://localhost:8000/docs for interactive API testing
- **Hot Reload:** Both backend (`--reload`) and frontend (`npm run dev`) auto-reload on changes

---

**Happy Developing! 🚀**
