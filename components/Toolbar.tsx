
import React from 'react';
import { useTimelineStore } from '../store/timelineStore';

const Toolbar: React.FC = () => {
  const { openModal } = useTimelineStore();

  const buttonStyle = "px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400";

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg shadow-lg flex gap-2">
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
