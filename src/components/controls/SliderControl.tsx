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

  return (
    <div className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-mono text-[11px]">
          <input
            type="number"
            value={localVal}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-10 bg-transparent text-right outline-none text-slate-800 dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-400 select-none">{isAngle ? '°' : unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseUp={() => onChangeEnd && onChangeEnd(value)}
          onTouchEnd={() => onChangeEnd && onChangeEnd(value)}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
