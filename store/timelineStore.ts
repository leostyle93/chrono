import { create } from 'zustand';
import type { TimelineItem, ModalState, TimelineEvent, TimelinePeriod, TimelineFrame, TimelineLink, LinkMenuState, ViewerModalState } from '../types';
import { dateToDecimal } from '../utils/time';

interface TimelineState {
  items: TimelineItem[];
  links: TimelineLink[];
  viewStartDate: number;
  viewEndDate: number;
  modalState: ModalState;
  viewerModalState: ViewerModalState;
  isLinking: boolean;
  linkStartItemId: string | null;
  linkMenuState: LinkMenuState;
  isImportModalOpen: boolean;
  pan: (delta: number) => void;
  zoom: (factor: number, anchorYear: number) => void;
  addItem: (item: Omit<TimelineItem, 'id' | 'type'>) => void;
  addItems: (items: Omit<TimelineItem, 'id'>[]) => void;
  updateItem: (item: TimelineItem) => void;
  deleteItem: (id: string) => void;
  openModal: (itemType: 'event' | 'period' | 'frame', item?: TimelineItem) => void;
  closeModal: () => void;
  openViewerModal: (event: TimelineEvent) => void;
  closeViewerModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  toggleLinkingMode: () => void;
  handleItemClickForLinking: (itemId: string) => void;
  cancelLinking: () => void;
  updateLink: (linkId: string, newProps: Partial<Omit<TimelineLink, 'id'>>) => void;
  deleteLink: (linkId: string) => void;
  openLinkMenu: (link: TimelineLink, x: number, y: number) => void;
  closeLinkMenu: () => void;
  loadState: (state: { items: TimelineItem[], links: TimelineLink[] }) => void;
  clearTimeline: () => void;
}

const initialItems: TimelineItem[] = [
  { id: '1', type: 'period', title: 'Roman Republic', startDate: -509, endDate: -27, yLevel: 0, color: '#a78bfa', frameId: '5' },
  { id: '2', type: 'period', title: 'Roman Empire', startDate: -27, endDate: 476, yLevel: 1, color: '#c084fc', frameId: '5' },
  { id: '3', type: 'event', title: 'Julius Caesar assassinated', date: -44, month: 3, day: 15, yLevel: 0, color: '#f87171', description: 'A pivotal event that led to the end of the Roman Republic.', mainText: 'The assassination of Julius Caesar was the result of a conspiracy by many Roman senators. Led by Gaius Cassius Longinus, Decimus Junius Brutus Albinus, and Marcus Junius Brutus, they stabbed Caesar to death in a location adjacent to the Theatre of Pompey on the Ides of March (March 15), 44 BC.', frameId: '5', periodId: '1', articleUrl: 'https://en.wikipedia.org/wiki/Assassination_of_Julius_Caesar', gmapsQuery: 'Largo di Torre Argentina, Rome, Italy' },
  { id: '4', type: 'event', title: 'Start of Pax Romana', date: 27, yLevel: 0, color: '#4ade80', description: 'A long period of relative peacefulness and minimal expansion by the Roman military.', mainText: 'The Pax Romana (Latin for "Roman Peace") was a period of approximately 200 years in Roman history which is identified with increased and sustained inner hegemonial peace and stability. It is traditionally dated as commencing from the accession of Caesar Augustus, founder of the Roman principate, in 27 BC and concluding in 180 AD with the death of Marcus Aurelius, the last of the "Five Good Emperors".', frameId: '5', periodId: '2'},
  { id: '5', type: 'frame', title: 'Rise and Fall of Rome', startDate: -600, endDate: 500, startY: -0.5, height: 5, color: '#9ca3af' },
  { id: '6', type: 'event', title: 'World War I Starts', date: 1914, month: 7, day: 28, yLevel: 0, color: '#fb923c', description: 'Austria-Hungary declares war on Serbia, beginning World War I.'},
  { id: '7', type: 'event', title: 'World War II Starts', date: 1939, month: 9, day: 1, yLevel: 1, color: '#f87171', description: 'Germany invades Poland, leading to declarations of war by France and the United Kingdom.'},
  { id: '8', type: 'period', title: 'The Cold War', startDate: 1947, endDate: 1991, yLevel: 2, color: '#60a5fa' },
  { id: '9', type: 'event', title: 'Moon Landing', date: 1969, month: 7, day: 20, yLevel: 0, color: '#facc15', description: 'Apollo 11 was the first spaceflight to land humans on the Moon.', mainText: 'American astronauts Neil Armstrong and Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC. Armstrong became the first person to step onto the lunar surface six hours and 39 minutes later on July 21 at 02:56 UTC; Aldrin joined him 19 minutes later. They spent about two and a quarter hours together outside the spacecraft, and they collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg', periodId: '8', youtubeUrl: 'https://www.youtube.com/watch?v=S9HdPi9Ikhk' },
];

// Helper to find the parent frame or period
const findParent = (item: Omit<TimelineItem, 'id'>, allItems: TimelineItem[]) => {
    let frameId: string | undefined = undefined;
    let periodId: string | undefined = undefined;
    
    let itemStart: number;
    let itemEnd: number;

    // Use a type-safe switch to determine the decimal start/end years for any item
    switch (item.type) {
        case 'event':
            const e = item as Omit<TimelineEvent, 'id'>;
            itemStart = dateToDecimal({ date: e.date, month: e.month, day: e.day });
            itemEnd = itemStart;
            break;
        case 'period':
            const p = item as Omit<TimelinePeriod, 'id'>;
            itemStart = dateToDecimal({ date: p.startDate, month: p.startMonth, day: p.startDay });
            itemEnd = dateToDecimal({ date: p.endDate, month: p.endMonth, day: p.endDay });
            break;
        case 'frame':
            const f = item as Omit<TimelineFrame, 'id'>;
            itemStart = f.startDate;
            itemEnd = f.endDate;
            break;
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
          const periodStart = dateToDecimal({ date: period.startDate, month: period.startMonth, day: period.startDay });
          const periodEnd = dateToDecimal({ date: period.endDate, month: period.endMonth, day: period.endDay });
          if (itemStart >= periodStart && itemEnd <= periodEnd) {
              const periodSpan = periodEnd - periodStart;
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
  links: [],
  viewStartDate: -1000,
  viewEndDate: 2050,
  modalState: { isOpen: false, item: null, itemType: null },
  viewerModalState: { isOpen: false, event: null },
  isLinking: false,
  linkStartItemId: null,
  linkMenuState: { isOpen: false, link: null, x: 0, y: 0 },
  isImportModalOpen: false,

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
    const { frameId, periodId } = findParent(item as Omit<TimelineItem, 'id'>, state.items);
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

  addItems: (itemsToAdd) => set(state => {
    const newItemsWithIds = itemsToAdd.map(item => {
      const { frameId, periodId } = findParent(item, state.items);
      return {
        ...item,
        id: `${new Date().toISOString()}-${Math.random()}`, // Ensure unique ID for batch adds
        frameId,
        periodId
      } as TimelineItem;
    });

    return {
      items: [...state.items, ...newItemsWithIds],
    };
  }),

  updateItem: (updatedItem) => set(state => {
    const { id, ...itemData } = updatedItem;
    // Pass other items to findParent to avoid item parenting itself
    const otherItems = state.items.filter(i => i.id !== id);
    const { frameId, periodId } = findParent(itemData, otherItems);
    const finalItem = { ...updatedItem, frameId, periodId };
    
    return {
      items: state.items.map(item => item.id === finalItem.id ? finalItem : item),
    }
  }),

  deleteItem: (id) => set(state => ({
    items: state.items.filter(item => item.id !== id),
    links: state.links.filter(link => link.startItemId !== id && link.endItemId !== id),
  })),
  
  openModal: (itemType, item = null) => set({
    modalState: { isOpen: true, item, itemType }
  }),
  
  closeModal: () => set({
    modalState: { isOpen: false, item: null, itemType: null }
  }),

  openViewerModal: (event) => set({
    viewerModalState: { isOpen: true, event }
  }),
  
  closeViewerModal: () => set({
    viewerModalState: { isOpen: false, event: null }
  }),

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),
  
  toggleLinkingMode: () => set(state => ({
      isLinking: !state.isLinking,
      linkStartItemId: null, // Reset on toggle
  })),

  cancelLinking: () => set({ isLinking: false, linkStartItemId: null }),
  
  handleItemClickForLinking: (itemId) => {
    const { linkStartItemId } = get();
    if (!linkStartItemId) {
      set({ linkStartItemId: itemId });
    } else if (linkStartItemId !== itemId) {
      const newLink: TimelineLink = {
        id: new Date().toISOString(),
        startItemId: linkStartItemId,
        endItemId: itemId,
        color: '#9ca3af', // Default color
      };
      set(state => ({
        links: [...state.links, newLink],
        isLinking: false,
        linkStartItemId: null,
      }));
    }
  },
  
  updateLink: (linkId, newProps) => set(state => ({
    links: state.links.map(link => link.id === linkId ? { ...link, ...newProps } : link),
  })),

  deleteLink: (linkId) => set(state => ({
    links: state.links.filter(link => link.id !== linkId),
    linkMenuState: { isOpen: false, link: null, x: 0, y: 0 },
  })),
  
  openLinkMenu: (link, x, y) => set({
    linkMenuState: { isOpen: true, link, x, y }
  }),

  closeLinkMenu: () => set(state => ({
    linkMenuState: { ...state.linkMenuState, isOpen: false }
  })),

  loadState: (newState) => set({ items: newState.items, links: newState.links }),

  clearTimeline: () => set({ items: [], links: [] }),
}));

// Function to convert year to a percentage position
export const yearToPercent = (year: number, start: number, end: number): number => {
  const span = end - start;
  if (span === 0) return 0;
  return ((year - start) / span) * 100;
};