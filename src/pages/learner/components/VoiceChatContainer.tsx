import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '~/stores';
import type { RootState } from '~/stores';
import { learnerActions } from '~/stores/learnerSlice';
import { LearnerService } from '~/api/services/LearnerService';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useImageQueue } from '../hooks/useImageQueue';
import { ConfigPanel } from './ConfigPanel';
import { AudioControls } from './AudioControls';
import { ChatDisplay } from './ChatDisplay';
import { TranscriptPanel } from './TranscriptPanel';
import { AudioVisualizer } from './AudioVisualizer';
import { LogPanel } from './LogPanel';
import { toast } from 'react-toastify';

export const VoiceChatContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { config, moods, connectionStatus } = useSelector((state: RootState) => state.learner);
  
  const [conversationId, setConversationId] = useState<string>('');
  const turnCompleteRef = useRef(false);
  const lastAudioEndTimeRef = useRef(0);
  const autoReopenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageFinishedRef = useRef(true); // Track if last message was finished

  // Custom hooks
  const { isConnected, connect: wsConnect, disconnect: wsDisconnect, sendMessage, sendBinary, getIsConnected } = useWebSocket({
    onOpen: () => {
      dispatch(learnerActions.setConnectionStatus('connected'));
      dispatch(learnerActions.addLog({ message: 'WebSocket connected', type: 'success' }));
    },
    onClose: () => {
      dispatch(learnerActions.setConnectionStatus('disconnected'));
      dispatch(learnerActions.addLog({ message: 'WebSocket disconnected', type: 'info' }));
    },
    onError: (error) => {
      dispatch(learnerActions.addLog({ message: `WebSocket error: ${error}`, type: 'error' }));
      toast.error('WebSocket connection error');
    },
    onMessage: handleWebSocketMessage,
    onBinaryData: handleBinaryAudioData,
  });

  const audioRecorder = useAudioRecorder({
    mode: config.mode === 'stt' ? 'stt' : 'direct',
    onAudioData: (data) => {
      if (config.mode === 'direct') {
        sendBinary(data);
      }
    },
    onError: (error) => {
      dispatch(learnerActions.addLog({ message: `Recorder error: ${error}`, type: 'error' }));
    },
  });

  const imageQueue = useImageQueue();

  // Callback when audio chunk finishes - check if there's pending image to display
  const handleAudioChunkEnd = useCallback((endTime: number) => {
    // Try to display pending image after audio finishes
    const displayedImage = imageQueue.displayPendingImage(endTime);
    if (displayedImage) {
      console.log('✅ [IMAGE DISPLAYED AFTER AUDIO]', { displayedImage, endTime });
      // Update Redux state with the displayed image
      dispatch(learnerActions.setCurrentImage({
        url: displayedImage.url,
        mood: displayedImage.mood,
        servo: displayedImage.servo,
      }));
      dispatch(learnerActions.addLog({ 
        message: `✅ Displayed queued image: ${displayedImage.mood || 'image'}`, 
        type: 'info' 
      }));
    }
  }, [imageQueue, dispatch]);

  const audioPlayer = useAudioPlayer(handleAudioChunkEnd);

  const speechRecognition = useSpeechRecognition({
    onTranscript: (transcript, isFinal) => {
      if (isFinal) {
        dispatch(learnerActions.setTranscript(transcript));
        if (config.mode === 'stt') {
          sendMessage({ type: 'transcript', text: transcript });
        }
      }
    },
    onError: (error) => {
      dispatch(learnerActions.addLog({ message: `STT error: ${error.error}`, type: 'error' }));
    },
  });

  // Handle binary audio data from WebSocket
  function handleBinaryAudioData(arrayBuffer: ArrayBuffer) {
    if (config.mode === 'text') return; // No audio in text mode
    
    const uint8Array = new Uint8Array(arrayBuffer);
    if (uint8Array.byteLength > 0) {
      // Convert Uint8Array to Int16Array for PCM audio
      const int16Array = new Int16Array(
        arrayBuffer.slice(0, arrayBuffer.byteLength - (arrayBuffer.byteLength % 2))
      );
      
      const endTime = audioPlayer.playPCMAudio(int16Array);
      if (endTime) {
        lastAudioEndTimeRef.current = endTime;
      }
    }
  }

  // Fetch and preload moods on mount
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const response = await LearnerService.fetchMoodList();
        console.log('📋 [MOOD LIST LOADED]', { 
          count: response.data.length, 
          sample: response.data.slice(0, 3),
          allMoods: response.data 
        });
        dispatch(learnerActions.setMoods(response.data));
        dispatch(learnerActions.addLog({ message: `Mood list loaded: ${response.data.length} moods`, type: 'success' }));
      } catch (error) {
        console.error('❌ [MOOD LIST ERROR]', error);
        dispatch(learnerActions.addLog({ message: `Failed to load moods: ${error}`, type: 'error' }));
      }
    };
    fetchMoods();
  }, [dispatch]);

  // Handle WebSocket messages
  function handleWebSocketMessage(message: any) {
    const { type } = message;

    switch (type) {
      case 'audio':
        // PCM audio data
        if (message.data) {
          const pcmData = new Int16Array(message.data);
          const endTime = audioPlayer.playPCMAudio(pcmData);
          lastAudioEndTimeRef.current = endTime || 0;
        }
        break;

      case 'transcript':
        dispatch(learnerActions.setTranscript(message.text || ''));
        break;

      case 'text':
        // Text response in chat mode
        if (config.mode === 'text') {
          dispatch(learnerActions.addMessage({
            id: Date.now().toString(),
            type: 'assistant',
            content: message.content || message.text || '',
            timestamp: Date.now(),
          }));
        }
        break;

      case 'function_call':
        dispatch(learnerActions.addMessage({
          id: Date.now().toString(),
          type: 'function',
          content: `Called: ${message.name}`,
          functionName: message.name,
          functionArgs: message.arguments,
          timestamp: Date.now(),
        }));
        break;

      case 'image':
      case 'image_listening':
        handleImageMessage(message);
        break;

      case 'other_modalities':
        // Handle image/mood/servo from other_modalities
        console.log('📨 [OTHER_MODALITIES MESSAGE]', { data: message.data, fullMessage: message });
        if (message.data) {
          handleImageMessage({
            image_url: message.data.image,
            mood: message.data.mood,
            servo: message.data.servo,
          });
        }
        break;

      case 'end_user_audio':
        // Auto-stop recording in direct audio mode
        if (config.mode === 'direct') {
          dispatch(learnerActions.addLog({ message: '🛑 Server requested stop recording', type: 'info' }));
          // Force stop recording (don't check isRecording state to avoid stale closure)
          audioRecorder.stopRecording();
          audioPlayer.toggleMute(false);
          dispatch(learnerActions.setIsRecording(false));
          sendMessage({ type: 'audio_end' });
        }
        break;

      case 'end_session':
        // Server requests to end session and disconnect
        dispatch(learnerActions.addLog({ message: '🔌 Server ended session - waiting for audio to finish', type: 'info' }));
        if (config.mode === 'text') {
          // Text mode: disconnect immediately
          dispatch(learnerActions.addMessage({
            id: Date.now().toString(),
            type: 'system',
            content: 'Session ended by server',
            timestamp: Date.now(),
          }));
          setTimeout(() => {
            handleDisconnect();
          }, 100);
        } else {
          // Voice mode: wait for audio to finish before disconnecting
          const checkAudioFinished = () => {
            const isStillPlaying = audioPlayer.isPlaying();
            if (isStillPlaying) {
              // Audio still playing, check again after 500ms
              setTimeout(checkAudioFinished, 500);
            } else {
              // Audio finished, now disconnect
              dispatch(learnerActions.addLog({ message: '✅ Audio finished - disconnecting now', type: 'info' }));
              handleDisconnect();
            }
          };
          // Start checking after 100ms
          setTimeout(checkAudioFinished, 100);
        }
        break;

      case 'turn_complete':
        handleTurnComplete(message);
        break;

      case 'listening_start':
        dispatch(learnerActions.setConnectionStatus('listening'));
        dispatch(learnerActions.addLog({ message: 'Server is listening', type: 'info' }));
        break;

      case 'message':
        // Handle message type - display in transcript for both input and output
        if (message.data) {
          const data = message.data;
          console.log('💬 [MESSAGE]', { type: data.type, content: data.content, is_finished: data.is_finished });
          
          // Handle both 'input' and 'output' types
          if ((data.type === 'input' || data.type === 'output') && data.content) {
            // If last message was finished, clear transcript before appending
            if (lastMessageFinishedRef.current) {
              dispatch(learnerActions.setTranscript(data.content));
              console.log('🔄 [TRANSCRIPT CLEARED & SET]', data.content);
            } else {
              // Append to existing transcript
              dispatch(learnerActions.appendTranscript(data.content));
              console.log('➕ [TRANSCRIPT APPENDED]', data.content);
            }
            
            // Update finished flag for next message
            lastMessageFinishedRef.current = data.is_finished || false;
            
            // For text mode, also add to chat display
            if (config.mode === 'text' && data.type === 'output') {
              dispatch(learnerActions.addMessage({
                id: Date.now().toString(),
                type: 'assistant',
                content: data.content,
                timestamp: Date.now(),
              }));
            }
            
            if (data.is_finished) {
              dispatch(learnerActions.addLog({ message: `${data.type === 'input' ? 'User' : 'Assistant'} message finished`, type: 'info' }));
            }
          }
        }
        break;

      case 'pong':
        // Keep-alive pong response
        dispatch(learnerActions.addLog({ message: 'Received pong', type: 'debug' }));
        break;

      case 'error':
        dispatch(learnerActions.addLog({ message: `Server error: ${message.message}`, type: 'error' }));
        toast.error(message.message || 'Server error');
        break;

      default:
        dispatch(learnerActions.addLog({ message: `Unknown message type: ${type}`, type: 'debug' }));
    }
  }

  // Handle image messages
  const handleImageMessage = useCallback(async (message: any) => {
    const { image_url, mood, servo } = message;
    
    console.log('🖼️ [HANDLE IMAGE MESSAGE - START]', { image_url, mood, servo, moodsCount: moods.length });
    
    let imageUrl = image_url;
    
    // If mood is provided but no URL, fetch from mood list
    if (!imageUrl && mood && moods.length > 0) {
      const moodItem = moods.find((m: any) => m?.mood_name?.toLowerCase() === mood.toLowerCase());
      console.log('🔍 [MOOD LOOKUP]', { mood, moodItem, found: !!moodItem });
      imageUrl = moodItem?.url;
    }
    
    // If still no URL but mood exists, try fetching from API
    if (!imageUrl && mood) {
      console.log('🌐 [FETCH MOOD FROM API]', { mood });
      try {
        imageUrl = await LearnerService.getImageUrlFromMood(mood, moods);
        console.log('✅ [FETCHED MOOD URL]', { mood, imageUrl });
      } catch (error) {
        console.error('❌ [FETCH MOOD ERROR]', error);
        dispatch(learnerActions.addLog({ message: `Failed to get image for mood: ${mood}`, type: 'error' }));
      }
    }

    if (imageUrl) {
      if (config.mode === 'text') {
        // Text mode: show immediately in chat as message
        dispatch(learnerActions.addMessage({
          id: Date.now().toString(),
          type: 'image',
          content: '',
          imageUrls: [imageUrl],
          timestamp: Date.now(),
        }));
        dispatch(learnerActions.addLog({ message: `Added image to chat: ${mood || 'image'}`, type: 'info' }));
      } else {
        // Voice modes: queue image for display after current audio finishes
        const isAudioPlaying = audioPlayer.isPlaying();
        const currentTime = audioPlayer.getCurrentTime();
        const currentEndTime = lastAudioEndTimeRef.current;
        
        console.log('🎵 [AUDIO STATUS]', { 
          isAudioPlaying, 
          currentTime, 
          currentEndTime,
          willQueue: isAudioPlaying && currentEndTime > currentTime
        });
        
        if (isAudioPlaying && currentEndTime > currentTime) {
          // Audio is playing - queue image to display after it finishes
          console.log('📥 [QUEUE IMAGE]', { imageUrl, mood, servo, endTime: currentEndTime });
          imageQueue.queueImage(imageUrl, mood, servo, currentEndTime);
          dispatch(learnerActions.addLog({ 
            message: `📥 Queued image to display after audio: ${mood || 'image'}`, 
            type: 'info' 
          }));
        } else {
          // No audio playing - show immediately
          console.log('⚡ [SHOW IMAGE IMMEDIATELY]', { imageUrl, mood, servo });
          dispatch(learnerActions.setCurrentImage({ url: imageUrl, mood, servo }));
          dispatch(learnerActions.addLog({ message: `⚡ Displaying image immediately: ${mood || 'image'}`, type: 'info' }));
        }
      }
    }
  }, [moods, config.mode, audioPlayer, imageQueue, dispatch]);

  // Handle turn complete
  const handleTurnComplete = useCallback((_message: any) => {
    turnCompleteRef.current = true;
    
    dispatch(learnerActions.addLog({ message: 'Turn complete - ready for next input', type: 'success' }));
    
    // Schedule auto-reopen mic after audio finishes
    if (config.mode === 'direct' && lastAudioEndTimeRef.current > 0) {
      const currentTime = audioPlayer.getCurrentTime();
      const waitTime = Math.max(0, lastAudioEndTimeRef.current - currentTime);
      const delayMs = (waitTime * 1000) + 100;
      
      if (autoReopenTimerRef.current) {
        clearTimeout(autoReopenTimerRef.current);
      }
      
      autoReopenTimerRef.current = setTimeout(() => {
        reopenMicAfterTurnComplete();
      }, delayMs);
    }
  }, [config.mode, audioPlayer, dispatch]);

  // Reopen mic after turn complete (only in direct mode)
  const reopenMicAfterTurnComplete = useCallback(() => {
    // Check all conditions before auto-reopening
    if (!turnCompleteRef.current) {
      dispatch(learnerActions.addLog({ message: 'Auto-reopen cancelled: turn not complete', type: 'debug' }));
      return;
    }
    
    if (audioRecorder.isRecording) {
      dispatch(learnerActions.addLog({ message: 'Auto-reopen skipped: already recording', type: 'debug' }));
      return;
    }
    
    // Check real-time WebSocket state (avoid stale closure)
    if (!getIsConnected()) {
      dispatch(learnerActions.addLog({ message: 'Auto-reopen skipped: WebSocket not connected', type: 'error' }));
      return;
    }
    
    // Only auto-reopen in direct mode
    if (config.mode !== 'direct') {
      dispatch(learnerActions.addLog({ message: `Auto-reopen skipped: not in direct mode (current: ${config.mode})`, type: 'debug' }));
      turnCompleteRef.current = false;
      return;
    }

    // All checks passed - auto-reopen mic for next turn
    dispatch(learnerActions.addLog({ message: '✅ Auto-reopening microphone for next turn', type: 'success' }));
    audioRecorder.startRecording();
    audioPlayer.toggleMute(true); // Mute incoming audio
    dispatch(learnerActions.setIsRecording(true));
    turnCompleteRef.current = false;
    
    // Send start_user_audio signal
    sendMessage({ type: 'start_user_audio' });
  }, [config.mode, audioRecorder, audioPlayer, sendMessage, getIsConnected, dispatch]);

  // Connect handler
  const handleConnect = useCallback(async () => {
    if (!config.userId || !config.todoId) {
      toast.error('Please enter User ID and select a Todo');
      return;
    }

    try {
      dispatch(learnerActions.setConnectionStatus('connecting'));
      dispatch(learnerActions.addLog({ message: 'Initializing conversation...', type: 'info' }));

      // Initialize conversation
      const initResponse = await LearnerService.initConversation({
        user_id: config.userId,
        todo_id: config.todoId,
        conversation_id: conversationId || undefined,
      });

      setConversationId(initResponse.conversation_id);
      dispatch(learnerActions.addLog({ 
        message: `Conversation initialized: ${initResponse.conversation_id}`, 
        type: 'success' 
      }));

      // Connect WebSocket
      await wsConnect(config.wsUrl);

      // Initialize audio systems
      if (config.mode !== 'text') {
        await audioRecorder.initialize();
        audioPlayer.initAudioContext();
      }

      // Send init message
      sendMessage({
        type: 'init',
        user_id: config.userId,
        todo_id: config.todoId,
        conversation_id: initResponse.conversation_id,
      });

      toast.success('Connected successfully!');
    } catch (error: any) {
      dispatch(learnerActions.addLog({ message: `Connection failed: ${error.message}`, type: 'error' }));
      dispatch(learnerActions.setConnectionStatus('disconnected'));
      toast.error(`Connection failed: ${error.message}`);
    }
  }, [config, conversationId, wsConnect, sendMessage, audioRecorder, audioPlayer, dispatch]);

  // Disconnect handler
  const handleDisconnect = useCallback(() => {
    wsDisconnect();
    audioRecorder.cleanup();
    audioPlayer.reset();
    speechRecognition.stop();
    
    if (autoReopenTimerRef.current) {
      clearTimeout(autoReopenTimerRef.current);
    }

    dispatch(learnerActions.setIsRecording(false));
    dispatch(learnerActions.setConnectionStatus('disconnected'));
    dispatch(learnerActions.addLog({ message: 'Disconnected', type: 'info' }));
  }, [wsDisconnect, audioRecorder, audioPlayer, speechRecognition, dispatch]);

  // Mic press handler
  const handleMicPress = useCallback(() => {
    if (!isConnected) return;

    if (config.mode === 'direct') {
      // Direct audio: click to start (if not recording), server controls stop
      if (!audioRecorder.isRecording) {
        audioRecorder.startRecording();
        audioPlayer.toggleMute(true); // Mute incoming audio while user speaks
        dispatch(learnerActions.setIsRecording(true));
        dispatch(learnerActions.addLog({ message: 'Recording started - waiting for server signal to stop', type: 'info' }));
        
        // Send start_user_audio signal to server
        sendMessage({ type: 'start_user_audio' });
        
        // Clear auto-reopen timer if user manually starts
        if (autoReopenTimerRef.current) {
          clearTimeout(autoReopenTimerRef.current);
          autoReopenTimerRef.current = null;
        }
        turnCompleteRef.current = false;
      }
      // Don't stop on press - wait for server end_user_audio signal
    } else if (config.mode === 'stt') {
      // STT: toggle speech recognition
      if (speechRecognition.isListening) {
        speechRecognition.stop();
        dispatch(learnerActions.setIsRecording(false));
      } else {
        speechRecognition.start();
        dispatch(learnerActions.setIsRecording(true));
        dispatch(learnerActions.addLog({ message: 'Speech recognition started', type: 'info' }));
      }
    }
  }, [isConnected, config.mode, audioRecorder, audioPlayer, speechRecognition, sendMessage, dispatch]);

  // Mic release handler (only for STT mode, direct mode ignores this)
  const handleMicRelease = useCallback(() => {
    // Direct mode ignores release - waits for server signal (end_user_audio)
    if (config.mode === 'stt' && audioRecorder.isRecording) {
      audioRecorder.stopRecording();
      dispatch(learnerActions.setIsRecording(false));
      dispatch(learnerActions.addLog({ message: 'Recording stopped', type: 'info' }));
    }
  }, [config.mode, audioRecorder, dispatch]);

  // Text message handler
  const handleSendTextMessage = useCallback((text: string) => {
    if (!isConnected) {
      toast.error('Not connected');
      return;
    }

    // Add user message to chat
    dispatch(learnerActions.addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    }));

    // Send to server
    sendMessage({ type: 'text', content: text });
    
    dispatch(learnerActions.addLog({ message: `Sent: ${text}`, type: 'info' }));
  }, [isConnected, sendMessage, dispatch]);

  // Keyboard handler for Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && config.mode !== 'text') {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return; // Don't interfere with input fields
        }
        e.preventDefault();
        handleMicPress();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && config.mode === 'direct') {
        e.preventDefault();
        handleMicRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [config.mode, handleMicPress, handleMicRelease]);

  return (
    <div className="max-w-3xl mx-auto">
      <ConfigPanel />
      
      <AudioControls
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onMicPress={handleMicPress}
        onMicRelease={handleMicRelease}
        disabled={connectionStatus === 'connecting'}
      />

      {config.mode === 'text' ? (
        <ChatDisplay 
          onSendMessage={handleSendTextMessage}
          disabled={!isConnected}
        />
      ) : (
        <>
          <AudioVisualizer />
          <TranscriptPanel />
        </>
      )}

      <LogPanel />
    </div>
  );
};
