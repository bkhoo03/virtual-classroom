# Agora Interactive Whiteboard Setup Guide

## Overview
The whiteboard feature uses Agora's Interactive Whiteboard service for real-time collaborative drawing and annotations.

## Step-by-Step Setup

### 1. Access Agora Console
1. Go to https://console.agora.io/
2. Log in with your account
3. Select your project (or create a new one)

### 2. Enable Interactive Whiteboard

#### Option A: From Project Dashboard
1. In your project dashboard, look for "Products & Usage"
2. Find "Interactive Whiteboard" in the product list
3. Click "Enable" or "Activate"

#### Option B: From Products Menu
1. Click on "Products" in the left sidebar
2. Find "Interactive Whiteboard"
3. Click "Enable for this project"

### 3. Get Your Credentials

#### Whiteboard App Identifier
1. Go to the Whiteboard section in your project
2. Find "App Identifier" or "Whiteboard App ID"
3. Copy this value (format: `xxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx`)

#### Access Key (AK) and Secret Key (SK)
1. In the Whiteboard settings, find "SDK Authentication"
2. Click "Generate" or "Create Access Key"
3. Copy both the **AK** (Access Key) and **SK** (Secret Key)
4. ⚠️ **Important**: Save the SK immediately - you won't be able to see it again!

### 4. Add to .env File

Update your `virtual-classroom/.env` file:

```env
# Agora Interactive Whiteboard Configuration
VITE_AGORA_WHITEBOARD_APP_ID=your_whiteboard_app_id_here
VITE_AGORA_WHITEBOARD_AK=your_access_key_here
VITE_AGORA_WHITEBOARD_SK=your_secret_key_here
```

### 5. Restart Your Dev Server

After updating the .env file:
```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Free Tier Limits

Agora Interactive Whiteboard free tier includes:
- **1,000 minutes per month** of whiteboard usage
- Perfect for development and testing
- No credit card required

## What You'll See After Setup

Once configured, the whiteboard mode will:
1. ✅ Load without errors
2. ✅ Allow real-time drawing
3. ✅ Support multiple users drawing simultaneously
4. ✅ Sync annotations across all participants
5. ✅ Provide tools: pen, eraser, shapes, text

## Testing the Whiteboard

1. Click the "Whiteboard" button in the presentation panel
2. You should see a white canvas
3. Use the toolbar on the left to select drawing tools
4. Draw on the canvas - it should work smoothly
5. Open another browser tab to test multi-user sync

## Troubleshooting

### "Whiteboard not initialized" Error
- Check that all three credentials are correctly set in .env
- Ensure there are no extra spaces in the values
- Restart your dev server after changes

### "Authentication failed" Error
- Verify your AK and SK are correct
- Make sure the SK hasn't expired
- Check that the App ID matches your project

### Whiteboard Loads but Drawing Doesn't Work
- Check browser console for errors
- Ensure you have the latest Agora Whiteboard SDK
- Try clearing browser cache

## Backend Token Generation (Optional)

For production, you should generate whiteboard tokens on your backend:

1. The backend needs to use the AK/SK to generate room tokens
2. Never expose AK/SK in frontend code
3. See `backend/src/routes/tokens.ts` for implementation

## Alternative: Use Without Whiteboard

If you don't need the whiteboard feature:
1. Simply don't configure the whiteboard credentials
2. The app will work fine with PDF and screen share modes
3. The whiteboard button will show an initialization message

## Resources

- [Agora Whiteboard Documentation](https://docs.agora.io/en/interactive-whiteboard/overview/product-overview)
- [Agora Console](https://console.agora.io/)
- [SDK Reference](https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api)
