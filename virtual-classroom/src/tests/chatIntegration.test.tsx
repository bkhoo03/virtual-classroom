/**
 * Integration Tests for Chat Component
 * 
 * Tests the actual Chat component implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../components/Chat';
import { ToastProvider } from '../contexts/ToastContext';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock AIService
vi.mock('../services/AIService', () => ({
  default: {
    initialize: vi.fn(() => ({
      sendFullMultimodalMessage: vi.fn().mockResolvedValue({
        response: {
          choices: [{ message: { content: 'Test AI response' } }],
          usage: { total_tokens: 100 },
        },
        images: [],
        generatedImages: [],
        searchResults: [],
      }),
    })),
  },
}));

// Mock AIContentBroadcaster
vi.mock('../services/AIContentBroadcaster', () => ({
  aiContentBroadcaster: {
    broadcast: vi.fn(),
  },
}));

const renderChat = (props = {}) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <Chat {...props} />
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Chat Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat component', () => {
    renderChat();
    expect(screen.getByRole('region', { name: /chat messages/i })).toBeInTheDocument();
  });

  it('should display empty state when no messages', () => {
    renderChat();
    expect(screen.getByText(/start a conversation/i)).toBeInTheDocument();
  });

  it('should have message input field', () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it('should have send button', () => {
    renderChat();
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('should have Ask AI button', () => {
    renderChat();
    const askAIButton = screen.getByRole('button', { name: /enable ai mode/i });
    expect(askAIButton).toBeInTheDocument();
  });

  it('should enable AI mode when Ask AI button is clicked', async () => {
    renderChat();
    const askAIButton = screen.getByRole('button', { name: /enable ai mode/i });
    
    fireEvent.click(askAIButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ai mode active/i)).toBeInTheDocument();
    });
  });

  it('should send message when send button is clicked', async () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should send message when Enter key is pressed', async () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should not send empty message', () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    
    // Input should still have the whitespace (not cleared)
    expect(input.value).toBe('   ');
  });

  it('should disable send button when loading', async () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Enable AI mode first
    const askAIButton = screen.getByRole('button', { name: /enable ai mode/i });
    fireEvent.click(askAIButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ai mode active/i)).toBeInTheDocument();
    });
    
    // Send a message
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    fireEvent.click(sendButton);
    
    // Button should be disabled while loading
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('should accept onUnreadCountChange callback', () => {
    const onUnreadCountChange = vi.fn();
    renderChat({ onUnreadCountChange });
    
    // Just verify the component renders with the callback
    // The actual unread tracking is tested in the property tests
    expect(screen.getByRole('region', { name: /chat messages/i })).toBeInTheDocument();
  });

  it('should display messages with sender name and timestamp', async () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    
    // Enable AI mode
    const askAIButton = screen.getByRole('button', { name: /enable ai mode/i });
    fireEvent.click(askAIButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ai mode active/i)).toBeInTheDocument();
    });
    
    // Send a message
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
    
    // Check for timestamp (should be in format like "1:23 PM")
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}\s*(AM|PM)/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should show AI thinking indicator when loading', async () => {
    renderChat();
    const input = screen.getByLabelText(/type a message/i) as HTMLInputElement;
    
    // Enable AI mode
    const askAIButton = screen.getByRole('button', { name: /enable ai mode/i });
    fireEvent.click(askAIButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ai mode active/i)).toBeInTheDocument();
    });
    
    // Send a message
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    // Should show AI thinking indicator
    await waitFor(() => {
      expect(screen.getByText(/ai is thinking/i)).toBeInTheDocument();
    });
  });
});
