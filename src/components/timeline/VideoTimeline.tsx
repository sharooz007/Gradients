import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Plus,
  Shuffle,
  Copy,
  Trash2
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
  onRandomizeKeyframe?: (id: string) => void;
  onDuplicateKeyframe?: (id: string) => void;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  project,
  playhead,
  isPlaying,
  selectedKeyframeId,
  onTogglePlay,
  onSeek,
  onAddKeyframe,
  onRemoveKeyframe,
  onRandomizeKeyframe,
  onDuplicateKeyframe
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [contextMenuKfId, setContextMenuKfId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuKfId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newTime = (x / rect.width) * project.duration;
    onSeek(newTime);
  };

  const playheadPercent = Math.max(0, Math.min(100, (playhead / project.duration) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex justify-center pb-4 px-4 select-none z-30 pointer-events-auto">
      {/* Floating Docked Player Container */}
      <div className="relative w-full max-w-3xl bg-[#16171d]/95 backdrop-blur-xl border border-[#2e303b] rounded-2xl px-5 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-white text-[#0e0f14] flex items-center justify-center hover:bg-[#e5e5ea] transition-all transform active:scale-95 cursor-pointer shadow-md shrink-0"
          title="Play / Pause (Space)"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-[#0e0f14]" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-[#0e0f14] ml-0.5" />
          )}
        </button>

        {/* Timecode Display: 00:02 - 00:05 */}
        <div className="font-mono text-xs font-semibold text-[#8f94a8] tracking-wider shrink-0">
          <span className="text-[#f2f2f5]">{formatTime(playhead)}</span>
          <span className="mx-1 text-[#686c82]">-</span>
          <span>{formatTime(project.duration)}</span>
        </div>

        {/* Interactive Scrubber Track with Diamond Markers */}
        <div className="relative flex-1 h-8 flex items-center">
          {/* Background Line Track */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative w-full h-1.5 bg-[#23242c] rounded-full cursor-pointer overflow-hidden border border-[#2e303b]"
          >
            {/* Active Progress Line */}
            <div
              className="h-full bg-gradient-to-r from-[#6268f8] to-[#818cf8] shadow-[0_0_8px_rgba(98,104,248,0.5)] transition-all duration-75"
              style={{ width: `${playheadPercent}%` }}
            />
          </div>

          {/* Keyframe Diamond Markers (◆ 1, ◆ 2, ◆ 3) */}
          {project.keyframes.map((kf, index) => {
            const kfPercent = (kf.time / project.duration) * 100;
            const isSelected = kf.id === selectedKeyframeId;
            const isMenuOpen = contextMenuKfId === kf.id;

            return (
              <div
                key={kf.id}
                style={{ left: `${kfPercent}%` }}
                className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(kf.time);
                    setContextMenuKfId(isMenuOpen ? null : kf.id);
                  }}
                  className={`w-5 h-5 rounded rotate-45 flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-[#6268f8] ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(98,104,248,0.8)]'
                      : 'bg-[#23242c] border border-[#3b3e55] hover:bg-[#2a2b38] hover:border-[#818cf8]'
                  }`}
                  title={`Keyframe ${index + 1} at ${kf.time.toFixed(2)}s - Click for options`}
                >
                  <span className="-rotate-45 text-[9px] font-extrabold text-white">
                    {index + 1}
                  </span>
                </button>

                {/* Keyframe Context Menu Popup (Randomize, Duplicate, Delete) */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-8 z-50 p-1.5 bg-[#16171d] border border-[#2e303b] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150"
                  >
                    {onRandomizeKeyframe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRandomizeKeyframe(kf.id);
                          setContextMenuKfId(null);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-medium text-[#f2f2f5] hover:bg-[#23242c] rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" />
                        <span>Randomize</span>
                      </button>
                    )}

                    {onDuplicateKeyframe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateKeyframe(kf.id);
                          setContextMenuKfId(null);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-medium text-[#f2f2f5] hover:bg-[#23242c] rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
                        <span>Duplicate</span>
                      </button>
                    )}

                    {project.keyframes.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveKeyframe(kf.id);
                          setContextMenuKfId(null);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/15 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Keyframe '+' Button */}
        <button
          type="button"
          onClick={onAddKeyframe}
          className="w-7 h-7 rounded-full bg-[#6268f8] hover:bg-[#777dfb] text-white flex items-center justify-center transition-all transform active:scale-95 shadow-[0_0_12px_rgba(98,104,248,0.4)] cursor-pointer shrink-0"
          title="Add Keyframe at current time (+)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

