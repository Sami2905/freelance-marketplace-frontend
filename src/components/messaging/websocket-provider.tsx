"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { toast } from '@/components/ui/use-toast';

type Message = {
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
};

type WebSocketContextType = {
  messages: Record<string, Message[]>; // key: orderId, value: messages array
  sendMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (orderId: string, messageIds: string[]) => void;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connectWebSocket = () => {
    if (!isAuthenticated || !user) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Send authentication message
      ws.current?.send(JSON.stringify({
        type: 'AUTH',
        token: localStorage.getItem('token'),
        userId: user._id,
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'NEW_MESSAGE':
            handleNewMessage(data.message);
            break;
          case 'MESSAGE_READ':
            handleMessageRead(data.orderId, data.messageIds);
            break;
          case 'TYPING':
            // Handle typing indicator
            break;
          case 'ERROR':
            console.error('WebSocket error:', data.message);
            toast({
              title: 'Error',
              description: data.message,
              variant: 'destructive',
            });
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current - 1);
        console.log(`Attempting to reconnect in ${delay}ms...`);
        setTimeout(connectWebSocket, delay);
      } else {
        console.error('Max reconnection attempts reached');
        toast({
          title: 'Connection lost',
          description: 'Unable to connect to the server. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => {
      const orderMessages = prev[message.orderId] || [];
      
      // Check if message already exists
      const messageExists = orderMessages.some((msg) => msg.id === message.id);
      if (messageExists) return prev;
      
      return {
        ...prev,
        [message.orderId]: [...orderMessages, message],
      };
    });
    
    // Show notification if not in the current conversation
    const isCurrentConversation = window.location.pathname.includes(`/messages/${message.orderId}`);
    if (!isCurrentConversation && message.sender !== user?._id) {
      toast({
        title: 'New message',
        description: `You have a new message in order ${message.orderId}`,
        action: (
          <a href={`/messages/${message.orderId}`} className="text-primary">
            View
          </a>
        ),
      });
    }
  };

  const handleMessageRead = (orderId: string, messageIds: string[]) => {
    setMessages((prev) => {
      const orderMessages = prev[orderId];
      if (!orderMessages) return prev;
      
      return {
        ...prev,
        [orderId]: orderMessages.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        ),
      };
    });
  };

  const sendMessage = (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => {
    if (!isConnected || !ws.current) {
      toast({
        title: 'Connection error',
        description: 'Not connected to the server. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    ws.current.send(
      JSON.stringify({
        type: 'SEND_MESSAGE',
        message: {
          ...message,
          createdAt: new Date().toISOString(),
          read: false,
        },
      })
    );
  };

  const markAsRead = (orderId: string, messageIds: string[]) => {
    if (!isConnected || !ws.current) return;
    
    ws.current.send(
      JSON.stringify({
        type: 'MARK_AS_READ',
        orderId,
        messageIds,
      })
    );
    
    // Update local state optimistically
    handleMessageRead(orderId, messageIds);
  };

  // Connect on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
    }
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isAuthenticated, user?._id]);

  return (
    <WebSocketContext.Provider
      value={{
        messages,
        sendMessage,
        markAsRead,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
