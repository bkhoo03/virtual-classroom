import type { PresentationMode } from '../types';

interface PresentationContainerProps {
  children: React.ReactNode;
  mode: PresentationMode;
  onModeChange: (mode: PresentationMode) => void;
}

export default function PresentationContainer({
  children,
  mode,
  onModeChange,
}: PresentationContainerProps) {
  const modes: { value: PresentationMode; label: string }[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'screenshare', label: 'Screen' },
    { value: 'whiteboard', label: 'Whiteboard' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col border border-gray-200">
      {/* Content Area - removed duplicate mode switcher */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className={`h-full rounded-lg relative ${mode === 'whiteboard' ? 'bg-white' : 'bg-gray-50'} border border-gray-200`}>
          {children}
        </div>
      </div>
    </div>
  );
}
