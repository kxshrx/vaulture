#!/bin/bash

# Vaulture Development Setup Script
# This script sets up the complete development environment

echo "🚀 Starting Vaulture Development Environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_tool "stripe"
check_tool "python"
check_tool "npm"

# Start backend server
echo "🔧 Starting backend server..."
cd /Users/kxshrx/dev/vaulture
source venv/bin/activate

# Kill any existing processes on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start backend in background
python -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Start Stripe CLI webhook forwarding (much better than ngrok for webhooks)
echo "🔗 Starting Stripe webhook forwarding..."
stripe listen --forward-to localhost:8000/purchase/webhook &
STRIPE_PID=$!
echo "✅ Stripe webhook forwarding started (PID: $STRIPE_PID)"

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "💡 Stripe webhooks are automatically forwarded to your local server"
echo "   No need to manually configure webhook URLs!"
echo ""
echo "⚠️  Important: Copy the webhook signing secret from Stripe CLI output"
echo "   and add it to your .env file as STRIPE_WEBHOOK_SECRET"
echo ""
echo "🛑 To stop all services, run: ./scripts/stop_dev.sh"

# Save PIDs for cleanup
echo "$BACKEND_PID" > /tmp/vaulture_backend.pid
echo "$STRIPE_PID" > /tmp/vaulture_stripe.pid
echo "$FRONTEND_PID" > /tmp/vaulture_frontend.pid

# Keep script running
wait
