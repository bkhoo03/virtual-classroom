/**
 * Copy PDF.js worker to public directory
 * Run this after npm install or when updating pdfjs-dist
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const workerSource = join(
  projectRoot,
  'node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);
const workerDest = join(publicDir, 'pdf.worker.min.mjs');

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Copy worker file
try {
  copyFileSync(workerSource, workerDest);
  console.log('✅ PDF.js worker copied to public directory');
} catch (error) {
  console.error('❌ Failed to copy PDF.js worker:', error.message);
  process.exit(1);
}
