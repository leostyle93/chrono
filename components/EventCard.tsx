import React from 'react';
import type { TimelineEvent } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { dateToDecimal, formatEventDate } from '../utils/time';
import { useThemeStore } from '../store/themeStore';

interface EventCardProps {
  event: TimelineEvent;
  start: number;
  end: number;
  parentYLevel?: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, start, end, parentYLevel }) => {
  const { openModal } = useTimelineStore();
  const { textColor } = useThemeStore();
  const position = dateToDecimal(event);
  const left = yearToPercent(position, start, end);

  if (left < 0 || left > 100) return null;

  const handleDoubleClick = () => {
    openModal('event', event);
  };
  
  const baseBottom = 70;
  const levelHeight = parentYLevel !== undefined ? 40 : 120; // smaller spacing if attached to period
  const parentOffset = parentYLevel !== undefined ? (parentYLevel * 40) + 40 : 0;
  
  const bottom = baseBottom + parentOffset + event.yLevel * levelHeight;

  return (
    <div
      className="absolute bottom-0 transform -translate-x-1/2 group transition-opacity duration-200"
      style={{ left: `${left}%`, bottom: `${bottom}px` }}
      onDoubleClick={handleDoubleClick}
    >
        <div className="absolute bottom-full left-1/2 w-0.5 bg-cyan-400/50" style={{ height: `${bottom - 64}px` }}></div>
        <div 
            className={`relative w-48 rounded-lg shadow-lg cursor-pointer transition-all duration-200 group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-cyan-500/30 overflow-hidden backdrop-blur-sm border border-white/10`}
            style={{ backgroundColor: `${event.color}40` }} // 40 for ~25% opacity
        >
            {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover" loading="lazy" />
            )}
            <div className="p-3">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: event.color }}></div>
                <span className="text-xs" style={{ color: textColor, opacity: 0.8 }}>{formatEventDate(event)}</span>
                <h3 className="font-bold text-sm pr-4" style={{ color: textColor }}>{event.title}</h3>
                <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.9 }}>{event.description}</p>
            </div>
        </div>
    </div>
  );
};

export default EventCard;