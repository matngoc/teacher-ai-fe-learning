import axios from 'axios';

export interface BotListResponse {
  status: number;
  msg: string;
  result: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

export interface BotDetailResponse {
  status: number;
  msg: string;
  result: {
    id: number;
    name: string;
    description: string;
    checkpoints?: any[];
    [key: string]: any;
  };
}

export interface CreateBotRequest {
  name: string;
  description: string;
  system_prompt: string;
  checkpoints?: any[];
}

export interface UpdateBotRequest {
  id: number;
  name: string;
  description: string;
  system_prompt: string;
  checkpoints?: any[];
}

export const LessonService = {
  /**
   * Fetch list of available bots/lessons
   */
  async fetchBotList(): Promise<BotListResponse> {
    const robotApiUrl = import.meta.env.VITE_AI_BE_URL || 'https://robot-api.hacknao.edu.vn/robot/api/v1';
    const response = await axios.get<BotListResponse>(
      `${robotApiUrl}/database/listBot`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    return response.data;
  },

  /**
   * Get bot/lesson detail
   */
  async getBotDetail(id: number): Promise<BotDetailResponse> {
    const robotApiUrl = import.meta.env.VITE_AI_BE_URL || 'https://robot-api.hacknao.edu.vn/robot/api/v1';
    const response = await axios.get<BotDetailResponse>(
      `${robotApiUrl}/database/getDataBot`,
      {
        params: { bot_id: id },
        headers: {
          'accept': 'application/json'
        }
      }
    );
    return response.data;
  },

  /**
   * Create new bot/lesson
   */
  async createBot(data: CreateBotRequest): Promise<any> {
    const robotApiUrl = import.meta.env.VITE_AI_BE_URL || 'https://robot-api.hacknao.edu.vn/robot/api/v1';
    
    const body = {
      name: data.name,
      description: data.description,
      task_chain: [
        {
          task: 0,
          language: '',
          session_id: '',
          start_message: 'string',
          checkpoints: data.checkpoints || [],
          sub_agents: [],
          tools: [],
          asr_config: 'medium',
          GRAMMAR_CHECKER_TOOL: '',
          SYSTEM_TASK_DESCRIPTION: data.system_prompt,
          SYSTEM_PROMPT_GENERATION: '',
          SYSTEM_EXTRACTION_PROFILE: '',
          PRONUNCIATION_CHECKER_TOOL: '',
          SYSTEM_EXTRACTION_VARIABLES: '',
        },
      ],
      generation_params: {
        model: 'gpt-4.1',
        top_p: 1,
        stream: false,
        max_tokens: 1024,
        temperature: 0,
      },
      provider_name: 'openai',
      system_prompt: '{{SYSTEM_TASK_DESCRIPTION}}',
      format_output: 'TEXT',
    };
    
    const response = await axios.post(
      `${robotApiUrl}/database/insertBot`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    return response.data;
  },

  /**
   * Update bot/lesson
   */
  async updateBot(data: UpdateBotRequest): Promise<any> {
    const robotApiUrl = import.meta.env.VITE_AI_BE_URL || 'https://robot-api.hacknao.edu.vn/robot/api/v1';
    
    const body = {
      bot_id: data.id,
      name: data.name,
      description: data.description,
      task_chain: [
        {
          task: 0,
          language: '',
          session_id: '',
          start_message: 'string',
          checkpoints: data.checkpoints || [],
          sub_agents: [],
          tools: [],
          asr_config: 'medium',
          GRAMMAR_CHECKER_TOOL: '',
          SYSTEM_TASK_DESCRIPTION: data.system_prompt,
          SYSTEM_PROMPT_GENERATION: '',
          SYSTEM_EXTRACTION_PROFILE: '',
          PRONUNCIATION_CHECKER_TOOL: '',
          SYSTEM_EXTRACTION_VARIABLES: '',
        },
      ],
      generation_params: {
        model: 'gpt-4.1',
        top_p: 1,
        stream: false,
        max_tokens: 1024,
        temperature: 0,
      },
      provider_name: 'openai',
      system_prompt: '{{SYSTEM_TASK_DESCRIPTION}}',
      format_output: 'TEXT',
    };
    
    const response = await axios.post(
      `${robotApiUrl}/database/updateBot`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );
    return response.data;
  },
};
