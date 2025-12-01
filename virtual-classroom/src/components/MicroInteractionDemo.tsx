/**
 * Micro-Interaction Demo Component
 * 
 * Demonstrates the animation system's micro-interaction classes
 */

import React from 'react';
import { DURATION, DELAY } from '../utils/animationConstants';

export const MicroInteractionDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Micro-Interaction Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Showcasing the animation system with smooth, modern interactions
        </p>

        {/* Button Press Effect */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Button Press Effect
          </h2>
          <p className="text-gray-600 mb-4">
            Click to see the scale-down effect (150ms, ease-out)
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="btn-press px-6 py-3 bg-[#FDC500] text-gray-900 rounded-lg font-medium shadow-md hover:shadow-lg">
              Press Me
            </button>
            <button className="btn-press px-6 py-3 bg-[#5C0099] text-white rounded-lg font-medium shadow-md hover:shadow-lg">
              Press Me Too
            </button>
          </div>
        </section>

        {/* Hover Lift Effect */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Hover Lift Effect
          </h2>
          <p className="text-gray-600 mb-4">
            Hover to see subtle elevation (300ms, ease-out-expo)
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="hover-lift px-6 py-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer">
              <div className="text-lg font-medium text-gray-900">Card 1</div>
              <div className="text-sm text-gray-600">Hover over me</div>
            </div>
            <div className="hover-lift px-6 py-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer">
              <div className="text-lg font-medium text-gray-900">Card 2</div>
              <div className="text-sm text-gray-600">Hover over me</div>
            </div>
            <div className="hover-lift px-6 py-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer">
              <div className="text-lg font-medium text-gray-900">Card 3</div>
              <div className="text-sm text-gray-600">Hover over me</div>
            </div>
          </div>
        </section>

        {/* Yellow Glow Effect */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Yellow Glow Effect
          </h2>
          <p className="text-gray-600 mb-4">
            Hover to see brand color glow (300ms, ease-out)
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="glow-yellow px-6 py-3 bg-[#FDC500] text-gray-900 rounded-lg font-medium">
              Glow Yellow
            </button>
            <button className="glow-yellow px-6 py-3 bg-[#FFD500] text-gray-900 rounded-lg font-medium">
              Bright Yellow
            </button>
            <button className="glow-yellow px-6 py-3 bg-[#FFEE32] text-gray-900 rounded-lg font-medium">
              Light Yellow
            </button>
          </div>
        </section>

        {/* Purple Glow Effect */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Purple Glow Effect
          </h2>
          <p className="text-gray-600 mb-4">
            Hover to see accent color glow (300ms, ease-out)
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="glow-purple px-6 py-3 bg-[#5C0099] text-white rounded-lg font-medium">
              Glow Purple
            </button>
            <button className="glow-purple px-6 py-3 bg-[#C86BFA] text-white rounded-lg font-medium">
              Light Purple
            </button>
          </div>
        </section>

        {/* Combined Effects */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Combined Effects
          </h2>
          <p className="text-gray-600 mb-4">
            Multiple micro-interactions working together
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="btn-press hover-lift px-6 py-3 bg-[#FDC500] text-gray-900 rounded-lg font-medium shadow-md">
              Press + Lift
            </button>
            <button className="btn-press glow-yellow px-6 py-3 bg-[#FFD500] text-gray-900 rounded-lg font-medium">
              Press + Glow
            </button>
            <button className="btn-press glow-purple px-6 py-3 bg-[#5C0099] text-white rounded-lg font-medium">
              Press + Purple Glow
            </button>
          </div>
        </section>

        {/* Animation Classes */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Animation Classes
          </h2>
          <p className="text-gray-600 mb-4">
            Entrance animations with staggered timing
          </p>
          <div className="space-y-3">
            <div className="fade-in stagger-1 px-4 py-3 bg-blue-100 rounded-lg">
              Fade In - Stagger 1 (75ms delay)
            </div>
            <div className="fade-in stagger-2 px-4 py-3 bg-blue-100 rounded-lg">
              Fade In - Stagger 2 (150ms delay)
            </div>
            <div className="fade-in stagger-3 px-4 py-3 bg-blue-100 rounded-lg">
              Fade In - Stagger 3 (225ms delay)
            </div>
          </div>
        </section>

        {/* Animation Constants Info */}
        <section className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Animation Constants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Easing Functions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ease-out-expo</li>
                <li>• ease-in-out-circ</li>
                <li>• ease-spring</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Durations</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fast: {DURATION.fast}ms</li>
                <li>• Normal: {DURATION.normal}ms</li>
                <li>• Slow: {DURATION.slow}ms</li>
                <li>• Very Slow: {DURATION.verySlow}ms</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delays</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Stagger: {DELAY.stagger}ms</li>
                <li>• Sequence: {DELAY.sequence}ms</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Accessibility Note */}
        <section className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span>♿</span> Accessibility
          </h3>
          <p className="text-blue-800 text-sm">
            All animations respect the <code className="bg-blue-100 px-2 py-1 rounded">prefers-reduced-motion</code> setting.
            Users who prefer reduced motion will see instant transitions instead of animations.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MicroInteractionDemo;
