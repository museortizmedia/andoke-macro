import React, { useState } from "react";
import Portada from "/portada.webp";
import WelcomeVideo from "/estaciones/EST-000/3_video.mp4";
import { useDeviceLanguage } from "../../hooks/useDeviceLanguage"

export default function AndokeWelcome({ onNavigate }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { t } = useDeviceLanguage();

  // URLs estables con fallback automático
  const [heroImg, setHeroImg] = useState(Portada);
  const [videoSrc, setVideoSrc] = useState(WelcomeVideo);

  const handleGoToMap = () => {
    if (onNavigate) {
      onNavigate("mapa");
    }
  };

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-['Manrope',sans-serif] antialiased min-h-screen w-full flex flex-col justify-between">
      <style>{`
        .vibrant-glow-primary {
          box-shadow: 0 4px 20px -2px rgba(230, 57, 70, 0.35);
        }
      `}</style>

      <main className="w-full max-w-xl mx-auto flex flex-col items-center pt-8 pb-12 px-6 flex-1 justify-center">
        {/* Header Logo */}
        <header className="w-full flex justify-center items-center mb-6">
          <img
            src="./horizontal.webp"
            alt="Andoke Logo"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </header>

        {/* Hero Video Banner / Card */}
        <div
          onClick={() => setIsVideoOpen(true)}
          className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm mb-8 cursor-pointer group bg-slate-900"
        >
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt="Parque Andoke"
            src={heroImg}
            onError={() => {
              setHeroImg("https://picsum.photos/id/1018/1200/675");
            }}
          />

          {/* Gradiente de Rojo (#e63946) a Transparente */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#e63946]/90 via-[#e63946]/30 to-transparent flex flex-col justify-between p-6">
            <div className="flex justify-end">
              <div className="w-12 h-12 rounded-full bg-white text-[#e63946] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </div>
            </div>

            <div>
              <span className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1 block">
                {t("Guía Interactiva • Video de Bienvenida")}
              </span>
              <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                {t("¡Bienvenido a Andoke!")}
              </h1>
            </div>
          </div>
        </div>

        {/* Modal de Video Player */}
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[16/9] flex items-center justify-center">
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <video
                key={videoSrc}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                src={videoSrc}
                onError={() => {
                  setVideoSrc("https://www.w3schools.com/html/mov_bbb.mp4");
                }}
              >
                {t("Tu navegador no soporta la reproducción de video.")}
              </video>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <section className="w-full mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#767775]">
              {t("¿Cómo interactuar en el parque?")}
            </h2>
            <p className="text-xs text-[#767775]/80 mt-1">
              {t("En cada estación encontrarás placas interactivas. Usa tu teléfono sin instalar aplicaciones.")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Opción NFC */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#4ea8de] text-white flex items-center justify-center mb-3 shadow-sm">
                <span className="material-symbols-outlined text-2xl">
                  contactless
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#767775] mb-1">
                {t("NFC")}
              </h3>
              <p className="text-xs text-[#767775]/80 leading-relaxed">
                {t("Acerca la parte trasera de tu celular a la placa.")}
              </p>
            </div>

            {/* Opción QR */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#52b788] text-white flex items-center justify-center mb-3 shadow-sm">
                <span className="material-symbols-outlined text-2xl">
                  qr_code_scanner
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#767775] mb-1">
                {t("Código QR")}
              </h3>
              <p className="text-xs text-[#767775]/80 leading-relaxed">
                {t("Escanea el código con la cámara de tu celular.")}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Directo al Mapa */}
        <div className="w-full">
          <button
            onClick={handleGoToMap}
            className="w-full mb-16 bg-[#e63946] text-white font-bold text-base py-4 px-8 rounded-full shadow-lg vibrant-glow-primary hover:bg-[#db313f] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">map</span>
            {t("Revisar mi ruta")}
          </button>
        </div>
      </main>
    </div>
  );
}