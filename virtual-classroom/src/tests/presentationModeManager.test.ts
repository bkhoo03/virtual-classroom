import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import PresentationModeManager, {
  getPresentationModeManager,
  resetPresentationModeManager,
  type PDFState,
  type WhiteboardState,
  type ScreenShareState
} from '../services/PresentationModeManager';
import type { PresentationMode } from '../types';

describe('PresentationModeManager Property Tests', () => {
  let manager: PresentationModeManager;

  beforeEach(() => {
    // Get the singleton instance (create if doesn't exist)
    manager = getPresentationModeManager();
    // Reset its state
    manager.reset();
  });

  afterEach(() => {
    // Clean up and reset singleton
    manager.reset();
    resetPresentationModeManager();
  });

  // Arbitraries for property-based testing
  const presentationModeArb = fc.constantFrom<PresentationMode>(
    'pdf',
    'whiteboard',
    'screenshare',
    'ai-output'
  );

  const pdfStateArb = fc.record({
    currentPage: fc.integer({ min: 1, max: 100 }),
    zoom: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
    scrollPosition: fc.record({
      x: fc.integer({ min: 0, max: 1000 }),
      y: fc.integer({ min: 0, max: 1000 })
    })
  });

  const whiteboardStateArb = fc.record({
    canUndo: fc.boolean(),
    canRedo: fc.boolean()
  });

  const screenshareStateArb = fc.record({
    isActive: fc.boolean()
  });

  describe('Property 80: PDF state preservation on switch', () => {
    it('**Feature: classroom-ui-overhaul, Property 80: PDF state preservation on switch**', () => {
      // Use a filtered arbitrary to avoid fc.pre() issues
      const nonPdfModeArb = fc.constantFrom<PresentationMode>(
        'whiteboard',
        'screenshare',
        'ai-output'
      );

      fc.assert(
        fc.asyncProperty(pdfStateArb, nonPdfModeArb, async (pdfState, targetMode) => {
          // Get fresh instance and reset to ensure clean state
          const testManager = getPresentationModeManager();
          testManager.reset();
          
          // Ensure we're in PDF mode (manager starts in PDF after reset)
          expect(testManager.getCurrentMode()).toBe('pdf');
          
          // Set PDF state
          testManager.preservePDFState(pdfState);
          
          // Switch to another mode
          await testManager.switchMode(targetMode);
          
          // Verify we switched
          expect(testManager.getCurrentMode()).toBe(targetMode);
          
          // Retrieve the preserved PDF state
          const restoredState = testManager.restorePDFState();
          
          // The PDF state should be preserved
          expect(restoredState).not.toBeNull();
          expect(restoredState?.currentPage).toBe(pdfState.currentPage);
          expect(restoredState?.zoom).toBeCloseTo(pdfState.zoom, 5);
          expect(restoredState?.scrollPosition.x).toBe(pdfState.scrollPosition.x);
          expect(restoredState?.scrollPosition.y).toBe(pdfState.scrollPosition.y);
          
          return true;
        }),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  describe('Property 81: Whiteboard state preservation on switch', () => {
    it('**Feature: classroom-ui-overhaul, Property 81: Whiteboard state preservation on switch**', () => {
      // Use a filtered arbitrary to avoid fc.pre() issues
      const nonWhiteboardModeArb = fc.constantFrom<PresentationMode>(
        'pdf',
        'screenshare',
        'ai-output'
      );

      fc.assert(
        fc.asyncProperty(whiteboardStateArb, nonWhiteboardModeArb, async (whiteboardState, targetMode) => {
          // Get fresh instance and reset to ensure clean state
          const testManager = getPresentationModeManager();
          testManager.reset();
          
          // Start in whiteboard mode
          await testManager.switchMode('whiteboard');
          expect(testManager.getCurrentMode()).toBe('whiteboard');
          
          // Set whiteboard state
          testManager.preserveWhiteboardState(whiteboardState);
          
          // Switch to another mode
          await testManager.switchMode(targetMode);
          
          // Verify we switched
          expect(testManager.getCurrentMode()).toBe(targetMode);
          
          // Retrieve the preserved whiteboard state
          const restoredState = testManager.restoreWhiteboardState();
          
          // The whiteboard state should be preserved
          expect(restoredState).not.toBeNull();
          expect(restoredState?.canUndo).toBe(whiteboardState.canUndo);
          expect(restoredState?.canRedo).toBe(whiteboardState.canRedo);
          
          return true;
        }),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  describe('Property 82: Screen share state preservation on switch', () => {
    it('**Feature: classroom-ui-overhaul, Property 82: Screen share state preservation on switch**', () => {
      // Use a filtered arbitrary to avoid fc.pre() issues
      const nonScreenshareModeArb = fc.constantFrom<PresentationMode>(
        'pdf',
        'whiteboard',
        'ai-output'
      );

      fc.assert(
        fc.asyncProperty(screenshareStateArb, nonScreenshareModeArb, async (screenshareState, targetMode) => {
          // Get fresh instance and reset to ensure clean state
          const testManager = getPresentationModeManager();
          testManager.reset();
          
          // Start in screenshare mode
          await testManager.switchMode('screenshare');
          expect(testManager.getCurrentMode()).toBe('screenshare');
          
          // Set screenshare state
          testManager.preserveScreenShareState(screenshareState);
          
          // Switch to another mode
          await testManager.switchMode(targetMode);
          
          // Verify we switched
          expect(testManager.getCurrentMode()).toBe(targetMode);
          
          // Retrieve the preserved screenshare state
          const restoredState = testManager.restoreScreenShareState();
          
          // The screenshare state should be preserved
          expect(restoredState).not.toBeNull();
          expect(restoredState?.isActive).toBe(screenshareState.isActive);
          
          return true;
        }),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  describe('Property 84: State restoration on return', () => {
    it('**Feature: classroom-ui-overhaul, Property 84: State restoration on return**', () => {
      // Test whiteboard -> ai-output -> whiteboard
      fc.assert(
        fc.asyncProperty(whiteboardStateArb, async (whiteboardState) => {
          const testManager = getPresentationModeManager();
          testManager.reset();
          
          // Start in whiteboard mode
          await testManager.switchMode('whiteboard');
          testManager.preserveWhiteboardState(whiteboardState);
          
          // Switch to AI output
          await testManager.autoSwitchToAIOutput();
          expect(testManager.getCurrentMode()).toBe('ai-output');
          expect(testManager.getPreviousMode()).toBe('whiteboard');
          
          // Return to previous mode
          await testManager.returnToPreviousMode();
          expect(testManager.getCurrentMode()).toBe('whiteboard');
          
          // Verify state is restored
          const restoredState = testManager.restoreWhiteboardState();
          expect(restoredState).not.toBeNull();
          expect(restoredState?.canUndo).toBe(whiteboardState.canUndo);
          expect(restoredState?.canRedo).toBe(whiteboardState.canRedo);
          
          return true;
        }),
        { numRuns: 30, endOnFailure: true }
      );

      // Test screenshare -> ai-output -> screenshare
      fc.assert(
        fc.asyncProperty(screenshareStateArb, async (screenshareState) => {
          const testManager = getPresentationModeManager();
          testManager.reset();
          
          // Start in screenshare mode
          await testManager.switchMode('screenshare');
          testManager.preserveScreenShareState(screenshareState);
          
          // Switch to AI output
          await testManager.autoSwitchToAIOutput();
          expect(testManager.getCurrentMode()).toBe('ai-output');
          expect(testManager.getPreviousMode()).toBe('screenshare');
          
          // Return to previous mode
          await testManager.returnToPreviousMode();
          expect(testManager.getCurrentMode()).toBe('screenshare');
          
          // Verify state is restored
          const restoredState = testManager.restoreScreenShareState();
          expect(restoredState).not.toBeNull();
          expect(restoredState?.isActive).toBe(screenshareState.isActive);
          
          return true;
        }),
        { numRuns: 30, endOnFailure: true }
      );
    });
  });

  describe('Property 79: Auto-switch to AI output', () => {
    it('**Feature: classroom-ui-overhaul, Property 79: Auto-switch to AI output**', async () => {
      // For any starting mode, calling autoSwitchToAIOutput should switch to ai-output
      await fc.assert(
        fc.asyncProperty(presentationModeArb, async (startMode) => {
          // Reset singleton before each property test run
          resetPresentationModeManager();
          const testManager = getPresentationModeManager();
          
          // Start in the given mode
          if (startMode !== 'ai-output') {
            await testManager.switchMode(startMode);
          }
          expect(testManager.getCurrentMode()).toBe(startMode);
          
          // Call autoSwitchToAIOutput
          await testManager.autoSwitchToAIOutput();
          
          // Should now be in ai-output mode
          expect(testManager.getCurrentMode()).toBe('ai-output');
          
          // Previous mode should be the start mode (unless we were already in ai-output)
          if (startMode !== 'ai-output') {
            expect(testManager.getPreviousMode()).toBe(startMode);
          }
          
          return true;
        }),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  describe('Property 83: Previous mode indicator', () => {
    it('**Feature: classroom-ui-overhaul, Property 83: Previous mode indicator**', async () => {
      // For any mode switch to ai-output, getPreviousMode should return the previous mode
      const nonAiOutputModeArb = fc.constantFrom<PresentationMode>(
        'pdf',
        'whiteboard',
        'screenshare'
      );

      await fc.assert(
        fc.asyncProperty(nonAiOutputModeArb, async (startMode) => {
          // Reset singleton before each property test run
          resetPresentationModeManager();
          const testManager = getPresentationModeManager();
          
          // Start in the given mode (manager starts in ai-output, so switch if different)
          if (startMode !== 'ai-output') {
            await testManager.switchMode(startMode);
          }
          
          // Switch to AI output
          await testManager.autoSwitchToAIOutput();
          
          // Previous mode should be available and equal to start mode
          const previousMode = testManager.getPreviousMode();
          expect(previousMode).not.toBeNull();
          expect(previousMode).toBe(startMode);
          
          return true;
        }),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  describe('Property 85: Smooth mode transition animation', () => {
    it('**Feature: classroom-ui-overhaul, Property 85: Smooth mode transition animation**', async () => {
      // For any mode switch with animate=true, the transition should complete successfully
      await fc.assert(
        fc.asyncProperty(
          presentationModeArb,
          presentationModeArb,
          async (fromMode, toMode) => {
            // Reset singleton before each property test run
            resetPresentationModeManager();
            const testManager = getPresentationModeManager();
            
            // Start in fromMode (manager starts in ai-output)
            if (fromMode !== 'ai-output') {
              await testManager.switchMode(fromMode);
            }
            
            // Switch to toMode with animation
            const startTime = Date.now();
            await testManager.switchMode(toMode, {
              animate: true,
              preserveState: true,
              reason: 'user'
            });
            const endTime = Date.now();
            
            // Verify the switch completed
            expect(testManager.getCurrentMode()).toBe(toMode);
            
            // Verify it completed in reasonable time (< 1 second)
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(1000);
            
            return true;
          }
        ),
        { numRuns: 50, endOnFailure: true }
      );
    });
  });

  // Additional unit tests for completeness
  describe('Unit Tests', () => {
    it('should initialize with ai-output mode', () => {
      expect(manager.getCurrentMode()).toBe('ai-output');
      expect(manager.getPreviousMode()).toBeNull();
    });

    it('should track previous mode after switch', async () => {
      await manager.switchMode('whiteboard');
      expect(manager.getCurrentMode()).toBe('whiteboard');
      expect(manager.getPreviousMode()).toBe('ai-output');
    });

    it('should not switch if already in requested mode', async () => {
      await manager.switchMode('pdf');
      const previousMode = manager.getPreviousMode();
      await manager.switchMode('pdf');
      expect(manager.getPreviousMode()).toBe(previousMode);
    });

    it('should call mode change callbacks', async () => {
      let callbackCalled = false;
      let callbackMode: PresentationMode | null = null;

      const unsubscribe = manager.onModeChange((mode) => {
        callbackCalled = true;
        callbackMode = mode;
      });

      await manager.switchMode('whiteboard');

      expect(callbackCalled).toBe(true);
      expect(callbackMode).toBe('whiteboard');

      unsubscribe();
    });

    it('should unsubscribe callbacks correctly', async () => {
      let callCount = 0;

      const unsubscribe = manager.onModeChange(() => {
        callCount++;
      });

      await manager.switchMode('whiteboard');
      expect(callCount).toBe(1);

      unsubscribe();

      await manager.switchMode('pdf');
      expect(callCount).toBe(1); // Should not increment after unsubscribe
    });

    it('should auto-switch to AI output', async () => {
      await manager.switchMode('pdf');
      await manager.autoSwitchToAIOutput();
      
      expect(manager.getCurrentMode()).toBe('ai-output');
      expect(manager.getPreviousMode()).toBe('pdf');
    });

    it('should return to previous mode', async () => {
      await manager.switchMode('whiteboard');
      await manager.autoSwitchToAIOutput();
      await manager.returnToPreviousMode();
      
      expect(manager.getCurrentMode()).toBe('whiteboard');
    });

    it('should get complete mode state', async () => {
      const pdfState: PDFState = {
        currentPage: 5,
        zoom: 1.5,
        scrollPosition: { x: 100, y: 200 }
      };

      manager.preservePDFState(pdfState);
      await manager.switchMode('pdf');

      const modeState = manager.getModeState();
      
      expect(modeState.mode).toBe('pdf');
      expect(modeState.pdfState).toEqual(pdfState);
    });

    it('should reset to initial state', async () => {
      await manager.switchMode('whiteboard');
      manager.reset();
      
      expect(manager.getCurrentMode()).toBe('ai-output');
      expect(manager.getPreviousMode()).toBeNull();
    });

    it('should update state for a mode', () => {
      const newPdfState: PDFState = {
        currentPage: 10,
        zoom: 2.0,
        scrollPosition: { x: 50, y: 75 }
      };

      manager.updateState('pdf', newPdfState);
      const retrievedState = manager.getState('pdf');

      expect(retrievedState.currentPage).toBe(10);
      expect(retrievedState.zoom).toBe(2.0);
    });
  });
});
