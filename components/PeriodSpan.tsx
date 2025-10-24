
import React from 'react';
import type { TimelinePeriod } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';

interface PeriodSpanProps {
  period: TimelinePeriod;
  start: number;
  end: number;
}

const colorClasses: Record<string, string> = {
    red: 'bg-red-500/30 border-red-500 hover:bg-red-500/50',
    blue: 'bg-blue-500/30 border-blue-500 hover:bg-blue-500/50',
    green: 'bg-green-500/30 border-green-500 hover:bg-green-500/50',
    yellow: 'bg-yellow-500/30 border-yellow-500 hover:bg-yellow-500/50',
    purple: 'bg-purple-500/30 border-purple-500 hover:bg-purple-500/50',
    orange: 'bg-orange-500/30 border-orange-500 hover:bg-orange-500/50',
    sky: 'bg-sky-500/30 border-sky-500 hover:bg-sky-500/50',
  };

const PeriodSpan: React.FC<PeriodSpanProps> = ({ period, start, end }) => {
  const { openModal } = useTimelineStore();
  const left = yearToPercent(period.startDate, start, end);
  const right = yearToPercent(period.endDate, start, end);
  const width = right - left;

  if (right < 0 || left > 100 || width <= 0) return null;

  const handleDoubleClick = () => {
    openModal('period', period);
  };
  
  const bottom = 70 + period.yLevel * 40;
  const spanColor = colorClasses[period.color] || 'bg-gray-500/30 border-gray-500';

  return (
    <div
      className={`absolute h-8 rounded flex items-center px-2 cursor-pointer border-l-4 transition-all duration-200`}
      style={{ left: `${left}%`, width: `${width}%`, bottom: `${bottom}px` }}
      onDoubleClick={handleDoubleClick}
      title={period.title}
    >
      <div className={`w-full h-full absolute top-0 left-0 ${spanColor} rounded`}></div>
      <span className="relative text-xs font-semibold truncate text-white z-10">{period.title}</span>
    </div>
  );
};

export default PeriodSpan;
