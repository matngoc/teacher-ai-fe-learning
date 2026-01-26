import { useCallback, useRef } from 'react';
import type { BoardLayout, BoardTextSegment, BoardAction } from '~/pages/learner/types/board';

interface MediaItem {
  type: 'image' | 'transcript' | 'board';
  timestamp: number;
  // Image data
  imageUrl?: string;
  mood?: string;
  servo?: string;
  // Transcript data
  transcript?: string;
  // Board data
  boardAction?: BoardAction;
  boardLayout?: BoardLayout;
  boardSegments?: BoardTextSegment[];
}

export const useMediaQueue = () => {
  const pendingItemsRef = useRef<MediaItem[]>([]);

  // Queue media item (image or transcript) for display after audio finishes
  const queueMedia = useCallback((item: Omit<MediaItem, 'timestamp'>, audioEndTime: number) => {
    const mediaItem: MediaItem = {
      ...item,
      timestamp: audioEndTime,
    };
    
    pendingItemsRef.current.push(mediaItem);
    pendingItemsRef.current.sort((a, b) => a.timestamp - b.timestamp);
  }, []);

  // Queue image
  const queueImage = useCallback((url: string, audioEndTime: number, mood?: string, servo?: string) => {
    queueMedia({
      type: 'image',
      imageUrl: url,
      mood,
      servo,
    }, audioEndTime);
  }, [queueMedia]);

  // Queue transcript
  const queueTranscript = useCallback((transcript: string, audioEndTime: number) => {
    queueMedia({
      type: 'transcript',
      transcript,
    }, audioEndTime);
  }, [queueMedia]);

  // Queue board
  const queueBoard = useCallback((action: BoardAction, audioEndTime: number, layout?: BoardLayout, segments?: BoardTextSegment[]) => {
    queueMedia({
      type: 'board',
      boardAction: action,
      boardLayout: layout,
      boardSegments: segments,
    }, audioEndTime);
  }, [queueMedia]);

  // Display pending media when audio chunk finishes
  const displayPendingMedia = useCallback((currentAudioEndTime: number): MediaItem[] => {
    const itemsToDisplay: MediaItem[] = [];
    
    // Find all items that should be displayed at this timestamp
    while (pendingItemsRef.current.length > 0) {
      const item = pendingItemsRef.current[0];
      
      // Check if this item's timestamp matches current audio end time (with small tolerance)
      if (Math.abs(item.timestamp - currentAudioEndTime) < 0.01) {
        itemsToDisplay.push(item);
        pendingItemsRef.current.shift(); // Remove from queue
      } else if (item.timestamp > currentAudioEndTime) {
        // Future items, stop checking
        break;
      } else {
        // Past items that were missed, display them anyway
        itemsToDisplay.push(item);
        pendingItemsRef.current.shift();
      }
    }
    
    return itemsToDisplay;
  }, []);

  // Clear all queued items
  const clearQueue = useCallback(() => {
    pendingItemsRef.current = [];
  }, []);

  // Get queue size
  const getQueueSize = useCallback(() => {
    return pendingItemsRef.current.length;
  }, []);

  return {
    queueImage,
    queueTranscript,
    queueBoard,
    displayPendingMedia,
    clearQueue,
    getQueueSize,
  };
};
