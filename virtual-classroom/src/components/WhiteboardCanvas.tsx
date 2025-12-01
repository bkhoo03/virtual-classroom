import { useEffect, useRef, useState } from 'react';
import type { Room, RoomPhase } from 'white-web-sdk';
import whiteboardService from '../services/WhiteboardService';
import type { WhiteboardConfig } from '../types/whiteboard.types';

interface WhiteboardCanvasProps {
  config: WhiteboardConfig;
  onConnected?: (room: Room) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * WhiteboardCanvas component integrates the Agora Whiteboard SDK
 * Handles canvas mounting, unmounting, and real-time synchronization
 */
export default function WhiteboardCanvas({
  config,
  onConnected,
  onDisconnected,
  onError,
  className = '',
}: WhiteboardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [phase, setPhase] = useState<RoomPhase | 'connecting'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let room: Room | null = null;

    const initializeWhiteboard = async () => {
      if (!containerRef.current) return;

      try {
        setIsConnecting(true);
        setError(null);

        // Initialize the SDK if not already initialized
        const appId = import.meta.env.VITE_AGORA_WHITEBOARD_APP_ID;
        if (!appId) {
          throw new Error('Whiteboard App ID not configured');
        }

        whiteboardService.initialize(appId);

        // Set up phase change listener
        whiteboardService.onPhaseChange((newPhase: RoomPhase) => {
          if (mounted) {
            setPhase(newPhase);
            
            if (newPhase === 'connected') {
              setIsConnecting(false);
            } else if (newPhase === 'disconnected') {
              onDisconnected?.();
            }
          }
        });

        // Join the room
        room = await whiteboardService.joinRoom(config);

        if (!mounted) {
          // Component unmounted during connection
          await whiteboardService.leaveRoom();
          return;
        }

        // Bind the whiteboard to the container
        room.bindHtmlElement(containerRef.current);

        setIsConnecting(false);
        onConnected?.(room);

      } catch (err) {
        console.error('Failed to initialize whiteboard:', err);
        
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to connect to whiteboard';
          setError(errorMessage);
          setIsConnecting(false);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    };

    initializeWhiteboard();

    // Cleanup on unmount
    return () => {
      mounted = false;
      
      if (room) {
        whiteboardService.leaveRoom().catch(err => {
          console.error('Error leaving whiteboard room:', err);
        });
      }
    };
  }, [config, onConnected, onDisconnected, onError]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Whiteboard container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full bg-white"
        style={{
          touchAction: 'none', // Prevent default touch behaviors
          willChange: 'transform', // Optimize for animations
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />

      {/* Loading overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-gray-900 font-medium">
              {phase === 'connecting' ? 'Connecting to whiteboard...' : 'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95">
          <div className="text-center max-w-md px-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {!isConnecting && !error && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm border border-gray-200">
          <div
            className={`w-2 h-2 rounded-full ${
              phase === 'connected'
                ? 'bg-green-500 animate-pulse'
                : phase === 'reconnecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-xs font-medium text-gray-900">
            {phase === 'connected'
              ? 'Connected'
              : phase === 'reconnecting'
              ? 'Reconnecting...'
              : 'Disconnected'}
          </span>
        </div>
      )}
    </div>
  );
}
