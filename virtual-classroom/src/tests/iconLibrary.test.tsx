/**
 * Icon Library Test
 * 
 * Tests the lucide-react icon library integration
 * Validates that icons can be imported and rendered correctly
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  // Control Toolbar Icons
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageCircle,
  LogOut,
  // Whiteboard Tool Icons
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Minus,
  Type,
  Eraser,
  Hand,
  // Whiteboard Action Icons
  Undo,
  Redo,
  Trash2,
  Save,
  // Chat Icons
  Send,
  Paperclip,
  // AI Assistant Icons
  Bot,
  Search,
  Image,
  Loader2,
  // Presentation Panel Icons
  FileText,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  // Video Call Icons
  Signal,
  Settings,
  User,
  // General UI Icons
  X,
  Menu,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

describe('Icon Library Integration', () => {
  describe('Icon Imports', () => {
    it('should import control toolbar icons', () => {
      expect(Mic).toBeDefined();
      expect(MicOff).toBeDefined();
      expect(Video).toBeDefined();
      expect(VideoOff).toBeDefined();
      expect(Monitor).toBeDefined();
      expect(MessageCircle).toBeDefined();
      expect(LogOut).toBeDefined();
    });

    it('should import whiteboard tool icons', () => {
      expect(MousePointer2).toBeDefined();
      expect(Pencil).toBeDefined();
      expect(Square).toBeDefined();
      expect(Circle).toBeDefined();
      expect(Minus).toBeDefined();
      expect(Type).toBeDefined();
      expect(Eraser).toBeDefined();
      expect(Hand).toBeDefined();
    });

    it('should import whiteboard action icons', () => {
      expect(Undo).toBeDefined();
      expect(Redo).toBeDefined();
      expect(Trash2).toBeDefined();
      expect(Save).toBeDefined();
    });

    it('should import chat icons', () => {
      expect(Send).toBeDefined();
      expect(Paperclip).toBeDefined();
    });

    it('should import AI assistant icons', () => {
      expect(Bot).toBeDefined();
      expect(Search).toBeDefined();
      expect(Image).toBeDefined();
      expect(Loader2).toBeDefined();
    });

    it('should import presentation panel icons', () => {
      expect(FileText).toBeDefined();
      expect(Upload).toBeDefined();
      expect(Download).toBeDefined();
      expect(ZoomIn).toBeDefined();
      expect(ZoomOut).toBeDefined();
      expect(Maximize).toBeDefined();
      expect(Minimize).toBeDefined();
    });

    it('should import video call icons', () => {
      expect(Signal).toBeDefined();
      expect(Settings).toBeDefined();
      expect(User).toBeDefined();
    });

    it('should import general UI icons', () => {
      expect(X).toBeDefined();
      expect(Menu).toBeDefined();
      expect(Info).toBeDefined();
      expect(AlertTriangle).toBeDefined();
      expect(AlertCircle).toBeDefined();
      expect(CheckCircle).toBeDefined();
      expect(ArrowLeft).toBeDefined();
      expect(ArrowRight).toBeDefined();
      expect(ArrowUp).toBeDefined();
      expect(ArrowDown).toBeDefined();
      expect(ChevronLeft).toBeDefined();
      expect(ChevronRight).toBeDefined();
      expect(ChevronUp).toBeDefined();
      expect(ChevronDown).toBeDefined();
    });
  });

  describe('Icon Rendering', () => {
    it('should render icons with default props', () => {
      const { container } = render(<Mic />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('should render icons with custom size', () => {
      const { container } = render(<Video size={32} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should render icons with custom color', () => {
      const { container } = render(<MessageCircle color="#FDC500" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Lucide icons apply color via stroke attribute
      expect(svg).toHaveAttribute('stroke', '#FDC500');
    });

    it('should render icons with custom className', () => {
      const { container } = render(<Send className="text-yellow-500" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-yellow-500');
    });

    it('should render icons with custom strokeWidth', () => {
      const { container } = render(<Pencil strokeWidth={3} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('stroke-width', '3');
    });

    it('should render multiple icons simultaneously', () => {
      const { container } = render(
        <div>
          <Mic data-testid="mic-icon" />
          <Video data-testid="video-icon" />
          <MessageCircle data-testid="chat-icon" />
        </div>
      );
      
      expect(screen.getByTestId('mic-icon')).toBeInTheDocument();
      expect(screen.getByTestId('video-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chat-icon')).toBeInTheDocument();
    });
  });

  describe('Icon Accessibility', () => {
    it('should render icons with aria-label when wrapped in button', () => {
      render(
        <button aria-label="Mute microphone">
          <MicOff />
        </button>
      );
      
      const button = screen.getByRole('button', { name: 'Mute microphone' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-hidden for decorative icons', () => {
      const { container } = render(<Bot aria-hidden="true" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Icon Styling', () => {
    it('should apply brand yellow color', () => {
      const { container } = render(<Mic color="#FDC500" />);
      const svg = container.querySelector('svg');
      // Lucide icons apply color via stroke attribute
      expect(svg).toHaveAttribute('stroke', '#FDC500');
    });

    it('should apply brand purple color', () => {
      const { container } = render(<MessageCircle color="#5C0099" />);
      const svg = container.querySelector('svg');
      // Lucide icons apply color via stroke attribute
      expect(svg).toHaveAttribute('stroke', '#5C0099');
    });

    it('should support Tailwind classes', () => {
      const { container } = render(
        <Video className="text-yellow-500 hover:scale-110 transition-transform" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-500');
      expect(svg).toHaveClass('hover:scale-110');
      expect(svg).toHaveClass('transition-transform');
    });

    it('should support inline styles', () => {
      const { container } = render(
        <Send style={{ transform: 'rotate(45deg)' }} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ transform: 'rotate(45deg)' });
    });
  });

  describe('Icon Animation', () => {
    it('should support spinning animation for loader', () => {
      const { container } = render(
        <Loader2 className="animate-spin" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('should support transition classes', () => {
      const { container } = render(
        <Pencil className="transition-all duration-300" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('transition-all');
      expect(svg).toHaveClass('duration-300');
    });
  });

  describe('Icon Component Types', () => {
    it('should be valid React components', () => {
      const icons = [
        Mic, Video, MessageCircle, Pencil, Send, Bot,
        FileText, Signal, X, CheckCircle
      ];
      
      icons.forEach(Icon => {
        // Lucide icons are objects with a render function, not plain functions
        expect(Icon).toBeDefined();
        const { container } = render(<Icon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('Icon Performance', () => {
    it('should render icons efficiently', () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <Mic key={i} size={24} />
          ))}
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Rendering 50 icons should take less than 100ms
      expect(renderTime).toBeLessThan(100);
    });
  });
});
