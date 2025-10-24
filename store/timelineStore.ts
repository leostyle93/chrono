
import { create } from 'zustand';
import type { TimelineItem, ModalState } from '../types';

interface TimelineState {
  items: TimelineItem[];
  viewStartDate: number;
  viewEndDate: number;
  modalState: ModalState;
  pan: (delta: number) => void;
  zoom: (factor: number, anchorYear: number) => void;
  addItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateItem: (item: TimelineItem) => void;
  deleteItem: (id: string) => void;
  openModal: (itemType: 'event' | 'period' | 'frame', item?: TimelineItem) => void;
  closeModal: () => void;
}

const initialItems: TimelineItem[] = [
  { id: '1', type: 'period', title: 'Roman Republic', startDate: -509, endDate: -27, yLevel: 0, color: 'blue' },
  { id: '2', type: 'period', title: 'Roman Empire', startDate: -27, endDate: 476, yLevel: 1, color: 'purple' },
  { id: '3', type: 'event', title: 'Julius Caesar assassinated', date: -44, month: 3, day: 15, yLevel: 2, color: 'red', description: 'A pivotal event that led to the end of the Roman Republic.' },
  { id: '4', type: 'event', title: 'Start of Pax Romana', date: 27, yLevel: 3, color: 'green', description: 'A long period of relative peacefulness and minimal expansion by the Roman military.' },
  { id: '5', type: 'frame', title: 'Rise and Fall of Rome', startDate: -600, endDate: 500, startY: -0.5, height: 5, color: 'gray' },
  { id: '6', type: 'event', title: 'World War I Starts', date: 1914, month: 7, day: 28, yLevel: 0, color: 'orange', description: 'Austria-Hungary declares war on Serbia, beginning World War I.'},
  { id: '7', type: 'event', title: 'World War II Starts', date: 1939, month: 9, day: 1, yLevel: 1, color: 'red', description: 'Germany invades Poland, leading to declarations of war by France and the United Kingdom.'},
  { id: '8', type: 'period', title: 'The Cold War', startDate: 1947, endDate: 1991, yLevel: 2, color: 'sky' },
  { id: '9', type: 'event', title: 'Moon Landing', date: 1969, month: 7, day: 20, yLevel: 3, color: 'yellow', description: 'Apollo 11 was the first spaceflight to land humans on the Moon.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg' },
];

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
  
  addItem: (item) => set(state => ({
    items: [...state.items, { ...item, id: new Date().toISOString() } as TimelineItem],
  })),

  updateItem: (updatedItem) => set(state => ({
    items: state.items.map(item => item.id === updatedItem.id ? updatedItem : item),
  })),

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
