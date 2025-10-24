import React from 'react';
import type { TimelineFrame } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { useThemeStore } from '../store/themeStore';

interface FrameBoxProps {
  frame: TimelineFrame;
  start: number;
  end: number;
}

const FrameBox: React.FC<FrameBoxProps> = ({ frame, start, end }) => {
  const { openModal } = useTimelineStore();
  const { frameOpacity, textColor } = useThemeStore();

  const left = yearToPercent(frame.startDate, start, end);
  const right = yearToPercent(frame.endDate, start, end);
  const width = right - left;

  if (right < 0 || left > 100 || width <= 0) return null;
  
  const handleDoubleClick = () => {
    openModal('frame', frame);
  };

  const bottom = 70 + frame.startY * 40;

  // Convert hex color to rgba for opacity control
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(1, 5).slice(2, 4), 16);
    const b = parseInt(hex.slice(1, 7).slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  const frameColor = frame.color || '#9ca3af'; // Default to gray

  return (
    <div
      className={`absolute rounded-lg border-2 border-dashed p-2 cursor-pointer transition-colors duration-300`}
      style={{ 
        left: `${left}%`, 
        width: `${width}%`, 
        bottom: `${bottom}px`,
        height: `${frame.height * 40}px`,
        borderColor: hexToRgba(frameColor, 0.5 * (frameOpacity / 100)),
        backgroundColor: hexToRgba(frameColor, 0.1 * (frameOpacity / 100)),
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span 
        className="absolute -top-6 left-2 text-sm font-bold"
        style={{ color: textColor, opacity: 0.7 }}
      >
        {frame.title}
      </span>
    </div>
  );
};

export default FrameBox;