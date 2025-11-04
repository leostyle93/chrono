export interface TimelineEvent {
  id: string;
  type: 'event';
  title: string;
  description: string; // Short description for the card
  mainText?: string; // Main, longer text for the viewer modal
  date: number; // Year
  month?: number; // 1-12
  day?: number; // 1-31
  yLevel: number;
  imageUrl?: string;
  color: string;
  frameId?: string;
  periodId?: string;
  articleUrl?: string;
  youtubeUrl?: string;
  gmapsQuery?: string;
}

export interface TimelinePeriod {
  id: string;
  type: 'period';
  title: string;
  startDate: number; // Year
  startMonth?: number; // 1-12
  startDay?: number; // 1-31
  endDate: number; // Year
  endMonth?: number; // 1-12
  endDay?: number; // 1-31
  yLevel: number;
  color: string;
  frameId?: string;
  height?: number; // in pixels
  opacity?: number; // 0-100
}

export interface TimelineFrame {
  id:string;
  type: 'frame';
  title: string;
  startDate: number;
  endDate: number;
  startY: number;
  height: number;
  color: string;
}

export type TimelineItem = TimelineEvent | TimelinePeriod | TimelineFrame;

export type EditableItem = Omit<TimelineItem, 'id' | 'type'>;

export interface ModalState {
  isOpen: boolean;
  item: TimelineItem | null;
  itemType: 'event' | 'period' | 'frame' | null;
}

export interface ViewerModalState {
  isOpen: boolean;
  event: TimelineEvent | null;
}

export interface TimelineLink {
  id: string;
  startItemId: string;
  endItemId: string;
  color: string;
}

export interface LinkMenuState {
  isOpen: boolean;
  link: TimelineLink | null;
  x: number;
  y: number;
}