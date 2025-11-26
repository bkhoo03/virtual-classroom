/**
 * PDF.js Worker Configuration
 * Configures the worker for react-pdf to handle PDF rendering in a separate thread
 */

import { pdfjs } from 'react-pdf';

// Use CDN worker - more reliable than local file
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default pdfjs;
