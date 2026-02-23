export type MediaType = "for_question" | "for_response";
export type CheckpointType = "narrative" | "cta" | "cta-pronun";

export interface Media {
  id: string;
  type: MediaType;
  image_url?: string;
  audio_url?: string;
  media_description?: string;
}

export interface KaraokeSegment {
  segment: string;
  end_time: number;
}

export interface CheckRule {
  type: "contains_or" | "exact_match" | "contains_and";
  sequence: string;
}

export interface SegmentVisualize {
  highlights: number[];
  karaoke?: KaraokeSegment[];
}

export interface PronounSegment {
  text: string;
  audio_url: string;
  check_rule: CheckRule;
  visualize: SegmentVisualize;
  start_msg: string;
}

export interface Checkpoint {
  name: string;
  type: CheckpointType;
  question: string;
  media_list: Media[];
  response_guide?: string;
  image_listening?: string;
  other_data?: {
    segment_list?: PronounSegment[];
  };
}

export interface Emotion {
  combo_name: string;
  title: string;
}
