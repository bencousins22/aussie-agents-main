import { useState, useCallback, type DragEvent } from "react";

export interface DragDropOptions {
  onDrop?: (files: File[]) => void;
  onError?: (error: string) => void;
  accept?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function useDragDrop(options: DragDropOptions = {}) {
  const {
    onDrop,
    onError,
    accept = [],
    maxFiles = 10,
    maxSize = 50 * 1024 * 1024, // 50MB default
  } = options;

  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Check file type if accept is specified
    if (accept.length > 0) {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type.toLowerCase();
      
      const isAccepted = accept.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        // Handle mime types like "image/*"
        if (type.includes('*')) {
          const [mainType] = type.split('/');
          return mimeType.startsWith(mainType);
        }
        return mimeType === type.toLowerCase();
      });

      if (!isAccepted) {
        return `File type "${file.type || 'unknown'}" is not accepted`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);

    // Check max files
    if (filesArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate all files
    const errors: string[] = [];
    const validFiles: File[] = [];

    filesArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Report errors
    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      // Still process valid files if any
      if (validFiles.length > 0) {
        onDrop?.(validFiles);
      }
    } else if (validFiles.length > 0) {
      onDrop?.(validFiles);
    }
  }, [maxFiles, validateFile, onDrop, onError]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple toggle might flicker on nested elements, but avoids unused state
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const reset = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    reset,
    validateFile,
    processFiles,
  };
}
