import React from 'react';
import clsx from 'clsx';

const pastelColors = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#34d399', // emerald
  '#2dd4bf', // teal
  '#60a5fa', // sky
  '#a78bfa', // violet
  '#c084fc', // purple
  '#f472b6', // pink
  '#9ca3af', // gray
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {pastelColors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={clsx(
            'w-8 h-8 rounded-full cursor-pointer transition-transform transform hover:scale-110 focus:outline-none ring-offset-2 ring-offset-gray-700',
            { 'ring-2 ring-cyan-400': selectedColor === color }
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
