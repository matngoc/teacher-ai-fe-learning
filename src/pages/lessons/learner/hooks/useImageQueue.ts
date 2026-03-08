import { useCallback, useRef, useState } from 'react';

interface ImageData {
  url: string;
  mood?: string;
  servo?: string;
  timestamp: number;
}

export const useImageQueue = () => {
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [isWaitingForAudio, setIsWaitingForAudio] = useState(false);
  const imageQueueRef = useRef<ImageData[]>([]);
  const pendingImageRef = useRef<ImageData | null>(null);

  // Queue image for display after audio finishes
  const queueImage = useCallback((url: string, mood?: string, servo?: string, audioEndTime?: number) => {
    const imageData: ImageData = {
      url,
      mood,
      servo,
      timestamp: audioEndTime || Date.now(),
    };

    if (audioEndTime) {
      // If audio is playing, queue the image
      pendingImageRef.current = imageData;
      setIsWaitingForAudio(true);
    } else {
      // Display immediately
      setCurrentImage(imageData);
      setIsWaitingForAudio(false);
    }
  }, []);

  // Display pending image when audio finishes
  const displayPendingImage = useCallback((currentAudioTime: number) => {
    if (pendingImageRef.current) {
      const shouldDisplay = currentAudioTime >= pendingImageRef.current.timestamp;
      
      if (shouldDisplay) {
        const imageToDisplay = pendingImageRef.current;
        setCurrentImage(imageToDisplay);
        pendingImageRef.current = null;
        setIsWaitingForAudio(false);
        return imageToDisplay; // Return the displayed image
      }
    }
    return null;
  }, []);

  // Show image immediately
  const showImage = useCallback((url: string, mood?: string, servo?: string) => {
    const imageData: ImageData = {
      url,
      mood,
      servo,
      timestamp: Date.now(),
    };
    setCurrentImage(imageData);
    setIsWaitingForAudio(false);
    pendingImageRef.current = null;
  }, []);

  // Clear current image
  const clearImage = useCallback(() => {
    setCurrentImage(null);
    setIsWaitingForAudio(false);
    pendingImageRef.current = null;
  }, []);

  // Clear all queued images
  const clearQueue = useCallback(() => {
    imageQueueRef.current = [];
    pendingImageRef.current = null;
    setIsWaitingForAudio(false);
  }, []);

  return {
    currentImage,
    isWaitingForAudio,
    queueImage,
    displayPendingImage,
    showImage,
    clearImage,
    clearQueue,
  };
};
