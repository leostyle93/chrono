export interface TimelineEvent {
  id: string;
  type: 'event';
  title: string;
  description: string;
  date: number; // Year
  month?: number; // 1-12
  day?: number; // 1-31
  yLevel: number;
  imageUrl?: string;
  color: string;
  frameId?: string;
  periodId?: string;
}

export interface TimelinePeriod {
  id: string;
  type: 'period';
  title: string;
  startDate: number;
  endDate: number;
  yLevel: number;
  color: string;
  frameId?: string;
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