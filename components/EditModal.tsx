import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import type { TimelineItem, TimelineEvent, TimelinePeriod, TimelineFrame } from '../types';
import ColorPicker from './ColorPicker';

const EditModal: React.FC = () => {
  const { modalState, closeModal, addItem, updateItem, deleteItem } = useTimelineStore();
  const { item, itemType } = modalState;
  
  const isEditing = !!item;
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Default values for new items
      const defaults = {
        event: { title: '', description: '', mainText: '', date: new Date().getFullYear(), month: undefined, day: undefined, yLevel: 0, color: '#f87171', imageUrl: '', articleUrl: '', youtubeUrl: '', gmapsQuery: '' },
        period: { title: '', startDate: 2000, startMonth: undefined, startDay: undefined, endDate: 2010, endMonth: undefined, endDay: undefined, yLevel: 0, color: '#60a5fa', height: 32, opacity: 80 },
        frame: { title: '', startDate: 1990, endDate: 2020, startY: 0, height: 4, color: '#9ca3af' }
      };
      setFormData(defaults[itemType!] || {});
    }
  }, [item, itemType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'number' || type === 'range') {
      finalValue = value === '' ? undefined : parseFloat(value);
    }
    
    setFormData({ ...formData, [name]: finalValue });
  };
  
  const handleColorChange = (color: string) => {
    setFormData({ ...formData, color });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up empty strings to undefined for optional number fields
    const cleanedData = {
      ...formData,
      month: formData.month || undefined,
      day: formData.day || undefined,
      startMonth: formData.startMonth || undefined,
      startDay: formData.startDay || undefined,
      endMonth: formData.endMonth || undefined,
      endDay: formData.endDay || undefined,
    };

    const dataToSave = { ...cleanedData, type: itemType };

    if (isEditing) {
      updateItem(dataToSave as TimelineItem);
    } else {
      addItem(dataToSave);
    }
    closeModal();
  };
  
  const handleDelete = () => {
    if (item && window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(item.id);
      closeModal();
    }
  };

  const renderFields = () => {
    const commonFields = (
      <>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
          <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className={inputStyle} required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-300">Color</label>
           <ColorPicker selectedColor={formData.color} onChange={handleColorChange} />
        </div>
      </>
    );

    switch (itemType) {
      case 'event':
        return (
          <>
            {commonFields}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">Year (e.g., 1969 or -44 for 44 BCE)</label>
              <input type="number" name="date" id="date" value={formData.date ?? ''} onChange={handleChange} className={inputStyle} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-300">Month (1-12)</label>
                <input type="number" name="month" id="month" value={formData.month ?? ''} onChange={handleChange} className={inputStyle} min="1" max="12" placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-300">Day (1-31)</label>
                <input type="number" name="day" id="day" value={formData.day ?? ''} onChange={handleChange} className={inputStyle} min="1" max="31" placeholder="Optional" />
              </div>
            </div>
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Short Description (for card)</label>
              <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} className={inputStyle} rows={2}></textarea>
            </div>
             <div>
              <label htmlFor="mainText" className="block text-sm font-medium text-gray-300">Main Text (for viewer)</label>
              <textarea name="mainText" id="mainText" value={formData.mainText || ''} onChange={handleChange} className={inputStyle} rows={4}></textarea>
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image URL</label>
              <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className={inputStyle} placeholder="https://example.com/image.png" />
            </div>
            <div>
              <label htmlFor="articleUrl" className="block text-sm font-medium text-gray-300">Article URL (e.g., Wikipedia)</label>
              <input type="text" name="articleUrl" id="articleUrl" value={formData.articleUrl || ''} onChange={handleChange} className={inputStyle} placeholder="https://en.wikipedia.org/..." />
            </div>
            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300">YouTube Video URL</label>
              <input type="text" name="youtubeUrl" id="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleChange} className={inputStyle} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <label htmlFor="gmapsQuery" className="block text-sm font-medium text-gray-300">Google Maps Location</label>
              <input type="text" name="gmapsQuery" id="gmapsQuery" value={formData.gmapsQuery || ''} onChange={handleChange} className={inputStyle} placeholder="Eiffel Tower, Paris, France" />
            </div>
            <div>
              <label htmlFor="yLevel" className="block text-sm font-medium text-gray-300">Vertical Level Offset</label>
              <input type="number" name="yLevel" id="yLevel" value={formData.yLevel ?? 0} onChange={handleChange} className={inputStyle} step="1" />
            </div>
          </>
        );
      case 'period':
        return (
          <>
            {commonFields}
            <div className="border border-gray-700 p-3 rounded-md">
                <h4 className="text-md font-semibold text-gray-300 mb-2">Start Date</h4>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label htmlFor="startDay" className="block text-sm font-medium text-gray-300">Day</label>
                        <input type="number" name="startDay" id="startDay" value={formData.startDay ?? ''} onChange={handleChange} className={inputStyle} min="1" max="31" placeholder="Optional" />
                    </div>
                    <div>
                        <label htmlFor="startMonth" className="block text-sm font-medium text-gray-300">Month</label>
                        <input type="number" name="startMonth" id="startMonth" value={formData.startMonth ?? ''} onChange={handleChange} className={inputStyle} min="1" max="12" placeholder="Optional" />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Year</label>
                        <input type="number" name="startDate" id="startDate" value={formData.startDate ?? ''} onChange={handleChange} className={inputStyle} required />
                    </div>
                </div>
            </div>
            <div className="border border-gray-700 p-3 rounded-md">
                <h4 className="text-md font-semibold text-gray-300 mb-2">End Date</h4>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label htmlFor="endDay" className="block text-sm font-medium text-gray-300">Day</label>
                        <input type="number" name="endDay" id="endDay" value={formData.endDay ?? ''} onChange={handleChange} className={inputStyle} min="1" max="31" placeholder="Optional" />
                    </div>
                    <div>
                        <label htmlFor="endMonth" className="block text-sm font-medium text-gray-300">Month</label>
                        <input type="number" name="endMonth" id="endMonth" value={formData.endMonth ?? ''} onChange={handleChange} className={inputStyle} min="1" max="12" placeholder="Optional" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">Year</label>
                        <input type="number" name="endDate" id="endDate" value={formData.endDate ?? ''} onChange={handleChange} className={inputStyle} required />
                    </div>
                </div>
            </div>
            <div>
              <label htmlFor="yLevel" className="block text-sm font-medium text-gray-300">Vertical Level</label>
              <input type="number" name="yLevel" id="yLevel" value={formData.yLevel ?? 0} onChange={handleChange} className={inputStyle} step="1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-300">Height (px)</label>
                    <input type="number" name="height" id="height" value={formData.height ?? 32} onChange={handleChange} className={inputStyle} min="4" />
                </div>
                <div>
                    <label htmlFor="opacity" className="block text-sm font-medium text-gray-300">Opacity ({formData.opacity ?? 100}%)</label>
                    <input type="range" name="opacity" id="opacity" value={formData.opacity ?? 100} onChange={handleChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2" min="0" max="100" />
                </div>
            </div>
          </>
        );
      case 'frame':
         return (
          <>
            {commonFields}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Year</label>
                <input type="number" name="startDate" id="startDate" value={formData.startDate ?? ''} onChange={handleChange} className={inputStyle} required />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Year</label>
                <input type="number" name="endDate" id="endDate" value={formData.endDate ?? ''} onChange={handleChange} className={inputStyle} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startY" className="block text-sm font-medium text-gray-300">Start Y Level</label>
                <input type="number" name="startY" id="startY" value={formData.startY ?? 0} onChange={handleChange} className={inputStyle} step="0.5" />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300">Height (in levels)</label>
                <input type="number" name="height" id="height" value={formData.height ?? 0} onChange={handleChange} className={inputStyle} step="0.5" />
              </div>
            </div>
          </>
        );
      default: return null;
    }
  };

  const inputStyle = "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2";

  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-700 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-400">{isEditing ? 'Edit' : 'Add'} {itemType}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFields()}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
            <div>
              {isEditing && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors">
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors">
                {isEditing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;