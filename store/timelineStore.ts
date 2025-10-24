import { create } from 'zustand';
import type { TimelineItem, ModalState, TimelineEvent, TimelinePeriod, TimelineFrame } from '../types';
import { dateToDecimal } from '../utils/time';

interface TimelineState {
  items: TimelineItem[];
  viewStartDate: number;
  viewEndDate: number;
  modalState: ModalState;
  pan: (delta: number) => void;
  zoom: (factor: number, anchorYear: number) => void;
  addItem: (item: Omit<TimelineItem, 'id' | 'type'>) => void;
  updateItem: (item: TimelineItem) => void;
  deleteItem: (id: string) => void;
  openModal: (itemType: 'event' | 'period' | 'frame', item?: TimelineItem) => void;
  closeModal: () => void;
}

const initialItems: TimelineItem[] = [
  { id: '1', type: 'period', title: 'Roman Republic', startDate: -509, endDate: -27, yLevel: 0, color: '#a78bfa', frameId: '5' },
  { id: '2', type: 'period', title: 'Roman Empire', startDate: -27, endDate: 476, yLevel: 1, color: '#c084fc', frameId: '5' },
  { id: '3', type: 'event', title: 'Julius Caesar assassinated', date: -44, month: 3, day: 15, yLevel: 0, color: '#f87171', description: 'A pivotal event that led to the end of the Roman Republic.', frameId: '5', periodId: '1' },
  { id: '4', type: 'event', title: 'Start of Pax Romana', date: 27, yLevel: 0, color: '#4ade80', description: 'A long period of relative peacefulness and minimal expansion by the Roman military.', frameId: '5', periodId: '2'},
  { id: '5', type: 'frame', title: 'Rise and Fall of Rome', startDate: -600, endDate: 500, startY: -0.5, height: 5, color: '#9ca3af' },
  { id: '6', type: 'event', title: 'World War I Starts', date: 1914, month: 7, day: 28, yLevel: 0, color: '#fb923c', description: 'Austria-Hungary declares war on Serbia, beginning World War I.'},
  { id: '7', type: 'event', title: 'World War II Starts', date: 1939, month: 9, day: 1, yLevel: 1, color: '#f87171', description: 'Germany invades Poland, leading to declarations of war by France and the United Kingdom.'},
  { id: '8', type: 'period', title: 'The Cold War', startDate: 1947, endDate: 1991, yLevel: 2, color: '#60a5fa' },
  { id: '9', type: 'event', title: 'Moon Landing', date: 1969, month: 7, day: 20, yLevel: 0, color: '#facc15', description: 'Apollo 11 was the first spaceflight to land humans on the Moon.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg', periodId: '8' },
];

// Helper to find the parent frame or period
const findParent = (item: Omit<TimelineItem, 'id'>, allItems: TimelineItem[]) => {
    let frameId: string | undefined = undefined;
    let periodId: string | undefined = undefined;

    // FIX: Replaced ternary operator with an if/else block to ensure correct type narrowing for the `item` union type. This resolves errors where properties like `date` were not found on the general `TimelineItem` type.
    let itemStart: number;
    let itemEnd: number;
    if (item.type === 'event') {
        itemStart = dateToDecimal(item);
        itemEnd = itemStart;
    } else {
        itemStart = item.startDate;
        itemEnd = item.endDate;
    }

    const frames = allItems.filter(i => i.type === 'frame') as TimelineFrame[];
    const periods = allItems.filter(i => i.type === 'period') as TimelinePeriod[];

    // Find the tightest-fitting frame
    let smallestFrameSpan = Infinity;
    for (const frame of frames) {
        if (itemStart >= frame.startDate && itemEnd <= frame.endDate) {
            const frameSpan = frame.endDate - frame.startDate;
            if (frameSpan < smallestFrameSpan) {
                smallestFrameSpan = frameSpan;
                frameId = frame.id;
            }
        }
    }

    // Find the tightest-fitting period (for events only)
    if(item.type === 'event') {
      let smallestPeriodSpan = Infinity;
      for (const period of periods) {
          if (itemStart >= period.startDate && itemEnd <= period.endDate) {
              const periodSpan = period.endDate - period.startDate;
              if (periodSpan < smallestPeriodSpan) {
                  smallestPeriodSpan = periodSpan;
                  periodId = period.id;
              }
          }
      }
    }

    return { frameId, periodId };
};


export const useTimelineStore = create<TimelineState>((set, get) => ({
  items: initialItems,
  viewStartDate: -1000,
  viewEndDate: 2050,
  modalState: { isOpen: false, item: null, itemType: null },

  pan: (delta) => set(state => {
    const span = state.viewEndDate - state.viewStartDate;
    const yearDelta = (delta / window.innerWidth) * span;
    return {
      viewStartDate: state.viewStartDate + yearDelta,
      viewEndDate: state.viewEndDate + yearDelta,
    };
  }),

  zoom: (factor, anchorYear) => set(state => {
    const { viewStartDate, viewEndDate } = state;
    const span = viewEndDate - viewStartDate;
    const newSpan = span * factor;

    const minSpan = 1/365; // ~1 day
    const maxSpan = 10000;
    if (newSpan < minSpan || newSpan > maxSpan) return {};

    const anchorRatio = (anchorYear - viewStartDate) / span;

    const newStartDate = anchorYear - (newSpan * anchorRatio);
    const newEndDate = newStartDate + newSpan;

    return {
      viewStartDate: newStartDate,
      viewEndDate: newEndDate,
    };
  }),
  
  addItem: (item) => set(state => {
    const { frameId, periodId } = findParent(item, state.items);
    const newItem = {
        ...item,
        id: new Date().toISOString(),
        frameId,
        periodId,
    } as TimelineItem;

    return {
      items: [...state.items, newItem],
    }
  }),

  updateItem: (updatedItem) => set(state => {
    const { frameId, periodId } = findParent(updatedItem, state.items);
    const finalItem = { ...updatedItem, frameId, periodId };
    
    return {
      items: state.items.map(item => item.id === finalItem.id ? finalItem : item),
    }
  }),

  deleteItem: (id) => set(state => ({
    items: state.items.filter(item => item.id !== id),
  })),
  
  openModal: (itemType, item = null) => set({
    modalState: { isOpen: true, item, itemType }
  }),
  
  closeModal: () => set({
    modalState: { isOpen: false, item: null, itemType: null }
  }),
}));

// Function to convert year to a percentage position
export const yearToPercent = (year: number, start: number, end: number): number => {
  const span = end - start;
  if (span === 0) return 0;
  return ((year - start) / span) * 100;
};