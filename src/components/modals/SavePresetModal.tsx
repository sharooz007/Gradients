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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f2f2f5]">Save as Preset</h3>
              <p className="text-xs text-[#8f94a8]">Store this gradient in your personal collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8f94a8]">
              Preset Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electric Silk Wave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#2e303b] bg-[#23242c] text-[#f2f2f5] outline-none focus:border-[#6268f8]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8f94a8]">
                Preset JSON
              </label>
              <button
                type="button"
                onClick={handleCopyJson}
                className="text-xs font-medium text-[#818cf8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="h-28 overflow-auto font-mono text-[11px] p-2.5 rounded-xl bg-[#0e0f14] text-[#8f94a8] border border-[#2e303b] custom-scrollbar">
              <code>{presetJson}</code>
            </pre>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#e5e5ea] text-[#0e0f14] text-xs font-semibold shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 transition-all cursor-pointer"
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

