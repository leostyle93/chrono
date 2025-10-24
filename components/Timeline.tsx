
import React, { useRef, useCallback } from 'react';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import type { TimelineItem, TimelineEvent, TimelinePeriod, TimelineFrame } from '../types';
import EventCard from './EventCard';
import PeriodSpan from './PeriodSpan';
import FrameBox from './FrameBox';
import TimelineRuler from './TimelineRuler';

const Timeline: React.FC = () => {
  const { viewStartDate, viewEndDate, items, pan, zoom } = useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouseX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    lastMouseX.current = e.clientX;
    timelineRef.current!.style.cursor = 'grabbing';
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    pan(-deltaX);
  }, [pan]);

  const handleMouseUp = () => {
    isPanning.current = false;
    timelineRef.current!.style.cursor = 'grab';
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
    };
    switch (item.type) {
      case 'event':
        return <EventCard {...props} event={item as TimelineEvent} />;
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
      className="w-full h-full overflow-hidden relative select-none cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        {items.map(mapItemToComponent)}
      </div>
      <TimelineRuler start={viewStartDate} end={viewEndDate} />
    </div>
  );
};

export default Timeline;
