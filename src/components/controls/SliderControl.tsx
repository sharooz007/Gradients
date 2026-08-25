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
    setLocalVal(Number(value.toFixed(2)).toString());
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
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const angleSnaps = [0, 15, 30, 45, 60, 90];

  return (
    <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#8f94a8] tracking-wider uppercase text-[10px]">{label}</span>
        <div className="flex items-center gap-0.5 font-mono text-[11px] text-[#8f94a8]">
          <input
            type="number"
            value={localVal}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-12 bg-transparent text-right outline-none text-[#f2f2f5] font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="select-none text-[#686c82]">{isAngle ? '°' : unit}</span>
        </div>
      </div>

      <div className="relative flex items-center h-5 group">
        {/* Background Track */}
        <div className="absolute w-full h-2.5 bg-[#23242c] rounded-full pointer-events-none border border-[#2e303b]" />
        
        {/* Filled Gradient Track */}
        <div 
          className="absolute h-2.5 bg-gradient-to-r from-[#6268f8] to-[#818cf8] rounded-full pointer-events-none shadow-[0_0_8px_rgba(98,104,248,0.3)]" 
          style={{ width: `${percent}%` }}
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
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb with grip lines */}
        <div 
          className="absolute w-4 h-4 bg-[#818cf8] rounded-full shadow-[0_0_10px_rgba(129,140,248,0.6)] pointer-events-none border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ left: `calc(${percent}% - 8px)` }}
        >
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>

      {/* Angle snap labels for rotation */}
      {isAngle && (
        <div className="flex items-center justify-between px-0.5 pt-0.5 text-[9px] font-mono text-[#585c72]">
          {angleSnaps.map((snap) => (
            <button
              key={snap}
              type="button"
              onClick={() => {
                onChange(snap);
                if (onChangeEnd) onChangeEnd(snap);
              }}
              className={`hover:text-[#f2f2f5] transition-colors cursor-pointer ${
                Math.round(value) === snap ? 'text-[#818cf8] font-bold' : ''
              }`}
            >
              {snap}°
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

