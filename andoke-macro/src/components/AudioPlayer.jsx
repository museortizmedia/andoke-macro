import React, { useState, useRef, useEffect } from 'react';

const WAVEFORM_HEIGHTS = [4, 12, 24, 16, 32, 20, 8, 16, 12, 24, 8, 20, 12, 28, 16, 8, 16, 8];
const SPEED_OPTIONS = [1, 1.5, 2];

export default function AudioPlayer({ src, title = "Escucha la Guía" }) {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [playbackRateIndex, setPlaybackRateIndex] = useState(0); // 0: 1x, 1: 1.5x, 2: 2x

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

  const calculateNewTime = (clientX) => {
    if (!progressBarRef.current || !duration) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    return percentage * duration;
  };

  const handleSeekStart = (e) => {
    if (!duration) return;
    setIsSeeking(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newTime = calculateNewTime(clientX);
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const handleSeekMove = (e) => {
      if (!isSeeking) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newTime = calculateNewTime(clientX);
      setCurrentTime(newTime);
    };

    const handleSeekEnd = () => {
      if (isSeeking) {
        setIsSeeking(false);
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
        }
      }
    };

    if (isSeeking) {
      window.addEventListener('mousemove', handleSeekMove);
      window.addEventListener('mouseup', handleSeekEnd);
      window.addEventListener('touchmove', handleSeekMove);
      window.addEventListener('touchend', handleSeekEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleSeekMove);
      window.removeEventListener('mouseup', handleSeekEnd);
      window.removeEventListener('touchmove', handleSeekMove);
      window.removeEventListener('touchend', handleSeekEnd);
    };
  }, [isSeeking, currentTime, duration]);

  const togglePlaybackRate = () => {
    const nextIndex = (playbackRateIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRateIndex(nextIndex);
    const newSpeed = SPEED_OPTIONS[nextIndex];
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const currentSpeed = SPEED_OPTIONS[playbackRateIndex];
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
        <h2 className="text-lg sm:text-xl font-semibold text-[#e63946] mb-2 sm:mb-3 leading-tight font-sans">
          {title}
        </h2>
      )}

      {/* Tarjeta Contenedora con posición relativa para fijar el tiempo abajo a la derecha */}
      <div className="relative bg-[#ffffff] border border-[#767775]/10 rounded-2xl p-4 pb-7 sm:pb-7 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-lg hover:shadow-[#4ea8de]/10 transition-all duration-300">
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
          className="w-11 h-11 sm:w-12 sm:h-12 bg-[#4ea8de] text-[#ffffff] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#70c7ff] active:scale-95 transition-all cursor-pointer shadow-md shadow-[#4ea8de]/20"
        >
          <span className="material-symbols-outlined text-2xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Onda de Audio Interactiva */}
        <div
          ref={progressBarRef}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          className="flex-1 flex flex-col justify-center h-12 cursor-pointer group select-none py-2 touch-none"
        >
          <div className="flex items-end justify-between sm:justify-center h-8 gap-[2px] sm:gap-[3px]">
            {WAVEFORM_HEIGHTS.map((height, idx) => {
              const barPercentage = ((idx + 1) / WAVEFORM_HEIGHTS.length) * 100;
              const isPlayed = progressPercentage >= barPercentage;

              return (
                <div
                  key={idx}
                  style={{
                    height: `${height}px`,
                    animationDelay: isPlaying && !isPlayed && !isSeeking ? `${(idx % 4) * 0.15}s` : '0s',
                  }}
                  className={`flex-1 sm:flex-none sm:w-1 rounded-t transition-all duration-150 origin-bottom ${
                    isSeeking ? '' : 'hover:scale-y-125'
                  } ${
                    isPlayed
                      ? 'bg-[#4ea8de]'
                      : `bg-[#e2e3df] group-hover:bg-[#d9dad7] ${isPlaying && !isSeeking ? 'animate-waveform' : ''}`
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Botón de Velocidad de Reproducción (Circular estático) */}
        <button
          onClick={togglePlaybackRate}
          aria-label={`Cambiar velocidad. Actual: ${currentSpeed}x`}
          title="Cambiar velocidad de reproducción"
          className="w-9 h-9 bg-[#f0f4f8] hover:bg-[#e2eaf4] active:scale-95 text-[#4ea8de] font-sans font-bold text-xs rounded-full flex items-center justify-center flex-shrink-0 border border-[#4ea8de]/20 cursor-pointer select-none transition-all"
        >
          {currentSpeed}x
        </button>

        {/* Display del Tiempo - Posicionado abajo a la derecha de la tarjeta */}
        <div className="absolute bottom-1.5 right-4 font-sans text-[10px] sm:text-xs font-semibold text-[#4ea8de]/80 select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}