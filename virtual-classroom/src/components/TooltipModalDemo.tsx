import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import { Modal } from './Modal';
import { Info, Save, Settings, HelpCircle } from 'lucide-react';

/**
 * Demo component showcasing modernized Tooltips and Modals
 * with glass-morphism effects and smooth animations
 */
export const TooltipModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-yellow-500 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Modernized Tooltips & Modals
          </h1>
          <p className="text-gray-700">
            Glass-morphism effects with smooth animations
          </p>
        </div>

        {/* Tooltip Examples */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tooltip Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Basic Tooltip */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">Basic Tooltip</p>
              <Tooltip content="This is a basic tooltip">
                <button className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all">
                  <Info size={20} />
                </button>
              </Tooltip>
            </div>

            {/* Tooltip with Shortcut */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">With Keyboard Shortcut</p>
              <Tooltip content="Save" shortcut="Ctrl+S">
                <button className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all">
                  <Save size={20} />
                </button>
              </Tooltip>
            </div>

            {/* Bottom Tooltip */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">Bottom Position</p>
              <Tooltip content="Settings" position="bottom">
                <button className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all">
                  <Settings size={20} />
                </button>
              </Tooltip>
            </div>

            {/* Left Tooltip */}
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-3">Left Position</p>
              <Tooltip content="Help & Support" position="left">
                <button className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all">
                  <HelpCircle size={20} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="mt-6 p-4 glass-subtle rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Features:</strong> Glass-morphism effect, smooth fade-in animation, 
              arrow pointer, modern typography, keyboard shortcut badges
            </p>
          </div>
        </div>

        {/* Modal Examples */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Modal Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setModalSize('sm');
                setIsModalOpen(true);
              }}
              className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all"
            >
              Small Modal
            </button>
            
            <button
              onClick={() => {
                setModalSize('md');
                setIsModalOpen(true);
              }}
              className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all"
            >
              Medium Modal
            </button>
            
            <button
              onClick={() => {
                setModalSize('lg');
                setIsModalOpen(true);
              }}
              className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all"
            >
              Large Modal
            </button>
            
            <button
              onClick={() => {
                setModalSize('xl');
                setIsModalOpen(true);
              }}
              className="glass-yellow px-6 py-3 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all"
            >
              Extra Large Modal
            </button>
          </div>

          <div className="mt-6 p-4 glass-subtle rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Features:</strong> Glass-strong effect, backdrop blur overlay, 
              smooth scale-in animation, modern close button with Lucide icon, 
              focus trap, keyboard navigation (ESC to close)
            </p>
          </div>
        </div>

        {/* Design System Info */}
        <div className="glass-dark rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Design System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Glass-Morphism</h3>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Backdrop blur: 16px (strong), 10px (base), 6px (subtle)</li>
                <li>• Semi-transparent backgrounds</li>
                <li>• Subtle borders and shadows</li>
                <li>• Safari support with -webkit-backdrop-filter</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Animations</h3>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Fade-in: 200ms with ease-out</li>
                <li>• Scale-in: 300ms with ease-out-expo</li>
                <li>• Respects prefers-reduced-motion</li>
                <li>• GPU-accelerated transforms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalSize.toUpperCase()} Modal Example`}
        size={modalSize}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This is a modernized modal with glass-morphism effects and smooth animations.
          </p>
          
          <div className="glass-subtle p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Glass-strong effect on modal container</li>
              <li>✓ Backdrop blur on overlay (12px)</li>
              <li>✓ Smooth scale-in animation (300ms)</li>
              <li>✓ Modern close button with Lucide X icon</li>
              <li>✓ Focus trap for accessibility</li>
              <li>✓ ESC key to close</li>
              <li>✓ Click outside to close</li>
              <li>✓ Prevents body scroll when open</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 rounded-xl font-medium bg-gray-200 hover:bg-gray-300 text-gray-900 transition-all hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 rounded-xl font-medium bg-yellow-500 hover:bg-yellow-400 text-gray-900 transition-all hover:scale-105 active:scale-95"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
