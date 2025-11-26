import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  agoraAppId: string;
  agoraAppCertificate: string;
  agoraWhiteboardAppId: string;
  agoraWhiteboardAppSecret: string;
  doubaoApiKey: string;
  doubaoApiEndpoint: string;
  corsOrigin: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'JWT_SECRET',
    'AGORA_APP_ID',
    'AGORA_APP_CERTIFICATE'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Some features may not work correctly. Please check your .env file.');
  }

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    agoraAppId: process.env.AGORA_APP_ID || '',
    agoraAppCertificate: process.env.AGORA_APP_CERTIFICATE || '',
    agoraWhiteboardAppId: process.env.AGORA_WHITEBOARD_APP_ID || '',
    agoraWhiteboardAppSecret: process.env.AGORA_WHITEBOARD_APP_SECRET || '',
    doubaoApiKey: process.env.DOUBAO_API_KEY || '',
    doubaoApiEndpoint: process.env.DOUBAO_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  };
}

export const config = validateEnv();
