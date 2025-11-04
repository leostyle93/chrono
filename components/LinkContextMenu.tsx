import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import ColorPicker from './ColorPicker';

const LinkContextMenu: React.FC = () => {
  const { linkMenuState, closeLinkMenu, updateLink, deleteLink } = useTimelineStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const { isOpen, link, x, y } = linkMenuState;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeLinkMenu();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeLinkMenu]);
  
  if (!isOpen || !link) return null;
  
  const handleColorChange = (color: string) => {
    updateLink(link.id, { color });
  };
  
  const handleDelete = () => {
    if(window.confirm('Are you sure you want to delete this link?')) {
        deleteLink(link.id);
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-700 z-50 animate-fade-in"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, 10px)', // Position below and centered on cursor
      }}
    >
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-cyan-400 border-b border-gray-700 pb-2">Edit Link</h3>
            <ColorPicker selectedColor={link.color} onChange={handleColorChange} />
             <button 
                onClick={handleDelete}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
            >
                Delete Link
            </button>
        </div>
    </div>
  );
};

export default LinkContextMenu;
