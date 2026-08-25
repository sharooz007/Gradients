import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="12" fill="#4F46E5" />
</svg>`;

export const SvgToCssStudio: React.FC = () => {
  const [svgInput, setSvgInput] = useState<string>(SAMPLE_SVG);
  const [copied, setCopied] = useState(false);

  // Encode SVG for CSS background
  const encodeSvgToCss = (svg: string) => {
    const cleaned = svg
      .trim()
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/"/g, "'")
      .replace(/#/g, '%23')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E');

    return `background-image: url("data:image/svg+xml,${cleaned}");`;
  };

  const cssOutput = encodeSvgToCss(svgInput);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Inputs */}
      <aside className="w-96 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Code className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            SVG to CSS Data-URI
          </span>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Raw SVG Markup
          </label>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            placeholder="Paste your <svg>...</svg> code here"
            className="w-full flex-1 min-h-[160px] p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 outline-none resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Generated CSS Output
          </label>
          <textarea
            readOnly
            value={cssOutput}
            className="w-full h-24 p-3 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 outline-none resize-none text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied CSS URI!' : 'Copy CSS Background'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-repeat"
          style={{ cssText: cssOutput } as any}
        />
      </main>
    </div>
  );
};
