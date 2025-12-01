# Doubao AI Assistant Setup Guide

## Overview
Doubao (豆包) is ByteDance's AI language model service that powers the "Ask AI" feature in the chat. It provides intelligent responses to student questions.

## What is Doubao?
- ByteDance's AI language model (similar to ChatGPT)
- Optimized for Chinese and English
- Part of Volcano Engine (火山引擎) platform
- Accessed through ARK API

## Step-by-Step Setup

### 1. Access Volcano Engine Console

**Option A: Direct Link**
- Go to https://console.volcengine.com/
- Or https://www.volcengine.com/product/doubao

**Option B: Through ByteDance**
- Visit https://www.doubao.com/
- Click on "开发者" (Developer) or "API"

### 2. Sign Up / Log In

**Requirements:**
- Chinese phone number (for verification)
- Email address
- Identity verification may be required

**Note:** If you don't have access to Chinese services, see alternatives below.

### 3. Navigate to ARK (方舟)

1. In the console, find "ARK" or "方舟" in the product list
2. This is the AI model service platform
3. Click to enter the ARK console

### 4. Create API Key

1. Go to "API Keys" (API密钥) or "密钥管理"
2. Click "Create API Key" (创建密钥)
3. Set a name: e.g., "Virtual Classroom Dev"
4. Set permissions (usually "Read & Write")
5. Click "Create" (创建)
6. **Copy the API Key immediately** (format: `ep-xxxxxxxxxxxxxxxxxx`)

### 5. Get Endpoint Information

**Default Endpoint:**
```
https://ark.cn-beijing.volces.com/api/v3
```

**Custom Endpoint:**
- Check your ARK console for your specific endpoint
- May vary based on region and service tier

### 6. Configure Your Application

Update `virtual-classroom/.env`:

```env
# Doubao API Configuration
VITE_DOUBAO_API_KEY=ep-20240xxxxxxxxxxxxx
VITE_DOUBAO_API_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3
```

### 7. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Pricing & Free Tier

### Free Trial
- Usually includes free credits for testing
- Check current promotion in Volcano Engine console

### Pricing (Approximate)
- Pay-per-token model
- ~¥0.008 per 1K tokens (input)
- ~¥0.012 per 1K tokens (output)
- Very affordable for development

### Cost Estimation
- Average chat message: ~100-500 tokens
- 1000 messages ≈ ¥5-10 RMB (~$1-2 USD)

## What You'll See After Setup

Once configured, the AI Assistant will:

1. ✅ **"Ask AI" button works** - Click to enable AI mode
2. ✅ **Get intelligent responses** - AI answers questions
3. ✅ **Context-aware** - Remembers conversation history
4. ✅ **Educational focus** - Optimized for learning assistance
5. ✅ **Bilingual support** - Works in Chinese and English

## Testing the AI Assistant

1. Open the chat panel
2. Click the "Ask AI" button (lightbulb icon)
3. Type a question like:
   - "Explain photosynthesis"
   - "Help me with calculus"
   - "What is machine learning?"
4. Press Send
5. You should see AI typing indicator
6. AI response appears in chat

## Alternative AI Services

If you can't access Doubao, you can modify the code to use:

### OpenAI (ChatGPT)
```env
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1
```

### Azure OpenAI
```env
VITE_AZURE_OPENAI_KEY=...
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
```

### Other Compatible APIs
- Anthropic Claude
- Google Gemini
- Local LLMs (Ollama, LM Studio)

## Modifying for Different AI Services

To switch AI providers, update `src/services/AIService.ts`:

```typescript
// Change the endpoint and headers
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    // Adjust headers for your provider
  },
  body: JSON.stringify({
    // Adjust request format for your provider
  })
});
```

## Troubleshooting

### "AI service not available" Error
- Check that API key is correctly set in .env
- Verify endpoint URL is correct
- Ensure no extra spaces in credentials
- Restart dev server after changes

### "Authentication failed" Error
- API key may be invalid or expired
- Check if you have sufficient credits
- Verify API key permissions

### AI Responses are Slow
- Normal for first request (cold start)
- Check your internet connection
- Consider upgrading service tier

### Rate Limiting Errors
- You've exceeded free tier limits
- Add payment method in console
- Or wait for rate limit reset

## Security Best Practices

### Development
- ✅ Use .env file (already gitignored)
- ✅ Never commit API keys to git
- ✅ Use different keys for dev/prod

### Production
- ⚠️ **Never expose API keys in frontend**
- ✅ Move AI calls to backend
- ✅ Implement rate limiting
- ✅ Add user authentication
- ✅ Monitor usage and costs

## Using Without AI

The app works perfectly without AI configured:
- ✅ Chat still works (peer-to-peer)
- ✅ All UI features work
- ✅ Video calls work
- ⏸️ "Ask AI" button shows error message

Simply don't click "Ask AI" if not configured!

## Resources

- [Volcano Engine Console](https://console.volcengine.com/)
- [Doubao Official Site](https://www.doubao.com/)
- [ARK API Documentation](https://www.volcengine.com/docs/82379)
- [Pricing Information](https://www.volcengine.com/pricing)

## Quick Start (Summary)

1. Go to https://console.volcengine.com/
2. Sign up with Chinese phone number
3. Navigate to ARK (方舟)
4. Create API Key
5. Copy key to `.env` file
6. Restart dev server
7. Test "Ask AI" in chat

That's it! Your AI assistant is ready to help students learn! 🎓✨
