import React from 'react';
import { useTimelineStore } from '../store/timelineStore';

const Toolbar: React.FC = () => {
  const { openModal } = useTimelineStore();

  const buttonStyle = "px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-md";

  return (
    <div className="flex gap-2">
      <button onClick={() => openModal('event')} className={buttonStyle}>
        Add Event
      </button>
      <button onClick={() => openModal('period')} className={buttonStyle}>
        Add Period
      </button>
      <button onClick={() => openModal('frame')} className={buttonStyle}>
        Add Frame
      </button>
    </div>
  );
};

export default Toolbar;