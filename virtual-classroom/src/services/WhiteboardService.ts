import * as WhiteWebSdk from 'white-web-sdk';
import type { Room, RoomState, RoomPhase } from 'white-web-sdk';
import type { WhiteboardConfig, DrawingToolType } from '../types/whiteboard.types';

/**
 * WhiteboardService manages the Agora Interactive Whiteboard SDK lifecycle
 * Handles room creation, joining, and whiteboard operations
 */
class WhiteboardService {
  private whiteWebSdk: any | null = null;
  private room: Room | null = null;
  private config: WhiteboardConfig | null = null;
  private onStateChangeCallback: ((state: RoomState) => void) | null = null;
  private onPhaseChangeCallback: ((phase: RoomPhase) => void) | null = null;

  /**
   * Initialize the Whiteboard SDK
   */
  initialize(appId: string): void {
    if (this.whiteWebSdk) {
      console.warn('WhiteboardService already initialized');
      return;
    }

    try {
      this.whiteWebSdk = new WhiteWebSdk.WhiteWebSdk({
        appIdentifier: appId,
        region: 'cn-hz', // China region, adjust based on your deployment
        deviceType: 'desktop',
        // Enable debug mode in development
        loggerOptions: {
          reportDebugLogMode: import.meta.env.DEV ? 'alwaysReport' : 'banReport',
          reportQualityMode: import.meta.env.DEV ? 'alwaysReport' : 'banReport',
        },
      });
      console.log('Whiteboard SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Whiteboard SDK:', error);
      throw error;
    }
  }

  /**
   * Join a whiteboard room
   */
  async joinRoom(config: WhiteboardConfig): Promise<Room> {
    if (!this.whiteWebSdk) {
      throw new Error('Whiteboard SDK not initialized. Call initialize() first.');
    }

    if (this.room) {
      console.warn('Already in a room. Leaving current room first.');
      await this.leaveRoom();
    }

    try {
      this.config = config;

      // Join the room with the provided configuration
      const room = await this.whiteWebSdk.joinRoom({
        uuid: config.roomId,
        roomToken: config.roomToken,
        uid: config.userId,
        // Set user role permissions
        isWritable: config.userRole === 'admin' || config.userRole === 'writer',
        disableNewPencil: false,
        floatBar: false, // Disable default toolbar, we'll use custom UI
      });

      this.room = room;

      // Set up event listeners
      this.setupEventListeners();

      console.log('Successfully joined whiteboard room:', config.roomId);
      return room;
    } catch (error) {
      console.error('Failed to join whiteboard room:', error);
      throw error;
    }
  }

  /**
   * Leave the current whiteboard room
   */
  async leaveRoom(): Promise<void> {
    if (!this.room) {
      console.warn('No active room to leave');
      return;
    }

    try {
      await this.room.disconnect();
      this.room = null;
      this.config = null;
      console.log('Left whiteboard room successfully');
    } catch (error) {
      console.error('Error leaving whiteboard room:', error);
      throw error;
    }
  }

  /**
   * Get the current room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Check if currently connected to a room
   */
  isConnected(): boolean {
    return this.room !== null && this.room.phase === 'connected';
  }

  /**
   * Set the current drawing tool
   */
  setTool(toolType: DrawingToolType): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      const memberState = this.room.state.memberState;

      switch (toolType) {
        case 'pencil':
          this.room.setMemberState({
            currentApplianceName: 'pencil',
          });
          break;
        case 'rectangle':
          this.room.setMemberState({
            currentApplianceName: 'rectangle',
          });
          break;
        case 'circle':
          this.room.setMemberState({
            currentApplianceName: 'ellipse',
          });
          break;
        case 'line':
          this.room.setMemberState({
            currentApplianceName: 'straight',
          });
          break;
        case 'text':
          this.room.setMemberState({
            currentApplianceName: 'text',
          });
          break;
        case 'eraser':
          this.room.setMemberState({
            currentApplianceName: 'eraser',
          });
          break;
        case 'selector':
          this.room.setMemberState({
            currentApplianceName: 'selector',
          });
          break;
        case 'hand':
          this.room.setMemberState({
            currentApplianceName: 'hand',
          });
          break;
        default:
          console.warn('Unknown tool type:', toolType);
      }
    } catch (error) {
      console.error('Error setting tool:', error);
    }
  }

  /**
   * Set the stroke color
   */
  setColor(color: string): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      // Convert hex color to RGB array [r, g, b]
      const rgb = this.hexToRgb(color);
      if (rgb) {
        this.room.setMemberState({
          strokeColor: rgb,
        });
      }
    } catch (error) {
      console.error('Error setting color:', error);
    }
  }

  /**
   * Set the stroke width
   */
  setStrokeWidth(width: number): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      this.room.setMemberState({
        strokeWidth: width,
      });
    } catch (error) {
      console.error('Error setting stroke width:', error);
    }
  }

  /**
   * Undo the last action
   */
  undo(): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      this.room.undo();
    } catch (error) {
      console.error('Error undoing:', error);
    }
  }

  /**
   * Redo the last undone action
   */
  redo(): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      this.room.redo();
    } catch (error) {
      console.error('Error redoing:', error);
    }
  }

  /**
   * Clear all content from the current scene
   */
  clearAll(): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      this.room.cleanCurrentScene();
    } catch (error) {
      console.error('Error clearing whiteboard:', error);
    }
  }

  /**
   * Get the number of undo steps available
   */
  canUndo(): boolean {
    if (!this.room) return false;
    return this.room.canUndoSteps > 0;
  }

  /**
   * Get the number of redo steps available
   */
  canRedo(): boolean {
    if (!this.room) return false;
    return this.room.canRedoSteps > 0;
  }

  /**
   * Export the current scene as an image
   */
  async exportImage(): Promise<string> {
    if (!this.room) {
      throw new Error('No active room');
    }

    try {
      // Get the current scene
      const scene = this.room.state.sceneState;
      
      // Generate preview of the current scene
      const preview = await this.room.screenshotToCanvas(
        scene.scenePath,
        scene.index,
        1920, // width
        1080  // height
      );

      // Convert canvas to data URL
      return preview.toDataURL('image/png');
    } catch (error) {
      console.error('Error exporting whiteboard image:', error);
      throw error;
    }
  }

  /**
   * Register callback for room state changes
   */
  onStateChange(callback: (state: RoomState) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Register callback for room phase changes
   */
  onPhaseChange(callback: (phase: RoomPhase) => void): void {
    this.onPhaseChangeCallback = callback;
  }

  /**
   * Set up event listeners for the room
   */
  private setupEventListeners(): void {
    if (!this.room) return;

    // Listen for room state changes
    this.room.callbacks.on('onRoomStateChanged', (state: Partial<RoomState>) => {
      if (this.onStateChangeCallback && this.room) {
        this.onStateChangeCallback(this.room.state);
      }
    });

    // Listen for phase changes (connecting, connected, disconnected, etc.)
    this.room.callbacks.on('onPhaseChanged', (phase: RoomPhase) => {
      console.log('Whiteboard room phase changed:', phase);
      if (this.onPhaseChangeCallback) {
        this.onPhaseChangeCallback(phase);
      }
    });

    // Listen for disconnection
    this.room.callbacks.on('onDisconnectWithError', (error: Error) => {
      console.error('Whiteboard disconnected with error:', error);
    });

    // Listen for kick events
    this.room.callbacks.on('onKickedWithReason', (reason: string) => {
      console.warn('Kicked from whiteboard room:', reason);
    });
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: string): [number, number, number] | null {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.error('Invalid hex color:', hex);
      return null;
    }

    return [r, g, b];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.room) {
      this.leaveRoom();
    }
    this.whiteWebSdk = null;
    this.onStateChangeCallback = null;
    this.onPhaseChangeCallback = null;
  }
}

// Export singleton instance
export const whiteboardService = new WhiteboardService();
export default whiteboardService;
