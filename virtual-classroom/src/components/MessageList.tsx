import { useEffect, useRef, memo, useMemo } from 'react';
import type { AIMessage, MediaContent } from '../types/ai.types';
import MediaRenderer from './MediaRenderer';

interface MessageListProps {
  messages: AIMessage[];
  isLoading?: boolean;
  onMediaShare?: (media: MediaContent) => void;
}

// Memoized message component for better performance
const Message = memo(({ message, onMediaShare }: { message: AIMessage; onMediaShare?: (media: MediaContent) => void }) => (
  <div
    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
  >
    <div
      className={`rounded-lg max-w-[80%] ${
        message.role === 'user'
          ? 'bg-[#5C0099] text-white rounded-br-sm'
          : 'bg-white/10 text-white rounded-bl-sm'
      }`}
    >
      <div className="px-2.5 py-1">
        <p className="text-[11px] leading-snug whitespace-pre-wrap break-words">{message.content}</p>
        {message.timestamp && (
          <p className="text-[9px] text-white/40 mt-0.5">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      {message.media && message.media.length > 0 && (
        <div className="px-2 pb-2 space-y-1.5">
          {message.media.map((media, index) => (
            <MediaRenderer 
              key={index} 
              media={media} 
              onShare={onMediaShare}
            />
          ))}
        </div>
      )}
    </div>
  </div>
));

Message.displayName = 'Message';

function MessageList({ messages, isLoading, onMediaShare }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Virtual scrolling: only render visible messages for large lists
  const visibleMessages = useMemo(() => {
    // For lists under 50 messages, render all
    if (messages.length <= 50) {
      return messages;
    }
    // For larger lists, only render the last 50 messages
    return messages.slice(-50);
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto mb-2 space-y-1.5 px-1">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="w-16 h-16 bg-[#5C0099] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#5C0099]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-2">Start a conversation</p>
          <p className="text-gray-400 text-xs max-w-xs">
            Ask me anything about language learning, request images or videos, and I'll help you!
          </p>
        </div>
      )}

      {visibleMessages.map((message) => (
        <Message key={message.id} message={message} onMediaShare={onMediaShare} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white/10 text-white rounded-lg rounded-bl-sm px-2.5 py-1.5 max-w-[80%]">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#5C0099] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#C86BFA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#FDC500] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default memo(MessageList);
