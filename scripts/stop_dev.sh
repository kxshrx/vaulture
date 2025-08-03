#!/bin/bash

# Stop all development services

echo "🛑 Stopping Vaulture development environment..."

# Function to kill process by PID file
kill_by_pidfile() {
    if [ -f "$1" ]; then
        PID=$(cat "$1")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "✅ Stopped process (PID: $PID)"
        fi
        rm "$1"
    fi
}

# Stop backend
kill_by_pidfile "/tmp/vaulture_backend.pid"

# Stop Stripe CLI
kill_by_pidfile "/tmp/vaulture_stripe.pid"

# Stop frontend
kill_by_pidfile "/tmp/vaulture_frontend.pid"

# Kill any remaining processes on our ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "🎉 All services stopped!"
