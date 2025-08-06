'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  lastMessageAt: string;
  unreadCount: number;
  order?: {
    _id: string;
    title: string;
  };
  gig?: {
    _id: string;
    title: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      } else {
        console.error('Error fetching conversations:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant?.name.toLowerCase().includes(searchLower) ||
      otherParticipant?.email.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower) ||
      conversation.order?.title.toLowerCase().includes(searchLower) ||
      conversation.gig?.title.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage your conversations</p>
        </div>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredConversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          return (
            <Card key={conversation._id} className={conversation.unreadCount > 0 ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {otherParticipant?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{otherParticipant?.name || 'Unknown User'}</div>
                      <div className="text-sm text-muted-foreground">
                        {conversation.order?.title || conversation.gig?.title || 'General conversation'}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="secondary">{conversation.unreadCount}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(conversation.lastMessageAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {conversation.lastMessage.content}
                  </p>
                )}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Icons.messageCircle className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Icons.eye className="mr-1 h-3 w-3" />
                    View Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConversations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.messageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchQuery 
                ? 'Try adjusting your search terms to find conversations.'
                : 'You don\'t have any messages yet. Start a conversation to get connected with clients or freelancers.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 