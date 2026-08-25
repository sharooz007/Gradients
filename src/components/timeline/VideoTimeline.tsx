import React, { useRef } from 'react';
import {
  Play,
  Pause,
  Repeat,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import type { EasingType, VideoProject } from '../../types/shader';

interface VideoTimelineProps {
  project: VideoProject;
  playhead: number;
  isPlaying: boolean;
  isLooping: boolean;
  selectedKeyframeId: string | null;
  onTogglePlay: () => void;
  onToggleLoop: () => void;
  onSeek: (time: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: (id: string) => void;
  onUpdateEasing: (id: string, easing: EasingType) => void;
  onChangeDuration: (dur: number) => void;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  project,
  playhead,
  isPlaying,
  isLooping,
  selectedKeyframeId,
  onTogglePlay,
  onToggleLoop,
  onSeek,
  onAddKeyframe,
  onRemoveKeyframe,
  onUpdateEasing,
  onChangeDuration
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newTime = (x / rect.width) * project.duration;
    onSeek(newTime);
  };

  const selectedKf = project.keyframes.find((k) => k.id === selectedKeyframeId);

  const playheadPercent = (playhead / project.duration) * 100;

  return (
    <div className="h-28 w-full border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-3 flex flex-col justify-between z-20 select-none">
      {/* Top row controls: Play/Pause, Time, Easing, Duration */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={onToggleLoop}
            title={isLooping ? 'Looping enabled' : 'Looping disabled'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLooping
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Timecode display */}
          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>{playhead.toFixed(2)}s</span>
            <span className="text-slate-400">/</span>
            <span>{project.duration.toFixed(2)}s</span>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={project.duration}
              onChange={(e) => onChangeDuration(parseFloat(e.target.value))}
              className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium cursor-pointer"
            >
              {[2, 3, 5, 8, 10, 15, 20].map((d) => (
                <option key={d} value={d} className="dark:bg-slate-800">
                  {d}s Duration
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected keyframe actions */}
        <div className="flex items-center gap-3">
          {selectedKf ? (
            <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Keyframe ({selectedKf.time.toFixed(2)}s):
              </span>

              {/* Easing selector */}
              <select
                value={selectedKf.easing}
                onChange={(e) => onUpdateEasing(selectedKf.id, e.target.value as EasingType)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer"
              >
                <option value="easeInOut">Ease In/Out</option>
                <option value="easeIn">Ease In</option>
                <option value="easeOut">Ease Out</option>
                <option value="linear">Linear</option>
              </select>

              {project.keyframes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveKeyframe(selectedKf.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                  title="Delete keyframe"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Select or add a keyframe to configure easing</span>
          )}

          {/* Add Keyframe Button */}
          <button
            type="button"
            onClick={onAddKeyframe}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Keyframe</span>
          </button>
        </div>
      </div>

      {/* Scrubber Timeline Bar */}
      <div className="relative w-full h-8 flex items-center mt-2">
        {/* Background Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 pointer-events-none transition-all duration-75"
            style={{ width: `${playheadPercent}%` }}
          />

          {/* Ruler tick marks */}
          <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-40">
            {Array.from({ length: Math.round(project.duration) + 1 }).map((_, i) => (
              <div key={i} className="w-px h-2 bg-slate-400" />
            ))}
          </div>
        </div>

        {/* Keyframe Markers */}
        {project.keyframes.map((kf) => {
          const kfPercent = (kf.time / project.duration) * 100;
          const isSelected = kf.id === selectedKeyframeId;

          return (
            <div
              key={kf.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(kf.time);
              }}
              style={{ left: `${kfPercent}%` }}
              className={`absolute -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full border-2 cursor-pointer transition-transform hover:scale-125 ${
                isSelected
                  ? 'bg-indigo-600 border-white ring-2 ring-indigo-500 shadow-md scale-110'
                  : 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xs'
              }`}
              title={`Keyframe at ${kf.time.toFixed(2)}s (${kf.easing})`}
            />
          );
        })}

        {/* Draggable Playhead Needle */}
        <div
          style={{ left: `${playheadPercent}%` }}
          className="absolute -translate-x-1/2 top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
        >
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm border border-white" />
          <div className="w-0.5 flex-1 bg-red-500 shadow-xs" />
        </div>
      </div>
    </div>
  );
};
