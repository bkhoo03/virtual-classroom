#!/bin/bash

# Start ngrok tunnel for backend (port 3001)
# This script starts the ngrok tunnel and displays the public URL

echo "🚀 Starting ngrok tunnel for backend (port 3001)..."
echo ""
echo "Make sure your backend is running on port 3001!"
echo "If not, start it with: cd backend && npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install it with: brew install ngrok/ngrok/ngrok"
    echo "Then add your authtoken: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

# Check if backend is running
if ! nc -z localhost 3001 2>/dev/null; then
    echo "⚠️  Warning: Backend doesn't appear to be running on port 3001"
    echo ""
    echo "Start it with: cd backend && npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📡 Starting ngrok tunnel..."
echo ""
echo "Copy the HTTPS URL and add it to virtual-classroom/.env:"
echo "VITE_BACKEND_URL=https://YOUR_NGROK_URL"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok
ngrok http 3001 --region us
