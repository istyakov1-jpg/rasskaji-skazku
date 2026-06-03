'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  src: string;
  title?: string;
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// Псевдо-волна (CSS полосы)
function Waveform({ progress }: { progress: number }) {
  const bars = 40;
  return (
    <div className="flex items-center gap-0.5 h-8 px-1">
      {Array.from({ length: bars }, (_, i) => {
        const height = 20 + Math.sin((i / bars) * Math.PI * 4) * 10 + Math.sin((i / bars) * Math.PI * 7) * 6;
        const filled = (i / bars) * 100 <= progress;
        return (
          <div key={i} className="flex-1 rounded-full transition-colors duration-100"
            style={{
              height: `${Math.max(4, height)}%`,
              background: filled ? '#7C5CBF' : 'rgba(124,92,191,0.2)',
            }} />
        );
      })}
    </div>
  );
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
  }, [playing]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const t = (Number(e.target.value) / 100) * duration;
    a.currentTime = t;
    setCurrent(t);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const on = (ev: string, fn: () => void) => a.addEventListener(ev, fn);
    const play  = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const ended = () => { setPlaying(false); setCurrent(0); };
    const time  = () => setCurrent(a.currentTime);
    const meta  = () => { setDuration(a.duration); setLoading(false); };
    const wait  = () => setLoading(true);
    const can   = () => setLoading(false);
    on('play', play); on('pause', pause); on('ended', ended);
    on('timeupdate', time); on('loadedmetadata', meta);
    on('waiting', wait); on('canplay', can);
    return () => {
      a.removeEventListener('play', play); a.removeEventListener('pause', pause);
      a.removeEventListener('ended', ended); a.removeEventListener('timeupdate', time);
      a.removeEventListener('loadedmetadata', meta); a.removeEventListener('waiting', wait);
      a.removeEventListener('canplay', can);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fairy-purple-700 to-fairy-purple-900 p-6 shadow-fairy-lg">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Декоративные круги */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">🎧</div>
        <div>
          <p className="text-white font-semibold text-sm">{title ?? 'Слушать сказку'}</p>
          <p className="text-white/50 text-xs">Аудиокнига</p>
        </div>
      </div>

      {/* Волна */}
      <div className="relative z-10 mb-4">
        <Waveform progress={progress} />
      </div>

      {/* Прогресс — кликабельный */}
      <div className="relative z-10 mb-4">
        <div className="relative h-1 bg-white/20 rounded-full">
          <div className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }} />
          <input type="range" min={0} max={100} value={progress} onChange={seek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        </div>
        <div className="flex justify-between text-white/50 text-xs mt-1.5">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Управление */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Перемотка назад */}
        <button onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 15; }}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium">
          ↩ 15с
        </button>

        {/* Play/Pause */}
        <button onClick={toggle} disabled={loading}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
          {loading ? (
            <svg className="animate-spin w-6 h-6 text-fairy-purple-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" />
            </svg>
          ) : playing ? (
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <rect x="6" y="4" width="4" height="16" rx="1.5" fill="#7C5CBF" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" fill="#7C5CBF" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="#7C5CBF" className="w-7 h-7 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Перемотка вперёд */}
        <button onClick={() => { if (audioRef.current) audioRef.current.currentTime += 15; }}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium">
          15с ↪
        </button>
      </div>

      {/* Громкость */}
      <div className="relative z-10 flex items-center gap-2 mt-4">
        <span className="text-white/40 text-base">{volume === 0 ? '🔇' : '🔊'}</span>
        <div className="relative flex-1 h-1 bg-white/20 rounded-full">
          <div className="absolute left-0 top-0 h-full bg-white/60 rounded-full"
            style={{ width: `${volume * 100}%` }} />
          <input type="range" min={0} max={100} value={volume * 100}
            onChange={e => { const v = Number(e.target.value) / 100; setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
        </div>
      </div>
    </div>
  );
}