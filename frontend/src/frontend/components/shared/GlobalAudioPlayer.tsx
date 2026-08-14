"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAudio } from "@/frontend/context/AudioContext";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Play, Pause, X, Music, Volume2, VolumeX } from "lucide-react";

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, closePlayer } = useAudio();
  const { language } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 shadow-2xl rounded-2xl backdrop-blur-md p-4 text-white animate-in slide-in-from-bottom duration-300">
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={togglePlayPause}
      />

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 flex items-center justify-center shrink-0">
            <Music size={18} className={isPlaying ? "animate-pulse text-gold-400" : ""} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs truncate text-white">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {currentTrack.speaker || (language === 'en' ? 'YABBOK Sermon' : 'የያቦቅ ስብከት')}
            </p>
          </div>
        </div>

        <button
          onClick={closePlayer}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
        />
        <div className="flex justify-between text-[9px] font-semibold text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-white"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          onClick={togglePlayPause}
          className="w-9 h-9 rounded-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <span className="text-[9px] font-bold text-gold-400 uppercase tracking-wider">
          {language === 'en' ? 'Audio Stream' : 'ድምጽ'}
        </span>
      </div>
    </div>
  );
}
