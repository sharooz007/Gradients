import React, { useState } from 'react';
import { Download, Copy, Check, Hexagon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

type ShapeType = 'starburst' | 'polygon' | 'ticket';

export const ShapeGeneratorStudio: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>('starburst');
  const [spikes, setSpikes] = useState<number>(16);
  const [innerRadius, setInnerRadius] = useState<number>(140);
  const [outerRadius, setOuterRadius] = useState<number>(180);
  const [color, setColor] = useState<string>('#F59E0B');
  const [copied, setCopied] = useState(false);

  const size = 400;
  const center = size / 2;

  const generateShapePath = () => {
    if (shape === 'starburst') {
      const step = Math.PI / spikes;
      let path = '';
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const a = i * step - Math.PI / 2;
        const x = center + Math.cos(a) * r;
        const y = center + Math.sin(a) * r;
        path += i === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)} ` : `L ${x.toFixed(1)},${y.toFixed(1)} `;
      }
      path += 'Z';
      return path;
    } else if (shape === 'polygon') {
      const sides = Math.max(3, Math.min(12, Math.floor(spikes / 2)));
      const step = (Math.PI * 2) / sides;
      let path = '';
      for (let i = 0; i < sides; i++) {
        const a = i * step - Math.PI / 2;
        const x = center + Math.cos(a) * outerRadius;
        const y = center + Math.sin(a) * outerRadius;
        path += i === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)} ` : `L ${x.toFixed(1)},${y.toFixed(1)} `;
      }
      path += 'Z';
      return path;
    } else {
      // Coupon Ticket with notched side cutouts
      const w = outerRadius * 1.6;
      const h = outerRadius * 1.1;
      const notch = 25;
      const x1 = center - w / 2;
      const x2 = center + w / 2;
      const y1 = center - h / 2;
      const y2 = center + h / 2;

      return `M ${x1 + 16},${y1} L ${x2 - 16},${y1} Q ${x2},${y1} ${x2},${y1 + 16} L ${x2},${center - notch} A ${notch} ${notch} 0 0 0 ${x2},${center + notch} L ${x2},${y2 - 16} Q ${x2},${y2} ${x2 - 16},${y2} L ${x1 + 16},${y2} Q ${x1},${y2} ${x1},${y2 - 16} L ${x1},${center + notch} A ${notch} ${notch} 0 0 0 ${x1},${center - notch} L ${x1},${y1 + 16} Q ${x1},${y1} ${x1 + 16},${y1} Z`;
    }
  };

  const getSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <path d="${generateShapePath()}" fill="${color}" stroke="#1E293B" stroke-width="4" stroke-linejoin="round" />
</svg>`;
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(getSvgMarkup());
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([getSvgMarkup()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `shape-${shape}-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 gap-4 overflow-y-auto custom-scrollbar pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Hexagon className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Shape & Badge Settings
          </span>
        </div>

        {/* Shape Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Shape Style
          </label>
          <SegmentedPicker<ShapeType>
            value={shape}
            onChange={setShape}
            options={[
              { value: 'starburst', label: 'Starburst' },
              { value: 'polygon', label: 'Polygon' },
              { value: 'ticket', label: 'Ticket' }
            ]}
          />
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Fill Color</span>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
            <span className="text-xs font-mono">{color.toUpperCase()}</span>
          </div>
        </div>

        {shape === 'starburst' && (
          <>
            <SliderControl
              label="Spike / Tooth Count"
              value={spikes}
              min={6}
              max={36}
              step={2}
              onChange={setSpikes}
            />

            <SliderControl
              label="Inner Tooth Depth"
              value={innerRadius}
              min={80}
              max={170}
              step={5}
              unit="px"
              onChange={setInnerRadius}
            />
          </>
        )}

        <SliderControl
          label="Outer Diameter"
          value={outerRadius}
          min={100}
          max={190}
          step={5}
          unit="px"
          onChange={setOuterRadius}
        />

        <div className="flex flex-col gap-2 pt-4 mt-auto">
          <button
            type="button"
            onClick={handleCopySvg}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SVG Code!' : 'Copy SVG Markup'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .SVG File</span>
          </button>
        </div>
      </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-96 h-96 flex items-center justify-center filter drop-shadow-xl"
          dangerouslySetInnerHTML={{ __html: getSvgMarkup() }}
        />
      </main>
    </div>
  );
};
