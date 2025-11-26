import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import type { PresentationMode, WhiteboardConfig } from '../types';
import type { ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import PresentationContainer from './PresentationContainer';
import AnnotationToolbar from './AnnotationToolbar';
import TopToolbar from './TopToolbar';
import { ScreenShareService } from '../services/ScreenShareService';
import { createWhiteboardRoom } from '../utils/whiteboardTokens';
import { useAnnotations } from '../hooks/useAnnotations';
import { useToast } from '../contexts/ToastContext';
import { annotationStorageService } from '../services/AnnotationStorageService';

// Lazy load heavy components
const PDFViewerWithAnnotations = lazy(() => import('./PDFViewerWithAnnotations'));
const ScreenShareDisplay = lazy(() => import('./ScreenShareDisplay'));
const Whiteboard = lazy(() => import('./Whiteboard'));

// Loading fallback for heavy components
function HeavyComponentLoader() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading component...</p>
      </div>
    </div>
  );
}

export default function PresentationPanel() {
  const { showToast } = useToast();
  
  // Presentation mode state
  const [mode, setMode] = useState<PresentationMode>('pdf');
  
  // PDF state
  const [pdfUrl, setPdfUrl] = useState<string>('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.2);
  const [documentId, setDocumentId] = useState<string>('');
  const [isUploadingPDF, setIsUploadingPDF] = useState<boolean>(false);
  
  // Screen share state
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Whiteboard state
  const [whiteboardConfig, setWhiteboardConfig] = useState<WhiteboardConfig | null>(null);
  const [isLoadingWhiteboard, setIsLoadingWhiteboard] = useState(false);
  
  const screenShareServiceRef = useRef<ScreenShareService | null>(null);
  const pdfViewerRef = useRef<any>(null);

  // Annotation state - only enabled for PDF and screen share modes
  const enableAnnotations = mode === 'pdf' || mode === 'screenshare';
  
  const {
    currentTool,
    currentColor,
    strokeWidth,
    changeTool,
    changeColor,
    changeStrokeWidth,
    clearAnnotations,
  } = useAnnotations({
    enabled: enableAnnotations,
  });

  useEffect(() => {
    // Initialize screen share service
    screenShareServiceRef.current = new ScreenShareService();

    return () => {
      // Cleanup on unmount
      if (screenShareServiceRef.current) {
        screenShareServiceRef.current.cleanup();
      }
    };
  }, []);

  const handleModeChange = async (newMode: PresentationMode) => {
    setMode(newMode);
    
    // If switching away from screen share, stop sharing
    if (mode === 'screenshare' && newMode !== 'screenshare' && isScreenSharing) {
      handleStopScreenShare();
    }

    // If switching to whiteboard, initialize it
    if (newMode === 'whiteboard' && !whiteboardConfig) {
      await initializeWhiteboard();
    }
  };

  const initializeWhiteboard = async () => {
    setIsLoadingWhiteboard(true);
    try {
      // Get session ID from URL or context (for now, use a mock)
      const sessionId = 'session-' + Date.now();
      
      // Create whiteboard room
      const { roomId, roomToken } = await createWhiteboardRoom(sessionId);
      
      // Get user info (should come from auth context in production)
      const userId = 'user-' + Math.floor(Math.random() * 10000);
      const userRole = 'admin'; // Tutor should be admin, tutee should be writer
      
      const config: WhiteboardConfig = {
        appId: import.meta.env.VITE_AGORA_WHITEBOARD_APP_ID || '',
        roomId,
        roomToken,
        userId,
        userRole,
      };
      
      setWhiteboardConfig(config);
    } catch (error) {
      console.error('Failed to initialize whiteboard:', error);
    } finally {
      setIsLoadingWhiteboard(false);
    }
  };

  const handleStartScreenShare = async () => {
    if (!screenShareServiceRef.current) return;

    try {
      // Get Agora credentials from environment or mock for development
      const appId = import.meta.env.VITE_AGORA_APP_ID || '';
      const channel = 'screen-share-channel'; // Should match the main channel
      const token = ''; // Should be generated from backend
      const uid = Math.floor(Math.random() * 1000000) + 10000; // Unique UID for screen share

      const track = await screenShareServiceRef.current.startScreenShare(
        appId,
        channel,
        token,
        uid
      );

      setScreenTrack(track);
      setIsScreenSharing(true);
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      setIsScreenSharing(false);
    }
  };

  const handleStopScreenShare = async () => {
    if (!screenShareServiceRef.current) return;

    try {
      await screenShareServiceRef.current.stopScreenShare();
      setScreenTrack(null);
      setIsScreenSharing(false);
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
    }
  };

  /**
   * Handle PDF file upload with validation
   */
  const handlePDFUpload = async (file: File) => {
    // Validate file type (must be application/pdf)
    if (file.type !== 'application/pdf') {
      showToast('Invalid file type. Please upload a PDF file.', 'error');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      showToast('File size exceeds 50MB limit. Please upload a smaller file.', 'error');
      return;
    }

    // Set loading state
    setIsUploadingPDF(true);

    try {
      // Simulate processing time for visual feedback (minimum 300ms)
      const startTime = Date.now();
      
      // Clear previous document annotations before loading new PDF
      if (documentId) {
        annotationStorageService.clearDocumentAnnotations(documentId);
      }

      // Generate new document ID for the uploaded PDF
      const newDocumentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      setDocumentId(newDocumentId);

      // Create object URL for the PDF
      const url = URL.createObjectURL(file);
      
      // Ensure minimum loading time for smooth UX
      const elapsed = Date.now() - startTime;
      if (elapsed < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
      }
      
      setPdfUrl(url);
      setUploadedFileName(file.name);
      setCurrentPage(1); // Reset to first page
      setZoom(1.2); // Reset zoom
      
      showToast('PDF uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      showToast('Failed to upload PDF. Please try again.', 'error');
    } finally {
      setIsUploadingPDF(false);
    }
  };

  /**
   * Handle page change from TopToolbar
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle zoom change from TopToolbar
   */
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  /**
   * Handle document load callback from PDFViewerWithAnnotations
   */
  const handleDocumentLoad = (numPages: number) => {
    setTotalPages(numPages);
    console.log(`PDF loaded with ${numPages} pages`);
  };

  /**
   * Handle page load callback from PDFViewerWithAnnotations
   */
  const handlePageLoad = (pageNumber: number, width: number, height: number) => {
    console.log(`Page ${pageNumber} loaded: ${width}x${height}`);
  };

  const renderContent = () => {
    switch (mode) {
      case 'pdf':
        return (
          <div className="relative h-full">
            <Suspense fallback={<HeavyComponentLoader />}>
              <PDFViewerWithAnnotations
                ref={pdfViewerRef}
                fileUrl={pdfUrl}
                currentPage={currentPage}
                zoom={zoom}
                tool={currentTool}
                color={currentColor}
                strokeWidth={strokeWidth}
                documentId={documentId}
                onDocumentLoad={handleDocumentLoad}
                onPageLoad={handlePageLoad}
                onAnnotationsChange={(pageNumber, annotations) => {
                  console.log(`Page ${pageNumber} annotations updated:`, annotations.length);
                }}
              />
            </Suspense>
            
            {/* Annotation Toolbar - only show for PDF mode */}
            <AnnotationToolbar
              selectedTool={currentTool as any}
              onToolChange={changeTool as any}
              currentColor={currentColor}
              onColorChange={changeColor}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={changeStrokeWidth}
              onClear={() => {
                clearAnnotations();
                if (pdfViewerRef.current) {
                  pdfViewerRef.current.clearCurrentPageAnnotations();
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50"
            />
          </div>
        );
      case 'screenshare':
        return (
          <div className="h-full flex flex-col">
            <Suspense fallback={<HeavyComponentLoader />}>
              <ScreenShareDisplay 
                screenTrack={screenTrack} 
                isLocal={true}
                enableAnnotations={enableAnnotations}
              />
            </Suspense>
            
            {/* Screen share controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
              {!isScreenSharing ? (
                <button
                  onClick={handleStartScreenShare}
                  className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-2"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Start Screen Share
                </button>
              ) : (
                <button
                  onClick={handleStopScreenShare}
                  className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-2"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Stop Sharing
                </button>
              )}
            </div>
          </div>
        );
      case 'whiteboard':
        if (isLoadingWhiteboard) {
          return (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                <p className="text-gray-900 font-medium">Initializing whiteboard...</p>
              </div>
            </div>
          );
        }
        
        if (!whiteboardConfig) {
          return (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Whiteboard not initialized</p>
                <button
                  onClick={initializeWhiteboard}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-md"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  Initialize Whiteboard
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <Suspense fallback={<HeavyComponentLoader />}>
            <Whiteboard
              config={whiteboardConfig}
              onError={(error) => console.error('Whiteboard error:', error)}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <PresentationContainer mode={mode} onModeChange={handleModeChange}>
      <div className="flex flex-col h-full">
        {/* Top Toolbar with all controls */}
        <TopToolbar
          mode={mode}
          onModeChange={handleModeChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onPDFUpload={handlePDFUpload}
          currentFileName={uploadedFileName}
          isUploadingPDF={isUploadingPDF}
        />
        
        {/* Presentation Content */}
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </PresentationContainer>
  );
}
