import React, { useEffect } from 'react';

export default function AboutProjectView({ onNavigate }) {
  // Inyección de estilos y fuentes
  useEffect(() => {
    const linkFonts = document.createElement('link');
    linkFonts.href =
      'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap';
    linkFonts.rel = 'stylesheet';
    document.head.appendChild(linkFonts);

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

  const handleBack = () => {
    if (typeof onNavigate === 'function') {
      onNavigate('mapa');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-['Manrope',sans-serif] antialiased min-h-screen pb-24">
      {/* Header Fijo */}
      <header className="fixed top-0 w-full z-50 bg-[#fcfdfd]/90 backdrop-blur-md border-b border-[#1a1c1a]/10 h-16 flex items-center justify-between px-4">
        <button
          onClick={handleBack}
          aria-label="Volver"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#e2e3df]/20 transition-colors text-[#e63946] cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="flex-1 px-4 flex flex-col items-center">
          <span className="text-xs font-semibold text-[#767775] uppercase tracking-widest">
            Créditos & Información
          </span>
        </div>

        <div className="w-10"></div>
      </header>

      {/* Contenido Principal */}
      <main className="pt-20 pb-8 md:max-w-3xl md:mx-auto">
        {/* Título de la Sección */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#4ea8de]/15 border border-[#4ea8de]/30 text-[#4ea8de] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px] mr-1">eco</span>
              Museografía Interactiva
            </span>
          </div>
          <h1 className="text-[28px] leading-[34px] font-bold text-[#e63946] -tracking-[0.01em]">
            Guía Digital Andoke
          </h1>
        </div>

        {/* Descripción del Proyecto */}
        <div className="px-4 mb-6">
          <p className="text-base leading-6 text-[#767775] font-normal whitespace-pre-line">
            Esta plataforma web e infraestructura de museografía digital fue desarrollada para potenciar la experiencia pedagógica e interactiva dentro de Andoke.
            {"\n\n"}
            Integrando tecnología Web y puntos de contacto presenciales (QR y NFC), permite a los visitantes descubrir el mariposario, el centro de ciencias y los senderos ecológicos a través de contenidos multimedia ordenados dinámicamente.
          </p>
        </div>

        {/* Sección del Cliente: Andoke */}
        <div className="px-4 mb-6">
          <div className="bg-white border border-[#767775]/15 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">local_florist</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Andoke</h2>
                <span className="text-xs text-emerald-700 font-semibold">Mariposario y Centro de Ciencias</span>
              </div>
            </div>
            
            <p className="text-xs leading-5 text-gray-600">
              Ubicado en Cali, Colombia. Un espacio dedicado a la educación ambiental, la conservación de lepidópteros y la reconexión con la naturaleza a través de experiencias biológicas y senderos interactivos.
            </p>

            <a
              href="https://andoke.com.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 transition-colors border border-emerald-100 text-xs font-bold text-emerald-800 group"
            >
              <span>Visitar sitio web oficial</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                open_in_new
              </span>
            </a>
          </div>
        </div>

        {/* Sección del Creador: Muse Ortiz Media */}
        <div className="px-4 mb-8">
          <div className="bg-white border border-[#767775]/15 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#4ea8de] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">terminal</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Muse Ortiz Media</h2>
                <span className="text-xs text-[#4ea8de] font-semibold">Diego Ortiz Hurtado</span>
              </div>
            </div>

            <p className="text-xs leading-5 text-gray-600">
              Dirección técnica, arquitectura de software y desarrollo de instalaciones interactivas. Especialista en la integración de aplicaciones web, motores de juego y hardware para experiencias inmersivas.
            </p>

            <a
              href="https://museortizmedia.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-sky-50 hover:bg-sky-100/70 transition-colors border border-sky-100 text-xs font-bold text-[#006590] group"
            >
              <span>Ver portafolio de proyectos</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                open_in_new
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* Botón Flotante Inferior */}
      <div className="fixed bottom-0 w-full bg-[#fcfdfd]/95 backdrop-blur-md border-t border-[#767775]/5 p-4 z-50 flex justify-center">
        <button
          onClick={handleBack}
          className="w-full max-w-sm bg-[#e63946] text-white text-sm font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-[#db313f] transition-all cursor-pointer"
        >
          Volver al Mapa
          <span className="material-symbols-outlined text-base">map</span>
        </button>
      </div>
    </div>
  );
}