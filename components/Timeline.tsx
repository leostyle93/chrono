import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import type { TimelineItem, TimelineEvent, TimelinePeriod, TimelineFrame } from '../types';
import EventCard from './EventCard';
import PeriodSpan from './PeriodSpan';
import FrameBox from './FrameBox';
import TimelineRuler from './TimelineRuler';
import { dateToDecimal } from '../utils/time';
import clsx from 'clsx';

const Timeline: React.FC = () => {
  const { 
    viewStartDate, viewEndDate, items, links, pan, zoom, 
    isLinking, cancelLinking, openLinkMenu, linkStartItemId
  } = useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouseX = useRef(0);
  const [itemAnchors, setItemAnchors] = useState(new Map());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelLinking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelLinking]);

  useEffect(() => {
    const calculateAnchors = () => {
      if (!timelineRef.current) return;
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const newAnchors = new Map<string, { x: number; y: number }>();
      
      items.forEach(item => {
        let xPercent: number, yPxFromBottom: number;
        
        switch (item.type) {
          case 'event': {
            const parentPeriod = items.find(p => p.id === item.periodId && p.type === 'period') as TimelinePeriod | undefined;
            const baseBottom = 70;
            const levelHeight = parentPeriod ? 40 : 120;
            const parentOffset = parentPeriod ? (parentPeriod.yLevel * 40) + 40 : 0;
            yPxFromBottom = baseBottom + parentOffset + item.yLevel * levelHeight;
            xPercent = yearToPercent(dateToDecimal(item), viewStartDate, viewEndDate);
            break;
          }
          case 'period': {
            const bottom = 70 + item.yLevel * 40;
            const height = 32; // h-8
            yPxFromBottom = bottom + height / 2;
            const startPercent = yearToPercent(item.startDate, viewStartDate, viewEndDate);
            const endPercent = yearToPercent(item.endDate, viewStartDate, viewEndDate);
            xPercent = (startPercent + endPercent) / 2;
            break;
          }
          case 'frame': {
            const bottom = 70 + item.startY * 40;
            const height = item.height * 40;
            yPxFromBottom = bottom + height / 2;
            const startPercent = yearToPercent(item.startDate, viewStartDate, viewEndDate);
            const endPercent = yearToPercent(item.endDate, viewStartDate, viewEndDate);
            xPercent = (startPercent + endPercent) / 2;
            break;
          }
        }

        const xPx = (xPercent / 100) * timelineRect.width;
        const yPxFromTop = timelineRect.height - yPxFromBottom;
        newAnchors.set(item.id, { x: xPx, y: yPxFromTop });
      });
      setItemAnchors(newAnchors);
    };
    
    calculateAnchors();
    const resizeObserver = new ResizeObserver(calculateAnchors);
    if (timelineRef.current) {
      resizeObserver.observe(timelineRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [items, viewStartDate, viewEndDate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLinking) return;
    isPanning.current = true;
    lastMouseX.current = e.clientX;
    timelineRef.current!.style.cursor = 'grabbing';
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current || isLinking) return;
    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    pan(-deltaX);
  }, [pan, isLinking]);

  const handleMouseUp = () => {
    isPanning.current = false;
    if (!isLinking) {
      timelineRef.current!.style.cursor = 'grab';
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const rect = timelineRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const anchorPercent = mouseX / rect.width;
    const span = viewEndDate - viewStartDate;
    const anchorYear = viewStartDate + (span * anchorPercent);
    zoom(factor, anchorYear);
  }, [viewStartDate, viewEndDate, zoom]);
  
  const mapItemToComponent = (item: TimelineItem) => {
    const props = {
      key: item.id,
      start: viewStartDate,
      end: viewEndDate,
      isLinking,
      isLinkStart: linkStartItemId === item.id,
    };
    switch (item.type) {
      case 'event':
        const event = item as TimelineEvent;
        const parentPeriod = items.find(p => p.id === event.periodId && p.type === 'period') as TimelinePeriod | undefined;
        return <EventCard {...props} event={event} parentYLevel={parentPeriod?.yLevel} />;
      case 'period':
        return <PeriodSpan {...props} period={item as TimelinePeriod} />;
      case 'frame':
        return <FrameBox {...props} frame={item as TimelineFrame} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={timelineRef}
      className={clsx("w-full h-full overflow-hidden relative select-none", isLinking ? 'cursor-crosshair' : 'cursor-grab')}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        {items.map(mapItemToComponent)}
      </div>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {links.map(link => {
            const startPos = itemAnchors.get(link.startItemId);
            const endPos = itemAnchors.get(link.endItemId);
            if (!startPos || !endPos) return null;
            return (
              <g 
                key={link.id} 
                className="pointer-events-auto cursor-pointer group" 
                onClick={(e) => {
                  e.stopPropagation();
                  openLinkMenu(link, e.clientX, e.clientY);
                }}
              >
                <line x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke="transparent" strokeWidth="10" />
                <line x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke={link.color} strokeWidth="2" strokeDasharray="4" className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </g>
            )
        })}
      </svg>
      <TimelineRuler start={viewStartDate} end={viewEndDate} />
    </div>
  );
};

export default Timeline;
