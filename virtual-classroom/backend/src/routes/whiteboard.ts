import express from 'express';
import axios from 'axios';

const router = express.Router();

// Agora Whiteboard API configuration
const WHITEBOARD_APP_ID = process.env.AGORA_WHITEBOARD_APP_ID || '';
const WHITEBOARD_APP_TOKEN = process.env.AGORA_WHITEBOARD_SDK_TOKEN || '';
const WHITEBOARD_API_BASE = 'https://api.netless.link/v5';

/**
 * Start a file conversion task
 * POST /api/whiteboard/convert
 */
router.post('/convert', async (req, res) => {
  try {
    const { fileUrl, fileName, config } = req.body;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'fileUrl and fileName are required' });
    }

    if (!WHITEBOARD_APP_ID || !WHITEBOARD_APP_TOKEN) {
      return res.status(500).json({ message: 'Whiteboard credentials not configured' });
    }

    // Determine conversion type from file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const dynamicFormats = ['ppt', 'pptx'];
    const conversionType = config?.type || (dynamicFormats.includes(ext || '') ? 'dynamic' : 'static');

    // Prepare conversion request
    const conversionRequest: any = {
      resource: fileUrl,
      type: conversionType,
      preview: config?.preview !== false,
    };

    // Add scale for static conversions
    if (conversionType === 'static') {
      conversionRequest.scale = config?.scale || 2;
      conversionRequest.outputFormat = config?.outputFormat || 'png';
    }

    console.log('Starting Agora conversion:', conversionRequest);
    console.log('Using token:', WHITEBOARD_APP_TOKEN.substring(0, 20) + '...');

    // Warn if using localhost URL (Agora can't access it)
    if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
      console.warn('⚠️  WARNING: Using localhost URL. Agora servers cannot access localhost!');
      console.warn('   For production, upload files to cloud storage (S3, Cloudinary, etc.)');
      console.warn('   For development, use ngrok or similar tunneling service');
      return res.status(400).json({
        message: 'Cannot use localhost URL. File must be publicly accessible.',
        hint: 'Make sure your backend is accessible via ngrok and the file URL uses the ngrok domain.'
      });
    }

    // Verify the file is accessible before sending to Agora
    console.log('Verifying file accessibility:', fileUrl);
    try {
      const testResponse = await axios.head(fileUrl, { timeout: 5000 });
      console.log('✅ File is accessible, status:', testResponse.status);
    } catch (error: any) {
      console.error('❌ File is NOT accessible:', error.message);
      return res.status(400).json({
        message: 'File URL is not accessible',
        fileUrl,
        error: error.message,
        hint: 'Make sure the file URL is publicly accessible and not blocked by CORS or firewall.'
      });
    }

    // Call Agora conversion API
    const response = await axios.post(
      `${WHITEBOARD_API_BASE}/services/conversion/tasks`,
      conversionRequest,
      {
        headers: {
          'token': WHITEBOARD_APP_TOKEN,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('Agora conversion started:', response.data);

    res.json({
      taskUuid: response.data.uuid,
      type: conversionType,
    });
  } catch (error: any) {
    console.error('❌ Error starting conversion:');
    console.error('   Status:', error.response?.status);
    console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('   Message:', error.message);
    
    res.status(500).json({
      message: 'Failed to start conversion',
      error: error.response?.data || error.message,
      details: error.response?.data,
    });
  }
});

/**
 * Query conversion task progress
 * GET /api/whiteboard/convert/:taskUuid
 */
router.get('/convert/:taskUuid', async (req, res) => {
  try {
    const { taskUuid } = req.params;

    if (!taskUuid) {
      return res.status(400).json({ message: 'taskUuid is required' });
    }

    if (!WHITEBOARD_APP_TOKEN) {
      return res.status(500).json({ message: 'Whiteboard credentials not configured' });
    }

    console.log('Querying conversion progress:', taskUuid);

    // Query Agora conversion API
    const response = await axios.get(
      `${WHITEBOARD_API_BASE}/services/conversion/tasks/${taskUuid}?type=static`,
      {
        headers: {
          'token': WHITEBOARD_APP_TOKEN,
        },
      }
    );

    console.log('Conversion progress:', response.data);

    res.json(response.data);
  } catch (error: any) {
    console.error('Error querying conversion:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to query conversion progress',
      error: error.response?.data || error.message,
    });
  }
});

export default router;
