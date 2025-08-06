"use client";

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useWebSocket } from './websocket-provider';

interface TypingIndicatorProps {
  userId: string;
  orderId: string;
  className?: string;
}

export function TypingIndicator({ userId, orderId, className }: TypingIndicatorProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { isConnected } = useWebSocket();
  const debouncedStopTyping = useDebouncedCallback(() => {
    setIsTyping(false);
    // Send stop typing event to server
  }, 1000);

  useEffect(() => {
    // Subscribe to typing events
    const handleTyping = (data: { userId: string; orderId: string; isTyping: boolean }) => {
      if (data.orderId !== orderId) return;
      
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    // In a real app, you would subscribe to WebSocket events here
    // ws.on('typing', handleTyping);
    
    return () => {
      // Cleanup subscription
      // ws.off('typing', handleTyping);
    };
  }, [orderId]);

  const handleInputChange = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Send start typing event to server
      // ws.emit('typing', { userId, orderId, isTyping: true });
    }
    debouncedStopTyping();
  };

  if (typingUsers.size === 0) return null;

  return (
    <div className={cn("flex items-center space-x-1 text-xs text-muted-foreground px-4 py-1", className)}>
      <div className="flex space-x-1">
        {Array.from(typingUsers).map((typingUserId) => (
          <div key={typingUserId} className="font-medium">
            {typingUserId === userId ? 'You' : 'Someone'}
          </div>
        ))}
        <div>is typing</div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// Simple debounce hook
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number>();
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
