import React, { useState } from 'react';
import { Copy, Check, Binary } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#EC4899" />
</svg>`;

export const SvgBase64Studio: React.FC = () => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [svgInput, setSvgInput] = useState<string>(SAMPLE_SVG);
  const [base64Input, setBase64Input] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const getBase64FromSvg = (svg: string) => {
    try {
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch {
      return '';
    }
  };

  const getSvgFromBase64 = (b64: string) => {
    try {
      const clean = b64.replace(/^data:image\/svg\+xml;base64,/, '');
      return decodeURIComponent(escape(atob(clean)));
    } catch {
      return '<!-- Invalid Base64 SVG -->';
    }
  };

  const encoded = getBase64FromSvg(svgInput);
  const decoded = getSvgFromBase64(base64Input || encoded);

  const handleCopy = () => {
    navigator.clipboard.writeText(mode === 'encode' ? encoded : decoded);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-96 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Binary className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            SVG ↔ Base64 Converter
          </span>
        </div>

        <SegmentedPicker<'encode' | 'decode'>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: 'SVG → Base64' },
            { value: 'decode', label: 'Base64 → SVG' }
          ]}
        />

        {mode === 'encode' ? (
          <>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SVG Code
              </label>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                className="w-full flex-1 min-h-[140px] p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Base64 Data URI
              </label>
              <textarea
                readOnly
                value={encoded}
                className="w-full h-24 p-3 text-[10px] font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 outline-none resize-none break-all"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Base64 String
            </label>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="data:image/svg+xml;base64,..."
              className="w-full flex-1 min-h-[140px] p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 outline-none resize-none"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Output!' : 'Copy Result'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-80 h-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-6"
          dangerouslySetInnerHTML={{ __html: mode === 'encode' ? svgInput : decoded }}
        />
      </main>
    </div>
  );
};
