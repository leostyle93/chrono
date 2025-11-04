import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import ColorPicker from './ColorPicker';

const backgroundColors = [
  // Dark tones
  '#111827', // Slate
  '#000000', // Black
  '#1e1b4b', // Indigo
  '#4c1d95', // Purple
  // Light tones
  '#f9fafb', // Off-white
  '#f3f4f6', // Light Gray
  '#fef9c3', // Light Yellow
  '#e0f2fe', // Light Blue
];

const textColors = [
  // Light tones (for dark backgrounds)
  '#e5e7eb', // Light Gray
  '#ffffff', // White
  '#a5f3fc', // Light Cyan
  '#d8b4fe', // Light Purple
  // Dark tones (for light backgrounds)
  '#1f2937', // Dark Gray
  '#374151', // Medium Dark Gray
  '#991b1b', // Dark Red
  '#1e3a8a', // Dark Blue
];

const ThemeToolbar: React.FC = () => {
  const { 
    backgroundColor, setBackgroundColor,
    textColor, setTextColor,
    frameOpacity, setFrameOpacity 
  } = useThemeStore();
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
      >
        Customize Theme
      </button>
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-30"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Background Color</label>
                    <ColorPicker 
                        selectedColor={backgroundColor} 
                        onChange={setBackgroundColor}
                        colors={backgroundColors}
                        size="sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Text &amp; Scale Color</label>
                    <ColorPicker 
                        selectedColor={textColor}
                        onChange={setTextColor}
                        colors={textColors}
                        size="sm"
                    />
                </div>
                
                <div>
                    <label htmlFor="frameOpacity" className="block text-sm text-gray-300 mb-1">Frame Opacity</label>
                    <input
                        type="range"
                        id="frameOpacity"
                        min="0"
                        max="100"
                        value={frameOpacity}
                        onChange={(e) => setFrameOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToolbar;