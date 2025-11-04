import React, { useRef, useState, useLayoutEffect } from 'react';
import type { TimelinePeriod } from '../types';
import { useTimelineStore, yearToPercent } from '../store/timelineStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import clsx from 'clsx';
import { dateToDecimal, formatPeriodDate } from '../utils/time';

interface PeriodSpanProps {
  period: TimelinePeriod;
  start: number;
  end: number;
  isLinking: boolean;
  isLinkStart: boolean;
}

const PeriodSpan: React.FC<PeriodSpanProps> = ({ period, start, end, isLinking, isLinkStart }) => {
  const { openModal, handleItemClickForLinking, updateItem } = useTimelineStore();
  const { textColor } = useThemeStore();
  const { language } = useLanguageStore();
  
  const spanContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const dragState = useRef({
    isDragging: false,
    dragged: false,
    initialMouseY: 0,
    initialYLevel: 0,
  });

  const left = yearToPercent(dateToDecimal({ date: period.startDate, month: period.startMonth, day: period.startDay }), start, end);
  const right = yearToPercent(dateToDecimal({ date: period.endDate, month: period.endMonth, day: period.endDay }), start, end);
  const width = right - left;

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const isTruncated = titleRef.current.scrollWidth > titleRef.current.clientWidth;
        setIsOverflowing(isTruncated);
      }
    };

    const container = spanContainerRef.current;
    if (!container) return;

    // ResizeObserver is the best tool, reacting to element size changes from zoom/pan.
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);

    checkOverflow(); // Initial check

    return () => observer.disconnect();
  }, [period.title, width]); // Re-run effect if the title text or width changes.

  if (right < 0 || left > 100 || width <= 0) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (isLinking) {
      handleItemClickForLinking(period.id);
      return;
    }

    dragState.current = {
      isDragging: true,
      dragged: false,
      initialMouseY: e.clientY,
      initialYLevel: period.yLevel,
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
    
    if (spanContainerRef.current) {
      spanContainerRef.current.style.transform = `translateY(${deltaY}px)`;
      spanContainerRef.current.style.transition = 'none';
      spanContainerRef.current.style.zIndex = '30';
    }
  };
  
  const handleMouseUpForDrag = (e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    window.removeEventListener('mousemove', handleMouseMoveForDrag);
    window.removeEventListener('mouseup', handleMouseUpForDrag);
    
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    if (spanContainerRef.current) {
      spanContainerRef.current.style.transform = '';
      spanContainerRef.current.style.transition = '';
      spanContainerRef.current.style.zIndex = '';
    }

    if (dragState.current.dragged) {
        const deltaY = e.clientY - dragState.current.initialMouseY;
        const levelHeight = 40; // Spacing between period levels
        const levelChange = Math.round(-deltaY / levelHeight);
        const newYLevel = dragState.current.initialYLevel + levelChange;

        if (newYLevel !== period.yLevel) {
            updateItem({ ...period, yLevel: newYLevel });
        }
    }
    
    dragState.current.isDragging = false;
    setTimeout(() => {
        if (!dragState.current.isDragging) {
            dragState.current.dragged = false;
        }
    }, 0);
  };

  const handleDoubleClick = () => {
    if (!isLinking && !dragState.current.dragged) {
      openModal('period', period);
    }
  };
  
  const bottom = 70 + period.yLevel * 40;
  
  const startLabel = formatPeriodDate({ date: period.startDate, month: period.startMonth, day: period.startDay }, language);
  const endLabel = formatPeriodDate({ date: period.endDate, month: period.endMonth, day: period.endDay }, language);

  const height = period.height ?? 32;
  const opacity = period.opacity ?? 80;
  
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(1, 5).slice(2, 4), 16);
    const b = parseInt(hex.slice(1, 7).slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const baseOpacity = (opacity / 100) * 0.4;
  const background = `linear-gradient(to right, ${hexToRgba(period.color, baseOpacity)}, ${hexToRgba(period.color, baseOpacity * 0.5)})`;

  return (
    <div
      ref={spanContainerRef}
      className={clsx(
        `absolute rounded flex items-center justify-between px-2 transition-all duration-200 group z-10`,
        isLinking ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400' : 'cursor-grab',
        isLinkStart && 'ring-2 ring-white'
      )}
      style={{ 
        left: `${left}%`, 
        width: `${width}%`, 
        bottom: `${bottom}px`,
        height: `${height}px`,
        background: background,
        borderLeft: `4px solid ${period.color}`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isOverflowing && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-sm font-semibold whitespace-nowrap z-30 pointer-events-none"
          style={{
            color: period.color,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
          }}
        >
          {period.title}
        </div>
      )}

      <span className="relative text-[10px] font-medium opacity-70 z-10 whitespace-nowrap" style={{ color: textColor }}>{startLabel}</span>
      <span ref={titleRef} className="relative text-xs font-semibold truncate z-10 px-2 text-center" style={{ color: textColor }}>{period.title}</span>
      <span className="relative text-[10px] font-medium opacity-70 z-10 whitespace-nowrap" style={{ color: textColor }}>{endLabel}</span>
    </div>
  );
};

export default PeriodSpan;