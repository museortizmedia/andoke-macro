import React, { useEffect } from 'react';

export const InteractiveMapContent = () => {
  useEffect(() => {
    // Inyectar fuentes
    const linkFonts = document.createElement('link');
    linkFonts.href =
      'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

    // Inyectar iconos Material Symbols
    const linkIcons = document.createElement('link');
    linkIcons.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    linkIcons.rel = 'stylesheet';
    document.head.appendChild(linkIcons);

    return () => {
      document.head.removeChild(linkFonts);
      document.head.removeChild(linkIcons);
    };
  }, []);

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-['Manrope',sans-serif] antialiased min-h-screen flex flex-col relative pb-[160px] md:pb-0">
      <style>{`
        .vibrant-glow-primary {
          box-shadow: 0 4px 20px -2px rgba(230, 57, 70, 0.3);
        }
        .vibrant-glow-secondary {
          box-shadow: 0 4px 20px -2px rgba(78, 168, 222, 0.3);
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TopAppBar (Desktop) */}
      <header className="hidden md:flex bg-[#fcfdfd] w-full top-0 sticky z-40 justify-between items-center px-12 h-16">
        <div className="text-2xl font-extrabold text-[#e63946] flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            flutter_dash
          </span>
          Andoke
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#e2e3df]/30 flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full object-cover"
              alt="Perfil de usuario"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyvUt5o5Hrsv_vzGdHK42thbNlPffHrVkEStrRdPDYSfBSDhBrhz8HnNOHPVaBU10KpgXpQaWWW6y7ZGhpu1KoTY37cQDUHfLdYEG6wch7RPxuQVIqCLH2TXLPK0yPWs2ow_tO3ZCvdubAmU6OyOoGi1yGwhj72VfjX1IHabwzsvLlv7d3yHSmq6TB5Rqrk3cwjqFKOzlON7_1zgO71qovuWs7qpyAwGtcIr5AQjXgn-fE1w8CpuDEQ"
            />
          </div>
        </div>
      </header>

      {/* Mobile Top Header (Search) */}
      <div className="md:hidden sticky top-0 z-40 bg-[#fcfdfd]/90 backdrop-blur-md px-4 pt-4 pb-4 border-b border-[#e4bebc]/20">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767775]">
            search
          </span>
          <input
            className="w-full bg-white border border-[#e4bebc]/50 rounded-full py-3 pl-12 pr-4 text-base focus:outline-none focus:border-[#4ea8de] focus:ring-2 focus:ring-[#4ea8de]/20 transition-all shadow-sm"
            placeholder="Buscar estaciones, plantas..."
            type="text"
          />
        </div>
      </div>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:px-12 md:py-8 flex flex-col md:flex-row gap-8">
        {/* Columna Izquierda: Mapa y Filtros */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 relative">
          <div className="hidden md:block relative w-full mb-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767775]">
              search
            </span>
            <input
              className="w-full bg-white border border-[#e4bebc]/50 rounded-full py-3 pl-12 pr-4 text-base focus:outline-none focus:border-[#4ea8de] focus:ring-2 focus:ring-[#4ea8de]/20 transition-all shadow-sm"
              placeholder="Buscar estaciones, plantas o rutas..."
              type="text"
            />
          </div>

          {/* Contenedor del Mapa Vectorial */}
          <div className="w-full aspect-[4/3] md:aspect-video rounded-none md:rounded-2xl overflow-hidden relative bg-[#f3f4f0] shadow-sm border border-[#e4bebc]/20 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full opacity-80 mix-blend-multiply"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjGbfOqiQM6wmgXWGOlNaF03MKSKi2H-0N_0SaoP06w9qtgalPr_u30QycCvB0JZC83eplydWmWrRvmws8JMFMLVUtgxAfGuoq9GtB96_WIW1ZnqoMEWowpyIYyKv8TI16aUSpft77EiElVs6CkO873DdF2Qm2JixV7zI2IvTvyUWkGaaDt4ETzrClzf9csQTR_CH-3hyQOUFgiqVSLVRK4w1B_HGgVnBjWVFg8y5Vdwt2F6dGqGCMzA')",
              }}
            />
            
            {/* Overlays del Mapa */}
            <div className="absolute inset-0 p-4 pointer-events-none">
              {/* Marcador Ubicación Actual */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
                <div className="w-12 h-12 bg-[#ffea00] rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                  <span className="material-symbols-outlined text-[#767775] font-bold">
                    person_pin_circle
                  </span>
                </div>
                <span className="mt-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-[#767775] shadow-sm">
                  Tú estás aquí
                </span>
              </div>

              {/* Estación 1 */}
              <button className="absolute top-[30%] left-[60%] flex flex-col items-center pointer-events-auto group">
                <div className="w-8 h-8 bg-[#4ea8de] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-sm">local_florist</span>
                </div>
              </button>

              {/* Estación 2 (Activa) */}
              <button className="absolute top-[60%] left-[30%] flex flex-col items-center pointer-events-auto group">
                <div className="w-10 h-10 bg-[#e63946] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform vibrant-glow-primary z-10">
                  <span className="material-symbols-outlined text-base">eco</span>
                </div>
              </button>
            </div>
          </div>

          {/* Rutas Sugeridas */}
          <div className="px-4 md:px-0 mt-2 md:mt-4">
            <h3 className="font-bold text-xs text-[#767775] mb-3 uppercase tracking-wider">
              Rutas Sugeridas
            </h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#52b788]/15 border border-[#52b788]/30 text-[#52b788] rounded-full font-bold text-sm hover:bg-[#52b788]/25 transition-colors">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Aprendizaje
              </button>
              <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#e63946] text-white rounded-full font-bold text-sm shadow-sm vibrant-glow-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Romántica
              </button>
              <button className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#4ea8de]/15 border border-[#4ea8de]/30 text-[#4ea8de] rounded-full font-bold text-sm hover:bg-[#4ea8de]/25 transition-colors">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                Express
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Estaciones Activas */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 px-4 md:px-0">
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#767775]">
                Estaciones Activas
              </h2>
              <span className="font-bold text-xs text-[#4ea8de] bg-[#4ea8de]/10 px-2 py-1 rounded-md">
                3 Seleccionadas
              </span>
            </div>

            {/* Lista Scrollable */}
            <div className="flex flex-col gap-4 max-h-[442px] md:max-h-[530px] overflow-y-auto hide-scrollbar pb-20 md:pb-4 pr-1">
              {/* Tarjeta 1 */}
              <div className="bg-white border border-[#e4bebc]/20 rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e63946]" />
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-[#767775]">Mariposario</h3>
                    <p className="text-sm text-[#767775] mt-1 line-clamp-2">
                      Observa el ciclo de vida de más de 15 especies de mariposas nativas en su hábitat natural.
                    </p>
                  </div>
                  <button className="text-[#e63946] p-1 bg-[#e63946]/10 rounded-full">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </button>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e2e3df]/30 flex items-center justify-between">
                  <span className="font-bold text-xs text-[#767775] uppercase">
                    Tiempo de Estancia
                  </span>
                  <div className="flex gap-1 bg-[#f3f4f0] p-1 rounded-full border border-[#e4bebc]/20">
                    <button className="px-3 py-1 rounded-full text-xs font-bold text-[#767775] hover:bg-[#e2e3df]/50 transition-colors">
                      15m
                    </button>
                    <button className="px-3 py-1 rounded-full text-xs font-bold bg-[#e63946] text-white shadow-sm transition-colors">
                      30m
                    </button>
                    <button className="px-3 py-1 rounded-full text-xs font-bold text-[#767775] hover:bg-[#e2e3df]/50 transition-colors">
                      45m
                    </button>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-white border border-[#e4bebc]/20 rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ea8de]" />
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-[#767775]">Jardín de Orquídeas</h3>
                    <p className="text-sm text-[#767775] mt-1 line-clamp-2">
                      Colección de orquídeas raras con sistemas de micro-nebulización integrados.
                    </p>
                  </div>
                  <button className="text-[#4ea8de] p-1 bg-[#4ea8de]/10 rounded-full">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </button>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e2e3df]/30 flex items-center justify-between">
                  <span className="font-bold text-xs text-[#767775] uppercase">
                    Tiempo de Estancia
                  </span>
                  <div className="flex gap-1 bg-[#f3f4f0] p-1 rounded-full border border-[#e4bebc]/20">
                    <button className="px-3 py-1 rounded-full text-xs font-bold bg-[#4ea8de] text-white shadow-sm transition-colors">
                      15m
                    </button>
                    <button className="px-3 py-1 rounded-full text-xs font-bold text-[#767775] hover:bg-[#e2e3df]/50 transition-colors">
                      30m
                    </button>
                    <button className="px-3 py-1 rounded-full text-xs font-bold text-[#767775] hover:bg-[#e2e3df]/50 transition-colors">
                      45m
                    </button>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white border border-[#e4bebc]/20 rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden opacity-70">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-[#767775]">Mirador Central</h3>
                    <p className="text-sm text-[#767775] mt-1 line-clamp-2">
                      Vista panorámica de todo el parque con telescopios fijos.
                    </p>
                  </div>
                  <button className="text-[#767775] p-1 hover:bg-[#e2e3df]/20 rounded-full transition-colors">
                    <span className="material-symbols-outlined">add_circle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón CTA Escritorio */}
          <div className="hidden md:block mt-auto pt-4 border-t border-[#e2e3df]/30">
            <button className="w-full bg-[#e63946] text-white font-bold text-sm py-4 rounded-full shadow-lg vibrant-glow-primary hover:bg-[#db313f] transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">route</span>
              Guardar mi Recorrido (1h 15m)
            </button>
          </div>
        </div>
      </main>

      {/* Botón CTA Móvil */}
      <div className="md:hidden fixed bottom-28 left-4 right-4 z-40">
        <button className="w-full bg-[#e63946] text-white font-bold text-sm py-4 rounded-full shadow-lg vibrant-glow-primary active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">route</span>
          Guardar mi Recorrido (1h 15m)
        </button>
      </div>
    </div>
  );
};