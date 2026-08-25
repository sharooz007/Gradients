import React, { useState } from 'react';
import { Copy, Check, FileCode, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ImageBase64Studio: React.FC = () => {
  const [base64, setBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!base64) return;
    navigator.clipboard.writeText(base64);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-96 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <FileCode className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Image ↔ Base64 Converter
          </span>
        </div>

        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50">
          <Upload className="w-6 h-6 text-indigo-500" />
          <span className="font-semibold">Drop image file here</span>
          <span className="text-[10px] text-slate-400">PNG, JPG, SVG, WebP</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {base64 && (
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Base64 String Output
            </label>
            <textarea
              readOnly
              value={base64}
              className="w-full flex-1 p-3 text-[10px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 outline-none resize-none break-all"
            />
          </div>
        )}

        <button
          type="button"
          disabled={!base64}
          onClick={handleCopy}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Base64!' : 'Copy Base64 Data URI'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        {base64 ? (
          <div className="max-w-xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <img src={base64} alt="Decoded preview" className="w-full h-full object-contain rounded-xl" />
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            Upload an image to preview and generate Base64 data URI
          </div>
        )}
      </main>
    </div>
  );
};
