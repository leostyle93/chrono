import React from 'react';
import { yearToPercent } from '../store/timelineStore';
import { getTicks } from '../utils/time';
import { useThemeStore } from '../store/themeStore';

interface TimelineRulerProps {
  start: number;
  end: number;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ start, end }) => {
  const { major: majorTicks, minor: minorTicks } = getTicks(start, end);
  const { textColor } = useThemeStore();

  return (
    <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 backdrop-blur-sm pointer-events-none z-10 border-t border-white/10">
      {majorTicks.map(({ value, label }) => {
        const left = yearToPercent(value, start, end);
        if (left < 0 || left > 100) return null;
        return (
          <div key={`major-${value}`} className="absolute bottom-0 h-full" style={{ left: `${left}%` }}>
            <div className="w-px h-6 bg-white/40"></div>
            <span 
              className="absolute -translate-x-1/2 mt-1 text-xs whitespace-nowrap transition-colors"
              style={{ color: textColor }}
            >
              {label}
            </span>
          </div>
        );
      })}
      {minorTicks.map(({ value, label }) => {
        const left = yearToPercent(value, start, end);
        if (left < 0 || left > 100) return null;
        return (
          <div key={`minor-${value}`} className="absolute bottom-0 h-full" style={{ left: `${left}%` }}>
            <div className="w-px h-3 bg-white/20"></div>
             {label && (
              <span 
                className="absolute bottom-4 -translate-x-1/2 text-[10px] whitespace-nowrap transition-colors"
                style={{ color: textColor, opacity: 0.7 }}
              >
                {label}
              </span>
             )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(TimelineRuler);