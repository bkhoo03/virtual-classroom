# TopToolbar Component

## Overview
The TopToolbar component is a unified horizontal toolbar that contains all presentation controls for the Virtual Classroom application.

## Features
- **Mode Selector**: Switch between PDF, Screen Share, and Whiteboard modes
- **Page Navigation**: Navigate through PDF pages (prev/current/next)
- **Zoom Controls**: Adjust PDF zoom level (+/-/reset with percentage display)
- **PDF Upload**: Upload new PDF files with file input
- **Current File Display**: Shows the name of the currently loaded PDF

## Props

```typescript
interface TopToolbarProps {
  mode: PresentationMode;                    // Current presentation mode
  onModeChange: (mode: PresentationMode) => void;  // Mode change handler
  currentPage: number;                       // Current PDF page number
  totalPages: number;                        // Total number of PDF pages
  onPageChange: (page: number) => void;      // Page change handler
  zoom: number;                              // Current zoom level (0.5 - 3.0)
  onZoomChange: (zoom: number) => void;      // Zoom change handler
  onPDFUpload: (file: File) => void;         // PDF upload handler
  currentFileName: string | null;            // Current PDF filename
}
```

## Layout
The toolbar uses a horizontal flexbox layout with three main sections:

1. **Left Section**: Mode selector buttons (PDF/Screen Share/Whiteboard)
2. **Center Section**: Page navigation and zoom controls (only visible in PDF mode)
3. **Right Section**: Current file display and PDF upload button (only visible in PDF mode)

## Styling
- Semi-transparent background with backdrop blur effect
- Border and shadow for depth
- Smooth transitions with cubic-bezier easing
- Responsive button states (hover, active, disabled)

## Accessibility
- ARIA labels on all buttons
- ARIA pressed states for mode selector buttons
- Disabled states for navigation/zoom limits
- Keyboard accessible file input

## Usage Example

```tsx
import TopToolbar from './TopToolbar';

function PresentationPanel() {
  const [mode, setMode] = useState<PresentationMode>('pdf');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePDFUpload = (file: File) => {
    // Validate and process file
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFileName(file.name);
    // Load PDF...
  };

  return (
    <TopToolbar
      mode={mode}
      onModeChange={setMode}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      zoom={zoom}
      onZoomChange={setZoom}
      onPDFUpload={handlePDFUpload}
      currentFileName={fileName}
    />
  );
}
```

## Requirements Satisfied
- **Requirement 1.1**: All presentation controls at the top in a unified toolbar
- **Requirement 1.12**: PDF upload button prominently displayed with file validation support
