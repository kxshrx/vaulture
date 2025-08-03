#!/bin/bash

# Production startup script for Vaulture backend

echo "🚀 Starting Vaulture Production Server..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Production mode detected"
    
    # Create database tables if they don't exist
    echo "🔧 Setting up database..."
    python -c "
from backend.db.base import engine, Base
try:
    Base.metadata.create_all(bind=engine)
    print('✅ Database tables created/verified')
except Exception as e:
    print(f'❌ Database setup failed: {e}')
    exit(1)
"

    # Start with Gunicorn for production
    echo "🌐 Starting Gunicorn server..."
    exec gunicorn backend.main:app \
        --host 0.0.0.0 \
        --port ${PORT:-8000} \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "🔧 Development mode detected"
    
    # Start with Uvicorn for development
    echo "🌐 Starting Uvicorn development server..."
    exec uvicorn backend.main:app \
        --host 0.0.0.0 \
        --port ${PORT:-8000} \
        --reload
fi
