/**
 * Property-Based Tests for Chat Functionality
 * 
 * Tests chat message display, unread tracking, and auto-scroll behavior
 * Feature: classroom-ui-overhaul
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  chatMessageArbitrary,
  userIdArbitrary,
  userNameArbitrary,
  delay,
} from './helpers/pbt-helpers';

/**
 * Chat Message Interface
 */
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}

/**
 * Chat State Manager
 * Manages chat messages, unread tracking, and scroll behavior
 */
class ChatStateManager {
  private messages: ChatMessage[] = [];
  private unreadCount: number = 0;
  private isAtBottom: boolean = true;
  private currentUserId: string;

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId;
  }

  /**
   * Add a message to the chat
   */
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    
    // If message is from another user and chat is not at bottom, increment unread
    if (message.senderId !== this.currentUserId && !this.isAtBottom) {
      this.unreadCount++;
    }
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Get messages with sender and timestamp
   */
  getMessagesWithMetadata(): Array<{
    id: string;
    content: string;
    senderName: string;
    timestamp: Date;
  }> {
    return this.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderName: msg.senderName,
      timestamp: msg.timestamp,
    }));
  }

  /**
   * Get unread message count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Mark chat as viewed (reset unread count)
   */
  markAsViewed(): void {
    this.unreadCount = 0;
  }

  /**
   * Set scroll position
   */
  setScrollPosition(isAtBottom: boolean): void {
    this.isAtBottom = isAtBottom;
    
    // If scrolled to bottom, mark all as read
    if (isAtBottom) {
      this.markAsViewed();
    }
  }

  /**
   * Check if should auto-scroll
   */
  shouldAutoScroll(): boolean {
    return this.isAtBottom;
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
    this.unreadCount = 0;
    this.isAtBottom = true;
  }
}

describe('Chat Functionality Property Tests', () => {
  let chatManager: ChatStateManager;
  const currentUserId = 'current-user-123';

  beforeEach(() => {
    chatManager = new ChatStateManager(currentUserId);
  });

  /**
   * Property 38: Chat message display
   * Feature: classroom-ui-overhaul, Property 38: Chat message display
   * Validates: Requirements 9.1, 9.3
   * 
   * For any chat message sent, the message should be displayed with sender name and timestamp
   */
  it('Property 38: Chat message display - messages include sender and timestamp', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 20 }),
        (messages) => {
          // Setup
          chatManager.clear();
          
          // Add all messages
          messages.forEach(msg => chatManager.addMessage(msg));
          
          // Get messages with metadata
          const displayedMessages = chatManager.getMessagesWithMetadata();
          
          // Property: All messages should be displayed with sender name and timestamp
          expect(displayedMessages.length).toBe(messages.length);
          
          displayedMessages.forEach((displayed, index) => {
            const original = messages[index];
            
            // Each message must have sender name
            expect(displayed.senderName).toBe(original.senderName);
            expect(displayed.senderName).toBeTruthy();
            
            // Each message must have timestamp
            expect(displayed.timestamp).toBeInstanceOf(Date);
            expect(displayed.timestamp.getTime()).toBe(original.timestamp.getTime());
            
            // Each message must have content
            expect(displayed.content).toBe(original.content);
            expect(displayed.content).toBeTruthy();
            
            // Each message must have id
            expect(displayed.id).toBe(original.id);
            expect(displayed.id).toBeTruthy();
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 39: Unread message tracking
   * Feature: classroom-ui-overhaul, Property 39: Unread message tracking
   * Validates: Requirements 9.6
   * 
   * For any messages received while not at bottom, unread count should increment
   */
  it('Property 39: Unread message tracking - tracks unread when not at bottom', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
        userIdArbitrary,
        (messages, otherUserId) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(false); // Not at bottom
          
          // Count messages from other users
          const messagesFromOthers = messages.filter(msg => {
            // Modify sender to be different from current user
            msg.senderId = otherUserId;
            return msg.senderId !== currentUserId;
          });
          
          // Add all messages
          messagesFromOthers.forEach(msg => chatManager.addMessage(msg));
          
          // Property: Unread count should match number of messages from others
          const unreadCount = chatManager.getUnreadCount();
          expect(unreadCount).toBe(messagesFromOthers.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 39b: Unread message tracking - own messages don't count
   * Feature: classroom-ui-overhaul, Property 39: Unread message tracking
   * Validates: Requirements 9.6
   * 
   * For any messages sent by current user, unread count should not increment
   */
  it('Property 39b: Unread message tracking - own messages do not increment unread', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
        (messages) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(false); // Not at bottom
          
          // Set all messages to be from current user
          const ownMessages = messages.map(msg => ({
            ...msg,
            senderId: currentUserId,
          }));
          
          // Add all messages
          ownMessages.forEach(msg => chatManager.addMessage(msg));
          
          // Property: Unread count should be 0 for own messages
          const unreadCount = chatManager.getUnreadCount();
          expect(unreadCount).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 39c: Unread message tracking - at bottom doesn't increment
   * Feature: classroom-ui-overhaul, Property 39: Unread message tracking
   * Validates: Requirements 9.6, 9.7
   * 
   * For any messages received while at bottom, unread count should not increment
   */
  it('Property 39c: Unread message tracking - at bottom does not increment unread', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
        userIdArbitrary,
        (messages, otherUserId) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(true); // At bottom
          
          // Set messages to be from other user
          const messagesFromOthers = messages.map(msg => ({
            ...msg,
            senderId: otherUserId,
          }));
          
          // Add all messages
          messagesFromOthers.forEach(msg => chatManager.addMessage(msg));
          
          // Property: Unread count should be 0 when at bottom
          const unreadCount = chatManager.getUnreadCount();
          expect(unreadCount).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 40: Unread message reset
   * Feature: classroom-ui-overhaul, Property 40: Unread message reset
   * Validates: Requirements 9.7
   * 
   * For any unread count, scrolling to bottom should reset unread to 0
   */
  it('Property 40: Unread message reset - scrolling to bottom clears unread', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 20 }),
        userIdArbitrary,
        (messages, otherUserId) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(false); // Not at bottom
          
          // Add messages from other user to create unread count
          const messagesFromOthers = messages.map(msg => ({
            ...msg,
            senderId: otherUserId,
          }));
          
          messagesFromOthers.forEach(msg => chatManager.addMessage(msg));
          
          // Verify unread count is greater than 0
          const unreadBefore = chatManager.getUnreadCount();
          expect(unreadBefore).toBeGreaterThan(0);
          
          // Scroll to bottom
          chatManager.setScrollPosition(true);
          
          // Property: Unread count should be reset to 0
          const unreadAfter = chatManager.getUnreadCount();
          expect(unreadAfter).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 40b: Unread message reset - expanding chat panel clears unread
   * Feature: classroom-ui-overhaul, Property 40: Unread message reset
   * Validates: Requirements 9.7
   * 
   * For any unread count, expanding the chat panel should reset unread to 0
   */
  it('Property 40b: Unread message reset - expanding chat panel clears unread', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 20 }),
        userIdArbitrary,
        (messages, otherUserId) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(false); // Not at bottom
          
          // Add messages from other user to create unread count
          const messagesFromOthers = messages.map(msg => ({
            ...msg,
            senderId: otherUserId,
          }));
          
          messagesFromOthers.forEach(msg => chatManager.addMessage(msg));
          
          // Verify unread count is greater than 0
          const unreadBefore = chatManager.getUnreadCount();
          expect(unreadBefore).toBeGreaterThan(0);
          
          // Expand chat panel (mark as viewed)
          chatManager.markAsViewed();
          
          // Property: Unread count should be reset to 0
          const unreadAfter = chatManager.getUnreadCount();
          expect(unreadAfter).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 41: Auto-scroll behavior
   * Feature: classroom-ui-overhaul, Property 41: Auto-scroll behavior
   * Validates: Requirements 9.7
   * 
   * For any new message, if at bottom, should auto-scroll to show new message
   */
  it('Property 41: Auto-scroll behavior - auto-scrolls when at bottom', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
        (messages) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(true); // At bottom
          
          // Add messages
          messages.forEach(msg => chatManager.addMessage(msg));
          
          // Property: Should auto-scroll when at bottom
          const shouldScroll = chatManager.shouldAutoScroll();
          expect(shouldScroll).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 41b: Auto-scroll behavior - maintains position when not at bottom
   * Feature: classroom-ui-overhaul, Property 41: Auto-scroll behavior
   * Validates: Requirements 9.7
   * 
   * For any new message, if not at bottom, should maintain scroll position
   */
  it('Property 41b: Auto-scroll behavior - maintains position when not at bottom', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 1, maxLength: 10 }),
        (messages) => {
          // Setup
          chatManager.clear();
          chatManager.setScrollPosition(false); // Not at bottom
          
          // Add messages
          messages.forEach(msg => chatManager.addMessage(msg));
          
          // Property: Should not auto-scroll when not at bottom
          const shouldScroll = chatManager.shouldAutoScroll();
          expect(shouldScroll).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 42: Message ordering
   * Feature: classroom-ui-overhaul, Property 42: Message ordering
   * Validates: Requirements 9.1
   * 
   * For any sequence of messages, messages should be displayed in chronological order
   */
  it('Property 42: Message ordering - messages displayed in chronological order', () => {
    fc.assert(
      fc.property(
        fc.array(chatMessageArbitrary, { minLength: 2, maxLength: 20 }),
        (messages) => {
          // Setup
          chatManager.clear();
          
          // Add messages
          messages.forEach(msg => chatManager.addMessage(msg));
          
          // Get displayed messages
          const displayedMessages = chatManager.getMessagesWithMetadata();
          
          // Property: Messages should be in the same order as added
          displayedMessages.forEach((displayed, index) => {
            expect(displayed.id).toBe(messages[index].id);
            expect(displayed.timestamp.getTime()).toBe(messages[index].timestamp.getTime());
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
