import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioChunk {
  data: Int16Array;
  timestamp: number;
}

export const useAudioPlayer = (onAudioChunkEnd?: (endTime: number) => void) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioQueueRef = useRef<AudioChunk[]>([]);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const onAudioChunkEndRef = useRef(onAudioChunkEnd);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
    
    // Create master gain for instant mute capability
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.connect(audioContextRef.current.destination);
  }, []);

  // Play PCM audio data
  const playPCMAudio = useCallback((pcmData: Int16Array) => {
    if (!audioContextRef.current || !masterGainRef.current) {
      initAudioContext();
      if (!audioContextRef.current || !masterGainRef.current) return;
    }

    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;

    // Convert Int16 PCM to Float32 for Web Audio API
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0; // Convert to -1.0 to 1.0 range
    }

    // Create audio buffer
    const audioBuffer = audioContext.createBuffer(1, float32Data.length, 16000);
    audioBuffer.getChannelData(0).set(float32Data);

    // Create source node
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(masterGain);

    // Track active sources
    activeSourcesRef.current.add(source);

    // Calculate when to play this chunk
    const currentTime = audioContext.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);

    // Schedule playback
    source.start(startTime);
    setIsPlaying(true);

    // Update next play time
    nextPlayTimeRef.current = startTime + audioBuffer.duration;

    // Cleanup when finished
    const endTime = startTime + audioBuffer.duration;
    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        setIsPlaying(false);
      }
      // Notify callback when chunk ends
      if (onAudioChunkEndRef.current) {
        onAudioChunkEndRef.current(endTime);
      }
    };

    return endTime;
  }, [initAudioContext]);

  // Stop all audio playback
  const stopAudio = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source may already be stopped
      }
    });
    activeSourcesRef.current.clear();
    audioQueueRef.current = [];
    
    if (audioContextRef.current) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
    }
    
    setIsPlaying(false);
  }, []);

  // Mute/unmute audio
  const toggleMute = useCallback((muted?: boolean) => {
    if (!masterGainRef.current) return;
    
    const shouldMute = muted !== undefined ? muted : !isMuted;
    masterGainRef.current.gain.value = shouldMute ? 0 : 1;
    setIsMuted(shouldMute);
  }, [isMuted]);

  // Get current audio time
  const getCurrentTime = useCallback(() => {
    return audioContextRef.current?.currentTime || 0;
  }, []);

  // Get next scheduled play time
  const getNextPlayTime = useCallback(() => {
    return nextPlayTimeRef.current;
  }, []);

  // Reset audio context
  const reset = useCallback(() => {
    stopAudio();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      masterGainRef.current = null;
    }
    nextPlayTimeRef.current = 0;
  }, [stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Update callback ref
  useEffect(() => {
    onAudioChunkEndRef.current = onAudioChunkEnd;
  }, [onAudioChunkEnd]);

  return {
    isPlaying: () => activeSourcesRef.current.size > 0,
    isPlayingState: isPlaying,
    isMuted,
    playPCMAudio,
    stopAudio,
    toggleMute,
    getCurrentTime,
    getNextPlayTime,
    initAudioContext,
    reset,
  };
};
