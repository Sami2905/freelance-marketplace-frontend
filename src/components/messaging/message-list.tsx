"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { useWebSocket } from './websocket-provider';
import { cn } from '@/lib/utils';

interface MessageListProps {
  orderId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  className?: string;
  onImageClick?: (url: string) => void;
  onLoadMore?: () => Promise<boolean>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function MessageList({
  orderId,
  currentUserId,
  otherUser,
  className,
  onImageClick,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: MessageListProps) {
  const { messages, markAsRead } = useWebSocket();
  const [unreadMessageIds, setUnreadMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Get messages for the current order
  const orderMessages = messages[orderId] || [];
  
  // Group messages by date
  const groupedMessages = orderMessages.reduce<Record<string, typeof orderMessages>>((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Handle loading more messages when scrolling to the top
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && onLoadMore) {
      const list = listRef.current;
      if (list) {
        // Save current scroll position
        const { scrollTop, scrollHeight } = list;
        setPrevScrollHeight(scrollHeight);
        
        // Load more messages
        onLoadMore().then((hasMore) => {
          if (hasMore && list && prevScrollHeight !== null) {
            // Restore scroll position after loading
            requestAnimationFrame(() => {
              if (list) {
                list.scrollTop = list.scrollHeight - prevScrollHeight;
              }
            });
          }
        });
      }
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore, prevScrollHeight]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [orderMessages.length, autoScroll, isAtBottom]);

  // Track unread messages
  useEffect(() => {
    const unreadIds = new Set<string>();
    
    orderMessages.forEach((message) => {
      if (!message.read && message.sender !== currentUserId) {
        unreadIds.add(message.id);
      }
    });
    
    setUnreadMessageIds(unreadIds);
    
    // Mark messages as read when they become visible
    if (unreadIds.size > 0 && document.visibilityState === 'visible') {
      markAsRead(orderId, Array.from(unreadIds));
    }
  }, [orderId, orderMessages, currentUserId, markAsRead]);

  // Handle window visibility changes to mark messages as read
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && unreadMessageIds.size > 0) {
        markAsRead(orderId, Array.from(unreadMessageIds));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [orderId, unreadMessageIds, markAsRead]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    
    setIsAtBottom(isNearBottom);
    
    // Disable auto-scroll if user scrolls up
    if (autoScroll && !isNearBottom) {
      setAutoScroll(false);
    } else if (!autoScroll && isNearBottom) {
      setAutoScroll(true);
    }
  }, [autoScroll]);

  // Scroll to bottom button click handler
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setAutoScroll(true);
    }
  };

  // Format date header
  const formatDateHeader = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    
    if (isSameDay(today, date)) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(yesterday, date)) {
      return 'Yesterday';
    }
    
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className={cn('flex flex-col h-full relative', className)}>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
        onScroll={handleScroll}
      >
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-2">
            {isLoadingMore ? (
              <div className="flex items-center space-x-2">
                <Icons.loader className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more messages...</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => onLoadMore?.()}
              >
                Load more messages
              </Button>
            )}
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 flex justify-center">
              <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                {formatDateHeader(date)}
              </div>
            </div>
            
            {dateMessages.map((message, index, arr) => {
              const isCurrentUser = message.sender === currentUserId;
              const nextMessage = arr[index + 1];
              const showAvatar = !nextMessage || nextMessage.sender !== message.sender;
              const showTimestamp = !nextMessage || 
                new Date(message.createdAt).getTime() - new Date(nextMessage.createdAt).getTime() > 5 * 60 * 1000;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  showTimestamp={showTimestamp}
                  onImageClick={onImageClick}
                />
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {!isAtBottom && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full h-10 w-10 shadow-lg"
          onClick={scrollToBottom}
        >
          <Icons.arrowDown className="h-5 w-5" />
          <span className="sr-only">Scroll to bottom</span>
        </Button>
      )}
    </div>
  );
}

// Skeleton loader for message list
export function MessageListSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-2',
            i % 2 === 0 ? 'justify-start' : 'justify-end'
          )}
        >
          {i % 2 === 0 && (
            <Skeleton className="h-8 w-8 rounded-full" />
          )}
          <div className="space-y-2 max-w-[80%]">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-48" />
          </div>
          {i % 2 !== 0 && (
            <Skeleton className="h-8 w-8 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}
