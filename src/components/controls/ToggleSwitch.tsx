import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  size = 'md'
}) => {
  const isSm = size === 'sm';

  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative rounded-full transition-colors duration-200 ease-in-out ${
          isSm ? 'w-8 h-4.5 p-0.5' : 'w-10 h-5.5 p-0.5'
        } ${
          checked
            ? 'bg-indigo-600 dark:bg-indigo-500'
            : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <div
          className={`bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
            isSm ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
          } ${
            checked
              ? isSm
                ? 'translate-x-3.5'
                : 'translate-x-4.5'
              : 'translate-x-0'
          }`}
        />
      </div>
      {label && (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {label}
        </span>
      )}
    </label>
  );
};
