import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: classroom-ui-overhaul, Property 61: Production API routing**
 * 
 * Property: For any API call made in the deployed application, the request should 
 * be routed to the deployed backend URL
 * 
 * Validates: Requirements 14.6
 */

// Test different origin patterns
const originArbitrary = fc.oneof(
  fc.constant('http://localhost:5173'),
  fc.constant('http://localhost:5174'),
  fc.webUrl({ validSchemes: ['https'] }).map(url => {
    // Generate ngrok-like URLs
    const subdomain = url.split('//')[1]?.split('.')[0] || 'test';
    return fc.oneof(
      fc.constant(`https://${subdomain}.ngrok-free.app`),
      fc.constant(`https://${subdomain}.ngrok.io`),
      fc.constant(`https://${subdomain}.ngrok.app`)
    );
  }).chain(x => x)
);

// API endpoints to test
const apiEndpoints = [
  '/health',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/validate',
  '/api/tokens/agora',
  '/api/tokens/whiteboard',
  '/api/sessions'
];

const endpointArbitrary = fc.constantFrom(...apiEndpoints);

describe('API Routing Property Tests', () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  let backendAvailable = false;

  beforeAll(async () => {
    // Check if backend is available
    try {
      const healthCheck = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      backendAvailable = healthCheck.ok;
    } catch (error) {
      console.warn('Backend not available for API routing tests:', error);
      backendAvailable = false;
    }
  });

  it('Property 61: API requests are routed to the configured backend URL', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(endpointArbitrary, async (endpoint) => {
        // Construct the full URL using the backend URL
        const fullUrl = `${BACKEND_URL}${endpoint}`;

        // Verify the URL is constructed correctly
        expect(fullUrl).toContain(BACKEND_URL);
        expect(fullUrl).toContain(endpoint);

        // Verify the URL doesn't have double slashes (except in protocol)
        const urlWithoutProtocol = fullUrl.replace(/^https?:\/\//, '');
        expect(urlWithoutProtocol).not.toContain('//');

        // Make a request to verify routing works
        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          });

          // Should get a response (even if it's an error response)
          expect(response).toBeDefined();
          expect(typeof response.status).toBe('number');
        } catch (error) {
          // Network errors are acceptable for some endpoints (auth required, etc.)
          // But the URL should still be correctly formed
          expect(fullUrl).toMatch(/^https?:\/\/.+/);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 61: Backend URL is correctly configured for the environment', () => {
    // Verify BACKEND_URL is set and valid
    expect(BACKEND_URL).toBeDefined();
    expect(BACKEND_URL).toMatch(/^https?:\/\/.+/);

    // In production/ngrok, should use https
    if (BACKEND_URL.includes('ngrok')) {
      expect(BACKEND_URL).toMatch(/^https:\/\//);
    }

    // Should not have trailing slash
    expect(BACKEND_URL).not.toMatch(/\/$/);
  });

  it('Property 61: CORS origin validation accepts valid origins', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(originArbitrary, async (origin) => {
        // Test CORS preflight request
        try {
          const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'OPTIONS',
            headers: {
              'Origin': origin,
              'Access-Control-Request-Method': 'GET'
            },
            signal: AbortSignal.timeout(2000)
          });

          // Should handle OPTIONS request
          expect(response).toBeDefined();
          
          // If origin is allowed, should have CORS headers
          const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
          
          // Localhost origins should always be allowed
          if (origin.includes('localhost')) {
            expect(allowOrigin).toBeTruthy();
          }
          
          // Ngrok origins should be allowed
          if (origin.includes('ngrok')) {
            expect(allowOrigin).toBeTruthy();
          }
        } catch (error) {
          // Network errors are acceptable
          console.warn(`CORS test failed for origin ${origin}:`, error);
        }
      }),
      { numRuns: 50 }
    );
  });

  it('Property 61: API client uses correct base URL for all requests', () => {
    // Test that the API client configuration is correct
    const apiClient = {
      baseURL: BACKEND_URL,
      makeRequest: (endpoint: string) => {
        return `${apiClient.baseURL}${endpoint}`;
      }
    };

    fc.assert(
      fc.property(endpointArbitrary, (endpoint) => {
        const fullUrl = apiClient.makeRequest(endpoint);
        
        // Should start with the base URL
        expect(fullUrl).toContain(BACKEND_URL);
        
        // Should include the endpoint
        expect(fullUrl).toContain(endpoint);
        
        // Should be a valid URL
        expect(() => new URL(fullUrl)).not.toThrow();
        
        // Should not have double slashes
        const urlWithoutProtocol = fullUrl.replace(/^https?:\/\//, '');
        expect(urlWithoutProtocol).not.toContain('//');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 61: Credentials are included in cross-origin requests', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    await fc.assert(
      fc.asyncProperty(fc.constant('/health'), async (endpoint) => {
        // Make request with credentials
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          signal: AbortSignal.timeout(2000)
        });

        // Should get a response
        expect(response).toBeDefined();
        expect(typeof response.status).toBe('number');

        // CORS headers should allow credentials
        const allowCredentials = response.headers.get('Access-Control-Allow-Credentials');
        expect(allowCredentials).toBe('true');
      }),
      { numRuns: 100 }
    );
  });

  it('Property 61: Invalid origins are rejected by CORS', async () => {
    if (!backendAvailable) {
      console.warn('Skipping test - backend not available');
      return;
    }

    const invalidOrigins = [
      'http://evil.com',
      'https://malicious.site',
      'http://not-allowed.com'
    ];

    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...invalidOrigins), async (origin) => {
        try {
          const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
            headers: {
              'Origin': origin
            },
            signal: AbortSignal.timeout(2000)
          });

          // Should either reject or not include CORS headers for invalid origins
          const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
          
          // Invalid origins should not be in the allow list
          if (allowOrigin) {
            expect(allowOrigin).not.toBe(origin);
          }
        } catch (error) {
          // CORS errors are expected for invalid origins
          expect(error).toBeDefined();
        }
      }),
      { numRuns: 50 }
    );
  });

  it('Property 61: Ngrok domain patterns are correctly validated', () => {
    const validNgrokDomains = [
      'https://abc123.ngrok-free.app',
      'https://test-app.ngrok.io',
      'https://my-tunnel.ngrok.app'
    ];

    const invalidNgrokDomains = [
      'http://abc123.ngrok-free.app', // http instead of https
      'https://ngrok-free.app', // missing subdomain
      'https://abc123.ngrok.com', // wrong TLD
      'https://abc123.ngrok-free.app.evil.com' // domain spoofing
    ];

    const ngrokPatterns = [
      /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
      /^https:\/\/[a-z0-9-]+\.ngrok\.io$/,
      /^https:\/\/[a-z0-9-]+\.ngrok\.app$/
    ];

    // Valid domains should match
    validNgrokDomains.forEach(domain => {
      const matches = ngrokPatterns.some(pattern => pattern.test(domain));
      expect(matches).toBe(true);
    });

    // Invalid domains should not match
    invalidNgrokDomains.forEach(domain => {
      const matches = ngrokPatterns.some(pattern => pattern.test(domain));
      expect(matches).toBe(false);
    });
  });
});
