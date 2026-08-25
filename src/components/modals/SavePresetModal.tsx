import React, { useState } from 'react';
import { X, BookmarkPlus, Copy, Check, Save } from 'lucide-react';
import type { ShaderState, CanvasDimensions, Preset } from '../../types/shader';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShaderState;
  dimensions: CanvasDimensions;
  onSavePreset: (preset: Preset) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  state,
  dimensions,
  onSavePreset
}) => {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presetJson = JSON.stringify(
    {
      id: `custom-${Date.now()}`,
      name: name || 'Custom Gradient',
      dimensions,
      state
    },
    null,
    2
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      dimensions,
      state: { ...state },
      isCustom: true
    };

    onSavePreset(newPreset);
    onClose();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(presetJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Save as Preset</h3>
              <p className="text-xs text-slate-500">Store this gradient in your personal collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Preset Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electric Silk Wave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Preset JSON
              </label>
              <button
                type="button"
                onClick={handleCopyJson}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="h-28 overflow-auto font-mono text-[11px] p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">
              <code>{presetJson}</code>
            </pre>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Preset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
