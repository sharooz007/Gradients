
import React, { useState, useEffect } from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  isAngle?: boolean;
  unit?: string;
  onChange: (val: number) => void;
  onChangeEnd?: (val: number) => void;
  disabled?: boolean;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  isAngle = false,
  unit = '',
  onChange,
  onChangeEnd,
  disabled = false
}) => {
  const [localVal, setLocalVal] = useState<string>(value.toString());

  useEffect(() => {
    setLocalVal(Number(value.toFixed(3)).toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    onChange(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalVal(e.target.value);
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  const handleBlur = () => {
    const num = parseFloat(localVal);
    if (isNaN(num)) {
      setLocalVal(value.toString());
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setLocalVal(clamped.toString());
      onChange(clamped);
      if (onChangeEnd) onChangeEnd(clamped);
    }
  };

  // Calculate percentage for filled track
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 w-full ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#1d1d1f] tracking-wide uppercase text-[10px]">{label}</span>
        <div className="flex items-center gap-0.5 font-mono text-[11px] text-[#86868b]">
          <input
            type="number"
            value={localVal}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-12 bg-transparent text-right outline-none text-[#1d1d1f] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="select-none">{isAngle ? '°' : unit}</span>
        </div>
      </div>
      <div className="relative flex items-center h-4 group">
        {/* Thick Track */}
        <div className="absolute w-full h-2 bg-[#e5e5ea] rounded-full pointer-events-none" />
        {/* Filled Track */}
        <div 
          className="absolute h-2 bg-[#0071e3] rounded-full pointer-events-none" 
          style={{ width: `${Math.max(4, percent)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseUp={() => onChangeEnd && onChangeEnd(value)}
          onTouchEnd={() => onChangeEnd && onChangeEnd(value)}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb */}
        <div 
          className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_2px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)] pointer-events-none border border-[#0071e3]/20"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>
    </div>
  );
};
