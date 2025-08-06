"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { FileUpload, type FileWithPreview } from './file-upload';

const messageFormSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface MessageComposerProps {
  onSubmit: (content: string, attachments: FileWithPreview[]) => Promise<void>;
  onTypingChange?: (isTyping: boolean) => void;
  className?: string;
  placeholder?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function MessageComposer({
  onSubmit,
  onTypingChange,
  className,
  placeholder = 'Type a message...',
  isSubmitting = false,
  disabled = false,
}: MessageComposerProps) {
  const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Handle form submission
  const handleSubmit = async (data: MessageFormValues) => {
    try {
      await onSubmit(data.content, attachments);
      form.reset({ content: '' });
      setAttachments([]);
      
      // Reset typing state
      if (onTypingChange) {
        onTypingChange(false);
      }
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
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
      form.handleSubmit(handleSubmit)();
    }
  };

  // Handle file upload
  const handleFilesSelected = (files: FileWithPreview[]) => {
    setAttachments((prev) => {
      const newFiles = [...prev, ...files];
      // Limit to 5 files total
      return newFiles.slice(0, 5);
    });
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => {
      const newFiles = [...prev];
      // Revoke object URL if it's an image
      if (newFiles[index]?.preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
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
    <div className={cn('border-t bg-card', className)}>
      {/* File previews */}
      {attachments.length > 0 && (
        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
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
                  onClick={() => handleRemoveFile(index)}
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
        </div>
      )}

      {/* Message input */}
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex items-end gap-2 p-3"
      >
        <div className="flex-1 relative">
          <div className="absolute bottom-2 left-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={disabled || isSubmitting}
            >
              <Icons.paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              maxFiles={5 - attachments.length}
              disabled={disabled || isSubmitting}
              className="hidden"
            />
          </div>
          <textarea
            placeholder={placeholder}
            className="w-full min-h-[40px] max-h-32 rounded-lg border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            rows={1}
            onKeyDown={handleKeyDown}
            onInput={(e) => {
              // Auto-resize textarea
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
            disabled={disabled || isSubmitting}
            {...form.register('content', {
              onChange: handleInputChange,
            })}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={
            disabled ||
            isSubmitting ||
            (!form.formState.isValid && attachments.length === 0)
          }
        >
          {isSubmitting ? (
            <Icons.loader className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
