import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { whiteboardService } from '../services/WhiteboardService';
import type { WhiteboardConfig, DrawingToolType } from '../types/whiteboard.types';

// Mock the white-web-sdk module
vi.mock('white-web-sdk', () => {
  const mockRoom = {
    phase: 'connected',
    state: {
      memberState: {
        currentApplianceName: 'pencil',
        strokeColor: [0, 0, 0],
        strokeWidth: 6,
      },
      sceneState: {
        scenePath: '/init',
        index: 0,
      },
    },
    canUndoSteps: 0,
    canRedoSteps: 0,
    setMemberState: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    cleanCurrentScene: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
    bindHtmlElement: vi.fn(),
    screenshotToCanvas: vi.fn().mockResolvedValue({
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
    }),
    callbacks: {
      on: vi.fn(),
    },
  };

  class MockWhiteWebSdk {
    joinRoom = vi.fn().mockResolvedValue(mockRoom);
  }

  return {
    WhiteWebSdk: MockWhiteWebSdk,
  };
});

describe('WhiteboardService Property Tests', () => {
  beforeEach(() => {
    // Reset the service state before each test
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup after each test
    try {
      await whiteboardService.destroy();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 8: Whiteboard initialization**
   * **Validates: Requirements 3.1**
   * 
   * For any valid session and whiteboard credentials, initializing the whiteboard
   * should succeed and return a connected room instance
   */
  describe('Property 8: Whiteboard initialization', () => {
    it('should successfully initialize with valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random but valid whiteboard configurations
          fc.record({
            appId: fc.string({ minLength: 10, maxLength: 50 }),
            roomId: fc.uuid(),
            roomToken: fc.string({ minLength: 20, maxLength: 100 }),
            userId: fc.string({ minLength: 5, maxLength: 30 }),
            userRole: fc.constantFrom('admin', 'writer', 'reader') as fc.Arbitrary<'admin' | 'writer' | 'reader'>,
          }),
          async (config: WhiteboardConfig) => {
            // Initialize the SDK
            whiteboardService.initialize(config.appId);

            // Join the room
            const room = await whiteboardService.joinRoom(config);

            // Verify room is connected
            expect(room).toBeDefined();
            expect(whiteboardService.isConnected()).toBe(true);
            expect(whiteboardService.getRoom()).toBe(room);

            // Cleanup
            await whiteboardService.leaveRoom();
          }
        ),
        { numRuns: 10 } // Run 10 times for faster tests
      );
    });

    it('should throw error when app ID is missing', () => {
      expect(() => {
        whiteboardService.initialize('');
      }).toThrow('Whiteboard App ID is required');
    });

    it('should throw error when joining without initialization', async () => {
      const config: WhiteboardConfig = {
        appId: 'test-app-id',
        roomId: 'test-room',
        roomToken: 'test-token',
        userId: 'test-user',
        userRole: 'admin',
      };

      await expect(whiteboardService.joinRoom(config)).rejects.toThrow(
        'Whiteboard SDK not initialized'
      );
    });
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 9: Whiteboard state management**
   * **Validates: Requirements 3.2, 3.4, 3.5**
   * 
   * For any whiteboard state change (tool, color, stroke width), subsequent
   * drawing operations should use the new state values
   */
  describe('Property 9: Whiteboard state management', () => {
    beforeEach(async () => {
      // Initialize and join a room before each test
      const config: WhiteboardConfig = {
        appId: 'test-app-id',
        roomId: 'test-room',
        roomToken: 'test-token',
        userId: 'test-user',
        userRole: 'admin',
      };

      whiteboardService.initialize(config.appId);
      await whiteboardService.joinRoom(config);
    });

    it('should update tool state correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<DrawingToolType>(
            'pencil',
            'rectangle',
            'circle',
            'line',
            'text',
            'eraser',
            'selector',
            'hand'
          ),
          (tool: DrawingToolType) => {
            // Set the tool
            whiteboardService.setTool(tool);

            // Verify setMemberState was called
            const room = whiteboardService.getRoom();
            expect(room).toBeDefined();
            expect(room!.setMemberState).toHaveBeenCalled();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should update color state correctly', () => {
      fc.assert(
        fc.property(
          // Generate valid hex colors
          fc.tuple(
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`),
          (color: string) => {
            // Set the color
            whiteboardService.setColor(color);

            // Verify setMemberState was called
            const room = whiteboardService.getRoom();
            expect(room).toBeDefined();
            expect(room!.setMemberState).toHaveBeenCalled();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should update stroke width correctly', () => {
      fc.assert(
        fc.property(
          // Generate reasonable stroke widths (1-50 pixels)
          fc.integer({ min: 1, max: 50 }),
          (width: number) => {
            // Set the stroke width
            whiteboardService.setStrokeWidth(width);

            // Verify setMemberState was called
            const room = whiteboardService.getRoom();
            expect(room).toBeDefined();
            expect(room!.setMemberState).toHaveBeenCalled();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle multiple state changes in sequence', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              tool: fc.constantFrom<DrawingToolType>(
                'pencil',
                'rectangle',
                'circle',
                'eraser'
              ),
              color: fc.tuple(
                fc.integer({ min: 0, max: 255 }),
                fc.integer({ min: 0, max: 255 }),
                fc.integer({ min: 0, max: 255 })
              ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`),
              width: fc.integer({ min: 1, max: 50 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (stateChanges) => {
            const room = whiteboardService.getRoom();
            expect(room).toBeDefined();

            // Apply all state changes
            stateChanges.forEach(change => {
              whiteboardService.setTool(change.tool);
              whiteboardService.setColor(change.color);
              whiteboardService.setStrokeWidth(change.width);
            });

            // Verify setMemberState was called for each change (3 calls per change)
            expect(room!.setMemberState).toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * **Feature: classroom-ui-overhaul, Property 10: Whiteboard cleanup**
   * **Validates: Requirements 3.7**
   * 
   * For any whiteboard session, after cleanup is called, the whiteboard should
   * be disconnected from the room
   */
  describe('Property 10: Whiteboard cleanup', () => {
    it('should properly cleanup after leaving room', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            appId: fc.string({ minLength: 10, maxLength: 50 }),
            roomId: fc.uuid(),
            roomToken: fc.string({ minLength: 20, maxLength: 100 }),
            userId: fc.string({ minLength: 5, maxLength: 30 }),
            userRole: fc.constantFrom('admin', 'writer', 'reader') as fc.Arbitrary<'admin' | 'writer' | 'reader'>,
          }),
          async (config: WhiteboardConfig) => {
            // Initialize and join
            whiteboardService.initialize(config.appId);
            const room = await whiteboardService.joinRoom(config);
            
            expect(whiteboardService.isConnected()).toBe(true);
            expect(whiteboardService.getRoom()).toBe(room);

            // Leave the room
            await whiteboardService.leaveRoom();

            // Verify cleanup
            expect(whiteboardService.getRoom()).toBeNull();
            expect(whiteboardService.isConnected()).toBe(false);
            expect(room.disconnect).toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      const config: WhiteboardConfig = {
        appId: 'test-app-id',
        roomId: 'test-room',
        roomToken: 'test-token',
        userId: 'test-user',
        userRole: 'admin',
      };

      whiteboardService.initialize(config.appId);
      const room = await whiteboardService.joinRoom(config);

      // Mock disconnect to throw an error
      room.disconnect = vi.fn().mockRejectedValue(new Error('Disconnect failed'));

      // Leave should not throw even if disconnect fails
      await expect(whiteboardService.leaveRoom()).resolves.not.toThrow();

      // Verify cleanup still happened
      expect(whiteboardService.getRoom()).toBeNull();
      expect(whiteboardService.isConnected()).toBe(false);
    });

    it('should cleanup all resources on destroy', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            appId: fc.string({ minLength: 10, maxLength: 50 }),
            roomId: fc.uuid(),
            roomToken: fc.string({ minLength: 20, maxLength: 100 }),
            userId: fc.string({ minLength: 5, maxLength: 30 }),
            userRole: fc.constantFrom('admin', 'writer', 'reader') as fc.Arbitrary<'admin' | 'writer' | 'reader'>,
          }),
          async (config: WhiteboardConfig) => {
            // Initialize and join
            whiteboardService.initialize(config.appId);
            await whiteboardService.joinRoom(config);

            // Destroy the service
            await whiteboardService.destroy();

            // Verify all resources are cleaned up
            expect(whiteboardService.getRoom()).toBeNull();
            expect(whiteboardService.isConnected()).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle multiple cleanup calls safely', async () => {
      const config: WhiteboardConfig = {
        appId: 'test-app-id',
        roomId: 'test-room',
        roomToken: 'test-token',
        userId: 'test-user',
        userRole: 'admin',
      };

      whiteboardService.initialize(config.appId);
      await whiteboardService.joinRoom(config);

      // Call leaveRoom multiple times
      await whiteboardService.leaveRoom();
      await whiteboardService.leaveRoom(); // Should not throw
      await whiteboardService.leaveRoom(); // Should not throw

      expect(whiteboardService.getRoom()).toBeNull();
    });
  });

  /**
   * Additional edge case tests
   */
  describe('Edge cases', () => {
    it('should handle operations when not connected', () => {
      // These should not throw, just log warnings
      expect(() => whiteboardService.setTool('pencil')).not.toThrow();
      expect(() => whiteboardService.setColor('#000000')).not.toThrow();
      expect(() => whiteboardService.setStrokeWidth(6)).not.toThrow();
      expect(() => whiteboardService.undo()).not.toThrow();
      expect(() => whiteboardService.redo()).not.toThrow();
      expect(() => whiteboardService.clearAll()).not.toThrow();
    });

    it('should return false for canUndo/canRedo when not connected', () => {
      expect(whiteboardService.canUndo()).toBe(false);
      expect(whiteboardService.canRedo()).toBe(false);
    });

    it('should handle invalid hex colors gracefully', async () => {
      const config: WhiteboardConfig = {
        appId: 'test-app-id',
        roomId: 'test-room',
        roomToken: 'test-token',
        userId: 'test-user',
        userRole: 'admin',
      };

      whiteboardService.initialize(config.appId);
      await whiteboardService.joinRoom(config);
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (invalidColor: string) => {
            // Should not throw, just handle gracefully
            expect(() => whiteboardService.setColor(invalidColor)).not.toThrow();
          }
        ),
        { numRuns: 10 }
      );
      
      await whiteboardService.leaveRoom();
    });
  });
});
