/**
 * Color Palette Demo Component
 * 
 * Visual demonstration of the yellow and purple color palettes
 * Requirements: 19.3, 19.10
 */

import React from 'react';

interface ColorSwatchProps {
  name: string;
  variable: string;
  shade: number;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, variable, shade }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-lg shadow-md border border-gray-200 transition-transform hover:scale-110"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <span className="mt-2 text-xs font-medium text-gray-700">{shade}</span>
    </div>
  );
};

export const ColorPaletteDemo: React.FC = () => {
  const yellowShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const purpleShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Color Palette Configuration
      </h1>

      {/* Yellow Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Yellow Palette (Primary Brand Color)
        </h2>
        <div className="flex gap-4 flex-wrap">
          {yellowShades.map((shade) => (
            <ColorSwatch
              key={shade}
              name="yellow"
              variable={`--color-yellow-${shade}`}
              shade={shade}
            />
          ))}
        </div>
      </section>

      {/* Purple Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Purple Palette (Accent Brand Color)
        </h2>
        <div className="flex gap-4 flex-wrap">
          {purpleShades.map((shade) => (
            <ColorSwatch
              key={shade}
              name="purple"
              variable={`--color-purple-${shade}`}
              shade={shade}
            />
          ))}
        </div>
      </section>

      {/* Primary and Secondary Aliases */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Primary Color Aliases (Yellow)
        </h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Primary</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-primary-hover)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Hover</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Light</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-primary-dark)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Dark</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Secondary Color Aliases (Purple)
        </h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Secondary</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-secondary-hover)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Hover</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-secondary-light)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Light</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-secondary-dark)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Dark</span>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Usage Examples
        </h2>
        <div className="space-y-4">
          <button
            className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Primary Button (Yellow)
          </button>
          <button
            className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all ml-4"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            Secondary Button (Purple)
          </button>
        </div>
      </section>

      {/* Legacy Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Legacy Accent Colors (Backward Compatibility)
        </h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Accent</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-accent-light)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Accent Light</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-lg shadow-md border border-gray-200"
              style={{ backgroundColor: 'var(--color-highlight)' }}
            />
            <span className="mt-2 text-sm font-medium text-gray-700">Highlight</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorPaletteDemo;
