export type MediaType = "for_question" | "for_response";
export type CheckpointType = "narrative" | "cta";

export interface Media {
  id: string;
  type: MediaType;
  image_url?: string;
  audio_url?: string;
  media_description?: string;
}

export interface Checkpoint {
  name: string;
  type: CheckpointType;
  question: string;
  media_list: Media[];
  response_guide?: string;
  image_listening?: string;
}

export interface Emotion {
  combo_name: string;
  title: string;
}
