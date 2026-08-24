import React, { useEffect, useState } from 'react';

export const NotFoundPage = ({ onNavigate }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Contador regresivo cada segundo
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirección al llegar a 0
    const redirectTimeout = setTimeout(() => {
      onNavigate('inicio');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [onNavigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfd] px-6 text-center font-['Manrope',sans-serif]">
      <div className="w-20 h-20 bg-[#e63946]/10 text-[#e63946] rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl">explore_off</span>
      </div>
      
      <h1 className="text-4xl font-extrabold text-[#767775] mb-2">404</h1>
      <h2 className="text-xl font-bold text-[#767775] mb-3">Página no encontrada</h2>
      
      <p className="text-sm text-[#767775]/70 max-w-sm mb-6">
        Parece que te has desviado del sendero. La ruta que intentas visitar no existe en Andoke.
      </p>

      {/* Indicador de Redirección */}
      <div className="mb-8 px-4 py-2 bg-gray-100/80 rounded-full border border-gray-200 text-xs font-semibold text-[#767775]">
        Serás redirigido al inicio en <span className="text-[#e63946] font-bold">{countdown}</span> segundos...
      </div>

      <button
        onClick={() => onNavigate('inicio')}
        className="bg-[#e63946] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md hover:bg-[#db313f] transition-all flex items-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-lg">home</span>
        Volver al Inicio Ahora
      </button>
    </div>
  );
};