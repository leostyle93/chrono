import React, { useState } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import ColorPicker, { pastelColors } from './ColorPicker';
import type { TimelineEvent } from '../types';

const ImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, addItems } = useTimelineStore();
  const [text, setText] = useState('');
  const [defaultColor, setDefaultColor] = useState('#f87171');
  const [randomizeColor, setRandomizeColor] = useState(true);

  if (!isImportModalOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    const newEvents: Omit<TimelineEvent, 'id' | 'frameId' | 'periodId'>[] = [];

    lines.forEach(line => {
      const separatorIndex = line.indexOf(' - ');
      if (separatorIndex === -1) return; // Skip invalid lines

      const dateStr = line.substring(0, separatorIndex).trim();
      const contentStr = line.substring(separatorIndex + 3).trim();

      let title = contentStr;
      let description = '';

      // Check for optional description using ' * ' separator
      const descriptionSeparatorIndex = contentStr.indexOf(' * ');
      if (descriptionSeparatorIndex !== -1) {
          title = contentStr.substring(0, descriptionSeparatorIndex).trim();
          description = contentStr.substring(descriptionSeparatorIndex + 3).trim();
      }

      const dateParts = dateStr.split('.').map(p => parseInt(p, 10)).filter(p => !isNaN(p));
      if (dateParts.length === 0) return; // Skip if no valid date part found

      let day: number | undefined, month: number | undefined, year: number;

      // Parsing logic: DD.MM.YYYY or MM.YYYY or YYYY
      if (dateParts.length === 3) { // DD.MM.YYYY
        day = dateParts[0];
        month = dateParts[1];
        year = dateParts[2];
      } else if (dateParts.length === 2) { // MM.YYYY
        day = undefined;
        month = dateParts[0];
        year = dateParts[1];
      } else { // YYYY
        day = undefined;
        month = undefined;
        year = dateParts[0];
      }

      // Basic validation
      if (month && (month < 1 || month > 12)) month = undefined;
      if (day && (day < 1 || day > 31)) day = undefined;
      
      const color = randomizeColor
        ? pastelColors[Math.floor(Math.random() * pastelColors.length)]
        : defaultColor;

      const newEvent: Omit<TimelineEvent, 'id' | 'frameId' | 'periodId'> = {
        type: 'event',
        title,
        description,
        date: year,
        month,
        day,
        yLevel: 0, // All at level 0 initially
        color: color,
      };
      newEvents.push(newEvent);
    });
    
    if (newEvents.length > 0) {
      addItems(newEvents);
    }
    
    setText('');
    closeImportModal();
  };

  const inputStyle = "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeImportModal}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Import Events from Text</h2>
          <button onClick={closeImportModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="import-text" className="block text-sm font-medium text-gray-300">
              Events
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Enter each event on a new line. Use format: <code>DD.MM.YYYY - Title * Optional description</code>.
              Day and month are optional. For BC dates, use a negative year (e.g., <code>15.03.-44 - Event</code>).
            </p>
            <textarea
              id="import-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${inputStyle} h-48 font-mono`}
              placeholder={"04.07.1776 - Declaration of Independence * The thirteen colonies declared independence.\n1969 - Moon Landing\n15.03.-44 - Julius Caesar assassinated"}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="randomize-color"
              checked={randomizeColor}
              onChange={(e) => setRandomizeColor(e.target.checked)}
              className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
            />
            <label htmlFor="randomize-color" className="text-sm font-medium text-gray-300">
              Randomize card colors
            </label>
          </div>
          {!randomizeColor && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Default Color for Imported Events</label>
              <ColorPicker selectedColor={defaultColor} onChange={setDefaultColor} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-700">
            <button type="button" onClick={closeImportModal} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors">
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;