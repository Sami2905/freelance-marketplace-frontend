"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  orderId: string;
  orderTitle: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender: string;
    read: boolean;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
};

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  isLoading = false,
  onSearch,
  className,
}: ConversationListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations);

  // Update filtered conversations when search query or conversations change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(
      (conv) =>
        conv.orderTitle.toLowerCase().includes(query) ||
        conv.otherUser.name.toLowerCase().includes(query) ||
        conv.lastMessage?.content.toLowerCase().includes(query)
    );
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  // Format the last message time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Truncate long message content
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle conversation click
  const handleConversationClick = (orderId: string) => {
    router.push(`/messages/${orderId}`);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch) {
      onSearch(query);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-card', className)}>
      {/* Search bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Icons.messageSquare className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No conversations found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = pathname.includes(`/messages/${conversation.orderId}`);
              const lastMessage = conversation.lastMessage;
              const isLastMessageFromCurrentUser = lastMessage?.sender === currentUserId;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                    isActive && 'bg-muted/50 border-r-2 border-primary',
                    conversation.unreadCount > 0 && 'bg-muted/25'
                  )}
                  onClick={() => handleConversationClick(conversation.orderId)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {conversation.orderTitle}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {conversation.updatedAt ? formatTime(conversation.updatedAt) : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {isLastMessageFromCurrentUser && <span className="text-foreground">You: </span>}
                      {lastMessage ? (
                        truncate(lastMessage.content, 30)
                      ) : (
                        <span className="text-muted-foreground italic">No messages yet</span>
                      )}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center">
                    <span className="text-xs text-muted-foreground truncate">
                      With {conversation.otherUser.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Empty state for no conversations */}
      {conversations.length === 0 && !searchQuery && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Icons.messageSquare className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your conversations will appear here
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/orders')}
          >
            <Icons.plus className="h-4 w-4 mr-2" />
            Start a conversation
          </Button>
        </div>
      )}
    </div>
  );
}

// Button component for consistency
function Button({
  children,
  className,
  variant = 'default',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  onClick?: () => void;
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], 'h-10 py-2 px-4', className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
