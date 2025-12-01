import { useState } from 'react';
import type { KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showAskAI?: boolean; // Option to show/hide Ask AI button
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Ask me anything...",
  showAskAI = true
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-[#C86BFA] focus:border-2 disabled:bg-white/5 disabled:cursor-not-allowed transition-colors"
      />
      {showAskAI && (
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="px-4 py-2 bg-[#FDC500] rounded-lg flex items-center gap-2 text-gray-900 text-sm font-medium hover:bg-[#FFD500] disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-label="Ask AI"
        >
          {disabled ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Ask AI
            </>
          )}
        </button>
      )}
      {!showAskAI && (
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="w-10 h-10 bg-[#FDC500] rounded-full flex items-center justify-center text-[#03071E] hover:bg-[#FFD500] disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      )}
    </div>
  );
}
