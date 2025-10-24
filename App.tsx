
import React from 'react';
import Timeline from './components/Timeline';
import Toolbar from './components/Toolbar';
import EditModal from './components/EditModal';
import { useTimelineStore } from './store/timelineStore';

const App: React.FC = () => {
  const modalState = useTimelineStore(state => state.modalState);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col overflow-hidden">
      <header className="p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-20">
        <h1 className="text-2xl font-bold text-cyan-400">Interactive Timeline</h1>
      </header>
      <main className="flex-grow relative">
        <Timeline />
      </main>
      <Toolbar />
      {modalState.isOpen && <EditModal />}
    </div>
  );
};

export default App;
