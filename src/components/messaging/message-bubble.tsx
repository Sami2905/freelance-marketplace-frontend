"use client";

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';

interface MessageBubbleProps {
  message: {
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
  };
  isCurrentUser: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onImageClick?: (url: string) => void;
  className?: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  showTimestamp,
  onImageClick,
  className,
}: MessageBubbleProps) {
  const timestamp = new Date(message.createdAt);
  const formattedTime = format(timestamp, 'h:mm a');
  const formattedDate = format(timestamp, 'MMM d, yyyy');
  const attachments = message.attachments ?? [];

  return (
    <div
      className={cn(
        'flex items-end gap-2 group',
        isCurrentUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={message.sender} />
            <AvatarFallback>
              {message.sender?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={cn('flex flex-col max-w-[80%]', isCurrentUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted text-foreground rounded-bl-none',
            message.attachments?.length ? 'p-2' : 'py-2 px-4'
          )}
        >
          {attachments.length > 0 && (
            <div className={cn(
              'grid gap-2 mb-2',
              attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative rounded-lg overflow-hidden border bg-background',
                    attachment.type === 'image' ? 'cursor-pointer' : ''
                  )}
                  onClick={() => {
                    if (attachment.type === 'image' && onImageClick) {
                      onImageClick(attachment.url);
                    }
                  }}
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="p-4 flex flex-col items-center justify-center h-32">
                      <Icons.file className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-center text-muted-foreground truncate w-full px-2">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                  {attachment.type !== 'image' && (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icons.download className="h-6 w-6 text-white" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.content && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>

        <div className={cn(
          'flex items-center gap-1.5 mt-1 px-2 text-xs text-muted-foreground',
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          {showTimestamp && (
            <time dateTime={timestamp.toISOString()} title={formattedDate}>
              {formattedTime}
            </time>
          )}
          {isCurrentUser && (
            <span className={cn(
              'flex items-center',
              message.read ? 'text-primary' : 'text-muted-foreground/50'
            )}>
              {message.read ? (
                <Icons.checkCheck className="h-3 w-3" />
              ) : (
                <Icons.check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>

      {isCurrentUser && showAvatar && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt="You" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
