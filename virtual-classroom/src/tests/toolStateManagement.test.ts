/**
 * Unit tests for tool state management and switching
 * Tests tool selection, property updates, and tool-specific behaviors
 * Requirements: 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';

type AnnotationTool = 'hand' | 'laser' | 'pen' | 'highlighter' | 'eraser';

interface ToolState {
  currentTool: AnnotationTool;
  color: string;
  strokeWidth: number;
}

/**
 * Tool state manager for testing
 * Mimics the logic used in annotation components
 */
class ToolStateManager {
  private state: ToolState;

  constructor() {
    this.state = {
      currentTool: 'hand',
      color: '#000000',
      strokeWidth: 2,
    };
  }

  setTool(tool: AnnotationTool): void {
    this.state.currentTool = tool;
  }

  setColor(color: string): void {
    this.state.color = color;
  }

  setStrokeWidth(width: number): void {
    this.state.strokeWidth = width;
  }

  getState(): ToolState {
    return { ...this.state };
  }

  isDrawingTool(): boolean {
    return ['pen', 'highlighter', 'eraser'].includes(this.state.currentTool);
  }

  shouldShowColorPicker(): boolean {
    return ['pen', 'highlighter'].includes(this.state.currentTool);
  }

  shouldShowStrokeWidth(): boolean {
    return ['pen', 'highlighter'].includes(this.state.currentTool);
  }

  getEffectiveStrokeWidth(): number {
    if (this.state.currentTool === 'highlighter') {
      return this.state.strokeWidth * 3;
    }
    return this.state.strokeWidth;
  }

  getOpacity(): number {
    if (this.state.currentTool === 'highlighter') {
      return 0.3;
    }
    return 1.0;
  }

  getCursor(): string {
    switch (this.state.currentTool) {
      case 'hand':
        return 'grab';
      case 'laser':
        return 'none';
      case 'pen':
        return 'crosshair';
      case 'highlighter':
        return 'crosshair';
      case 'eraser':
        return 'crosshair';
      default:
        return 'default';
    }
  }
}

describe('Tool State Management', () => {
  let toolManager: ToolStateManager;

  beforeEach(() => {
    toolManager = new ToolStateManager();
  });

  describe('Tool Selection', () => {
    it('should initialize with hand tool', () => {
      const state = toolManager.getState();
      expect(state.currentTool).toBe('hand');
    });

    it('should switch to pen tool', () => {
      toolManager.setTool('pen');
      expect(toolManager.getState().currentTool).toBe('pen');
    });

    it('should switch to highlighter tool', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.getState().currentTool).toBe('highlighter');
    });

    it('should switch to eraser tool', () => {
      toolManager.setTool('eraser');
      expect(toolManager.getState().currentTool).toBe('eraser');
    });

    it('should switch to laser tool', () => {
      toolManager.setTool('laser');
      expect(toolManager.getState().currentTool).toBe('laser');
    });

    it('should switch between tools multiple times', () => {
      toolManager.setTool('pen');
      expect(toolManager.getState().currentTool).toBe('pen');

      toolManager.setTool('highlighter');
      expect(toolManager.getState().currentTool).toBe('highlighter');

      toolManager.setTool('hand');
      expect(toolManager.getState().currentTool).toBe('hand');
    });
  });

  describe('Color Management', () => {
    it('should initialize with black color', () => {
      expect(toolManager.getState().color).toBe('#000000');
    });

    it('should update color', () => {
      toolManager.setColor('#FF0000');
      expect(toolManager.getState().color).toBe('#FF0000');
    });

    it('should preserve color when switching tools', () => {
      toolManager.setColor('#00FF00');
      toolManager.setTool('pen');
      expect(toolManager.getState().color).toBe('#00FF00');

      toolManager.setTool('highlighter');
      expect(toolManager.getState().color).toBe('#00FF00');
    });

    it('should handle various color formats', () => {
      toolManager.setColor('#ABCDEF');
      expect(toolManager.getState().color).toBe('#ABCDEF');

      toolManager.setColor('#123');
      expect(toolManager.getState().color).toBe('#123');
    });
  });

  describe('Stroke Width Management', () => {
    it('should initialize with default stroke width', () => {
      expect(toolManager.getState().strokeWidth).toBe(2);
    });

    it('should update stroke width', () => {
      toolManager.setStrokeWidth(5);
      expect(toolManager.getState().strokeWidth).toBe(5);
    });

    it('should preserve stroke width when switching tools', () => {
      toolManager.setStrokeWidth(8);
      toolManager.setTool('pen');
      expect(toolManager.getState().strokeWidth).toBe(8);

      toolManager.setTool('highlighter');
      expect(toolManager.getState().strokeWidth).toBe(8);
    });

    it('should handle various stroke widths', () => {
      toolManager.setStrokeWidth(1);
      expect(toolManager.getState().strokeWidth).toBe(1);

      toolManager.setStrokeWidth(10);
      expect(toolManager.getState().strokeWidth).toBe(10);
    });
  });

  describe('Drawing Tool Detection', () => {
    it('should identify pen as drawing tool', () => {
      toolManager.setTool('pen');
      expect(toolManager.isDrawingTool()).toBe(true);
    });

    it('should identify highlighter as drawing tool', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.isDrawingTool()).toBe(true);
    });

    it('should identify eraser as drawing tool', () => {
      toolManager.setTool('eraser');
      expect(toolManager.isDrawingTool()).toBe(true);
    });

    it('should identify hand as non-drawing tool', () => {
      toolManager.setTool('hand');
      expect(toolManager.isDrawingTool()).toBe(false);
    });

    it('should identify laser as non-drawing tool', () => {
      toolManager.setTool('laser');
      expect(toolManager.isDrawingTool()).toBe(false);
    });
  });

  describe('UI Control Visibility', () => {
    it('should show color picker for pen', () => {
      toolManager.setTool('pen');
      expect(toolManager.shouldShowColorPicker()).toBe(true);
    });

    it('should show color picker for highlighter', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.shouldShowColorPicker()).toBe(true);
    });

    it('should hide color picker for eraser', () => {
      toolManager.setTool('eraser');
      expect(toolManager.shouldShowColorPicker()).toBe(false);
    });

    it('should hide color picker for hand', () => {
      toolManager.setTool('hand');
      expect(toolManager.shouldShowColorPicker()).toBe(false);
    });

    it('should hide color picker for laser', () => {
      toolManager.setTool('laser');
      expect(toolManager.shouldShowColorPicker()).toBe(false);
    });

    it('should show stroke width for pen', () => {
      toolManager.setTool('pen');
      expect(toolManager.shouldShowStrokeWidth()).toBe(true);
    });

    it('should show stroke width for highlighter', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.shouldShowStrokeWidth()).toBe(true);
    });

    it('should hide stroke width for eraser', () => {
      toolManager.setTool('eraser');
      expect(toolManager.shouldShowStrokeWidth()).toBe(false);
    });
  });

  describe('Tool-Specific Behaviors', () => {
    it('should return base stroke width for pen', () => {
      toolManager.setTool('pen');
      toolManager.setStrokeWidth(4);
      expect(toolManager.getEffectiveStrokeWidth()).toBe(4);
    });

    it('should return 3x stroke width for highlighter', () => {
      toolManager.setTool('highlighter');
      toolManager.setStrokeWidth(4);
      expect(toolManager.getEffectiveStrokeWidth()).toBe(12);
    });

    it('should return full opacity for pen', () => {
      toolManager.setTool('pen');
      expect(toolManager.getOpacity()).toBe(1.0);
    });

    it('should return 30% opacity for highlighter', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.getOpacity()).toBe(0.3);
    });

    it('should return full opacity for eraser', () => {
      toolManager.setTool('eraser');
      expect(toolManager.getOpacity()).toBe(1.0);
    });
  });

  describe('Cursor Styles', () => {
    it('should return grab cursor for hand tool', () => {
      toolManager.setTool('hand');
      expect(toolManager.getCursor()).toBe('grab');
    });

    it('should return none cursor for laser tool', () => {
      toolManager.setTool('laser');
      expect(toolManager.getCursor()).toBe('none');
    });

    it('should return crosshair cursor for pen tool', () => {
      toolManager.setTool('pen');
      expect(toolManager.getCursor()).toBe('crosshair');
    });

    it('should return crosshair cursor for highlighter tool', () => {
      toolManager.setTool('highlighter');
      expect(toolManager.getCursor()).toBe('crosshair');
    });

    it('should return crosshair cursor for eraser tool', () => {
      toolManager.setTool('eraser');
      expect(toolManager.getCursor()).toBe('crosshair');
    });
  });

  describe('State Immutability', () => {
    it('should return a copy of state, not reference', () => {
      const state1 = toolManager.getState();
      const state2 = toolManager.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it('should not allow external modification of state', () => {
      const state = toolManager.getState();
      state.currentTool = 'pen';

      expect(toolManager.getState().currentTool).toBe('hand');
    });
  });

  describe('Complex Tool Switching Scenarios', () => {
    it('should maintain properties through multiple tool switches', () => {
      toolManager.setColor('#FF0000');
      toolManager.setStrokeWidth(5);

      toolManager.setTool('pen');
      expect(toolManager.getState().color).toBe('#FF0000');
      expect(toolManager.getState().strokeWidth).toBe(5);

      toolManager.setTool('hand');
      expect(toolManager.getState().color).toBe('#FF0000');
      expect(toolManager.getState().strokeWidth).toBe(5);

      toolManager.setTool('highlighter');
      expect(toolManager.getState().color).toBe('#FF0000');
      expect(toolManager.getState().strokeWidth).toBe(5);
    });

    it('should handle rapid tool switching', () => {
      const tools: AnnotationTool[] = ['pen', 'highlighter', 'eraser', 'hand', 'laser'];

      tools.forEach((tool) => {
        toolManager.setTool(tool);
        expect(toolManager.getState().currentTool).toBe(tool);
      });
    });

    it('should handle property updates during tool switches', () => {
      toolManager.setTool('pen');
      toolManager.setColor('#FF0000');

      toolManager.setTool('highlighter');
      toolManager.setStrokeWidth(6);

      toolManager.setTool('pen');
      expect(toolManager.getState().color).toBe('#FF0000');
      expect(toolManager.getState().strokeWidth).toBe(6);
    });
  });
});
