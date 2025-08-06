"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { TypingIndicator } from './typing-indicator';
import { MessageList, MessageListSkeleton } from './message-list';
import { FileUpload, type FileWithPreview } from './file-upload';
import { useWebSocket } from './websocket-provider';

const messageFormSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface MessagingInterfaceProps {
  orderId: string;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  className?: string;
  initialMessages?: Array<{
    id: string;
    content: string;
    sender: string;
    recipient: string;
    createdAt: string;
    read: boolean;
    attachments?: Array<{
      url: string;
      type: 'image' | 'document' | 'other';
      name: string;
      size: number;
    }>;
  }>;
  onSendMessage?: (
    content: string,
    attachments?: FileWithPreview[]
  ) => Promise<void>;
  onLoadMore?: () => Promise<boolean>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isTyping?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}

export function MessagingInterface({
  orderId,
  currentUser,
  otherUser,
  className,
  initialMessages = [],
  onSendMessage,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  isTyping = false,
  onTypingChange,
}: MessagingInterfaceProps) {
  const router = useRouter();
  const { sendMessage: sendWebSocketMessage, messages: wsMessages } = useWebSocket();
  const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Combine initial messages with WebSocket messages
  const allMessages = [...initialMessages, ...(wsMessages[orderId] || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Handle form submission
  const onSubmit = async (data: MessageFormValues) => {
    try {
      if (onSendMessage) {
        await onSendMessage(data.content, attachments);
      } else {
        // Fallback to WebSocket if no custom handler provided
        sendWebSocketMessage({
          content: data.content,
          sender: currentUser.id,
          recipient: otherUser.id,
          orderId,
          attachments: attachments.map((file) => ({
            url: URL.createObjectURL(file.file),
            type: file.type,
            name: file.file.name,
            size: file.file.size,
          })),
        });
      }

      // Reset form
      form.reset({ content: '' });
      setAttachments([]);
      
      // Notify typing stopped
      if (onTypingChange) {
        onTypingChange(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue('content', e.target.value);
    
    // Notify typing started
    if (onTypingChange && e.target.value.length > 0) {
      onTypingChange(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingChange) {
          onTypingChange(false);
        }
      }, 3000);
    } else if (onTypingChange) {
      onTypingChange(false);
    }
  };

  // Handle key down for Shift+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  // Handle file upload
  const handleFilesSelected = (files: FileWithPreview[]) => {
    setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Limit to 5 files
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image preview
  const handleImageClick = (url: string) => {
    setPreviewImage(url);
    setIsImagePreviewOpen(true);
  };

  // Clean up file URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach((file) => {
        if (file.type === 'image' && file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [attachments]);

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => router.back()}
          >
            <Icons.arrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h2 className="font-semibold">Order #{orderId}</h2>
            <p className="text-sm text-muted-foreground">
              Chat with {otherUser.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Icons.phone className="h-5 w-5" />
            <span className="sr-only">Voice call</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.video className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {isLoadingMore && initialMessages.length === 0 ? (
          <MessageListSkeleton />
        ) : (
          <MessageList
            orderId={orderId}
            currentUserId={currentUser.id}
            otherUser={otherUser}
            onImageClick={handleImageClick}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-4 py-1">
          <TypingIndicator userId={otherUser.id} orderId={orderId} />
        </div>
      )}

      {/* Message input */}
      <div className="border-t p-4 bg-card">
        {attachments.length > 0 && (
          <div className="mb-3">
            <FilePreviews
              files={attachments}
              onRemove={handleRemoveFile}
            />
          </div>
        )}
        
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <div className="absolute bottom-2 left-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Icons.paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const files = Array.from(e.target.files).map((file) => {
                      let fileType: 'image' | 'document' | 'other' = 'other';
                      if (file.type.startsWith('image/')) {
                        fileType = 'image';
                      } else if (
                        file.type === 'application/pdf' ||
                        file.type === 'application/msword' ||
                        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      ) {
                        fileType = 'document';
                      }
                      return {
                        file,
                        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
                        type: fileType,
                      };
                    });
                    handleFilesSelected(files);
                  }
                }}
              />
            </div>
            <textarea
              placeholder="Type a message..."
              className="w-full min-h-[40px] max-h-32 rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={1}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                // Auto-resize textarea
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
              {...form.register('content', {
                onChange: handleInputChange,
              })}
            />
          </div>
          <Button type="submit" size="icon" disabled={!form.formState.isValid && attachments.length === 0}>
            <Icons.send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>

      {/* Image preview modal */}
      {isImagePreviewOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setIsImagePreviewOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/10"
              onClick={() => setIsImagePreviewOpen(false)}
            >
              <Icons.x className="h-6 w-6" />
              <span className="sr-only">Close preview</span>
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// FilePreviews component for showing selected files before sending
function FilePreviews({
  files,
  onRemove,
}: {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="relative border rounded-md overflow-hidden group"
        >
          {file.type === 'image' ? (
            <div className="w-16 h-16 relative">
              <img
                src={file.preview}
                alt={file.file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-muted">
              <Icons.file className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icons.x className="h-3 w-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
            {file.file.name}
          </div>
        </div>
      ))}
    </div>
  );
}
