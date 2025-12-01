# Glass-morphism Visual Examples

## Quick Reference

### All Variants Side-by-Side

```tsx
// Base glass
<div className="glass rounded-xl p-6">
  Standard glass effect
</div>

// Subtle variant
<div className="glass-subtle rounded-xl p-6">
  Lighter, more subtle
</div>

// Strong variant
<div className="glass-strong rounded-xl p-6">
  Stronger, more prominent
</div>

// Dark variant
<div className="glass-dark rounded-xl p-6 text-white">
  Dark tint for light backgrounds
</div>

// Yellow variant
<div className="glass-yellow rounded-xl p-6">
  Yellow brand color
</div>

// Purple variant
<div className="glass-purple rounded-xl p-6">
  Purple accent color
</div>
```

## Real-World Use Cases

### 1. Navigation Bar

```tsx
<nav className="glass-dark fixed top-0 left-0 right-0 z-50">
  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
    <div className="text-white font-bold text-xl">Logo</div>
    <div className="flex gap-6">
      <a href="#" className="text-white hover:text-yellow-400">Home</a>
      <a href="#" className="text-white hover:text-yellow-400">About</a>
      <a href="#" className="text-white hover:text-yellow-400">Contact</a>
    </div>
  </div>
</nav>
```

### 2. Feature Card

```tsx
<div className="glass rounded-2xl p-8 hover:glass-strong transition-all">
  <div className="text-4xl mb-4">🎨</div>
  <h3 className="text-2xl font-bold mb-2">Design</h3>
  <p className="text-gray-700">
    Beautiful glass-morphism effects for modern UIs
  </p>
</div>
```

### 3. Modal Dialog

```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
  <div className="glass-strong rounded-3xl p-8 max-w-md w-full mx-4">
    <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
    <p className="text-gray-700 mb-6">
      Are you sure you want to proceed?
    </p>
    <div className="flex gap-3">
      <button className="glass-yellow rounded-xl px-6 py-2 font-semibold hover:scale-105 transition-transform">
        Confirm
      </button>
      <button className="glass rounded-xl px-6 py-2 hover:scale-105 transition-transform">
        Cancel
      </button>
    </div>
  </div>
</div>
```

### 4. Notification Toast

```tsx
<div className="glass-yellow rounded-2xl p-4 flex items-center gap-4 shadow-xl">
  <div className="text-2xl">✅</div>
  <div>
    <h4 className="font-semibold">Success!</h4>
    <p className="text-sm text-gray-700">Your changes have been saved.</p>
  </div>
</div>
```

### 5. Sidebar Panel

```tsx
<aside className="glass-dark h-screen w-64 p-6 text-white">
  <h2 className="text-xl font-bold mb-6">Menu</h2>
  <nav className="space-y-2">
    <a href="#" className="block glass-subtle rounded-lg px-4 py-2 hover:glass transition-all">
      Dashboard
    </a>
    <a href="#" className="block glass-subtle rounded-lg px-4 py-2 hover:glass transition-all">
      Settings
    </a>
    <a href="#" className="block glass-subtle rounded-lg px-4 py-2 hover:glass transition-all">
      Profile
    </a>
  </nav>
</aside>
```

### 6. Floating Action Button

```tsx
<button className="glass-yellow rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform fixed bottom-8 right-8">
  <span className="text-2xl">+</span>
</button>
```

### 7. Stats Card

```tsx
<div className="glass rounded-2xl p-6">
  <div className="text-sm text-gray-600 mb-1">Total Users</div>
  <div className="text-3xl font-bold mb-2">12,345</div>
  <div className="glass-yellow rounded-lg px-3 py-1 inline-block text-sm font-semibold">
    +12% this month
  </div>
</div>
```

### 8. Search Bar

```tsx
<div className="glass rounded-full px-6 py-3 flex items-center gap-3 max-w-md">
  <span className="text-gray-500">🔍</span>
  <input
    type="text"
    placeholder="Search..."
    className="bg-transparent border-none outline-none flex-1 text-gray-900 placeholder-gray-500"
  />
</div>
```

### 9. Profile Card

```tsx
<div className="glass-strong rounded-3xl p-8 text-center">
  <div className="glass-yellow rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center text-4xl">
    👤
  </div>
  <h3 className="text-xl font-bold mb-1">John Doe</h3>
  <p className="text-gray-600 mb-4">Product Designer</p>
  <button className="glass-purple rounded-xl px-6 py-2 font-semibold hover:scale-105 transition-transform">
    View Profile
  </button>
</div>
```

### 10. Pricing Card

```tsx
<div className="glass rounded-3xl p-8 hover:glass-strong transition-all">
  <div className="glass-yellow rounded-2xl px-4 py-2 inline-block mb-4 font-semibold">
    Popular
  </div>
  <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
  <div className="text-4xl font-bold mb-4">
    $29<span className="text-lg text-gray-600">/mo</span>
  </div>
  <ul className="space-y-2 mb-6 text-gray-700">
    <li>✓ Unlimited projects</li>
    <li>✓ Priority support</li>
    <li>✓ Advanced analytics</li>
  </ul>
  <button className="glass-purple rounded-xl px-6 py-3 w-full font-semibold hover:scale-105 transition-transform">
    Get Started
  </button>
</div>
```

### 11. Video Player Controls

```tsx
<div className="glass-dark rounded-2xl p-4 flex items-center gap-4">
  <button className="glass-subtle rounded-full w-12 h-12 flex items-center justify-center text-white hover:glass transition-all">
    ⏮
  </button>
  <button className="glass-yellow rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform">
    ▶️
  </button>
  <button className="glass-subtle rounded-full w-12 h-12 flex items-center justify-center text-white hover:glass transition-all">
    ⏭
  </button>
  <div className="flex-1 glass-subtle rounded-full h-2"></div>
  <span className="text-white text-sm">3:45 / 5:30</span>
</div>
```

### 12. Tag/Badge

```tsx
<div className="flex gap-2">
  <span className="glass-yellow rounded-full px-4 py-1 text-sm font-semibold">
    Design
  </span>
  <span className="glass-purple rounded-full px-4 py-1 text-sm font-semibold">
    Development
  </span>
  <span className="glass rounded-full px-4 py-1 text-sm font-semibold">
    Marketing
  </span>
</div>
```

## Composition Patterns

### Nested Glass for Depth

```tsx
<div className="glass rounded-3xl p-8">
  <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
  
  <div className="grid grid-cols-2 gap-4">
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="font-semibold mb-2">Metric 1</h3>
      <p className="text-3xl font-bold">1,234</p>
    </div>
    
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="font-semibold mb-2">Metric 2</h3>
      <p className="text-3xl font-bold">5,678</p>
    </div>
  </div>
</div>
```

### Glass with Gradient Background

```tsx
<div 
  className="min-h-screen p-8"
  style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}
>
  <div className="glass rounded-3xl p-8 max-w-4xl mx-auto">
    <h1 className="text-4xl font-bold mb-4">Glass on Gradient</h1>
    <p className="text-gray-700">
      Glass effects work beautifully on gradient backgrounds
    </p>
  </div>
</div>
```

### Responsive Glass Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="glass rounded-2xl p-6 hover:glass-strong transition-all">
      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
      <p className="text-gray-700">{item.description}</p>
    </div>
  ))}
</div>
```

## Animation Examples

### Hover Scale

```tsx
<div className="glass rounded-2xl p-6 hover:scale-105 hover:glass-strong transition-all duration-300 cursor-pointer">
  Hover to scale and strengthen
</div>
```

### Fade In

```tsx
<div className="glass rounded-2xl p-6 animate-fade-in">
  Fades in on mount
</div>
```

### Slide In

```tsx
<div className="glass rounded-2xl p-6 animate-slide-in">
  Slides in from right
</div>
```

## Tips for Best Results

1. **Use on colorful backgrounds**: Glass effects shine on gradients and images
2. **Combine with rounded corners**: `rounded-xl`, `rounded-2xl`, `rounded-3xl`
3. **Add hover effects**: `hover:scale-105`, `hover:glass-strong`
4. **Layer for depth**: Nest glass elements for hierarchy
5. **Mind the contrast**: Ensure text is readable on glass backgrounds
6. **Optimize for mobile**: Use `glass-subtle` on mobile devices
7. **Animate transitions**: Add `transition-all` for smooth changes

## Testing Your Implementation

To see these examples in action:

1. Import the demo component:
```tsx
import { GlassMorphismDemo } from './components/GlassMorphismDemo';
```

2. Add it to your app:
```tsx
<GlassMorphismDemo />
```

3. Open in different browsers to test compatibility
