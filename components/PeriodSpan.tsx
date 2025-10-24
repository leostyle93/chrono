import React from 'react';
import type { TimelinePeriod } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { useThemeStore } from '../store/themeStore';

interface PeriodSpanProps {
  period: TimelinePeriod;
  start: number;
  end: number;
}


const PeriodSpan: React.FC<PeriodSpanProps> = ({ period, start, end }) => {
  const { openModal } = useTimelineStore();
  const { textColor } = useThemeStore();
  const left = yearToPercent(period.startDate, start, end);
  const right = yearToPercent(period.endDate, start, end);
  const width = right - left;

  if (right < 0 || left > 100 || width <= 0) return null;

  const handleDoubleClick = () => {
    openModal('period', period);
  };
  
  const bottom = 70 + period.yLevel * 40;

  return (
    <div
      className={`absolute h-8 rounded flex items-center px-2 cursor-pointer transition-all duration-200`}
      style={{ 
        left: `${left}%`, 
        width: `${width}%`, 
        bottom: `${bottom}px`,
        borderLeft: `4px solid ${period.color}`,
      }}
      onDoubleClick={handleDoubleClick}
      title={period.title}
    >
      <div 
        className={`w-full h-full absolute top-0 left-0 rounded opacity-30 group-hover:opacity-50 transition-opacity`}
        style={{ backgroundColor: period.color }}
      ></div>
      <span className="relative text-xs font-semibold truncate z-10" style={{ color: textColor }}>{period.title}</span>
    </div>
  );
};

export default PeriodSpan;