# PDF.js Worker Setup Guide

## Problem
React-PDF requires a PDF.js worker file to render PDFs. The worker must be accessible from the browser.

## Solution
The worker file is automatically copied to the `public` directory and served by Vite.

## Files

### 1. Worker Configuration (`src/utils/pdfWorker.ts`)
```typescript
import { pdfjs } from 'react-pdf';

// Configure worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

### 2. Copy Script (`scripts/copy-pdf-worker.js`)
Automatically copies the worker from `node_modules` to `public` directory.

### 3. Package.json
```json
{
  "scripts": {
    "postinstall": "node scripts/copy-pdf-worker.js"
  }
}
```

## How It Works

1. **During Development**: Vite serves files from `public` directory at root path
2. **Worker Location**: `/pdf.worker.min.mjs` → `public/pdf.worker.min.mjs`
3. **Auto-Copy**: Runs after `npm install` to ensure worker is always available

## Manual Setup (if needed)

If the worker is missing, run:

```bash
node scripts/copy-pdf-worker.js
```

Or manually copy:

```bash
# Windows
copy node_modules\react-pdf\node_modules\pdfjs-dist\build\pdf.worker.min.mjs public\

# Linux/Mac
cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

## Verification

Check if worker exists:
```bash
ls public/pdf.worker.min.mjs
```

Should see: `public/pdf.worker.min.mjs` (approximately 1.5MB)

## Troubleshooting

### Error: "Failed to fetch dynamically imported module"
- **Cause**: Worker file not found in public directory
- **Fix**: Run `node scripts/copy-pdf-worker.js`

### Error: "Setting up fake worker failed"
- **Cause**: Worker path incorrect or file missing
- **Fix**: Verify `public/pdf.worker.min.mjs` exists

### Worker loads but PDF doesn't render
- **Cause**: CORS or network issue
- **Fix**: Check browser console for specific errors

## Production Build

The worker is automatically included in production builds:
1. Vite copies `public` directory to `dist`
2. Worker accessible at `/pdf.worker.min.mjs`
3. No additional configuration needed

## Alternative Approaches (not used)

### CDN (not recommended for production)
```typescript
pdfjs.GlobalWorkerOptions.workerSrc = 
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
```
- ❌ Requires internet connection
- ❌ CDN may be blocked
- ❌ Version mismatch issues

### Import URL (complex with Vite)
```typescript
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();
```
- ❌ Path resolution issues
- ❌ Build configuration complexity

## Current Approach (recommended)
✅ Copy to public directory
✅ Simple and reliable
✅ Works in dev and production
✅ No external dependencies
