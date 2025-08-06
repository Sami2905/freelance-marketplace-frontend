"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar: string
  }
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
}

interface Conversation {
  id: string
  participants: Array<{
    id: string
    name: string
    avatar: string
    isOnline: boolean
  }>
  lastMessage: {
    content: string
    timestamp: Date
    senderId: string
  }
  unreadCount: number
}

export function MessagingLayout() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Mock data - replace with real data from your API
  useEffect(() => {
    // Simulate loading conversations
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          {
            id: '2',
            name: 'Alex Johnson',
            avatar: '/avatars/02.png',
            isOnline: true
          }
        ],
        lastMessage: {
          content: 'Hey, I was wondering about the project timeline...',
          timestamp: new Date('2025-07-24T10:30:00'),
          senderId: '2'
        },
        unreadCount: 2
      },
      // Add more mock conversations as needed
    ]
    
    setConversations(mockConversations)
    
    // Set the first conversation as active by default
    if (mockConversations.length > 0) {
      setActiveConversation(mockConversations[0].id)
    }
  }, [])

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) return
    
    // Simulate loading messages for the active conversation
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey there!',
        sender: {
          id: '2',
          name: 'Alex Johnson',
          avatar: '/avatars/02.png'
        },
        timestamp: new Date('2025-07-24T10:20:00'),
        status: 'read',
        type: 'text'
      },
      // Add more mock messages as needed
    ]
    
    setMessages(mockMessages)
  }, [activeConversation])

  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return
    
    // In a real app, you would send this message to your backend
    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: {
        id: '1', // Current user ID
        name: 'You',
        avatar: '/avatars/01.png'
      },
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage("")
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      )
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    // In a real app, you would emit a typing indicator event to the server
    if (!isTyping) {
      setIsTyping(true)
      // Send typing started event
    }
    
    // Reset typing indicator after 3 seconds of inactivity
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false)
      // Send typing stopped event
    }, 3000)
    
    setTypingTimeout(timeout)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // In a real app, you would upload the file to your storage service
    // and then send a message with the file URL
    const fileUrl = URL.createObjectURL(file)
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: '',
      sender: {
        id: '1', // Current user ID
        name: 'You',
        avatar: '/avatars/01.png'
      },
      timestamp: new Date(),
      status: 'sent',
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileUrl,
      fileName: file.name,
      fileSize: file.size
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Simulate file upload and message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      )
    }, 1000)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations sidebar */}
      <div 
        className={cn(
          "w-full border-r bg-background/95 backdrop-blur sm:w-80 md:w-96",
          isMobile && !showSidebar && "hidden"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Icons.plus className="h-5 w-5" />
            <span className="sr-only">New message</span>
          </Button>
        </div>
        
        <div className="p-2">
          <div className="relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="w-full rounded-lg bg-background pl-8"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-7rem)]">
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={activeConversation === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 p-3"
                onClick={() => {
                  setActiveConversation(conversation.id)
                  if (isMobile) setShowSidebar(false)
                }}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={conversation.participants[0].avatar} 
                      alt={conversation.participants[0].name} 
                    />
                    <AvatarFallback>
                      {conversation.participants[0].name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participants[0].isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"></span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {conversation.participants[0].name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {conversation.lastMessage.senderId === '1' 
                      ? `You: ${conversation.lastMessage.content}`
                      : conversation.lastMessage.content}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Chat area */}
      <div className={cn(
        "flex flex-1 flex-col",
        isMobile && showSidebar && "hidden"
      )}>
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="flex h-16 items-center border-b px-4">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2"
                  onClick={() => setShowSidebar(true)}
                >
                  <Icons.chevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back to conversations</span>
                </Button>
              )}
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={conversations.find(c => c.id === activeConversation)?.participants[0].avatar || ''} 
                    alt={conversations.find(c => c.id === activeConversation)?.participants[0].name || ''} 
                  />
                  <AvatarFallback>
                    {conversations.find(c => c.id === activeConversation)?.participants[0].name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">
                    {conversations.find(c => c.id === activeConversation)?.participants[0].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conversations.find(c => c.id === activeConversation)?.participants[0].isOnline 
                      ? 'Online' 
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Icons.phone className="h-5 w-5" />
                  <span className="sr-only">Voice call</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Icons.video className="h-5 w-5" />
                  <span className="sr-only">Video call</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Icons.moreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex max-w-[80%]",
                      msg.sender.id === '1' ? "ml-auto justify-end" : "mr-auto"
                    )}
                  >
                    {msg.sender.id !== '1' && (
                      <Avatar className="h-8 w-8 self-end">
                        <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                        <AvatarFallback>
                          {msg.sender.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={cn(
                        "rounded-2xl px-4 py-2",
                        msg.sender.id === '1' 
                          ? "rounded-br-none bg-primary text-primary-foreground"
                          : "rounded-bl-none bg-muted"
                      )}
                    >
                      {msg.type === 'text' ? (
                        <p>{msg.content}</p>
                      ) : msg.type === 'image' ? (
                        <div className="relative">
                          <img 
                            src={msg.fileUrl} 
                            alt={msg.fileName} 
                            className="max-h-64 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                            <Button variant="ghost" size="icon">
                              <Icons.download className="h-5 w-5 text-white" />
                              <span className="sr-only">Download</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Icons.file className="h-5 w-5" />
                          <div className="max-w-[200px]">
                            <p className="truncate font-medium">{msg.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(msg.fileSize || 0) > 1024 * 1024
                                ? `${(msg.fileSize || 0) / (1024 * 1024)} MB`
                                : `${Math.ceil((msg.fileSize || 0) / 1024)} KB`}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <span className="text-xs text-muted-foreground/70">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.sender.id === '1' && (
                          <span className="text-xs">
                            {msg.status === 'sent' && <Icons.check className="h-3 w-3" />}
                            {msg.status === 'delivered' && <Icons.checkCheck className="h-3 w-3" />}
                            {msg.status === 'read' && (
                              <Icons.checkCheck className="h-3 w-3 text-blue-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex max-w-[80%] mr-auto">
                    <Avatar className="h-8 w-8 self-end">
                      <AvatarImage 
                        src={conversations.find(c => c.id === activeConversation)?.participants[0].avatar || ''} 
                        alt={conversations.find(c => c.id === activeConversation)?.participants[0].name || ''} 
                      />
                      <AvatarFallback>
                        {conversations.find(c => c.id === activeConversation)?.participants[0].name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 flex items-center space-x-1 rounded-2xl rounded-bl-none bg-muted px-4 py-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Message input */}
            <div className="border-t p-4">
              <div className="relative">
                <div className="absolute left-3 top-3 flex gap-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <Icons.plus className="h-5 w-5" />
                    <span className="sr-only">Add attachment</span>
                  </Button>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Icons.paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </div>
                <Input
                  placeholder="Type a message..."
                  className="min-h-[48px] resize-none py-3 pl-14 pr-24"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-3 flex gap-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <Icons.mic className="h-5 w-5" />
                    <span className="sr-only">Send voice message</span>
                  </Button>
                  <Button 
                    type="button" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Icons.send className="h-5 w-5" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Icons.messageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No conversation selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a conversation or start a new one to begin messaging
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
