# Icon Mapping Documentation

This document provides a comprehensive mapping of icons used throughout the Virtual Classroom application using the `lucide-react` library.

## Installation

```bash
npm install lucide-react
```

## Usage

```tsx
import { IconName } from 'lucide-react';

// Example
<IconName size={24} color="#FDC500" />
```

## Icon Mapping by Component

### Control Toolbar

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| Audio On | 🎤 | `Mic` | `import { Mic } from 'lucide-react'` |
| Audio Off | 🔇 | `MicOff` | `import { MicOff } from 'lucide-react'` |
| Video On | 📹 | `Video` | `import { Video } from 'lucide-react'` |
| Video Off | 📵 | `VideoOff` | `import { VideoOff } from 'lucide-react'` |
| Screen Share | 🖥️ | `Monitor` | `import { Monitor } from 'lucide-react'` |
| Chat | 💬 | `MessageCircle` | `import { MessageCircle } from 'lucide-react'` |
| Leave | 🚪 | `LogOut` | `import { LogOut } from 'lucide-react'` |

### Whiteboard Tools

| Tool | Old (Emoji) | New (Lucide) | Import |
|------|-------------|--------------|--------|
| Selector | 👆 | `MousePointer2` | `import { MousePointer2 } from 'lucide-react'` |
| Pen | ✏️ | `Pencil` | `import { Pencil } from 'lucide-react'` |
| Rectangle | ▭ | `Square` | `import { Square } from 'lucide-react'` |
| Circle | ⭕ | `Circle` | `import { Circle } from 'lucide-react'` |
| Line | ➖ | `Minus` | `import { Minus } from 'lucide-react'` |
| Text | 📝 | `Type` | `import { Type } from 'lucide-react'` |
| Eraser | 🧹 | `Eraser` | `import { Eraser } from 'lucide-react'` |
| Hand/Pan | ✋ | `Hand` | `import { Hand } from 'lucide-react'` |

### Whiteboard Actions

| Action | Old (Emoji) | New (Lucide) | Import |
|--------|-------------|--------------|--------|
| Undo | ↶ | `Undo` | `import { Undo } from 'lucide-react'` |
| Redo | ↷ | `Redo` | `import { Redo } from 'lucide-react'` |
| Clear | 🗑️ | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| Save | 💾 | `Save` | `import { Save } from 'lucide-react'` |

### Chat Component

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| Send | ➤ | `Send` | `import { Send } from 'lucide-react'` |
| Attach | 📎 | `Paperclip` | `import { Paperclip } from 'lucide-react'` |

### AI Assistant

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| AI | 🤖 | `Bot` | `import { Bot } from 'lucide-react'` |
| Search | 🔍 | `Search` | `import { Search } from 'lucide-react'` |
| Image | 🖼️ | `Image` | `import { Image } from 'lucide-react'` |
| Loading | ⏳ | `Loader2` | `import { Loader2 } from 'lucide-react'` |

### Presentation Panel

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| PDF | 📄 | `FileText` | `import { FileText } from 'lucide-react'` |
| Upload | ⬆️ | `Upload` | `import { Upload } from 'lucide-react'` |
| Download | ⬇️ | `Download` | `import { Download } from 'lucide-react'` |
| Zoom In | ➕ | `ZoomIn` | `import { ZoomIn } from 'lucide-react'` |
| Zoom Out | ➖ | `ZoomOut` | `import { ZoomOut } from 'lucide-react'` |
| Fullscreen | ⛶ | `Maximize` | `import { Maximize } from 'lucide-react'` |
| Exit Fullscreen | ⛶ | `Minimize` | `import { Minimize } from 'lucide-react'` |

### Video Call Module

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| Connection Quality | 📶 | `Signal` | `import { Signal } from 'lucide-react'` |
| Settings | ⚙️ | `Settings` | `import { Settings } from 'lucide-react'` |
| User | 👤 | `User` | `import { User } from 'lucide-react'` |

### General UI

| Function | Old (Emoji) | New (Lucide) | Import |
|----------|-------------|--------------|--------|
| Close | ✖️ | `X` | `import { X } from 'lucide-react'` |
| Menu | ☰ | `Menu` | `import { Menu } from 'lucide-react'` |
| Info | ℹ️ | `Info` | `import { Info } from 'lucide-react'` |
| Warning | ⚠️ | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` |
| Error | ❌ | `AlertCircle` | `import { AlertCircle } from 'lucide-react'` |
| Success | ✅ | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` |
| Arrow Left | ← | `ArrowLeft` | `import { ArrowLeft } from 'lucide-react'` |
| Arrow Right | → | `ArrowRight` | `import { ArrowRight } from 'lucide-react'` |
| Arrow Up | ↑ | `ArrowUp` | `import { ArrowUp } from 'lucide-react'` |
| Arrow Down | ↓ | `ArrowDown` | `import { ArrowDown } from 'lucide-react'` |
| Chevron Left | ‹ | `ChevronLeft` | `import { ChevronLeft } from 'lucide-react'` |
| Chevron Right | › | `ChevronRight` | `import { ChevronRight } from 'lucide-react'` |
| Chevron Up | ˄ | `ChevronUp` | `import { ChevronUp } from 'lucide-react'` |
| Chevron Down | ˅ | `ChevronDown` | `import { ChevronDown } from 'lucide-react'` |

## Common Props

All Lucide icons accept the following props:

```tsx
interface IconProps {
  size?: number | string;        // Default: 24
  color?: string;                // Default: currentColor
  strokeWidth?: number;          // Default: 2
  className?: string;            // CSS classes
  style?: React.CSSProperties;   // Inline styles
}
```

## Brand Color Usage

Use the brand colors with icons:

```tsx
// Yellow primary
<Mic size={24} color="#FDC500" />

// Purple accent
<MessageCircle size={24} color="#5C0099" />

// Use with Tailwind classes
<Video className="text-yellow-500" size={24} />
```

## Animation Examples

### Spinning Loader

```tsx
<Loader2 className="animate-spin text-yellow-500" size={24} />
```

### Hover Effects

```tsx
<button className="group">
  <Send 
    className="text-yellow-500 group-hover:scale-110 transition-transform" 
    size={24} 
  />
</button>
```

## Accessibility

Always provide accessible labels when using icons:

```tsx
<button aria-label="Mute microphone">
  <MicOff size={24} />
</button>
```

## Performance Tips

1. **Tree Shaking**: Import only the icons you need
   ```tsx
   // Good
   import { Mic, Video } from 'lucide-react';
   
   // Avoid
   import * as Icons from 'lucide-react';
   ```

2. **Icon Size**: Use consistent sizes throughout the app
   - Small: 16px
   - Medium: 24px (default)
   - Large: 32px

3. **Stroke Width**: Use consistent stroke widths
   - Thin: 1.5
   - Normal: 2 (default)
   - Bold: 2.5

## Resources

- [Lucide Icons Documentation](https://lucide.dev/)
- [Lucide React Package](https://www.npmjs.com/package/lucide-react)
- [Icon Search](https://lucide.dev/icons/)
