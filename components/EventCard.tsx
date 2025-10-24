
import React from 'react';
import type { TimelineEvent } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { dateToDecimal, formatEventDate } from '../utils/time';

interface EventCardProps {
  event: TimelineEvent;
  start: number;
  end: number;
}

const colorClasses: Record<string, string> = {
  red: 'bg-red-500 border-red-400',
  blue: 'bg-blue-500 border-blue-400',
  green: 'bg-green-500 border-green-400',
  yellow: 'bg-yellow-500 border-yellow-400',
  purple: 'bg-purple-500 border-purple-400',
  orange: 'bg-orange-500 border-orange-400',
  sky: 'bg-sky-500 border-sky-400',
  gray: 'bg-gray-500 border-gray-400',
};

const EventCard: React.FC<EventCardProps> = ({ event, start, end }) => {
  const { openModal } = useTimelineStore();
  const position = dateToDecimal(event);
  const left = yearToPercent(position, start, end);

  if (left < 0 || left > 100) return null;

  const handleDoubleClick = () => {
    openModal('event', event);
  };
  
  const bottom = 70 + event.yLevel * 120; // Increased spacing for images
  const cardColor = colorClasses[event.color] || 'bg-gray-500 border-gray-400';

  return (
    <div
      className="absolute bottom-0 transform -translate-x-1/2 group transition-opacity duration-200"
      style={{ left: `${left}%`, bottom: `${bottom}px` }}
      onDoubleClick={handleDoubleClick}
    >
        <div className="absolute bottom-full left-1/2 w-0.5 bg-cyan-400/50" style={{ height: `${bottom - 64}px` }}></div>
        <div className={`relative w-48 rounded-lg shadow-lg border cursor-pointer hover:scale-105 transition-transform duration-200 ${cardColor} bg-opacity-30 backdrop-blur-sm overflow-hidden`}>
            {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover" loading="lazy" />
            )}
            <div className="p-3">
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${colorClasses[event.color]}`}></div>
                <span className="text-xs text-gray-400">{formatEventDate(event)}</span>
                <h3 className="font-bold text-sm text-white pr-4">{event.title}</h3>
                <p className="text-xs text-gray-300 mt-1">{event.description}</p>
            </div>
        </div>
    </div>
  );
};

export default EventCard;
