import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import TabButton from '../components/TabButton';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ClassroomLayoutProps {
  chatPanel: ReactNode;
  aiOutputPanel: ReactNode;
  videoModule: ReactNode;
  presentationPanel: ReactNode;
  whiteboardPanel: ReactNode;
}

type TabType = 'ai-output' | 'presentation' | 'whiteboard';

export default function ClassroomLayout({
  chatPanel,
  aiOutputPanel,
  videoModule,
  presentationPanel,
  whiteboardPanel,
}: ClassroomLayoutProps) {
  // Load initial width from localStorage or default to 45%
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('classroom-left-panel-width');
    return saved ? parseFloat(saved) : 45;
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('ai-output');
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts for tab navigation (Ctrl+1, Ctrl+2, Ctrl+3)
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '1',
        ctrlKey: true,
        action: () => setActiveTab('ai-output'),
        description: 'Switch to AI Output tab',
      },
      {
        key: '2',
        ctrlKey: true,
        action: () => setActiveTab('presentation'),
        description: 'Switch to Presentation tab',
      },
      {
        key: '3',
        ctrlKey: true,
        action: () => setActiveTab('whiteboard'),
        description: 'Switch to Whiteboard tab',
      },
    ],
    enabled: true,
  });

  // Persist panel width to localStorage
  useEffect(() => {
    localStorage.setItem('classroom-left-panel-width', leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain width between 30% and 60%
      const constrainedWidth = Math.min(Math.max(newWidth, 30), 60);
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Prevent text selection during resize
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, [isResizing]);

  return (
    <div className="min-h-screen bg-white">
      <div ref={containerRef} className="h-screen flex">
        {/* Left Panel - Video & Chat (Resizable) */}
        <aside 
          className="flex flex-col border-r border-gray-200 transition-all"
          style={{ 
            width: `${leftPanelWidth}%`,
            transitionProperty: isResizing ? 'none' : 'width',
            transitionDuration: '300ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Video and chat panel"
        >
          {/* Video Module - Compact at top */}
          <section 
            className="h-56 border-b border-gray-200 bg-gray-900 flex-shrink-0"
            aria-label="Video call"
          >
            {videoModule}
          </section>
          
          {/* Chat Section */}
          <section className="flex-1 flex flex-col min-h-0" aria-label="Chat">
            {/* Compact Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-gray-900">AI Chat</h2>
              </div>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              {chatPanel}
            </div>
          </section>
        </aside>
        
        {/* Resize Handle */}
        <div 
          className={`w-1 cursor-col-resize transition-colors flex-shrink-0 ${
            isResizing ? 'bg-purple-400' : 'bg-gray-200 hover:bg-purple-400'
          }`}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-label="Resize panels"
          aria-orientation="vertical"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setLeftPanelWidth(Math.max(30, leftPanelWidth - 5));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              setLeftPanelWidth(Math.min(60, leftPanelWidth + 5));
            }
          }}
        />
        
        {/* Right Panel - AI Output & Content */}
        <main id="main-content" className="flex-1 flex flex-col min-w-0" aria-label="Main content">
          {/* Minimal Tab Bar */}
          <nav 
            className="h-12 px-4 flex items-center gap-1 border-b border-gray-200 bg-gray-50 flex-shrink-0"
            role="tablist"
            aria-label="Content tabs (Use Ctrl+1, Ctrl+2, Ctrl+3 to switch)"
          >
            <TabButton 
              active={activeTab === 'ai-output'}
              onClick={() => setActiveTab('ai-output')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              label="AI Output"
              ariaLabel="AI Output (Ctrl+1)"
              ariaControls="ai-output-panel"
            />
            <TabButton 
              active={activeTab === 'presentation'}
              onClick={() => setActiveTab('presentation')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
              label="Presentation"
              ariaLabel="Presentation (Ctrl+2)"
              ariaControls="presentation-panel"
            />
            <TabButton 
              active={activeTab === 'whiteboard'}
              onClick={() => setActiveTab('whiteboard')}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              label="Whiteboard"
              ariaLabel="Whiteboard (Ctrl+3)"
              ariaControls="whiteboard-panel"
            />
          </nav>
          
          {/* Content Area with smooth 300ms fade transitions */}
          <div className="flex-1 overflow-hidden bg-white relative">
            <div 
              id="ai-output-panel"
              role="tabpanel"
              aria-labelledby="ai-output-tab"
              aria-hidden={activeTab !== 'ai-output'}
              className={`absolute inset-0 transition-opacity ${
                activeTab === 'ai-output' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                transitionDuration: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {aiOutputPanel}
            </div>
            <div 
              id="presentation-panel"
              role="tabpanel"
              aria-labelledby="presentation-tab"
              aria-hidden={activeTab !== 'presentation'}
              className={`absolute inset-0 transition-opacity ${
                activeTab === 'presentation' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                transitionDuration: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {presentationPanel}
            </div>
            <div 
              id="whiteboard-panel"
              role="tabpanel"
              aria-labelledby="whiteboard-tab"
              aria-hidden={activeTab !== 'whiteboard'}
              className={`absolute inset-0 transition-opacity ${
                activeTab === 'whiteboard' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                transitionDuration: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {whiteboardPanel}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
