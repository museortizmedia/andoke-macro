import React, { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto aspect-video rounded-tl-3xl rounded-br-3xl overflow-hidden shadow-xl group select-none"
    >
      {/* Video principal */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Overlay del botón Play central */}
      <div 
        onClick={togglePlay}
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 flex items-center justify-center cursor-pointer ${
          isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <span className="material-symbols-outlined text-[#e63946] text-4xl sm:text-5xl">
              pause
            </span>
          ) : (
            /* Triángulo de Play más grande y con esquinas redondeadas (stroke-linejoin="round") */
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-[#e63946] translate-x-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>
      </div>

      {/* Bar de Controles Inferiores */}
      <div className={`absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
        isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
      }`}>
        <div className="text-white font-sans text-sm sm:text-base font-semibold tracking-wide drop-shadow-md">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          aria-label="Pantalla completa"
          className="text-white hover:text-white/80 transition-colors p-1 pointer-events-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl sm:text-3xl drop-shadow-md">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>
    </div>
  );
}