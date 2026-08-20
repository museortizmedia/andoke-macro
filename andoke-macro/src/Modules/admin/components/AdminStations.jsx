import React, { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export const AdminStations = () => {
  const { logout } = useAuth();

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

  return (
    <div className="bg-[#faf9f7] text-[#1a1c1b] font-['Manrope',sans-serif] min-h-screen w-full flex flex-col md:flex-row">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .shadow-nature {
          box-shadow: 0 8px 24px rgba(27, 67, 50, 0.04), 0 2px 8px rgba(27, 67, 50, 0.02);
        }
      `}</style>

      {/* Top Bar Móvil */}
      <header className="md:hidden flex justify-between items-center px-4 py-2 w-full z-50 bg-[#fcfdfd] shadow-sm sticky top-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006590]">flutter_dash</span>
          <span className="text-xl font-bold text-[#b7102a]">Andoke</span>
        </div>
        <button className="p-2 text-[#8f6f6e] hover:bg-[#f4f4f1] transition-colors rounded-full">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Sidebar Desktop */}
      <nav className="hidden md:flex flex-col h-screen py-12 w-64 flex-shrink-0 bg-[rgba(82,183,136,0.1)] border-r border-[#e4bebc] sticky top-0">
        <div className="px-6 mb-16">
          <h1 className="text-2xl font-extrabold text-[#006590]">Andoke Admin</h1>
        </div>
        <ul className="flex flex-col gap-2 pr-4">
          <li>
            <a className="flex items-center gap-4 py-2 text-[#767775] hover:bg-[#e8e8e6] rounded-r-full pl-4 transition-all" href="#dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-4 py-2 bg-[#ffdad8] text-[#410007] font-bold rounded-r-full pl-4 transition-all" href="#stations">
              <span className="material-symbols-outlined fill">hub</span>
              <span>Stations</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-4 py-2 text-[#767775] hover:bg-[#e8e8e6] rounded-r-full pl-4 transition-all" href="#analytics">
              <span className="material-symbols-outlined">insights</span>
              <span>Route Analytics</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-4 py-2 text-[#767775] hover:bg-[#e8e8e6] rounded-r-full pl-4 transition-all" href="#staff">
              <span className="material-symbols-outlined">group</span>
              <span>Staff Management</span>
            </a>
          </li>
          <li>
            <a className="flex items-center gap-4 py-2 text-[#767775] hover:bg-[#e8e8e6] rounded-r-full pl-4 transition-all" href="#settings">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </a>
          </li>
        </ul>
        <div className="mt-auto px-4">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-[#e3e2e0] text-[#1a1c1a] py-2 rounded-full font-bold text-sm hover:bg-[#dadad7] transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#faf9f7] p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#b7102a]">Estaciones de Ruta</h2>
              <p className="text-[#767775] mt-1">Gestión de contenido, códigos QR y análisis en tiempo real.</p>
            </div>
            <button className="bg-[#e63946] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#b7102a] transition-colors shadow-sm">
              <span className="material-symbols-outlined">add</span>
              Nueva Estación
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#fcfdfd] rounded-xl shadow-nature border border-[#e8e8e6] flex flex-col hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
              <div className="relative h-48 w-full">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC3yasLisTsZOy03Md2St5SSPvFqYw2RTWAHm3VoL1OqoEE8_yTOvoU0t6P5ToqcMM8NV3UyeV18VkOppdxZLfanhPmcE09zfHE1x8tE30mLp19AcEdpzgDpOildIeUq8l7qOcwFCZGouvegLhcDITx7sM7Yo_iZQevZsIcenEufm97MS-Pp6wNErbcfDE9BwiJwVrYBJMOSC9hcUvKdAwTWMqGKMFR7ANK09qt9L6ZDDLXb84vfy6iw" alt="Mariposario" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-[#e3e2e0]">
                  <div className="w-2 h-2 rounded-full bg-[#52b788]" />
                  <span className="text-xs text-[#1a1c1a]">Activa</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#b7102a] mb-1">Mariposario Principal</h3>
                <p className="text-xs text-[#767775] mb-4">Ruta de Polinizadores</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-[#4ea8de]/20 text-[#4ea8de] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">videocam</span> Video
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#52b788]/20 text-[#52b788] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">mic</span> Audio
                  </span>
                </div>
                <div className="bg-[#f4f4f1] rounded-lg p-3 mb-4 flex justify-between items-center border border-[#e8e8e6]">
                  <div>
                    <span className="text-xs text-[#767775] block">Escaneos Hoy</span>
                    <span className="text-lg font-bold text-[#b7102a]">342</span>
                  </div>
                  <div className="w-16 h-8 flex items-end gap-1 opacity-70">
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[30%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[50%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[40%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[80%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[100%]" />
                  </div>
                </div>
                <div className="mt-auto pt-2 flex gap-2 border-t border-[#e3e2e0]">
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span> Previa
                  </button>
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span> QR
                  </button>
                  <button className="flex-1 bg-[#e63946] hover:bg-[#b7102a] text-white font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">upload</span> Subir
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#fcfdfd] rounded-xl shadow-nature border border-[#e8e8e6] flex flex-col hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
              <div className="relative h-48 w-full">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKIk5ByFeJFI9n9T8tsU98CvvC8T7NZEfyR9KE8jfkGVyUyb4gUH5iT3EJ9k-MWHDdbMWgWFwmyzLEJcGxOg2WXgZXmBrM9TyTkYCN0Aza1PETJ87UG8eRv6sDYjJd3snnu2RKOujcgbO4YOfkphBYRsUTf_aKUkd91pXDiOJ6SXjk2WCTZREUROQXHKLTVBTSt2tXRZpryWi1wAkqK1HKrWyIE-SqQq8qjO1Z1pc4fLQORnJ_nhBfgA" alt="Jardín de Orquídeas" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-[#e3e2e0]">
                  <div className="w-2 h-2 rounded-full bg-[#52b788]" />
                  <span className="text-xs text-[#1a1c1a]">Activa</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#b7102a] mb-1">Jardín de Orquídeas</h3>
                <p className="text-xs text-[#767775] mb-4">Ruta Botánica</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-[#4ea8de]/20 text-[#4ea8de] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">videocam</span> Video
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#52b788]/20 text-[#52b788] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">mic</span> Audio
                  </span>
                </div>
                <div className="bg-[#f4f4f1] rounded-lg p-3 mb-4 flex justify-between items-center border border-[#e8e8e6]">
                  <div>
                    <span className="text-xs text-[#767775] block">Escaneos Hoy</span>
                    <span className="text-lg font-bold text-[#b7102a]">128</span>
                  </div>
                  <div className="w-16 h-8 flex items-end gap-1 opacity-70">
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[60%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[40%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[50%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[20%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[30%]" />
                  </div>
                </div>
                <div className="mt-auto pt-2 flex gap-2 border-t border-[#e3e2e0]">
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span> Previa
                  </button>
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span> QR
                  </button>
                  <button className="flex-1 bg-[#e63946] hover:bg-[#b7102a] text-white font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">upload</span> Subir
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#fcfdfd] rounded-xl shadow-nature border border-[#e8e8e6] flex flex-col hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
              <div className="relative h-48 w-full">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDugknjKg9Tkoses4GGIWvXHRtXzqP5KxQOFrWzTZjDTjoG0wzAQLxEAMTpfjTjlaX2vKqGpwfeYOrDqIwKyH460FQLtUpxuyjhlVW10_eCJyf3JjFDOapjoMyVlpva1gaLYivrAm4QRhWI3yasq5PSYA0x6MorEL_Ih16NVUIf0oPodchhElPNpDidLbmVLe1J5_FSmem7P9q5nXisS33idI1X-xU7-H9hGo8SsjV-J6Va8V0TL9nM2A" alt="Sendero Acuático" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-[#ffdad6]">
                  <div className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  <span className="text-xs text-[#1a1c1a]">Revisión req.</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#b7102a] mb-1">Sendero Acuático</h3>
                <p className="text-xs text-[#767775] mb-4">Ruta Hídrica</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 bg-[#4ea8de]/20 text-[#4ea8de] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">videocam</span> Video
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#e3e2e0] text-[#767775] text-xs px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">image</span> Fotos
                  </span>
                </div>
                <div className="bg-[#f4f4f1] rounded-lg p-3 mb-4 flex justify-between items-center border border-[#e8e8e6]">
                  <div>
                    <span className="text-xs text-[#767775] block">Escaneos Hoy</span>
                    <span className="text-lg font-bold text-[#b7102a]">89</span>
                  </div>
                  <div className="w-16 h-8 flex items-end gap-1 opacity-70">
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[20%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[30%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[25%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[40%]" />
                    <div className="w-2 bg-[#4ea8de] rounded-t-sm h-[45%]" />
                  </div>
                </div>
                <div className="mt-auto pt-2 flex gap-2 border-t border-[#e3e2e0]">
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span> Previa
                  </button>
                  <button className="flex-1 bg-[#eeeeeb] hover:bg-[#e3e2e0] text-[#1a1c1a] font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span> QR
                  </button>
                  <button className="flex-1 bg-[#e63946] hover:bg-[#b7102a] text-white font-bold text-xs py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">upload</span> Subir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navegación Inferior Móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-[#fcfdfd] border-t border-[#e4bebc] shadow-lg rounded-t-xl">
        <a className="flex flex-col items-center justify-center text-[#767775]" href="#dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] mt-1 font-bold">Inicio</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#70c7ff] text-[#005276] rounded-full px-4 py-1" href="#stations">
          <span className="material-symbols-outlined fill">hub</span>
          <span className="text-[10px] mt-1 font-bold">Estaciones</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#767775]" href="#scanner">
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="text-[10px] mt-1 font-bold">Escaner</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#767775]" href="#profile">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] mt-1 font-bold">Perfil</span>
        </a>
      </nav>
    </div>
  );
};