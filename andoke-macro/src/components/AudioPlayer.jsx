import React, { useState, useRef } from 'react';

const WAVEFORM_HEIGHTS = [4, 12, 24, 16, 32, 20, 8, 16, 12, 24, 8, 20, 12, 28, 16, 8, 16, 8];

export default function AudioPlayer({ src, title = "Escucha la Guía" }) {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!isSeeking && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * duration;

    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <style>{`
        @keyframes waveform-bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.35); }
        }
        .animate-waveform {
          animation: waveform-bounce 0.8s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
      `}</style>

      {title && (
        <h2 className="text-xl font-semibold text-[#e63946] mb-3 leading-tight font-sans">
          {title}
        </h2>
      )}

      <div className="bg-[#ffffff] border border-[#767775]/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-lg hover:shadow-[#4ea8de]/10 transition-all duration-300">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Botón de reproducción/pausa */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          className="w-12 h-12 bg-[#4ea8de] text-[#ffffff] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#70c7ff] active:scale-95 transition-all cursor-pointer shadow-md shadow-[#4ea8de]/20"
        >
          <span className="material-symbols-outlined text-2xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Onda de Audio Interactiva */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="flex-1 flex flex-col justify-center h-12 cursor-pointer group select-none py-2"
        >
          <div className="flex items-end justify-center h-8 gap-[3px]">
            {WAVEFORM_HEIGHTS.map((height, idx) => {
              const barPercentage = ((idx + 1) / WAVEFORM_HEIGHTS.length) * 100;
              const isPlayed = progressPercentage >= barPercentage;

              return (
                <div
                  key={idx}
                  style={{
                    height: `${height}px`,
                    // La animación solo se desfasa y aplica si la barra NO ha sido leída (!isPlayed) y se está reproduciendo
                    animationDelay: isPlaying && !isPlayed ? `${(idx % 4) * 0.15}s` : '0s',
                  }}
                  className={`w-1 rounded-t transition-all duration-200 origin-bottom hover:scale-y-125 ${
                    isPlayed
                      ? 'bg-[#4ea8de]' // Barras leídas: color activo y estáticas
                      : `bg-[#e2e3df] group-hover:bg-[#d9dad7] ${isPlaying ? 'animate-waveform' : ''}` // Barras no leídas: oscilando si se reproduce
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Display del Tiempo */}
        <div className="font-sans text-xs font-semibold text-[#4ea8de] min-w-[70px] text-right select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}