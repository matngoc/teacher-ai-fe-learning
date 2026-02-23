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
import { useMediaQueue } from '../hooks/useMediaQueue';
import { ConfigPanel } from './ConfigPanel';
import { AudioControls } from './AudioControls';
import { ChatDisplay } from './ChatDisplay';
import { TranscriptPanel } from './TranscriptPanel';
import { AudioVisualizer } from './AudioVisualizer';
import { LogPanel } from './LogPanel';
import { toast } from 'react-toastify';

interface VoiceChatContainerProps {
  autoConnect?: boolean;
  botId?: number;
  showCaption?: boolean;
  compactLayout?: boolean;
}

export const VoiceChatContainer: React.FC<VoiceChatContainerProps> = ({
  autoConnect = false,
  botId,
  showCaption = true,
  compactLayout = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { config, moods, connectionStatus } = useSelector((state: RootState) => state.learner);
  
  const [conversationId, setConversationId] = useState<string>('');
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const turnCompleteRef = useRef(false);
  const lastAudioEndTimeRef = useRef(0);
  const autoReopenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageFinishedRef = useRef(true); // Track if last message was finished
  const isHoldModeRef = useRef(false); // Track if in hold-to-talk mode
  const mouseDownTimeRef = useRef(0); // Track mouse down time to distinguish click vs hold

  // Custom hooks
  const { isConnected, connect: wsConnect, disconnect: wsDisconnect, sendMessage, sendBinary, getIsConnected } = useWebSocket({
    onOpen: () => {
      dispatch(learnerActions.setConnectionStatus('connected'));
      dispatch(learnerActions.addLog({ message: 'WebSocket connected', type: 'success' }));
    },
    onClose: () => {
      dispatch(learnerActions.setConnectionStatus('disconnected'));
      dispatch(learnerActions.addLog({ message: 'WebSocket disconnected', type: 'info' }));
      setHasConnectionError(true);
    },
    onError: (error) => {
      dispatch(learnerActions.addLog({ message: `WebSocket error: ${error}`, type: 'error' }));
      toast.error('WebSocket connection error');
      setHasConnectionError(true);
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

  const mediaQueue = useMediaQueue();

  // Callback when audio chunk finishes - check if there's pending media to display
  const handleAudioChunkEnd = useCallback((endTime: number) => {
    // Display all pending media items for this audio chunk
    const itemsToDisplay = mediaQueue.displayPendingMedia(endTime);
    
    if (itemsToDisplay.length > 0) {
      console.log('✅ [MEDIA DISPLAYED AFTER AUDIO]', { itemsToDisplay, endTime });
      
      itemsToDisplay.forEach((item) => {
        if (item.type === 'image') {
          // Update Redux state with the displayed image (or mood-only if imageUrl is empty)
          dispatch(learnerActions.setCurrentImage({
            url: item.imageUrl || '',
            mood: item.mood,
            servo: item.servo,
          }));
          dispatch(learnerActions.addLog({ 
            message: `✅ Displayed queued ${item.imageUrl ? 'image' : 'mood'}: ${item.mood || 'content'}`, 
            type: 'info' 
          }));
        } else if (item.type === 'transcript' && item.transcript) {
          // Update transcript
          dispatch(learnerActions.setTranscript(item.transcript));
          dispatch(learnerActions.addLog({ 
            message: '✅ Displayed queued transcript', 
            type: 'info' 
          }));
        } else if (item.type === 'board') {
          // Apply queued board action
          if (item.boardAction === 'init' && item.boardLayout) {
            dispatch(learnerActions.initBoard({ layout: item.boardLayout }));
            dispatch(learnerActions.addLog({ 
              message: `✅ Displayed queued board init with ${item.boardLayout} layout`, 
              type: 'info' 
            }));
          } else if (item.boardAction === 'add' && item.boardSegments) {
            dispatch(learnerActions.addBoardText(item.boardSegments));
            dispatch(learnerActions.addLog({ 
              message: `✅ Displayed queued board add with ${item.boardSegments.length} segments`, 
              type: 'info' 
            }));
          } else if (item.boardAction === 'update' && item.boardSegments) {
            dispatch(learnerActions.updateBoardText(item.boardSegments));
            dispatch(learnerActions.addLog({ 
              message: `✅ Displayed queued board update with ${item.boardSegments.length} segments`, 
              type: 'info' 
            }));
          } else if (item.boardAction === 'remove' && item.boardSegments) {
            const idsToRemove = item.boardSegments.map(s => s.id);
            dispatch(learnerActions.removeBoardText(idsToRemove));
            dispatch(learnerActions.addLog({ 
              message: `✅ Displayed queued board remove ${idsToRemove.length} segments`, 
              type: 'info' 
            }));
          } else if (item.boardAction === 'clear') {
            dispatch(learnerActions.clearBoard());
            dispatch(learnerActions.addLog({ 
              message: '✅ Displayed queued board clear', 
              type: 'info' 
            }));
          } else if (item.boardAction === 'close') {
            dispatch(learnerActions.closeBoard());
            dispatch(learnerActions.addLog({ 
              message: '✅ Displayed queued board close (hidden)', 
              type: 'info' 
            }));
          }
        }
      });
    }
  }, [mediaQueue, dispatch]);

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
          // Handle board if present
          if (message.data.board) {
            console.log('📋 [BOARD DATA]', message.data.board);
            handleBoardMessage(message.data.board);
          }
          // Handle image/mood/servo if present
          if (message.data.image || message.data.mood || message.data.servo) {
            console.log('🖼️ [IMAGE/MOOD DATA]', { image: message.data.image, mood: message.data.mood, servo: message.data.servo });
            handleImageMessage({
              image_url: message.data.image,
              mood: message.data.mood,
              servo: message.data.servo,
            });
          }
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
            if (data.type === 'input') {
              // Input: always display immediately (real-time speech recognition)
              dispatch(learnerActions.setTranscript(data.content));
              console.log('🔄 [TRANSCRIPT REPLACED - INPUT]', data.content);
              
              // When input finishes, mark it so next output will clear
              if (data.is_finished) {
                lastMessageFinishedRef.current = true;
              }
            } else {
              // Output: queue transcript to display after audio finishes
              const isAudioPlaying = audioPlayer.isPlaying();
              const currentTime = audioPlayer.getCurrentTime();
              const currentEndTime = lastAudioEndTimeRef.current;
              
              if (isAudioPlaying && currentEndTime > currentTime) {
                // Audio is playing - queue transcript to display after it finishes
                console.log('📥 [QUEUE TRANSCRIPT]', { content: data.content, endTime: currentEndTime });
                mediaQueue.queueTranscript(data.content, currentEndTime);
                dispatch(learnerActions.addLog({ 
                  message: '📥 Queued transcript to display after audio', 
                  type: 'info' 
                }));
              } else {
                // No audio playing - show immediately
                console.log('⚡ [SHOW TRANSCRIPT IMMEDIATELY]', data.content);
                dispatch(learnerActions.setTranscript(data.content));
              }
              
              lastMessageFinishedRef.current = false; // Reset for continuous updates
            }
            
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
    
    // Only use image_url if it's actually provided
    // Don't fetch mood gif URL here - let AudioVisualizer handle it
    const imageUrl = image_url;

    if (config.mode === 'text') {
      // Text mode: show immediately in chat as message
      if (imageUrl) {
        dispatch(learnerActions.addMessage({
          id: Date.now().toString(),
          type: 'image',
          content: '',
          imageUrls: [imageUrl],
          timestamp: Date.now(),
        }));
        dispatch(learnerActions.addLog({ message: `Added image to chat: ${mood || 'image'}`, type: 'info' }));
      }
    } else {
      // Voice modes: queue for display after current audio finishes OR show immediately
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
        // Audio is playing - queue to display after it finishes
        // Use empty string for URL if only mood (AudioVisualizer will handle mood gif)
        console.log('📥 [QUEUE IMAGE/MOOD]', { imageUrl: imageUrl || '', mood, servo, endTime: currentEndTime });
        mediaQueue.queueImage(imageUrl || '', currentEndTime, mood, servo);
        dispatch(learnerActions.addLog({ 
          message: `📥 Queued ${imageUrl ? 'image' : 'mood'} to display after audio: ${mood || 'content'}`, 
          type: 'info' 
        }));
      } else {
        // No audio playing - show immediately
        console.log('⚡ [SHOW IMMEDIATELY]', { imageUrl: imageUrl || '', mood, servo });
        dispatch(learnerActions.setCurrentImage({ url: imageUrl || '', mood, servo }));
        dispatch(learnerActions.addLog({ 
          message: `⚡ Displaying ${imageUrl ? 'image' : 'mood'} immediately: ${mood || 'content'}`, 
          type: 'info' 
        }));
      }
    }
  }, [moods, config.mode, audioPlayer, mediaQueue, dispatch]);

  // Handle board messages
  const handleBoardMessage = useCallback((boardData: any) => {
    const { action, layout, data } = boardData;
    
    console.log('📋 [HANDLE BOARD MESSAGE]', { action, layout, data });
    
    const isAudioPlaying = audioPlayer.isPlaying();
    const currentTime = audioPlayer.getCurrentTime();
    const currentEndTime = lastAudioEndTimeRef.current;
    
    console.log('🎵 [AUDIO STATUS FOR BOARD]', { 
      isAudioPlaying, 
      currentTime, 
      currentEndTime,
      willQueue: isAudioPlaying && currentEndTime > currentTime
    });
    
    if (action === 'init') {
      if (isAudioPlaying && currentEndTime > currentTime) {
        console.log('📥 [QUEUE BOARD INIT]', { layout: layout || 'normal', endTime: currentEndTime });
        mediaQueue.queueBoard('init', currentEndTime, layout || 'normal', []);
        dispatch(learnerActions.addLog({ message: `📥 Queued board init with ${layout || 'normal'} layout`, type: 'info' }));
      } else {
        dispatch(learnerActions.initBoard({ layout: layout || 'normal' }));
        dispatch(learnerActions.addLog({ message: `📋 Board initialized with ${layout || 'normal'} layout`, type: 'info' }));
      }
    } else if (action === 'add') {
      if (data && Array.isArray(data)) {
        if (isAudioPlaying && currentEndTime > currentTime) {
          console.log('📥 [QUEUE BOARD ADD]', { segments: data, endTime: currentEndTime });
          mediaQueue.queueBoard('add', currentEndTime, undefined, data);
          dispatch(learnerActions.addLog({ message: `📥 Queued board add with ${data.length} segment(s)`, type: 'info' }));
        } else {
          dispatch(learnerActions.addBoardText(data));
          dispatch(learnerActions.addLog({ message: `📋 Added ${data.length} text segment(s) to board`, type: 'info' }));
        }
      }
    } else if (action === 'update') {
      if (data && Array.isArray(data)) {
        if (isAudioPlaying && currentEndTime > currentTime) {
          console.log('📥 [QUEUE BOARD UPDATE]', { segments: data, endTime: currentEndTime });
          mediaQueue.queueBoard('update', currentEndTime, undefined, data);
          dispatch(learnerActions.addLog({ message: `📥 Queued board update with ${data.length} segment(s)`, type: 'info' }));
        } else {
          dispatch(learnerActions.updateBoardText(data));
          dispatch(learnerActions.addLog({ message: `📋 Updated ${data.length} text segment(s) on board`, type: 'info' }));
        }
      }
    } else if (action === 'remove') {
      if (data && Array.isArray(data)) {
        if (isAudioPlaying && currentEndTime > currentTime) {
          console.log('📥 [QUEUE BOARD REMOVE]', { ids: data.map(item => item.id), endTime: currentEndTime });
          mediaQueue.queueBoard('remove', currentEndTime, undefined, data);
          dispatch(learnerActions.addLog({ message: `📥 Queued board remove ${data.length} segment(s)`, type: 'info' }));
        } else {
          const idsToRemove = data.map(item => item.id);
          dispatch(learnerActions.removeBoardText(idsToRemove));
          dispatch(learnerActions.addLog({ message: `📋 Removed ${idsToRemove.length} text segment(s) from board`, type: 'info' }));
        }
      }
    } else if (action === 'clear') {
      if (isAudioPlaying && currentEndTime > currentTime) {
        console.log('📥 [QUEUE BOARD CLEAR]', { endTime: currentEndTime });
        mediaQueue.queueBoard('clear', currentEndTime);
        dispatch(learnerActions.addLog({ message: '📥 Queued board clear', type: 'info' }));
      } else {
        dispatch(learnerActions.clearBoard());
        dispatch(learnerActions.addLog({ message: '📋 Board cleared', type: 'info' }));
      }
    } else if (action === 'close') {
      if (isAudioPlaying && currentEndTime > currentTime) {
        console.log('📥 [QUEUE BOARD CLOSE]', { endTime: currentEndTime });
        mediaQueue.queueBoard('close', currentEndTime);
        dispatch(learnerActions.addLog({ message: '📥 Queued board close', type: 'info' }));
      } else {
        dispatch(learnerActions.closeBoard());
        dispatch(learnerActions.addLog({ message: '📋 Board closed (hidden)', type: 'info' }));
      }
    }
  }, [audioPlayer, mediaQueue, dispatch]);

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
    try {
      dispatch(learnerActions.setConnectionStatus('connecting'));
      dispatch(learnerActions.addLog({ message: 'Initializing conversation...', type: 'info' }));

      // Initialize conversation
      const initResponse = botId 
        ? await LearnerService.initConversationWithBot({
            user_id: config.userId || 'default_user',
            bot_id: botId,
            conversation_id: conversationId || undefined,
          })
        : await LearnerService.initConversation({
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
        user_id: config.userId || 'default_user',
        ...(botId ? { bot_id: botId } : { todo_id: config.todoId }),
        conversation_id: initResponse.conversation_id,
      });

      toast.success('Connected successfully!');
      setHasConnectionError(false); // Clear error on successful connection
    } catch (error: any) {
      dispatch(learnerActions.addLog({ message: `Connection failed: ${error.message}`, type: 'error' }));
      dispatch(learnerActions.setConnectionStatus('disconnected'));
      toast.error(`Connection failed: ${error.message}`);
      setHasConnectionError(true); // Set error flag
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

    // Clear board and media queue
    dispatch(learnerActions.hideBoard());
    mediaQueue.clearQueue();

    dispatch(learnerActions.setIsRecording(false));
    dispatch(learnerActions.setConnectionStatus('disconnected'));
    dispatch(learnerActions.addLog({ message: 'Disconnected', type: 'info' }));
  }, [wsDisconnect, audioRecorder, audioPlayer, speechRecognition, mediaQueue, dispatch]);

  // Mic press handler
  const handleMicPress = useCallback(() => {
    if (!isConnected) return;
    
    mouseDownTimeRef.current = Date.now();

    if (config.mode === 'direct') {
      // Direct audio: click to start (if not recording)
      // Hold button/space while recording to enter hold mode
      if (!audioRecorder.isRecording) {
        audioRecorder.startRecording();
        audioPlayer.toggleMute(true); // Mute incoming audio while user speaks
        dispatch(learnerActions.setIsRecording(true));
        dispatch(learnerActions.addLog({ message: 'Recording started - hold space/button for hold mode', type: 'info' }));
        
        // Send start_user_audio signal to server
        sendMessage({ type: 'start_user_audio' });
        
        // Clear auto-reopen timer if user manually starts
        if (autoReopenTimerRef.current) {
          clearTimeout(autoReopenTimerRef.current);
          autoReopenTimerRef.current = null;
        }
        turnCompleteRef.current = false;
        isHoldModeRef.current = false; // Reset hold mode
      } else if (!isHoldModeRef.current) {
        // Already recording, enter hold mode
        isHoldModeRef.current = true;
        dispatch(learnerActions.setIsHoldMode(true));
        sendMessage({ type: 'control', data: { command: 'start_hold' } });
        dispatch(learnerActions.addLog({ message: '🔒 Hold mode activated (button)', type: 'info' }));
      }
      // Don't stop on press - wait for server end_user_audio signal or hold mode release
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

  // Mic release handler for button (handles hold mode)
  const handleMicRelease = useCallback(() => {
    const pressDuration = Date.now() - mouseDownTimeRef.current;
    
    // Only process release if it was a hold (> 200ms) or in hold mode
    // This prevents quick clicks from triggering hold mode exit
    if (config.mode === 'direct' && isHoldModeRef.current && pressDuration > 100) {
      // Exit hold mode when button released
      isHoldModeRef.current = false;
      dispatch(learnerActions.setIsHoldMode(false));
      sendMessage({ type: 'control', data: { command: 'end_hold' } });
      dispatch(learnerActions.addLog({ message: '🔓 Hold mode released (button) - waiting for server', type: 'info' }));
      // Server will send end_user_audio to stop recording
    } else if (config.mode === 'stt' && audioRecorder.isRecording) {
      // STT mode: release stops recording immediately
      audioRecorder.stopRecording();
      dispatch(learnerActions.setIsRecording(false));
      dispatch(learnerActions.addLog({ message: 'Recording stopped', type: 'info' }));
    }
  }, [config.mode, audioRecorder, sendMessage, dispatch]);

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

  // Keyboard handler for Space key with hold-to-talk support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && config.mode !== 'text') {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return; // Don't interfere with input fields
        }
        e.preventDefault();
        
        // If already recording in direct mode and not in hold mode yet, enter hold mode
        if (config.mode === 'direct' && audioRecorder.isRecording && !isHoldModeRef.current && !e.repeat) {
          isHoldModeRef.current = true;
          dispatch(learnerActions.setIsHoldMode(true));
          sendMessage({ type: 'control', data: { command: 'start_hold' } });
          dispatch(learnerActions.addLog({ message: '🔒 Hold mode activated - hold space to keep talking', type: 'info' }));
        } else if (!e.repeat) {
          // Normal mic press for first time or STT mode
          handleMicPress();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (config.mode === 'direct' && isHoldModeRef.current) {
          // Exit hold mode - send end_hold signal
          isHoldModeRef.current = false;
          dispatch(learnerActions.setIsHoldMode(false));
          sendMessage({ type: 'control', data: { command: 'end_hold' } });
          dispatch(learnerActions.addLog({ message: '🔓 Hold mode released - waiting for server to stop recording', type: 'info' }));
          // Server will send end_user_audio to stop recording
        } else if (config.mode === 'stt') {
          // STT mode: release stops recording
          handleMicRelease();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [config.mode, audioRecorder.isRecording, handleMicPress, handleMicRelease, sendMessage, dispatch]);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      const timer = setTimeout(() => {
        handleConnect();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        handleDisconnect();
      };
    }
  }, []); // Empty deps - only run once on mount

  if (compactLayout) {
    // Compact layout for lesson learning page
    return (
      <div className="w-full max-w-2xl">
        {/* Audio Visualizer */}
        <AudioVisualizer showCaption={showCaption} />
        
        {/* Audio Controls */}
        <div className="mt-4">
          <AudioControls
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onMicPress={handleMicPress}
            onMicRelease={handleMicRelease}
            disabled={connectionStatus === 'connecting'}
            hideConnectionControls={true}
            hasError={hasConnectionError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ConfigPanel />
      
      <AudioControls
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onMicPress={handleMicPress}
        onMicRelease={handleMicRelease}
        disabled={connectionStatus === 'connecting'}
        hasError={hasConnectionError}
      />

      {config.mode === 'text' ? (
        <ChatDisplay 
          onSendMessage={handleSendTextMessage}
          disabled={!isConnected}
        />
      ) : (
        <>
          <AudioVisualizer showCaption={showCaption} />
          <TranscriptPanel />
        </>
      )}

      <LogPanel />
    </div>
  );
};
