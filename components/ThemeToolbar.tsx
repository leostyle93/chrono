import React, { useState } from 'react';
import { useThemeStore } from '../store/themeStore';

const ThemeToolbar: React.FC = () => {
  const { 
    backgroundColor, setBackgroundColor,
    textColor, setTextColor,
    frameOpacity, setFrameOpacity 
  } = useThemeStore();
  
  const [isOpen, setIsOpen] = useState(false);

  const CustomColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={`${label}-color`} className="text-sm text-gray-300">{label}</label>
      <div className="relative w-8 h-8 rounded-md overflow-hidden border border-gray-600">
        <input
          type="color"
          id={`${label}-color`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }}></div>
      </div>
    </div>
  );

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
                <CustomColorInput label="Background" value={backgroundColor} onChange={setBackgroundColor} />
                <CustomColorInput label="Text Color" value={textColor} onChange={setTextColor} />
                
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
