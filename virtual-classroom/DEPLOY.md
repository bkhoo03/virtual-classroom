# Deploy to Vercel - Quick Guide

## Setup (5 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Frontend
```bash
cd virtual-classroom
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? **virtual-classroom** (or whatever you want)
- Directory? **./** (just press enter)
- Override settings? **N**

### 4. Set Environment Variables on Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables

Add these:
```
VITE_AGORA_APP_ID=2c5e09a7b90c4330a352cb0bfdaa220e
VITE_AGORA_WHITEBOARD_APP_ID=PKBIgMp_EfCEFBsewjmR-w/l-M_XQr0XcD28g
VITE_AGORA_WHITEBOARD_AK=KhyLuMbqcQGGDdqI
VITE_AGORA_WHITEBOARD_SK=cZbxo4WagcXZZ5SUloc9uZQZSvBUYFcN
VITE_BACKEND_URL=https://your-ngrok-url.ngrok-free.dev
VITE_OPENAI_API_KEY=your-key-here
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1
VITE_SERPER_API_KEY=cd35b5d56b2a3a06c039c9d4e9e74f018590f448
VITE_UNSPLASH_ACCESS_KEY=E4pF7u7rwAgs-BEGj2VsgTZHs_aCgWS5pVS6lI0gNpc
VITE_ENV=production
```

### 5. Redeploy
```bash
vercel --prod
```

## Backend Setup (Keep Running Locally)

### 1. Start Backend with ngrok
```bash
cd virtual-classroom/backend
npm run dev
```

### 2. In another terminal, start ngrok
```bash
ngrok http 3001
```

### 3. Update Vercel Environment Variable
Copy the ngrok URL (e.g., `https://abc123.ngrok-free.dev`) and update `VITE_BACKEND_URL` in Vercel dashboard, then redeploy.

## Usage

1. **You:** Open `https://your-app.vercel.app`
2. **Colleague:** Open same URL
3. Both join the same session ID
4. Video call works!

## Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check logs
vercel logs

# Open dashboard
vercel dashboard
```

## Troubleshooting

### Video not connecting?
- Check backend is running: `curl https://your-ngrok.ngrok-free.dev/health`
- Check VITE_BACKEND_URL is correct in Vercel
- Check browser console for errors

### CORS errors?
Backend already configured for ngrok domains, should work automatically.

### Need to update?
```bash
git add .
git commit -m "update"
vercel --prod
```

Done! Your app is live and you can video call with your colleague.
