# Ngrok Setup Guide

This guide explains how to set up ngrok to expose your local backend and frontend for testing and collaboration.

## What is Ngrok?

Ngrok creates secure tunnels from public URLs to your localhost, allowing you to:
- Test your application from any device
- Share your local development with colleagues
- Test webhooks and external API integrations
- Avoid deployment delays during development

## Prerequisites

- macOS with Homebrew installed
- Backend running on port 3001
- Frontend running on port 5173 (Vite dev server)

## Installation

### Step 1: Install ngrok via Homebrew

```bash
brew install ngrok/ngrok/ngrok
```

### Step 2: Sign up for ngrok account (Free)

1. Go to https://ngrok.com/
2. Sign up for a free account
3. Get your authtoken from the dashboard

### Step 3: Add your authtoken

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Replace `YOUR_AUTH_TOKEN_HERE` with your actual token from the ngrok dashboard.

## Configuration

### Backend Tunnel (Port 3001)

Create a tunnel for your backend server:

```bash
ngrok http 3001 --region us
```

This will output something like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

**Save this URL** - you'll need it for the frontend configuration.

### Frontend Tunnel (Port 5173)

**⚠️ Important: Free Account Limitation**

Free ngrok accounts can only run **1 tunnel at a time**. For development, you typically only need the backend tunnel. The frontend can run locally and access the tunneled backend.

**If you have a paid account**, you can create a separate frontend tunnel:

```bash
ngrok http 5173 --region us
```

This will output something like:
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:5173
```

**For free accounts**, skip this step and access the frontend at `http://localhost:5173` instead.

## Environment Configuration

### Backend Configuration

The backend CORS is already configured to accept ngrok domains. No changes needed!

### Frontend Configuration

Update your `virtual-classroom/.env` file with the backend ngrok URL:

```env
# Replace with your actual backend ngrok URL
VITE_BACKEND_URL=https://abc123.ngrok-free.app
```

**Important:** Restart your Vite dev server after changing the `.env` file:

```bash
cd virtual-classroom
npm run dev
```

## Usage Workflow

### Starting Everything

1. **Start Backend** (Terminal 1):
   ```bash
   cd virtual-classroom/backend
   npm run dev
   ```

2. **Start Backend Ngrok Tunnel** (Terminal 2):
   ```bash
   ngrok http 3001 --region us
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

3. **Update Frontend .env** (Terminal 3):
   ```bash
   cd virtual-classroom
   # Edit .env and set VITE_BACKEND_URL to the backend ngrok URL
   ```

4. **Start Frontend** (Terminal 3):
   ```bash
   npm run dev
   ```

5. **Access Your App**:
   - **Free Account**: Open `http://localhost:5173` in your browser
   - **Paid Account**: Optionally start a frontend tunnel in Terminal 4:
     ```bash
     ngrok http 5173 --region us
     ```
     Then share the frontend ngrok URL with colleagues

**⚠️ Important Notes:**
- **DO NOT use `--pooling-enabled`** - it causes routing conflicts
- Free accounts can only run 1 tunnel at a time
- Backend tunnel is more important (needed for Agora document conversion)
- Frontend can run locally and still access the tunneled backend

### Quick Start Script

For convenience, you can use the provided start script:

```bash
cd virtual-classroom
./start-dev.sh
```

This will start both backend and frontend. Then manually start the ngrok tunnels in separate terminals.

## Testing

### Test Backend Connection

```bash
curl https://YOUR_BACKEND_NGROK_URL/health
```

Should return a 200 OK response.

### Test Frontend

Open your frontend ngrok URL in a browser. You should see the login page.

### Test Full Flow

1. Login with credentials
2. Create or join a session
3. Test video call features
4. Test whiteboard
5. Test AI assistant with multimodal features
6. Test chat

## Multimodal AI Testing

With ngrok, you can test all multimodal AI features:

- **Web Search**: Test queries that require current information
- **Unsplash Image Search**: Test proactive image enhancement
- **DALL-E Image Generation**: Test custom image generation
- **Document Upload**: Test PDF upload and Agora conversion (requires public URL)

## Troubleshooting

### Issue: "ERR_NGROK_108"

This means your ngrok session expired. Free accounts have 2-hour session limits.

**Solution**: Restart the ngrok tunnel.

### Issue: "Failed to complete tunnel connection"

**Solution**: Check your internet connection and try again.

### Issue: Frontend can't reach backend

**Solution**: 
1. Verify backend ngrok URL is correct in `.env`
2. Restart Vite dev server after changing `.env`
3. Check backend is running on port 3001

### Issue: CORS errors

**Solution**: The backend is already configured for ngrok domains. If you still see CORS errors:
1. Check the backend console for the actual origin being rejected
2. Verify you're using the HTTPS ngrok URL (not HTTP)

### Issue: Ngrok "Visit Site" warning page

Free ngrok accounts show a warning page before forwarding. Click "Visit Site" to continue.

**Solution**: Upgrade to a paid ngrok account to remove this warning, or just click through it.

## Advanced Configuration

### Using ngrok.yml Configuration File

Create `~/.ngrok2/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE
tunnels:
  backend:
    proto: http
    addr: 3001
    region: us
  frontend:
    proto: http
    addr: 5173
    region: us
```

Then start both tunnels at once:

```bash
ngrok start --all
```

### Custom Subdomain (Paid Feature)

With a paid ngrok account, you can use custom subdomains:

```bash
ngrok http 3001 --subdomain=my-classroom-backend
```

## Benefits of Ngrok for Development

1. **Instant Testing**: No need to deploy to test changes
2. **Real Collaboration**: Share with colleagues instantly
3. **Mobile Testing**: Test on real mobile devices
4. **Webhook Testing**: Test external API callbacks
5. **Fast Iteration**: See code changes immediately

## Migration to Production

When ready for production deployment:

1. Deploy backend to a cloud platform (AWS, Heroku, Railway, etc.)
2. Deploy frontend to Vercel
3. Update environment variables to use production URLs
4. Configure proper domain names

Ngrok is perfect for development and testing, but use proper hosting for production.

## Cost Comparison

### Ngrok (Development)
- Free tier: 1 online ngrok process, 40 connections/minute
- Paid ($8/month): Multiple processes, custom domains, no warning page

### Production Hosting
- Vercel (Frontend): Free for personal projects
- Railway/Heroku (Backend): ~$5-10/month
- AWS (Full Stack): Variable, can be free tier eligible

## Security Notes

- Ngrok URLs are public - anyone with the URL can access your app
- Don't commit ngrok URLs to git
- Don't use ngrok for production
- Rotate your authtoken if exposed
- Use ngrok's IP restrictions feature for sensitive testing (paid feature)

## Support

- Ngrok Documentation: https://ngrok.com/docs
- Ngrok Dashboard: https://dashboard.ngrok.com/
- Virtual Classroom Issues: Check the project README

## Summary

Ngrok is an excellent tool for development and testing. It allows you to:
- Test your app from anywhere
- Collaborate with remote team members
- Test on real devices
- Avoid deployment delays

For production, migrate to proper hosting platforms like Vercel and AWS.
