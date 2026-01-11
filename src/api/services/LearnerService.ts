import { AxiosBaseHttpAiApi } from '~/core/configs/axios.config';
import axios from 'axios';

export interface TodoResponse {
  status: number;
  data: Array<{
    id: string;
    name: string;
    description?: string;
    status_action?: boolean;
    data?: any[];
  }>;
}

export interface ConversationInitRequest {
  user_id: string;
  todo_id: string;
  conversation_id?: string;
}

export interface ConversationInitWithBotRequest {
  user_id: string;
  bot_id: number;
  conversation_id?: string;
}

export interface ConversationInitResponse {
  conversation_id: string;
  message?: string;
}

export interface MoodResponse {
  data: Array<{
    id: string;
    mood_name: string;
    url: string;
  }>;
}

export const LearnerService = {
  /**
   * Fetch list of available todos from Robot API
   */
  async fetchTodoList(): Promise<TodoResponse> {
    const robotApiUrl = import.meta.env.VITE_ROBOT_API_URL || 'https://robot-api-hackathon.hacknao.edu.vn/robot/api/v1';
    const response = await axios.get<TodoResponse>(
      `${robotApiUrl}/open-api/to-do-list`,
      {
        headers: {
          'accept': '*/*'
        }
      }
    );
    // Response is already the full object with status and data
    return response.data;
  },

  /**
   * Initialize a conversation session
   */
  async initConversation(data: ConversationInitRequest): Promise<ConversationInitResponse> {
    // Always send conversation_id (default to 'string' if not provided)
    const payload = {
      ...data,
      conversation_id: data.conversation_id ?? 'string',
    };
    const response = await AxiosBaseHttpAiApi.post<ConversationInitResponse>(
      '/bot/initConversation',
      payload
    );
    return response.data;
  },

  /**
   * Initialize conversation with bot_id instead of todo_id
   */
  async initConversationWithBot(params: ConversationInitWithBotRequest): Promise<ConversationInitResponse> {
    const payload = {
      ...params,
      conversation_id: params.conversation_id ?? 'string',
    };
    const response = await AxiosBaseHttpAiApi.post<ConversationInitResponse>(
      '/bot/initConversation',
      payload
    );
    return response.data;
  },

  /**
   * Fetch list of mood images from LLM API
   */
  async fetchMoodList(): Promise<MoodResponse> {
    const llmApiUrl = import.meta.env.VITE_LLM_API_URL || 'https://robot-api.hacknao.edu.vn/robot/api/v1';
    const llmApiToken = import.meta.env.VITE_LLM_API_TOKEN || 'b1812cb7-2513-408b-bb22-d9f91b099fbd';
    
    const response = await axios.get<{ status: number; data: { moods: MoodResponse['data'] } }>(
      `${llmApiUrl}/llm/moods`,
      {
        params: {
          token: llmApiToken
        },
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    // Transform response to match our interface
    return {
      data: response.data.data?.moods || []
    };
  },

  /**
   * Get image URL by mood name
   */
  async getImageUrlFromMood(moodName: string, moods?: MoodResponse['data']): Promise<string | null> {
    // If moods array is provided, search in it
    if (moods && moods.length > 0) {
      const mood = moods.find(m => m.mood_name.toLowerCase() === moodName.toLowerCase());
      return mood?.url || null;
    }
    
    // Otherwise fetch from API
    const response = await this.fetchMoodList();
    const mood = response.data.find(m => m.mood_name.toLowerCase() === moodName.toLowerCase());
    return mood?.url || null;
  },

};
