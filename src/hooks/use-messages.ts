import { useState, useCallback, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/components/messaging/websocket-provider';
import { useAuth } from '@/app/AuthContext';

const MESSAGES_PER_PAGE = 20;

export interface Message {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  orderId: string;
  createdAt: string;
  read: boolean;
  attachments?: Array<{
    url: string;
    type: 'image' | 'document' | 'other';
    name: string;
    size: number;
  }>;
}

interface UseMessagesOptions {
  orderId: string;
  enabled?: boolean;
  onNewMessage?: (message: Message) => void;
}

export function useMessages({ orderId, enabled = true, onNewMessage }: UseMessagesOptions) {
  const queryClient = useQueryClient();
  const { messages: wsMessages, markAsRead } = useWebSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  // Fetch messages with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['messages', orderId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/messages?orderId=${orderId}&page=${pageParam}&limit=${MESSAGES_PER_PAGE}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MESSAGES_PER_PAGE) {
        return undefined; // No more pages
      }
      return allPages.length; // Next page number (0-based)
    },
    enabled: !!orderId && enabled,
    refetchOnWindowFocus: false,
    initialPageParam: 0,
  });

  // Flatten all pages of messages
  const allMessages = data?.pages.flat() || [];

  // Mark messages as read when they become visible
  useEffect(() => {
    if (!orderId) return;

    const unreadMessages = allMessages
      .filter((msg: Message) => !msg.read && msg.sender !== user?._id);

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg: Message) => msg.id);
      markAsRead(orderId, messageIds);
    }
  }, [orderId, allMessages, markAsRead, user?._id]);

  // Handle new WebSocket messages
  useEffect(() => {
    if (!orderId) return;

    const wsOrderMessages = wsMessages[orderId] || [];
    
    // Check for new messages that aren't in the query cache yet
    const newMessages = wsOrderMessages.filter(
      (wsMsg) => !allMessages.some((msg: Message) => msg.id === wsMsg.id)
    );

    // Add new messages to the query cache
    if (newMessages.length > 0) {
      queryClient.setQueryData(['messages', orderId], (oldData: any) => {
        if (!oldData) return { pages: [newMessages], pageParams: [0] };
        
        const newFirstPage = [...newMessages, ...(oldData.pages[0] || [])];
        return {
          ...oldData,
          pages: [newFirstPage, ...oldData.pages.slice(1)],
        };
      });

      // Notify parent component of new messages
      newMessages.forEach((msg) => onNewMessage?.(msg));
    }
  }, [orderId, wsMessages, allMessages, queryClient, onNewMessage]);

  // Handle typing indicators
  const handleTypingEvent = useCallback((data: { userId: string; isTyping: boolean }) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      if (data.isTyping) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });

    // Auto-clear typing indicator after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(new Set());
    }, 3000);
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle sending a typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    setIsTyping(isTyping);
    // In a real app, you would emit a WebSocket event here
    // socket?.emit('typing', { orderId, isTyping });
  }, [orderId]);

  // Handle sending a message
  const sendMessage = useCallback(async (content: string, attachments: any[] = []) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('orderId', orderId);
      
      // Append attachments if any
      attachments.forEach((file) => {
        formData.append('attachments', file.file);
      });
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [orderId]);

  return {
    messages: allMessages,
    isLoading,
    isError,
    error,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
    loadMore: fetchNextPage,
    isTyping,
    typingUsers: Array.from(typingUsers),
    sendTypingIndicator,
    sendMessage,
  };
}
