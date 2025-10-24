
import React from 'react';
import type { TimelineFrame } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';

interface FrameBoxProps {
  frame: TimelineFrame;
  start: number;
  end: number;
}

const colorClasses: Record<string, string> = {
    gray: 'border-gray-500 bg-gray-500/10',
    red: 'border-red-500 bg-red-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10',
  };

const FrameBox: React.FC<FrameBoxProps> = ({ frame, start, end }) => {
  const { openModal } = useTimelineStore();
  const left = yearToPercent(frame.startDate, start, end);
  const right = yearToPercent(frame.endDate, start, end);
  const width = right - left;

  if (right < 0 || left > 100 || width <= 0) return null;
  
  const handleDoubleClick = () => {
    openModal('frame', frame);
  };

  const bottom = 70 + frame.startY * 40;
  const frameColor = colorClasses[frame.color] || 'border-gray-500 bg-gray-500/10';

  return (
    <div
      className={`absolute rounded-lg border-2 border-dashed p-2 cursor-pointer ${frameColor}`}
      style={{ 
        left: `${left}%`, 
        width: `${width}%`, 
        bottom: `${bottom}px`,
        height: `${frame.height * 40}px`
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span className="absolute -top-6 left-2 text-sm font-bold text-gray-400">{frame.title}</span>
    </div>
  );
};

export default FrameBox;
