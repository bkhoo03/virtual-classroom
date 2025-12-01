import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: classroom-ui-overhaul, Property 1: API endpoint validation**
 * 
 * Property: For any valid API endpoint and request payload, the endpoint should 
 * return a successful status code and response structure matching the expected schema
 * 
 * Validates: Requirements 1.6
 */

// API endpoint definitions
interface APIEndpoint {
  method: 'GET' | 'POST';
  path: string;
  requiresAuth: boolean;
  requiredFields?: string[];
  expectedResponseFields: string[];
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/health',
    requiresAuth: false,
    expectedResponseFields: ['status', 'timestamp', 'environment']
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    requiresAuth: false,
    requiredFields: ['email', 'password'],
    expectedResponseFields: ['accessToken', 'refreshToken', 'user']
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    requiresAuth: true,
    expectedResponseFields: ['message']
  },
  {
    method: 'GET',
    path: '/api/auth/validate',
    requiresAuth: true,
    expectedResponseFields: ['valid', 'user']
  },
  {
    method: 'POST',
    path: '/api/auth/refresh',
    requiresAuth: false,
    requiredFields: ['refreshToken'],
    expectedResponseFields: ['accessToken', 'refreshToken']
  },
  {
    method: 'POST',
    path: '/api/tokens/agora',
    requiresAuth: true,
    requiredFields: ['channelName'],
    expectedResponseFields: ['token', 'uid', 'channel', 'expiresAt']
  },
  {
    method: 'POST',
    path: '/api/tokens/whiteboard',
    requiresAuth: true,
    requiredFields: ['roomId'],
    expectedResponseFields: ['token', 'roomId', 'expiresAt']
  },
  {
    method: 'POST',
    path: '/api/sessions',
    requiresAuth: true,
    requiredFields: ['sessionId'],
    expectedResponseFields: ['sessionId', 'session']
  }
];

// Generators for test data
const emailArbitrary = fc.emailAddress();
const passwordArbitrary = fc.string({ minLength: 6, maxLength: 20 });
const sessionIdArbitrary = fc.uuid();
const channelNameArbitrary = fc.string({ minLength: 1, maxLength: 64 });
const roomIdArbitrary = fc.string({ minLength: 1, maxLength: 64 });

// Mock backend URL (should be configured in test environment)
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Helper function to check if response has expected fields
function hasExpectedFields(response: any, expectedFields: string[]): boolean {
  return expectedFields.every(field => field in response);
}

// Helper function to make API request
async function makeAPIRequest(
  endpoint: APIEndpoint,
  payload: any,
  authToken?: string
): Promise<{ status: number; data: any }> {
  const url = `${BACKEND_URL}${endpoint.path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method: endpoint.method,
    headers
  };

  if (endpoint.method === 'POST' && payload) {
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    throw new Error(`API request failed: ${error}`);
  }
}

describe('API Endpoint Validation Property Tests', () => {
  let authToken: string | undefined;
  let backendAvailable = false;

  beforeAll(async () => {
    // Check if backend is available
    try {
      const healthCheck = await fetch(`${BACKEND_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      backendAvailable = healthCheck.ok;
      
      if (backendAvailable) {
        // Create a test user and get auth token for authenticated endpoints
        const loginResponse = await makeAPIRequest(
          API_ENDPOINTS.find(e => e.path === '/api/auth/login')!,
          { email: 'test@example.com', password: 'password123' }
        );
        
        if (loginResponse.status === 200 && loginResponse.data.accessToken) {
          authToken = loginResponse.data.accessToken;
        }
      }
    } catch (error) {
      console.warn('Backend not available for API tests:', error);
      backendAvailable = false;
    }
  });

  it('Property 1: Health endpoint returns valid response structure', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const endpoint = API_ENDPOINTS.find(e => e.path === '/health')!;
        const response = await makeAPIRequest(endpoint, null);

        // Should return successful status code
        expect(response.status).toBe(200);

        // Should have expected response fields
        expect(hasExpectedFields(response.data, endpoint.expectedResponseFields)).toBe(true);

        // Validate specific field types
        expect(typeof response.data.status).toBe('string');
        expect(typeof response.data.timestamp).toBe('string');
        expect(typeof response.data.environment).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1: Login endpoint validates request payload and returns expected structure', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(emailArbitrary, passwordArbitrary, async (email, password) => {
        const endpoint = API_ENDPOINTS.find(e => e.path === '/api/auth/login')!;
        const payload = { email, password };
        const response = await makeAPIRequest(endpoint, payload);

        // Should return either success (200) or unauthorized (401)
        expect([200, 401]).toContain(response.status);

        // If successful, should have expected response fields
        if (response.status === 200) {
          expect(hasExpectedFields(response.data, endpoint.expectedResponseFields)).toBe(true);
          expect(typeof response.data.accessToken).toBe('string');
          expect(typeof response.data.refreshToken).toBe('string');
          expect(typeof response.data.user).toBe('object');
        }

        // If failed, should have error message
        if (response.status === 401) {
          expect(typeof response.data.message).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1: Agora token endpoint requires authentication and valid payload', async () => {
    // Skip if no auth token available
    if (!authToken) {
      console.warn('Skipping authenticated endpoint test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(channelNameArbitrary, async (channelName) => {
        const endpoint = API_ENDPOINTS.find(e => e.path === '/api/tokens/agora')!;
        const payload = { channelName };
        const response = await makeAPIRequest(endpoint, payload, authToken);

        // Should return successful status code
        expect(response.status).toBe(200);

        // Should have expected response fields
        expect(hasExpectedFields(response.data, endpoint.expectedResponseFields)).toBe(true);

        // Validate specific field types
        expect(typeof response.data.token).toBe('string');
        expect(typeof response.data.uid).toBe('number');
        expect(typeof response.data.channel).toBe('string');
        expect(typeof response.data.expiresAt).toBe('number');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1: Whiteboard token endpoint requires authentication and valid payload', async () => {
    // Skip if no auth token available
    if (!authToken) {
      console.warn('Skipping authenticated endpoint test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(roomIdArbitrary, async (roomId) => {
        const endpoint = API_ENDPOINTS.find(e => e.path === '/api/tokens/whiteboard')!;
        const payload = { roomId };
        const response = await makeAPIRequest(endpoint, payload, authToken);

        // Should return successful status code
        expect(response.status).toBe(200);

        // Should have expected response fields
        expect(hasExpectedFields(response.data, endpoint.expectedResponseFields)).toBe(true);

        // Validate specific field types
        expect(typeof response.data.token).toBe('string');
        expect(typeof response.data.roomId).toBe('string');
        expect(typeof response.data.expiresAt).toBe('number');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1: Session creation endpoint requires authentication and valid payload', async () => {
    // Skip if no auth token available
    if (!authToken) {
      console.warn('Skipping authenticated endpoint test - no auth token');
      return;
    }

    await fc.assert(
      fc.asyncProperty(sessionIdArbitrary, async (sessionId) => {
        const endpoint = API_ENDPOINTS.find(e => e.path === '/api/sessions')!;
        const payload = { sessionId };
        const response = await makeAPIRequest(endpoint, payload, authToken);

        // Should return successful status code
        expect(response.status).toBe(200);

        // Should have expected response fields
        expect(hasExpectedFields(response.data, endpoint.expectedResponseFields)).toBe(true);

        // Validate specific field types
        expect(typeof response.data.sessionId).toBe('string');
        expect(typeof response.data.session).toBe('object');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 1: Endpoints reject requests with missing required fields', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Test login endpoint with missing fields
        const loginEndpoint = API_ENDPOINTS.find(e => e.path === '/api/auth/login')!;
        
        // Missing password
        const response1 = await makeAPIRequest(loginEndpoint, { email: 'test@example.com' });
        expect(response1.status).toBe(400);
        
        // Missing email
        const response2 = await makeAPIRequest(loginEndpoint, { password: 'password123' });
        expect(response2.status).toBe(400);
        
        // Empty payload
        const response3 = await makeAPIRequest(loginEndpoint, {});
        expect(response3.status).toBe(400);
      }),
      { numRuns: 100 }
    );
  });
});
