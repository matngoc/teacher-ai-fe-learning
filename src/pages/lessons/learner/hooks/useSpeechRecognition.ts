import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventTimeRef = useRef(0);

  const {
    onTranscript,
    onError,
    continuous = true,
    interimResults = true,
    lang = 'vi-VN',
  } = options;

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Clear watchdog timer
  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  // Start watchdog timer to detect stalled recognition
  const startWatchdog = useCallback(() => {
    clearWatchdog();
    watchdogTimerRef.current = setTimeout(() => {
      const timeSinceLastEvent = Date.now() - lastEventTimeRef.current;
      if (timeSinceLastEvent > 15000 && isListening) {
        console.warn('Speech recognition watchdog triggered - restarting');
        stop();
        setTimeout(() => start(), 100);
      }
    }, 16000);
  }, [isListening]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      lastEventTimeRef.current = Date.now();
      startWatchdog();
    };

    recognition.onresult = (event: any) => {
      lastEventTimeRef.current = Date.now();
      startWatchdog();

      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;

      onTranscript?.(transcript, isFinal);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event);
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are not critical errors, continue listening
        lastEventTimeRef.current = Date.now();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearWatchdog();
      
      // Auto-restart if it ended unexpectedly while we want it listening
      if (isListening && continuous) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
  }, [isSupported, continuous, interimResults, lang, onTranscript, onError, isListening, startWatchdog, clearWatchdog]);

  // Start recognition
  const start = useCallback(() => {
    if (!isSupported) {
      console.error('Speech recognition is not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      initRecognition();
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        lastEventTimeRef.current = Date.now();
      } catch (e: any) {
        if (e.name !== 'InvalidStateError') {
          console.error('Failed to start recognition:', e);
          onError?.(e);
        }
      }
    }
  }, [isSupported, isListening, initRecognition, onError]);

  // Stop recognition
  const stop = useCallback(() => {
    clearWatchdog();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
    }
    setIsListening(false);
  }, [clearWatchdog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      recognitionRef.current = null;
    };
  }, [stop]);

  return {
    isSupported,
    isListening,
    start,
    stop,
  };
};
