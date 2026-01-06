import { useCallback, useRef, useState } from 'react';

interface UseAudioRecorderOptions {
  onAudioData?: (data: ArrayBuffer) => void;
  onError?: (error: any) => void;
  mode?: 'direct' | 'stt';
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const { onAudioData, onError } = options;

  // Initialize audio recorder
  const initialize = useCallback(async () => {
    if (isInitialized) return true;

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      audioStreamRef.current = stream;

      // Create audio context with 16kHz sample rate
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = context;

      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      onError?.(error);
      return false;
    }
  }, [isInitialized, onError]);

  // Start recording with AudioWorklet
  const startRecording = useCallback(async () => {
    if (isRecording || !audioStreamRef.current || !audioContextRef.current) {
      if (!isInitialized) {
        const success = await initialize();
        if (!success) return false;
      }
    }

    if (!audioStreamRef.current || !audioContextRef.current) return false;

    try {
      const context = audioContextRef.current;
      const source = context.createMediaStreamSource(audioStreamRef.current);

      // Try to use AudioWorklet (modern approach)
      try {
        await context.audioWorklet.addModule('/pcm-recorder-worklet.js');
        
        const workletNode = new AudioWorkletNode(context, 'pcm-recorder-processor');
        audioWorkletNodeRef.current = workletNode;

        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audio') {
            onAudioData?.(event.data.data);
          }
        };

        source.connect(workletNode);
        workletNode.connect(context.destination);
        workletNode.port.postMessage({ command: 'start' });

        setIsRecording(true);
        return true;
      } catch (workletError) {
        console.warn('AudioWorklet not supported, falling back to ScriptProcessor:', workletError);
        
        // Fallback to ScriptProcessorNode
        const bufferSize = 4096;
        const processor = context.createScriptProcessor(bufferSize, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (!isRecording) return;

          const inputData = event.inputBuffer.getChannelData(0);
          const int16Data = new Int16Array(inputData.length);

          for (let i = 0; i < inputData.length; i++) {
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            int16Data[i] = Math.round(sample * 32767);
          }

          onAudioData?.(int16Data.buffer);
        };

        source.connect(processor);
        processor.connect(context.destination);

        setIsRecording(true);
        return true;
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(error);
      return false;
    }
  }, [isRecording, isInitialized, initialize, onAudioData, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Always try to stop, even if state says not recording (avoid stale state issues)
    // Stop AudioWorklet
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({ command: 'stop' });
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }

    // Stop ScriptProcessor
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    setIsRecording(false);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stopRecording();

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsInitialized(false);
  }, [stopRecording]);

  return {
    isRecording,
    isInitialized,
    initialize,
    startRecording,
    stopRecording,
    cleanup,
  };
};
