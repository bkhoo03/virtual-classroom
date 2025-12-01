/**
 * Loading States Demo Component
 * Showcases all the modern loading states with yellow accents
 */
import { useState } from 'react';
import Spinner from './Spinner';
import AILoadingIndicator from './AILoadingIndicator';
import { AIOutputSkeleton, ChatSkeleton, PresentationSkeleton, VideoCallSkeleton } from './skeletons';

export default function LoadingStatesDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('spinner');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Modern Loading States
          </h1>
          <p className="text-gray-600">
            Beautiful loading indicators with yellow accents and smooth animations
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'spinner', label: 'Spinner' },
            { id: 'ai-loading', label: 'AI Loading' },
            { id: 'ai-skeleton', label: 'AI Skeleton' },
            { id: 'chat-skeleton', label: 'Chat Skeleton' },
            { id: 'presentation-skeleton', label: 'Presentation Skeleton' },
            { id: 'video-skeleton', label: 'Video Skeleton' },
          ].map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeDemo === demo.id
                  ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30'
                  : 'bg-white text-gray-700 hover:bg-yellow-50'
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Demo Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px]">
          {activeDemo === 'spinner' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Spinner Component</h2>
                <p className="text-gray-600 mb-8">
                  Modern circular spinner with yellow colors and smooth rotation
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Spinner size="small" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Small</p>
                  <p className="text-xs text-gray-500">24px × 24px</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Spinner size="medium" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Medium</p>
                  <p className="text-xs text-gray-500">48px × 48px</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Spinner size="large" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Large</p>
                  <p className="text-xs text-gray-500">64px × 64px</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-8">
                <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✨ Yellow brand colors (yellow-500 & yellow-200)</li>
                  <li>🔄 Smooth rotation with cubic-bezier easing</li>
                  <li>🌟 Pulsing glow effect</li>
                  <li>📏 Three size variants</li>
                </ul>
              </div>
            </div>
          )}

          {activeDemo === 'ai-loading' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Loading Indicator</h2>
                <p className="text-gray-600 mb-8">
                  Beautiful animated indicator for AI responses with multiple synchronized animations
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <AILoadingIndicator size="small" message="Loading..." />
                  <p className="text-sm font-medium text-gray-700 mt-4">Small</p>
                </div>
                
                <div className="text-center">
                  <AILoadingIndicator size="medium" message="AI is thinking..." />
                  <p className="text-sm font-medium text-gray-700 mt-4">Medium</p>
                </div>
                
                <div className="text-center">
                  <AILoadingIndicator size="large" message="Generating response..." />
                  <p className="text-sm font-medium text-gray-700 mt-4">Large</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-8">
                <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🎯 Spinning ring with yellow colors</li>
                  <li>✨ Sparkles icon with pulse animation</li>
                  <li>🎪 Three bouncing dots with staggered timing</li>
                  <li>🌟 Radial gradient glow effect</li>
                  <li>📝 Customizable message text</li>
                  <li>📏 Three size variants</li>
                </ul>
              </div>
            </div>
          )}

          {activeDemo === 'ai-skeleton' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Output Skeleton</h2>
                <p className="text-gray-600">
                  Skeleton loader for AI output panel with yellow shimmer
                </p>
              </div>
              <div className="h-[400px]">
                <AIOutputSkeleton />
              </div>
            </div>
          )}

          {activeDemo === 'chat-skeleton' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Skeleton</h2>
                <p className="text-gray-600">
                  Skeleton loader for chat interface with glass effects
                </p>
              </div>
              <div className="h-[400px]">
                <ChatSkeleton />
              </div>
            </div>
          )}

          {activeDemo === 'presentation-skeleton' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Presentation Skeleton</h2>
                <p className="text-gray-600">
                  Skeleton loader for presentation panel with yellow shimmer
                </p>
              </div>
              <div className="h-[400px]">
                <PresentationSkeleton />
              </div>
            </div>
          )}

          {activeDemo === 'video-skeleton' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Call Skeleton</h2>
                <p className="text-gray-600">
                  Skeleton loader for video call module with glass effects
                </p>
              </div>
              <div className="h-[400px]">
                <VideoCallSkeleton />
              </div>
            </div>
          )}
        </div>

        {/* Code Examples */}
        <div className="mt-8 bg-gray-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Usage Example:</h3>
          <pre className="text-sm overflow-x-auto">
            <code>{`// Import the component
import { ${
              activeDemo === 'spinner' ? 'Spinner' :
              activeDemo === 'ai-loading' ? 'AILoadingIndicator' :
              activeDemo === 'ai-skeleton' ? 'AIOutputSkeleton' :
              activeDemo === 'chat-skeleton' ? 'ChatSkeleton' :
              activeDemo === 'presentation-skeleton' ? 'PresentationSkeleton' :
              'VideoCallSkeleton'
            } } from './components';

// Use in your component
${
  activeDemo === 'spinner' ? `<Spinner size="medium" />` :
  activeDemo === 'ai-loading' ? `<AILoadingIndicator 
  size="medium" 
  message="AI is thinking..." 
/>` :
  `{isLoading ? <${
    activeDemo === 'ai-skeleton' ? 'AIOutputSkeleton' :
    activeDemo === 'chat-skeleton' ? 'ChatSkeleton' :
    activeDemo === 'presentation-skeleton' ? 'PresentationSkeleton' :
    'VideoCallSkeleton'
  } /> : <YourComponent />}`
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
