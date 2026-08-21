import React, { useState, useEffect } from "react";

export default function AndokeWelcome({ onNavigate }) {
  const [expressMode, setExpressMode] = useState(false);

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-sans min-h-screen flex flex-col items-center overflow-x-hidden">
      <style>{`
        .nature-shadow {
          box-shadow: 0 8px 30px rgba(27, 67, 50, 0.08);
        }
        .interactive-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .interactive-card:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <main className="w-full max-w-2xl flex flex-col pt-8 pb-8 px-6">
        {/* Header: Logo */}
        <header className="w-full flex justify-center items-center mb-8">
          <img
            src="./horizontal.webp"
            alt="Andoke Logo"
            className="h-16 w-auto object-contain"
          />
        </header>

        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full aspect-[4/3] rounded-t-[2rem] rounded-b-xl overflow-hidden nature-shadow border border-gray-200 group cursor-pointer">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Jardín botánico Andoke"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLsKdYkdWS8Dhj0r25WNQTK9K5-HrYvGJgm5O4Q-Hah-_azCK4rYDlVg6UOm9MA_0buj9hvdCKqYuOhORsx-tLv5p4tB_r5ANTsjr9Q8RiLD-se6Y56HEydVDw8qnMEM4Dsb0vtXnovYoCn_RR-PWCRC0QP4tgIZOtyQ9jIL_k2LA4o_9yGFNPFn5WYOXP-Tlw9Kiaedy6m1cfVl7Eul-UvuIdSr92xIUW148KIDjnncXXaf_flpv90A"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#e63946]/80 via-[#e63946]/20 to-transparent flex items-end p-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                Welcome to the Park
              </h2>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white transition-transform group-hover:scale-110">
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Cómo interactuar */}
        <section className="mb-8 flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-[#e63946]">
            Cómo Interactuar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="interactive-card bg-white p-4 rounded-t-xl rounded-b-lg border border-gray-200/60 nature-shadow flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#4ea8de] text-white flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-3xl">
                  contactless
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#e63946] tracking-wider">
                NFC
              </h4>
              <p className="text-sm text-[#767775]">
                Acerca el reverso de tu celular a la placa de madera.
              </p>
            </div>

            <div className="interactive-card bg-white p-4 rounded-t-xl rounded-b-lg border border-gray-200/60 nature-shadow flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#52b788] text-white flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-3xl">
                  qr_code_scanner
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#e63946] tracking-wider">
                QR
              </h4>
              <p className="text-sm text-[#767775]">
                Abre la cámara y escanea el código QR.
              </p>
            </div>
          </div>
        </section>

        {/* Modo Express */}
        <section className="mb-12">
          <div className="bg-[#f4f4f1] rounded-xl p-4 flex items-center justify-between border border-gray-300/50">
            <div className="flex flex-col pr-4">
              <span className="font-bold text-sm text-[#e63946] tracking-wider">
                Modo Express
              </span>
              <span className="text-xs text-[#767775] mt-1">
                Reducir intervenciones para agilizar tiempo
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={expressMode}
                onChange={(e) => setExpressMode(e.target.checked)}
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#e63946]"></div>
            </label>
          </div>
        </section>

        {/* Botón CTA con evento onNavigate */}
        <section className="mt-auto pb-16 w-full flex justify-center">
          <button
            onClick={() => onNavigate && onNavigate('mapa')}
            className="w-full bg-[#e63946] text-white font-bold text-sm py-4 px-8 rounded-full shadow-[0_4px_20px_rgba(230,57,70,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(230,57,70,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            Continuar al Mapa de Rutas
            <span className="material-symbols-outlined">map</span>
          </button>
        </section>
      </main>
    </div>
  );
}