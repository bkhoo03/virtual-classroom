import type { PresentationMode } from '../types';

/**
 * State for each presentation mode
 */
interface PDFState {
  currentPage: number;
  zoom: number;
  scrollPosition: { x: number; y: number };
}

interface WhiteboardState {
  canUndo: boolean;
  canRedo: boolean;
}

interface ScreenShareState {
  isActive: boolean;
}

interface AIOutputState {
  scrollPosition: number;
}

/**
 * Complete mode state
 */
interface ModeState {
  mode: PresentationMode;
  previousMode: PresentationMode | null;
  pdfState?: PDFState;
  whiteboardState?: WhiteboardState;
  screenshareState?: ScreenShareState;
  aiOutputState?: AIOutputState;
}

/**
 * Options for mode switching
 */
interface ModeSwitchOptions {
  animate?: boolean;
  preserveState?: boolean;
  reason?: 'user' | 'ai-query' | 'system';
}

/**
 * PresentationModeManager
 * 
 * Manages presentation panel mode switching with state preservation and auto-switching.
 * Tracks current and previous modes, preserves state for each mode, and provides
 * smooth transitions between modes.
 */
class PresentationModeManager {
  private currentMode: PresentationMode;
  private previousMode: PresentationMode | null;
  private stateStore: Map<PresentationMode, any>;
  private modeChangeCallbacks: Array<(mode: PresentationMode) => void>;

  constructor() {
    this.currentMode = 'ai-output';
    this.previousMode = null;
    this.stateStore = new Map();
    this.modeChangeCallbacks = [];
    
    // Initialize default states
    this.initializeDefaultStates();
  }

  /**
   * Initialize default states for all modes
   */
  private initializeDefaultStates(): void {
    this.stateStore.set('pdf', {
      currentPage: 1,
      zoom: 1,
      scrollPosition: { x: 0, y: 0 }
    });
    
    this.stateStore.set('whiteboard', {
      canUndo: false,
      canRedo: false
    });
    
    this.stateStore.set('screenshare', {
      isActive: false
    });
    
    this.stateStore.set('ai-output', {
      scrollPosition: 0
    });
  }

  /**
   * Get the current presentation mode
   */
  getCurrentMode(): PresentationMode {
    return this.currentMode;
  }

  /**
   * Get the previous presentation mode
   */
  getPreviousMode(): PresentationMode | null {
    return this.previousMode;
  }

  /**
   * Switch to a new presentation mode
   */
  async switchMode(
    newMode: PresentationMode,
    options: ModeSwitchOptions = {}
  ): Promise<void> {
    const {
      animate = true,
      preserveState = true,
      reason = 'user'
    } = options;

    // Don't switch if already in the requested mode
    if (newMode === this.currentMode) {
      return;
    }

    // Update mode tracking
    this.previousMode = this.currentMode;
    this.currentMode = newMode;

    // Notify listeners
    this.notifyModeChange(newMode);

    // Log the mode change
    console.log(`[PresentationModeManager] Switched from ${this.previousMode} to ${newMode} (reason: ${reason})`);
  }

  /**
   * Auto-switch to AI output mode (typically triggered by AI query)
   */
  async autoSwitchToAIOutput(): Promise<void> {
    await this.switchMode('ai-output', {
      animate: true,
      preserveState: true,
      reason: 'ai-query'
    });
  }

  /**
   * Return to the previous mode
   */
  async returnToPreviousMode(): Promise<void> {
    if (this.previousMode) {
      const targetMode = this.previousMode;
      await this.switchMode(targetMode, {
        animate: true,
        preserveState: false, // Don't preserve current state when going back
        reason: 'user'
      });
      
      // Restore the state of the target mode
      this.restoreState(targetMode);
    }
  }

  /**
   * Preserve the current mode's state
   * Note: State preservation is handled by the specific preserve methods
   * (preservePDFState, preserveWhiteboardState, etc.)
   */
  preserveCurrentState(): void {
    // This method is kept for API compatibility but state preservation
    // is handled by the specific preserve methods
    console.log(`[PresentationModeManager] Current mode: ${this.currentMode}`);
  }

  /**
   * Preserve PDF state (page, zoom, scroll position)
   */
  preservePDFState(state: PDFState): void {
    this.stateStore.set('pdf', { ...state });
    console.log('[PresentationModeManager] Preserved PDF state', state);
  }

  /**
   * Preserve whiteboard state
   */
  preserveWhiteboardState(state: WhiteboardState): void {
    this.stateStore.set('whiteboard', { ...state });
    console.log('[PresentationModeManager] Preserved whiteboard state', state);
  }

  /**
   * Preserve screen share state
   */
  preserveScreenShareState(state: ScreenShareState): void {
    this.stateStore.set('screenshare', { ...state });
    console.log('[PresentationModeManager] Preserved screen share state', state);
  }

  /**
   * Preserve AI output state
   */
  preserveAIOutputState(state: AIOutputState): void {
    this.stateStore.set('ai-output', { ...state });
    console.log('[PresentationModeManager] Preserved AI output state', state);
  }

  /**
   * Restore state for a specific mode
   */
  restoreState(mode: PresentationMode): any {
    const state = this.stateStore.get(mode);
    if (state) {
      console.log(`[PresentationModeManager] Restoring state for ${mode}`, state);
      // Return a copy of the state to prevent mutations
      return JSON.parse(JSON.stringify(state));
    }
    return null;
  }

  /**
   * Restore PDF state
   */
  restorePDFState(): PDFState | null {
    const state = this.stateStore.get('pdf');
    if (state) {
      console.log('[PresentationModeManager] Restoring PDF state', state);
      return { ...state };
    }
    return null;
  }

  /**
   * Restore whiteboard state
   */
  restoreWhiteboardState(): WhiteboardState | null {
    const state = this.stateStore.get('whiteboard');
    if (state) {
      console.log('[PresentationModeManager] Restoring whiteboard state', state);
      return { ...state };
    }
    return null;
  }

  /**
   * Restore screen share state
   */
  restoreScreenShareState(): ScreenShareState | null {
    const state = this.stateStore.get('screenshare');
    if (state) {
      console.log('[PresentationModeManager] Restoring screen share state', state);
      return { ...state };
    }
    return null;
  }

  /**
   * Restore AI output state
   */
  restoreAIOutputState(): AIOutputState | null {
    const state = this.stateStore.get('ai-output');
    if (state) {
      console.log('[PresentationModeManager] Restoring AI output state', state);
      return { ...state };
    }
    return null;
  }

  /**
   * Update state for a specific mode
   */
  updateState(mode: PresentationMode, state: any): void {
    this.stateStore.set(mode, { ...this.stateStore.get(mode), ...state });
  }

  /**
   * Get state for a specific mode
   */
  getState(mode: PresentationMode): any {
    return this.stateStore.get(mode);
  }

  /**
   * Register a callback for mode changes
   */
  onModeChange(callback: (mode: PresentationMode) => void): () => void {
    this.modeChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.modeChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.modeChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of mode change
   */
  private notifyModeChange(mode: PresentationMode): void {
    console.log(`[PresentationModeManager] Notifying ${this.modeChangeCallbacks.length} listeners of mode change to: ${mode}`);
    this.modeChangeCallbacks.forEach(callback => {
      try {
        callback(mode);
      } catch (error) {
        console.error('[PresentationModeManager] Error in mode change callback:', error);
      }
    });
  }

  /**
   * Get the complete mode state
   */
  getModeState(): ModeState {
    return {
      mode: this.currentMode,
      previousMode: this.previousMode,
      pdfState: this.stateStore.get('pdf'),
      whiteboardState: this.stateStore.get('whiteboard'),
      screenshareState: this.stateStore.get('screenshare'),
      aiOutputState: this.stateStore.get('ai-output')
    };
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.currentMode = 'pdf';
    this.previousMode = null;
    this.initializeDefaultStates();
    this.notifyModeChange(this.currentMode);
  }
}

// Singleton instance
let instance: PresentationModeManager | null = null;

/**
 * Get the singleton instance of PresentationModeManager
 */
export function getPresentationModeManager(): PresentationModeManager {
  if (!instance) {
    instance = new PresentationModeManager();
  }
  return instance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetPresentationModeManager(): void {
  instance = null;
}

export default PresentationModeManager;
export type { ModeState, ModeSwitchOptions, PDFState, WhiteboardState, ScreenShareState, AIOutputState };
