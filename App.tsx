import React from 'react';
import Timeline from './components/Timeline';
import Toolbar from './components/Toolbar';
import EditModal from './components/EditModal';
import ThemeToolbar from './components/ThemeToolbar';
import { useTimelineStore } from './store/timelineStore';
import { useThemeStore } from './store/themeStore';

const App: React.FC = () => {
  const modalState = useTimelineStore(state => state.modalState);
  const { backgroundColor, textColor } = useThemeStore();

  return (
    <div 
      className="w-screen h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{ backgroundColor, color: textColor }}
    >
      <header className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10 z-20 flex justify-between items-center">
        <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-cyan-400">ChronoCraft</h1>
            <Toolbar />
        </div>
        <ThemeToolbar />
      </header>
      <main className="flex-grow relative">
        <Timeline />
      </main>
      {modalState.isOpen && <EditModal />}
    </div>
  );
};

export default App;