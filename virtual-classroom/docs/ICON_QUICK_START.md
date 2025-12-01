# Icon Library Quick Start Guide

## Installation ✅

The `lucide-react` package is already installed in the project.

```bash
npm install lucide-react
```

## Basic Usage

### 1. Import Icons

```tsx
import { Mic, Video, MessageCircle } from 'lucide-react';
```

### 2. Use in Components

```tsx
function MyComponent() {
  return (
    <div>
      <Mic size={24} />
      <Video size={24} color="#FDC500" />
      <MessageCircle className="text-yellow-500" />
    </div>
  );
}
```

## Common Patterns

### Button with Icon

```tsx
<button aria-label="Mute microphone">
  <MicOff size={20} className="text-red-500" />
</button>
```

### Toggle State

```tsx
const [isMuted, setIsMuted] = useState(false);

<button onClick={() => setIsMuted(!isMuted)}>
  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
</button>
```

### Animated Loader

```tsx
<Loader2 className="animate-spin text-yellow-500" size={24} />
```

### Hover Effect

```tsx
<button className="group">
  <Send 
    className="text-yellow-500 group-hover:scale-110 transition-transform" 
    size={24} 
  />
</button>
```

## Brand Colors

Use these colors for consistency:

```tsx
// Yellow (Primary)
<Mic color="#FDC500" />
<Video color="#FFD500" />

// Purple (Accent)
<MessageCircle color="#5C0099" />
<LogOut color="#C86BFA" />

// Or with Tailwind
<Mic className="text-yellow-500" />
<MessageCircle className="text-purple-600" />
```

## Icon Sizes

Standard sizes used in the app:

- **Small**: 16px - For inline text icons
- **Medium**: 24px - Default for most UI elements
- **Large**: 32px - For prominent actions
- **Extra Large**: 48px - For hero sections

```tsx
<Pencil size={16} />  // Small
<Pencil size={24} />  // Medium (default)
<Pencil size={32} />  // Large
<Pencil size={48} />  // Extra Large
```

## Accessibility

Always provide labels for icon-only buttons:

```tsx
// Good ✅
<button aria-label="Mute microphone">
  <MicOff />
</button>

// Bad ❌
<button>
  <MicOff />
</button>
```

For decorative icons:

```tsx
<Bot aria-hidden="true" />
```

## Performance Tips

1. **Import only what you need** (tree-shaking works automatically):
   ```tsx
   // Good ✅
   import { Mic, Video } from 'lucide-react';
   
   // Avoid ❌
   import * as Icons from 'lucide-react';
   ```

2. **Use consistent sizes** to improve rendering performance

3. **Avoid inline styles** when possible, use Tailwind classes instead

## Examples

See `src/components/IconExample.tsx` for complete working examples including:
- Basic usage
- Brand colors
- Animations
- Interactive buttons
- Glass-morphism effects
- Complete control toolbar

## Full Icon List

See `docs/ICON_MAPPING.md` for a complete mapping of all icons used in the application.

## Resources

- [Lucide Icons Search](https://lucide.dev/icons/)
- [Lucide React Docs](https://lucide.dev/guide/packages/lucide-react)
- [Icon Mapping Documentation](./ICON_MAPPING.md)
