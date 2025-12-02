import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import type { PresentationMode, WhiteboardConfig } from '../types';
import type { ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import PresentationContainer from './PresentationContainer';
import TopToolbar from './TopToolbar';
import { ScreenShareService } from '../services/ScreenShareService';
import { createWhiteboardRoom } from '../utils/whiteboardTokens';
import { useToast } from '../contexts/ToastContext';
import { getPresentationModeManager } from '../services/PresentationModeManager';
import DocumentUpload from './DocumentUpload';
import whiteboardService from '../services/WhiteboardService';
import type { ConvertedDocument } from '../services/DocumentConversionService';
import documentManagementService from '../services/DocumentManagementService';
import pdfSyncService from '../services/PDFSyncService';

// Lazy load heavy components
const ScreenShareDisplay = lazy(() => import('./ScreenShareDisplay'));
const Whiteboard = lazy(() => import('./Whiteboard'));
const SyncedPDFViewer = lazy(() => import('./SyncedPDFViewer'));

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

interface PresentationPanelProps {
  sessionId?: string;
  userId?: string;
  userRole?: 'tutor' | 'tutee';
}

export default function PresentationPanel({ 
  sessionId: propSessionId,
  userId: propUserId,
  userRole: propUserRole = 'tutee'
}: PresentationPanelProps = {}) {
  const { showToast } = useToast();
  const modeManager = useRef(getPresentationModeManager());
  
  // Presentation mode state
  const [mode, setMode] = useState<PresentationMode>(modeManager.current.getCurrentMode());
  
  // Screen share state
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Whiteboard state
  const [whiteboardConfig, setWhiteboardConfig] = useState<WhiteboardConfig | null>(null);
  const [isLoadingWhiteboard, setIsLoadingWhiteboard] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<ConvertedDocument | null>(null);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentTotalPages, setDocumentTotalPages] = useState(0);
  const [availableDocuments, setAvailableDocuments] = useState<ConvertedDocument[]>([]);
  const [showDocumentList, setShowDocumentList] = useState(false);
  
  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfPage, setPdfPage] = useState(1);
  
  // Use the session ID from props, or fallback to a generated one
  const sessionId = useRef(propSessionId || 'session-' + Date.now());
  
  const screenShareServiceRef = useRef<ScreenShareService | null>(null);

  useEffect(() => {
    // Initialize screen share service
    screenShareServiceRef.current = new ScreenShareService();

    // Load available documents for this session
    const documents = documentManagementService.getDocuments(sessionId.current);
    setAvailableDocuments(documents);

    // Subscribe to mode changes from the manager
    const unsubscribe = modeManager.current.onModeChange((newMode) => {
      setMode(newMode);
      
      // Restore state when mode changes
      if (newMode === 'screenshare') {
        const screenShareState = modeManager.current.restoreScreenShareState();
        if (screenShareState) {
          setIsScreenSharing(screenShareState.isActive);
        }
      } else if (newMode === 'whiteboard' && !whiteboardConfig) {
        // Auto-initialize whiteboard when switching to it
        initializeWhiteboard();
      }
    });
    
    // Subscribe to PDF sync changes
    const unsubscribePdfSync = pdfSyncService.subscribe(sessionId.current, (page, url) => {
      if (url === pdfUrl) {
        setPdfPage(page);
      }
    });

    return () => {
      // Cleanup on unmount
      if (screenShareServiceRef.current) {
        screenShareServiceRef.current.cleanup();
      }
      unsubscribe();
      unsubscribePdfSync();
    };
  }, [whiteboardConfig, pdfUrl]);

  const handleModeChange = async (newMode: PresentationMode) => {
    // Preserve current mode state before switching
    if (mode === 'whiteboard') {
      modeManager.current.preserveWhiteboardState({
        canUndo: false,
        canRedo: false
      });
    } else if (mode === 'screenshare') {
      modeManager.current.preserveScreenShareState({
        isActive: isScreenSharing
      });
    }
    
    // Switch mode using the manager
    await modeManager.current.switchMode(newMode, {
      animate: true,
      preserveState: true,
      reason: 'user'
    });
    
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
      // Use the actual session ID from props
      const currentSessionId = sessionId.current;
      
      console.log('🎨 [Whiteboard] Initializing whiteboard for session:', currentSessionId);
      
      // Create whiteboard room using the session ID
      const { roomId, roomToken } = await createWhiteboardRoom(currentSessionId);
      
      // Get user info from props or generate fallback
      const userId = propUserId || 'user-' + Math.floor(Math.random() * 10000);
      // Map tutor to admin, tutee to writer
      const userRole = propUserRole === 'tutor' ? 'admin' : 'writer';
      
      const config: WhiteboardConfig = {
        appId: import.meta.env.VITE_AGORA_WHITEBOARD_APP_ID || '',
        roomId,
        roomToken,
        userId,
        userRole,
      };
      
      console.log('🎨 [Whiteboard] Config created:', { 
        appId: config.appId, 
        roomId: config.roomId, 
        userId: config.userId,
        userRole: config.userRole,
        sessionId: currentSessionId,
        hasToken: !!config.roomToken 
      });
      console.log('🎨 [Whiteboard] All users in session', currentSessionId, 'should join room:', roomId);
      
      setWhiteboardConfig(config);
      showToast('Whiteboard initialized successfully', 'success');
    } catch (error) {
      console.error('❌ [Whiteboard] Failed to initialize:', error);
      showToast('Failed to initialize whiteboard. Make sure the backend is running.', 'error');
    } finally {
      setIsLoadingWhiteboard(false);
    }
  };

  /**
   * Handle document conversion completion
   */
  const handleDocumentConverted = async (document: ConvertedDocument) => {
    try {
      console.log('Document converted successfully:', document);
      
      // Save document to storage
      documentManagementService.addDocument(sessionId.current, document);
      
      // Update available documents list
      const documents = documentManagementService.getDocuments(sessionId.current);
      setAvailableDocuments(documents);
      
      // Display the document
      await displayDocument(document);
      
      showToast(`Document "${document.resourceName}" loaded successfully`, 'success');
    } catch (error) {
      console.error('Failed to display document on whiteboard:', error);
      showToast('Failed to display document on whiteboard', 'error');
    }
  };

  /**
   * Display a document on the whiteboard
   */
  const displayDocument = async (document: ConvertedDocument) => {
    setCurrentDocument(document);
    
    try {
      // Insert document into whiteboard
      await whiteboardService.insertDocument(
        document.taskUuid,
        document.taskProgress,
        document.conversion.type
      );
      
      setDocumentPage(1);
      setDocumentTotalPages(document.taskProgress.totalPageSize);
    } catch (error) {
      console.error('Error displaying document on whiteboard:', error);
      // Still set the document so it can be viewed in other ways
      setDocumentPage(1);
      setDocumentTotalPages(document.taskProgress.totalPageSize);
      throw error;
    }
  };

  /**
   * Switch to a different document
   */
  const handleSwitchDocument = async (document: ConvertedDocument) => {
    try {
      await displayDocument(document);
      setShowDocumentList(false);
      showToast(`Switched to "${document.resourceName}"`, 'success');
    } catch (error) {
      console.error('Failed to switch document:', error);
      showToast('Failed to switch document', 'error');
    }
  };

  /**
   * Handle document page navigation
   */
  const handleDocumentPageChange = (page: number) => {
    if (page < 1 || page > documentTotalPages) return;
    
    whiteboardService.goToPage(page);
    setDocumentPage(page);
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



  const renderContent = () => {
    console.log('[PresentationPanel] renderContent - mode:', mode);
    
    switch (mode) {
      case 'screenshare':
        return (
          <div className="h-full flex flex-col">
            <Suspense fallback={<HeavyComponentLoader />}>
              <ScreenShareDisplay 
                screenTrack={screenTrack} 
                isLocal={true}
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
          <div className="h-full relative">
            <Suspense fallback={<HeavyComponentLoader />}>
              <Whiteboard
                config={whiteboardConfig}
                onError={(error) => {
                  console.error('Whiteboard error:', error);
                  showToast('Whiteboard connection failed', 'error');
                }}
                className="h-full"
              />
            </Suspense>
            
            {/* Document controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <DocumentUpload
                onDocumentConverted={handleDocumentConverted}
                onError={(error) => showToast(error, 'error')}
              />
              
              {availableDocuments.length > 0 && (
                <button
                  onClick={() => setShowDocumentList(!showDocumentList)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Documents ({availableDocuments.length})</span>
                </button>
              )}
            </div>
            
            {/* Document list dropdown */}
            {showDocumentList && availableDocuments.length > 0 && (
              <div className="absolute top-20 left-4 z-20 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[300px] max-w-[400px] max-h-[400px] overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Available Documents</h3>
                </div>
                <div className="p-2">
                  {availableDocuments.map((doc) => (
                    <button
                      key={doc.resourceUuid}
                      onClick={() => handleSwitchDocument(doc)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        currentDocument?.resourceUuid === doc.resourceUuid
                          ? 'bg-yellow-50 border-2 border-yellow-500'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.resourceName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.taskProgress.totalPageSize} pages • {doc.conversion.type}
                          </p>
                        </div>
                        {currentDocument?.resourceUuid === doc.resourceUuid && (
                          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Document page navigation */}
            {currentDocument && documentTotalPages > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
                <button
                  onClick={() => handleDocumentPageChange(documentPage - 1)}
                  disabled={documentPage <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm font-medium text-gray-700">
                  Page {documentPage} / {documentTotalPages}
                </span>
                
                <button
                  onClick={() => handleDocumentPageChange(documentPage + 1)}
                  disabled={documentPage >= documentTotalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            

          </div>
        );
      case 'pdf':
        return (
          <div className="h-full relative">
            {pdfUrl ? (
              <Suspense fallback={<HeavyComponentLoader />}>
                <SyncedPDFViewer
                  pdfUrl={pdfUrl}
                  sessionId={sessionId.current}
                  externalPage={pdfPage}
                  onPageChange={(page) => {
                    setPdfPage(page);
                    pdfSyncService.updatePage(sessionId.current, pdfUrl, page);
                  }}
                  className="h-full"
                />
              </Suspense>
            ) : (
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center max-w-md px-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No PDF Loaded
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload a PDF file to view it here. This is a fallback viewer - for the best experience, use the Agora Whiteboard document viewer first.
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        const url = URL.createObjectURL(file);
                        setPdfUrl(url);
                        setPdfPage(1);
                        pdfSyncService.updatePage(sessionId.current, url, 1);
                        showToast('PDF loaded successfully', 'success');
                      } else {
                        showToast('Please select a valid PDF file', 'error');
                      }
                    }}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload PDF
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const previousMode = modeManager.current.getPreviousMode();
  const showPreviousModeIndicator = previousMode && previousMode !== mode;

  return (
    <PresentationContainer mode={mode} onModeChange={handleModeChange}>
      <div className="flex flex-col h-full">
        {/* Top Toolbar with all controls */}
        <TopToolbar
          mode={mode}
          onModeChange={handleModeChange}
        />
        
        {/* Presentation Content */}
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
          
          {/* Previous mode indicator and return button */}
          {showPreviousModeIndicator && (
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={async () => {
                  await modeManager.current.returnToPreviousMode();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2 group"
                style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">
                  Return to {previousMode === 'ai-output' ? 'AI Output' : previousMode.toUpperCase()}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </PresentationContainer>
  );
}
