import React, { useRef } from 'react';
import type { TimelineEvent } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { dateToDecimal, formatEventDate } from '../utils/time';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import clsx from 'clsx';

interface EventCardProps {
  event: TimelineEvent;
  start: number;
  end: number;
  parentYLevel?: number;
  isLinking: boolean;
  isLinkStart: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, start, end, parentYLevel, isLinking, isLinkStart }) => {
  const { openModal, openViewerModal, handleItemClickForLinking, updateItem } = useTimelineStore();
  const { textColor } = useThemeStore();
  const { language } = useLanguageStore();
  const position = dateToDecimal(event);
  const left = yearToPercent(position, start, end);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);
  const dragState = useRef({
    isDragging: false,
    dragged: false,
    initialMouseY: 0,
    initialYLevel: 0,
  });

  if (left < 0 || left > 100) return null;
  
  const baseBottom = 70;
  const levelHeight = parentYLevel !== undefined ? 40 : 120; // smaller spacing if attached to period
  const parentOffset = parentYLevel !== undefined ? (parentYLevel * 40) + 40 : 0;
  
  const bottom = baseBottom + parentOffset + event.yLevel * levelHeight;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isLinking) return;

    e.stopPropagation();

    dragState.current = {
      isDragging: true,
      dragged: false,
      initialMouseY: e.clientY,
      initialYLevel: event.yLevel,
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    window.addEventListener('mousemove', handleMouseMoveForDrag);
    window.addEventListener('mouseup', handleMouseUpForDrag);
  };
  
  const handleMouseMoveForDrag = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;
    
    const deltaY = e.clientY - dragState.current.initialMouseY;
    
    if (Math.abs(deltaY) > 5 && !dragState.current.dragged) {
        dragState.current.dragged = true;
    }
    
    if (cardContainerRef.current) {
      cardContainerRef.current.style.transform = `translateX(-50%) translateY(${deltaY}px)`;
      cardContainerRef.current.style.transition = 'none';
      cardContainerRef.current.style.zIndex = '30';
    }
  };
  
  const handleMouseUpForDrag = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    window.removeEventListener('mousemove', handleMouseMoveForDrag);
    window.removeEventListener('mouseup', handleMouseUpForDrag);
    
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    if (cardContainerRef.current) {
      cardContainerRef.current.style.transform = 'translateX(-50%)';
      cardContainerRef.current.style.transition = '';
      cardContainerRef.current.style.zIndex = '';
    }

    if (dragState.current.dragged) {
        const deltaY = e.clientY - dragState.current.initialMouseY;
        const levelChange = Math.round(-deltaY / levelHeight);
        const newYLevel = dragState.current.initialYLevel + levelChange;

        if (newYLevel !== event.yLevel) {
            updateItem({ ...event, yLevel: newYLevel });
        }
    }
    
    dragState.current.isDragging = false;
    setTimeout(() => {
        dragState.current.dragged = false;
    }, 50);
  };
  
  const handleCardClick = () => {
    // If linking, handle that and nothing else.
    if (isLinking) {
      handleItemClickForLinking(event.id);
      return;
    }
    
    // A drag operation prevents clicks.
    if (dragState.current.dragged) {
      return;
    }
    
    clickCount.current += 1;
    
    if (clickCount.current === 1) {
      clickTimer.current = window.setTimeout(() => {
        openViewerModal(event);
        clickCount.current = 0; // Reset after action
      }, 250); // Double-click threshold
    } else if (clickCount.current === 2) {
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
      openModal('event', event);
      clickCount.current = 0; // Reset after action
    }
  };

  return (
    <div
      ref={cardContainerRef}
      className="absolute bottom-0 transform -translate-x-1/2 group z-20"
      style={{ left: `${left}%`, bottom: `${bottom}px` }}
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
    >
        {/* Connector line: Starts from the card's bottom and goes down to the ruler's top */}
        <div 
            className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-cyan-400/50"
            style={{ 
                top: '100%',
                height: `${bottom - 64}px`
            }}
        ></div>
        <div 
            className={clsx(
                `relative w-48 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:z-20`,
                isLinking ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400' : 'cursor-grab',
                isLinkStart && 'ring-2 ring-white scale-105'
            )}
            style={{ backgroundColor: `${event.color}40` }} // 40 for ~25% opacity
        >
            {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover group-hover:h-40 transition-all duration-300" loading="lazy" />
            )}
            <div className="p-3">
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: event.color }}></div>
                <span className="text-xs" style={{ color: textColor, opacity: 0.8 }}>{formatEventDate(event, language)}</span>
                <h3 className="font-bold text-sm pr-4" style={{ color: textColor }}>{event.title}</h3>
                <p className="text-xs mt-1 line-clamp-3 group-hover:line-clamp-none transition-all duration-300" style={{ color: textColor, opacity: 0.9 }}>{event.description}</p>
            </div>
        </div>
    </div>
  );
};

export default EventCard;