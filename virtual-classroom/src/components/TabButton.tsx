import type { ReactNode } from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  ariaControls?: string;
}

export default function TabButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  ariaLabel,
  ariaControls 
}: TabButtonProps) {
  return (
    <button
      id={`${label.toLowerCase().replace(/\s+/g, '-')}-tab`}
      role="tab"
      aria-selected={active}
      aria-controls={ariaControls}
      aria-label={ariaLabel || label}
      onClick={onClick}
      tabIndex={active ? 0 : -1}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ease-smooth transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
        active
          ? 'bg-white text-purple-600 shadow-sm scale-100'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105'
      }`}
      style={{
        transitionProperty: 'background-color, color, box-shadow, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <span className="w-4 h-4 transition-transform duration-300" style={{
        transform: active ? 'scale(1.1)' : 'scale(1)',
      }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
