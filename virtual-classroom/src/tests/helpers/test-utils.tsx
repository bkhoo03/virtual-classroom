/**
 * Test Utilities for React Component Testing
 * Provides custom render functions and common test helpers
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';

/**
 * Custom render function that wraps components with common providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  authValue?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialRoute = '/', authValue, ...renderOptions } = options || {};

  // Set initial route if specified
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock localStorage for testing
 */
export class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Mock sessionStorage for testing
 */
export function createMockSessionStorage(): Storage {
  return new MockStorage();
}

/**
 * Mock localStorage for testing
 */
export function createMockLocalStorage(): Storage {
  return new MockStorage();
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Mock fetch for API testing
 */
export function createMockFetch(responses: Map<string, any>) {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const key = `${options?.method || 'GET'} ${url}`;
    const response = responses.get(key);

    if (!response) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(response.data), {
      status: response.status || 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

/**
 * Mock WebSocket for testing
 */
export class MockWebSocket {
  public url: string;
  public readyState: number = 0;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string): void {
    // Mock send - do nothing
  }

  close(): void {
    this.readyState = 3;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  // Helper to simulate receiving a message
  simulateMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
}

/**
 * Mock Agora RTC Client for testing
 */
export class MockAgoraRTCClient {
  public uid: number | null = null;
  public connectionState: string = 'DISCONNECTED';
  private localTracks: any[] = [];
  private remoteTracks: Map<string, any[]> = new Map();

  async join(appId: string, channel: string, token: string, uid: number): Promise<number> {
    this.uid = uid;
    this.connectionState = 'CONNECTED';
    return uid;
  }

  async leave(): Promise<void> {
    this.uid = null;
    this.connectionState = 'DISCONNECTED';
    this.localTracks = [];
    this.remoteTracks.clear();
  }

  async publish(tracks: any[]): Promise<void> {
    this.localTracks = tracks;
  }

  async unpublish(tracks: any[]): Promise<void> {
    this.localTracks = this.localTracks.filter(t => !tracks.includes(t));
  }

  async subscribe(user: any, mediaType: string): Promise<any> {
    const track = { trackMediaType: mediaType, play: () => {} };
    const userTracks = this.remoteTracks.get(user.uid) || [];
    userTracks.push(track);
    this.remoteTracks.set(user.uid, userTracks);
    return track;
  }

  on(event: string, callback: Function): void {
    // Mock event listener
  }

  off(event: string, callback: Function): void {
    // Mock event listener removal
  }
}

/**
 * Mock Agora RTC Track for testing
 */
export class MockAgoraRTCTrack {
  public trackMediaType: string;
  public enabled: boolean = true;
  public muted: boolean = false;

  constructor(mediaType: string) {
    this.trackMediaType = mediaType;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
  }

  async setMuted(muted: boolean): Promise<void> {
    this.muted = muted;
  }

  play(element: HTMLElement): void {
    // Mock play
  }

  stop(): void {
    // Mock stop
  }

  close(): void {
    // Mock close
  }
}

/**
 * Create mock video track
 */
export function createMockVideoTrack(): MockAgoraRTCTrack {
  return new MockAgoraRTCTrack('video');
}

/**
 * Create mock audio track
 */
export function createMockAudioTrack(): MockAgoraRTCTrack {
  return new MockAgoraRTCTrack('audio');
}

/**
 * Suppress console errors/warnings during tests
 */
export function suppressConsole() {
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });
}

/**
 * Create a mock file for upload testing
 */
export function createMockFile(
  name: string = 'test.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
}

/**
 * Simulate user interaction delay
 */
export async function simulateUserDelay(ms: number = 100): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Re-export commonly used testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
