const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/tools/**/*.tsx');
files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Same regexes as LeftSidebar
  code = code.replace(/bg-slate-50\/80 dark:bg-slate-800\/40 rounded-2xl border border-slate-200\/80 dark:border-slate-800\/80 overflow-hidden( mb-6)?/g, 'border-b border-[#e5e5ea] overflow-hidden');
  
  // The generic card wrapper used in studios
  code = code.replace(/p-3\.5 bg-\[#fafafc\] rounded-2xl border border-\[#e5e5ea\]/g, 'p-3.5 border-b border-[#e5e5ea]');
  code = code.replace(/p-4 bg-\[#fafafc\] rounded-2xl border border-\[#e5e5ea\]/g, 'p-4 border-b border-[#e5e5ea]');
  code = code.replace(/p-3 bg-\[#fafafc\] rounded-2xl border border-\[#e5e5ea\]/g, 'p-3 border-b border-[#e5e5ea]');
  
  // Fix the main aside wrapper
  code = code.replace(/<aside className="w-80 h-full max-h-full shrink-0 border-r border-\[#e5e5ea\] bg-white overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 z-20 custom-scrollbar overscroll-contain">/g, '<aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">');
  
  // Header section inside aside
  // <div className="flex items-center justify-between">
  // Often it's the first child of the aside and needs padding if we removed it from aside
  code = code.replace(/<div className="flex items-center justify-between">\s*<div className="flex items-center gap-2">/g, '<div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">\n          <div className="flex items-center gap-2">');

  code = code.replace(/<div className="flex items-center justify-between">\s*<span className="text-xs font-semibold text-\[#1d1d1f\] uppercase tracking-wider">/g, '<div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">\n          <span className="text-[13px] font-semibold text-[#1d1d1f]">');

  // Canvas preview container (shadows)
  // relative w-[720px] h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea]
  code = code.replace(/rounded-2xl overflow-hidden shadow-2xl border border-\[#e5e5ea\] bg-white/g, 'rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-white');
  code = code.replace(/rounded-2xl overflow-hidden shadow-2xl border border-\[#e5e5ea\] bg-slate-900/g, 'rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-slate-900');
  code = code.replace(/rounded-2xl overflow-hidden shadow-2xl border border-\[#e5e5ea\] bg-slate-950/g, 'rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-slate-950');

  // Fix button wrappers
  code = code.replace(/mt-auto pt-4 flex flex-col gap-2/g, 'mt-auto p-4 flex flex-col gap-2');
  code = code.replace(/mt-auto flex flex-col gap-2 pt-4/g, 'mt-auto p-4 flex flex-col gap-2');

  fs.writeFileSync(file, code);
});
