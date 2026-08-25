import React from 'react';

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedPickerProps<T extends string | number> {
  options: Option<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function SegmentedPicker<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true
}: SegmentedPickerProps<T>) {
  return (
    <div
      className={`inline-flex bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 font-medium transition-all duration-150 rounded-md ${
              size === 'sm' ? 'py-1 px-2 text-xs' : 'py-1.5 px-3 text-xs'
            } ${
              isSelected
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {opt.icon && <span className="opacity-80">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
