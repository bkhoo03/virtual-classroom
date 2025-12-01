# PDF Upload & AI Disable Features

## Overview
Added two new features to enhance control and flexibility in the virtual classroom.

## 1. PDF Upload Feature

### Location
**PresentationPanel** component - PDF mode

### Features
- **Upload Button**: Appears in top-right corner when in PDF mode
- **File Selection**: Click to open file picker
- **File Validation**: 
  - Only accepts PDF files (`application/pdf`)
  - Maximum file size: 50MB
  - Shows error alerts for invalid files
- **File Display**: Shows uploaded filename below the button
- **Dynamic Button Text**: Changes from "Upload PDF" to "Change PDF" after upload

### Implementation Details

```tsx
// State management
const [pdfUrl, setPdfUrl] = useState<string>('default-pdf-url');
const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

// File upload handler
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file');
    return;
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('File size must be less than 50MB');
    return;
  }

  // Create object URL for the PDF
  const url = URL.createObjectURL(file);
  setPdfUrl(url);
  setUploadedFileName(file.name);
  setCurrentPage(1);
  setZoom(1);
};
```

### UI Components

**Upload Button:**
- Position: `absolute top-4 right-4`
- Style: Purple gradient with hover effect
- Icon: Upload cloud icon
- Z-index: 10 (above PDF viewer)

**Filename Display:**
- Position: `absolute top-16 right-4`
- Style: Dark overlay with backdrop blur
- Shows: 📄 emoji + filename
- Truncates long filenames

### User Flow
1. User clicks "Upload PDF" button
2. File picker opens
3. User selects a PDF file
4. System validates file type and size
5. If valid, PDF loads and displays filename
6. User can click "Change PDF" to upload a different file

### Validation Rules
- **File Type**: Must be `application/pdf`
- **File Size**: Maximum 50MB
- **Error Handling**: Alert messages for invalid files

---

## 2. AI Disable Feature

### Location
**AIAssistant** component

### Features
- **Optional AI**: Can be disabled via `enableAI` prop
- **Disabled State UI**: Shows informative message when disabled
- **Input Disabled**: Message input is disabled when AI is off
- **Clear Messaging**: Users know why they can't use AI

### Implementation Details

```tsx
interface AIAssistantProps {
  sessionId?: string;
  onMediaShare?: (media: any) => void;
  enableAI?: boolean; // New prop - defaults to true
}

export default function AIAssistant({ 
  sessionId, 
  onMediaShare, 
  enableAI = true // Default: AI enabled
}: AIAssistantProps) {
  // ... component logic
}
```

### UI Components

**Disabled Message:**
```tsx
{!enableAI && (
  <div className="mb-3 p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg">
    <svg>...</svg>
    <div>
      <p>AI Assistant Disabled</p>
      <p>The AI assistant feature is currently disabled for this session.</p>
    </div>
  </div>
)}
```

**Input State:**
```tsx
<MessageInput 
  disabled={isLoading || !aiService || !enableAI}
  placeholder={
    !enableAI 
      ? "AI assistant is disabled" 
      : aiService 
        ? "Ask me anything..." 
        : "AI service unavailable"
  }
/>
```

### Usage Examples

**Enable AI (default):**
```tsx
<AIAssistant sessionId="session-123" />
```

**Disable AI:**
```tsx
<AIAssistant sessionId="session-123" enableAI={false} />
```

**Conditional AI:**
```tsx
<AIAssistant 
  sessionId="session-123" 
  enableAI={userRole === 'tutor'} // Only tutors can use AI
/>
```

### Visual States

**When AI is Disabled:**
- Gray info box appears at top of chat
- Info icon (ℹ️) with explanation
- Message input is disabled
- Placeholder text: "AI assistant is disabled"
- No "Ask AI" functionality available

**When AI is Enabled:**
- Normal chat interface
- Message input active
- Placeholder: "Ask me anything..."
- Full AI functionality available

---

## Integration Guide

### For ClassroomPage or Parent Component

```tsx
import PresentationPanel from './components/PresentationPanel';
import AIAssistant from './components/AIAssistant';

function ClassroomPage() {
  // Control AI availability based on user role, subscription, etc.
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div>
      {/* Presentation with PDF upload */}
      <PresentationPanel />
      
      {/* Chat with optional AI */}
      <AIAssistant 
        sessionId={sessionId}
        enableAI={aiEnabled}
      />
      
      {/* Optional: Toggle button for AI */}
      <button onClick={() => setAiEnabled(!aiEnabled)}>
        {aiEnabled ? 'Disable AI' : 'Enable AI'}
      </button>
    </div>
  );
}
```

### Use Cases

**PDF Upload:**
- Tutors upload homework PDFs
- Students share their work
- Upload study materials
- Share practice problems
- Load textbook pages

**AI Disable:**
- Free tier users (no AI access)
- Exam mode (prevent cheating)
- Tutee-only sessions (tutor controls AI)
- Bandwidth saving (disable AI to reduce API calls)
- Privacy mode (no AI processing of conversations)

---

## Technical Notes

### PDF Upload
- Uses `URL.createObjectURL()` for client-side PDF loading
- No server upload required (files stay local)
- Memory efficient (browser handles PDF rendering)
- Resets page and zoom when new PDF loaded
- Hidden file input with custom button trigger

### AI Disable
- Prop-based control (easy to integrate)
- Graceful degradation (chat still works without AI)
- Clear user feedback (disabled state message)
- Maintains message history (AI just can't respond)
- Input validation prevents sending when disabled

---

## Future Enhancements

### PDF Upload
- [ ] Server-side PDF storage
- [ ] PDF history/library
- [ ] Share PDFs with other participants
- [ ] PDF metadata (title, author, page count)
- [ ] Thumbnail preview before upload
- [ ] Drag-and-drop upload
- [ ] Multiple PDF management

### AI Disable
- [ ] Per-user AI permissions
- [ ] AI usage quotas
- [ ] Temporary AI disable (time-based)
- [ ] AI feature toggles (specific features on/off)
- [ ] AI usage analytics
- [ ] Custom disabled messages
- [ ] AI re-enable notifications

---

## Testing Checklist

### PDF Upload
- [ ] Click upload button opens file picker
- [ ] Selecting PDF loads it successfully
- [ ] Non-PDF files show error
- [ ] Files over 50MB show error
- [ ] Filename displays correctly
- [ ] "Change PDF" button works
- [ ] PDF viewer shows uploaded file
- [ ] Page navigation works with uploaded PDF
- [ ] Zoom works with uploaded PDF
- [ ] Annotations work with uploaded PDF

### AI Disable
- [ ] `enableAI={false}` shows disabled message
- [ ] Message input is disabled when AI off
- [ ] Placeholder text shows "AI assistant is disabled"
- [ ] No AI responses when disabled
- [ ] Chat messages still display
- [ ] Re-enabling AI works correctly
- [ ] Disabled state persists across re-renders
- [ ] Error messages don't appear when disabled
