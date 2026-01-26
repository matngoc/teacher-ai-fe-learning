export type BoardLayout = 'normal' | 'auto_center';

export type BoardAction = 'init' | 'add' | 'update' | 'remove' | 'clear';

export interface BoardTextSegment {
  id: number;
  text: string;
  color: string;
  highlight_indexes?: number[];
  highlight_color?: string;
}

export interface BoardState {
  layout: BoardLayout;
  segments: BoardTextSegment[];
  isVisible: boolean;
}

export interface BoardMessage {
  action: BoardAction;
  layout?: BoardLayout;
  data?: BoardTextSegment[];
}
