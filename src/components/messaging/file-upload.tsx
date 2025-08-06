"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export type FileWithPreview = {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'other';
};

interface FileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processFiles(files);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processFiles = async (files: File[]) => {
    setError(null);
    
    // Check file count
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    const processedFiles: FileWithPreview[] = [];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB.`);
        continue;
      }

      // Determine file type
      let fileType: 'image' | 'document' | 'other' = 'other';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type === 'application/pdf' || 
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileType = 'document';
      }

      // Create preview for images
      let preview = '';
      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }

      processedFiles.push({
        file,
        preview,
        type: fileType,
      });
    }

    if (processedFiles.length > 0) {
      onFilesSelected(processedFiles);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Icons.upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={handleButtonClick}
              disabled={disabled}
            >
              Click to upload
            </Button>{' '}
            or drag and drop
          </div>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, up to {maxSizeMB}MB each. Supports images and documents.
          </p>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          multiple={maxFiles > 1}
          accept="image/*,.pdf,.doc,.docx"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// Preview component for uploaded files
export function FilePreviews({
  files,
  onRemove,
  className,
}: {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
  className?: string;
}) {
  if (files.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2 mt-2', className)}>
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
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
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
