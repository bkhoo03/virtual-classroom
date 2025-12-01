/**
 * Glass-morphism Demo Component
 * 
 * Visual demonstration of all glass-morphism variants
 * for manual testing in browsers (Chrome, Firefox, Safari)
 */

import React from 'react';

export const GlassMorphismDemo: React.FC = () => {
  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Glass-morphism Design System
        </h1>

        {/* Base Glass */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Base Glass Effect</h2>
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-2">Glass Effect</h3>
            <p className="text-gray-700">
              This is the base glass-morphism effect with standard backdrop blur (10px),
              semi-transparent background, and subtle border.
            </p>
          </div>
        </div>

        {/* Glass Variants */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Glass Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-subtle rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">Glass Subtle</h3>
              <p className="text-gray-700">
                Lighter effect with 6px blur for subtle backgrounds.
              </p>
            </div>

            <div className="glass-strong rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">Glass Strong</h3>
              <p className="text-gray-700">
                Stronger effect with 16px blur for more prominent elements.
              </p>
            </div>

            <div className="glass-dark rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2 text-white">Glass Dark</h3>
              <p className="text-gray-200">
                Dark variant with black tint for use on light backgrounds.
              </p>
            </div>

            <div className="glass-yellow rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">Glass Yellow</h3>
              <p className="text-gray-700">
                Yellow-tinted glass for brand-colored elements.
              </p>
            </div>

            <div className="glass-purple rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">Glass Purple</h3>
              <p className="text-gray-700">
                Purple-tinted glass for accent elements.
              </p>
            </div>
          </div>
        </div>

        {/* Nested Glass */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Nested Glass Effects</h2>
          <div className="glass rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">Outer Glass Container</h3>
            <div className="glass-strong rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">Inner Glass Strong</h4>
              <p className="text-gray-700">
                Glass effects can be nested to create depth and hierarchy.
              </p>
            </div>
          </div>
        </div>

        {/* Combined with Other Utilities */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Combined with Tailwind Utilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Hover Effect</h3>
              <p className="text-sm text-gray-700">
                Glass + hover scale
              </p>
            </div>

            <div className="glass-yellow rounded-full p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Rounded Full</h3>
              <p className="text-sm text-gray-700">
                Glass + rounded-full
              </p>
            </div>

            <div className="glass-purple rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-2">Extra Shadow</h3>
              <p className="text-sm text-gray-700">
                Glass + shadow-2xl
              </p>
            </div>
          </div>
        </div>

        {/* Browser Support Info */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Browser Support</h2>
          <div className="space-y-2 text-gray-700">
            <p>✅ Chrome/Edge: Full support with backdrop-filter</p>
            <p>✅ Safari: Full support with -webkit-backdrop-filter</p>
            <p>✅ Firefox: Full support with backdrop-filter</p>
            <p>⚠️ Older browsers: Fallback to solid semi-transparent backgrounds</p>
          </div>
        </div>

        {/* Performance Note */}
        <div className="glass-dark rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Performance Considerations</h2>
          <div className="space-y-2 text-gray-200">
            <p>• Backdrop-filter can be GPU-intensive on mobile devices</p>
            <p>• Consider reducing blur radius on mobile (use glass-subtle)</p>
            <p>• Limit the number of overlapping glass elements</p>
            <p>• Use will-change: backdrop-filter for animated glass elements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassMorphismDemo;
