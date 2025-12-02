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

    if (!appId) {
      throw new Error('Whiteboard App ID is required');
    }

    try {
      this.whiteWebSdk = new WhiteWebSdk.WhiteWebSdk({
        appIdentifier: appId,
        region: 'us-sv', // US region - change to 'cn-hz' for China, 'sg' for Singapore, 'in-mum' for India
        deviceType: 'desktop' as any,
        // Performance optimizations
        renderEngine: 'canvas' as any, // Use canvas for better performance
        // Enable debug mode in development
        loggerOptions: {
          reportDebugLogMode: (import.meta.env.DEV ? 'alwaysReport' : 'banReport') as any,
          reportQualityMode: (import.meta.env.DEV ? 'alwaysReport' : 'banReport') as any,
        },
        // Optimize rendering
        useMobXState: true, // Enable MobX for better state management
      });
      console.log('Whiteboard SDK initialized successfully with App ID:', appId);
    } catch (error) {
      console.error('Failed to initialize Whiteboard SDK:', error);
      throw new Error(`Failed to initialize Whiteboard SDK: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Join a whiteboard room
   */
  async joinRoom(config: WhiteboardConfig): Promise<Room> {
    if (!this.whiteWebSdk) {
      throw new Error('Whiteboard SDK not initialized. Call initialize() first.');
    }

    if (!config.roomId || !config.roomToken) {
      throw new Error('Room ID and room token are required');
    }

    if (this.room) {
      console.warn('Already in a room. Leaving current room first.');
      await this.leaveRoom();
    }

    try {
      this.config = config;

      console.log('🎨 [WhiteboardService] Joining whiteboard room:', {
        roomId: config.roomId,
        userId: config.userId,
        userRole: config.userRole
      });

      // Join the room with the provided configuration
      const room = await this.whiteWebSdk.joinRoom({
        uuid: config.roomId,
        roomToken: config.roomToken,
        uid: config.userId,
        // Set user role permissions
        isWritable: config.userRole === 'admin' || config.userRole === 'writer',
        disableNewPencil: false,
        floatBar: false, // Disable default toolbar, we'll use custom UI
        // Performance optimizations
        disableBezier: false, // Keep bezier curves for smooth drawing
        disableEraseImage: false,
        // Optimize rendering
        cameraBound: {
          damping: 0.5, // Smooth camera movement
        },
        // Reduce network traffic
        invisiblePlugins: [], // No invisible plugins needed
        wrappedComponents: [], // No wrapped components needed
      });

      this.room = room;

      // Set up event listeners
      this.setupEventListeners();

      console.log('✅ [WhiteboardService] Successfully joined whiteboard room:', config.roomId);
      console.log('✅ [WhiteboardService] Room phase:', room.phase);
      return room;
    } catch (error) {
      console.error('Failed to join whiteboard room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to join whiteboard room: ${errorMessage}`);
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
      console.log('Leaving whiteboard room...');
      
      // Disconnect from the room
      await this.room.disconnect();
      
      // Clear references
      this.room = null;
      this.config = null;
      
      // Clear callbacks
      this.onStateChangeCallback = null;
      this.onPhaseChangeCallback = null;
      
      console.log('Left whiteboard room successfully');
    } catch (error) {
      console.error('Error leaving whiteboard room:', error);
      
      // Force cleanup even if disconnect fails
      this.room = null;
      this.config = null;
      this.onStateChangeCallback = null;
      this.onPhaseChangeCallback = null;
      
      // Don't throw - we want cleanup to succeed even if disconnect fails
      console.warn('Forced whiteboard cleanup after disconnect error');
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
      switch (toolType) {
        case 'pencil':
          this.room.setMemberState({
            currentApplianceName: 'pencil' as any,
          });
          break;
        case 'rectangle':
          this.room.setMemberState({
            currentApplianceName: 'rectangle' as any,
          });
          break;
        case 'circle':
          this.room.setMemberState({
            currentApplianceName: 'ellipse' as any,
          });
          break;
        case 'line':
          this.room.setMemberState({
            currentApplianceName: 'straight' as any,
          });
          break;
        case 'text':
          this.room.setMemberState({
            currentApplianceName: 'text' as any,
          });
          break;
        case 'eraser':
          this.room.setMemberState({
            currentApplianceName: 'eraser' as any,
          });
          break;
        case 'selector':
          this.room.setMemberState({
            currentApplianceName: 'selector' as any,
          });
          break;
        case 'hand':
          this.room.setMemberState({
            currentApplianceName: 'hand' as any,
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
      const preview = await (this.room as any).screenshotToCanvas(
        scene.scenePath,
        scene.index,
        1920, // width
        1080, // height
        'image/png'
      );

      // Convert canvas to data URL
      return (preview as HTMLCanvasElement).toDataURL('image/png');
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
    this.room.callbacks.on('onRoomStateChanged', () => {
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
   * Insert a converted document into the whiteboard
   * Supports both static (images) and dynamic (interactive) documents
   */
  async insertDocument(
    taskUuid: string,
    taskProgress: {
      prefix: string;
      totalPageSize: number;
      images: Array<{
        name: string;
        width: number;
        height: number;
        url: string;
      }>;
    },
    type: 'static' | 'dynamic'
  ): Promise<void> {
    if (!this.room) {
      throw new Error('No active room');
    }

    try {
      console.log('Inserting document into whiteboard:', { taskUuid, type, pageCount: taskProgress.totalPageSize });

      if (type === 'static') {
        // For static documents, insert images as scenes
        const scenes = taskProgress.images.map((image, index) => ({
          name: `${index + 1}`,
          ppt: {
            src: image.url,
            width: image.width,
            height: image.height,
            previewURL: image.url, // Add preview URL for better loading
          },
        }));

        // Create a new scene directory for the document
        const scenePath = `/document_${taskUuid}`;
        
        console.log('Creating scenes:', scenes);
        console.log('Scene path:', scenePath);
        
        // Put scenes into the whiteboard
        this.room.putScenes(scenePath, scenes);
        
        // Switch to the first page of the document
        this.room.setScenePath(`${scenePath}/1`);
        
        console.log('Static document inserted successfully');
      } else {
        // For dynamic documents (PPT with animations)
        // The conversion service provides a projector URL
        // We need to use the whiteboard's insertPlugin method
        console.warn('Dynamic document insertion not yet implemented');
        // TODO: Implement dynamic document insertion using projector plugin
      }
    } catch (error) {
      console.error('Error inserting document:', error);
      throw error;
    }
  }

  /**
   * Navigate to a specific page in the current document
   */
  goToPage(pageNumber: number): void {
    if (!this.room) {
      console.warn('No active room');
      return;
    }

    try {
      const currentPath = this.room.state.sceneState.scenePath;
      const pathParts = currentPath.split('/');
      
      // Replace the last part (page number) with the new page number
      pathParts[pathParts.length - 1] = pageNumber.toString();
      const newPath = pathParts.join('/');
      
      this.room.setScenePath(newPath);
    } catch (error) {
      console.error('Error navigating to page:', error);
    }
  }

  /**
   * Get the current page number
   */
  getCurrentPage(): number {
    if (!this.room) return 1;

    try {
      const currentPath = this.room.state.sceneState.scenePath;
      const pathParts = currentPath.split('/');
      const pageStr = pathParts[pathParts.length - 1];
      return parseInt(pageStr, 10) || 1;
    } catch (error) {
      console.error('Error getting current page:', error);
      return 1;
    }
  }

  /**
   * Get the total number of pages in the current document
   */
  getTotalPages(): number {
    if (!this.room) return 0;

    try {
      const scenes = this.room.state.sceneState.scenes;
      return scenes.length;
    } catch (error) {
      console.error('Error getting total pages:', error);
      return 0;
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    console.log('Destroying whiteboard service...');
    
    try {
      if (this.room) {
        await this.leaveRoom();
      }
    } catch (error) {
      console.error('Error during whiteboard destroy:', error);
    }
    
    // Clear all references
    this.whiteWebSdk = null;
    this.room = null;
    this.config = null;
    this.onStateChangeCallback = null;
    this.onPhaseChangeCallback = null;
    
    console.log('Whiteboard service destroyed');
  }
}

// Export singleton instance
export const whiteboardService = new WhiteboardService();
export default whiteboardService;
