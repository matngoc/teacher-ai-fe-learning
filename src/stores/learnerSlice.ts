import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AudioMode = 'stt' | 'direct' | 'text';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'listening';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'function' | 'image';
  content: string;
  timestamp: number;
  functionName?: string;
  functionArgs?: any;
  imageUrls?: string[];
}

export interface TodoItem {
  id: string;
  name: string;
  description?: string;
  status_action?: boolean;
}

export interface MoodItem {
  id: string;
  mood_name: string;
  url: string;
}

export interface LearnerConfig {
  wsUrl: string;
  userId: string;
  todoId: string;
  mode: AudioMode;
  asrType: string;
}

export interface LearnerState {
  // Connection
  connectionStatus: ConnectionStatus;
  isRecording: boolean;
  isHoldMode: boolean;
  
  // Configuration
  config: LearnerConfig;
  
  // Data
  todos: TodoItem[];
  moods: MoodItem[];
  
  // Chat
  messages: ChatMessage[];
  transcript: string;
  
  // Image display
  currentImage: {
    url: string;
    mood?: string;
    servo?: string;
  } | null;
  
  // Logs
  logs: Array<{
    message: string;
    type: 'info' | 'success' | 'error' | 'debug';
    timestamp: number;
  }>;
  
  // UI State
  showAdvanced: boolean;
}

const getDefaultWebSocketUrl = (): string => {
  // Use environment variable if available, otherwise construct from window.location
  const baseUrl = import.meta.env.VITE_WS_BASE_URL;
  
  if (baseUrl) {
    return `${baseUrl}/personalized-ai-coach/api/v1/bot/ws/audio2audio/string?asr_type=grpc`;
  }
  
  // Fallback to auto-detect from current page
  if (typeof window === 'undefined' || !window.location.host) return '';
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/personalized-ai-coach/api/v1/bot/ws/audio2audio/string?asr_type=grpc`;
};

const initialState: LearnerState = {
  connectionStatus: 'disconnected',
  isRecording: false,
  isHoldMode: false,
  config: {
    wsUrl: getDefaultWebSocketUrl(),
    userId: 'default_user',
    todoId: '',
    mode: 'direct',
    asrType: 'grpc',
  },
  todos: [],
  moods: [],
  messages: [],
  transcript: '',
  currentImage: null,
  logs: [],
  showAdvanced: false,
};

const learnerSlice = createSlice({
  name: 'learner',
  initialState,
  reducers: {
    // Connection actions
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setIsHoldMode: (state, action: PayloadAction<boolean>) => {
      state.isHoldMode = action.payload;
    },
    
    // Config actions
    updateConfig: (state, action: PayloadAction<Partial<LearnerConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    setMode: (state, action: PayloadAction<AudioMode>) => {
      state.config.mode = action.payload;
      
      // Update WebSocket URL based on mode
      const baseUrl = import.meta.env.VITE_WS_BASE_URL;
      
      if (baseUrl) {
        // Use environment variable
        if (action.payload === 'text') {
          state.config.wsUrl = `${baseUrl}/personalized-ai-coach/api/v1/bot/ws/benchmark/string?benchmark_type=agent`;
        } else {
          state.config.wsUrl = `${baseUrl}/personalized-ai-coach/api/v1/bot/ws/audio2audio/string?asr_type=${state.config.asrType}`;
        }
      } else {
        // Fallback to auto-detect from window.location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        if (action.payload === 'text') {
          state.config.wsUrl = `${protocol}//${host}/personalized-ai-coach/api/v1/bot/ws/benchmark/string?benchmark_type=agent`;
        } else {
          state.config.wsUrl = `${protocol}//${host}/personalized-ai-coach/api/v1/bot/ws/audio2audio/string?asr_type=${state.config.asrType}`;
        }
      }
    },
    setAsrType: (state, action: PayloadAction<string>) => {
      state.config.asrType = action.payload;
      
      // Update WebSocket URL with new ASR type
      if (state.config.mode !== 'text' && state.config.wsUrl) {
        try {
          const baseUrl = import.meta.env.VITE_WS_BASE_URL || window.location.origin;
          const url = new URL(state.config.wsUrl, baseUrl);
          url.searchParams.set('asr_type', action.payload);
          state.config.wsUrl = url.toString();
        } catch (e) {
          console.error('Failed to update ASR type in URL:', e);
        }
      }
    },
    
    // Data actions
    setTodos: (state, action: PayloadAction<TodoItem[]>) => {
      state.todos = action.payload;
    },
    setMoods: (state, action: PayloadAction<MoodItem[]>) => {
      state.moods = action.payload;
    },
    
    // Chat actions
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateLastMessage: (state, action: PayloadAction<Partial<ChatMessage>>) => {
      const lastIndex = state.messages.length - 1;
      if (lastIndex >= 0) {
        state.messages[lastIndex] = { ...state.messages[lastIndex], ...action.payload };
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
    },
    appendTranscript: (state, action: PayloadAction<string>) => {
      state.transcript += (state.transcript ? ' ' : '') + action.payload;
    },
    
    // Image actions
    setCurrentImage: (state, action: PayloadAction<{ url: string; mood?: string; servo?: string } | null>) => {
      state.currentImage = action.payload;
    },
    
    // Log actions
    addLog: (state, action: PayloadAction<{ message: string; type: 'info' | 'success' | 'error' | 'debug' }>) => {
      state.logs.push({
        ...action.payload,
        timestamp: Date.now(),
      });
      
      // Keep only last 100 logs
      if (state.logs.length > 100) {
        state.logs = state.logs.slice(-100);
      }
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    
    // UI actions
    toggleAdvanced: (state) => {
      state.showAdvanced = !state.showAdvanced;
    },
    
    // Reset action
    reset: () => initialState,
  },
});

export const learnerActions = learnerSlice.actions;
export default learnerSlice.reducer;
