'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  src: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const v = Number(e.target.value) / 100;
    setVolume(v);
    if (audio) audio.volume = v;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers = {
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      ended: () => { setIsPlaying(false); setCurrentTime(0); },
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => { setDuration(audio.duration); setIsLoading(false); },
      waiting: () => setIsLoading(true),
      canplay: () => setIsLoading(false),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, []);

  return (
    <div className="fairy-card flex flex-col gap-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎙️</span>
        <div>
          <p className="font-semibold text-fairy-purple-700">Слушать сказку</p>
          <p className="text-xs text-fairy-purple-400">Озвучено с помощью AI</p>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-fairy-purple-400 w-10 text-right tabular-nums">
          {formatTime(currentTime)}
        </span>
        <div className="relative flex-1 h-2 bg-fairy-purple-100 rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-fairy-purple-400 to-fairy-pink-500 rounded-full pointer-events-none"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="audio-progress absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            style={{ margin: 0 }}
          />
        </div>
        <span className="text-xs text-fairy-purple-400 w-10 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {/* Управление */}
      <div className="flex items-center justify-between">
        {/* Кнопка play/pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-fairy-purple-500 to-fairy-pink-500 text-white flex items-center justify-center shadow-fairy-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
        >
          {isLoading ? (
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40 20" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Громкость */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
          <div className="relative w-20 h-1.5 bg-fairy-purple-100 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-fairy-purple-300 rounded-full pointer-events-none"
              style={{ width: `${volume * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume * 100}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              style={{ margin: 0 }}
              aria-label="Громкость"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
