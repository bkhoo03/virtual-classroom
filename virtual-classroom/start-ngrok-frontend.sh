#!/bin/bash

# Start ngrok tunnel for frontend (port 5173)
# This script starts the ngrok tunnel and displays the public URL

echo "🚀 Starting ngrok tunnel for frontend (port 5173)..."
echo ""
echo "Make sure your frontend is running on port 5173!"
echo "If not, start it with: npm run dev"
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

# Check if frontend is running
if ! nc -z localhost 5173 2>/dev/null; then
    echo "⚠️  Warning: Frontend doesn't appear to be running on port 5173"
    echo ""
    echo "Start it with: npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📡 Starting ngrok tunnel..."
echo ""
echo "Share the HTTPS URL with colleagues or use it for testing!"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok
ngrok http 5173 --region us
