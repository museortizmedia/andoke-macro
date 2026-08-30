import React, { useState, useEffect } from "react";
import { useDeviceLanguage } from "../../hooks/useDeviceLanguage"

const DEFAULT_CENTER_COORDS = [
  { top: "45%", left: "45%" },
  { top: "40%", left: "55%" },
  { top: "55%", left: "40%" },
  { top: "50%", left: "50%" },
  { top: "60%", left: "52%" },
  { top: "35%", left: "50%" },
  { top: "48%", left: "62%" },
  { top: "62%", left: "42%" },
  { top: "38%", left: "38%" }
];

const SELECTED_ROUTE_CACHE_KEY = 'user_selected_route';

export const InteractiveMapContent = ({ onNavigate }) => {
  const { t } = useDeviceLanguage();

  const [extendedPois, setExtendedPois] = useState([]);
  const [routesConfig, setRoutesConfig] = useState([]);
  const [selectedStationIds, setSelectedStationIds] = useState([]);
  const [activeRouteFilter, setActiveRouteFilter] = useState("completa");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Carga dinámica del JSON desde la carpeta public
  useEffect(() => {
    fetch("/data/parkData.json")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar parkData.json");
        return res.json();
      })
      .then((data) => {
        const rawPois = data.POIS || [];
        const rawRoutes = data.PREDEFINED_ROUTES || [];

        // Mapeo e hidratación de POIs
        const pois = rawPois.map((poi, index) => {
          const defaultCoord = DEFAULT_CENTER_COORDS[index % DEFAULT_CENTER_COORDS.length];
          return {
            ...poi,
            top: poi.mapCoords?.top || defaultCoord.top,
            left: poi.mapCoords?.left || defaultCoord.left,
            selectable: poi.selectable !== false,
            isAttraction: poi.selectable !== false
          };
        });

        // Mapeo e hidratación de Rutas
        const routes = rawRoutes.map((route) => ({
          ...route,
          pois: route.pois || pois.filter((p) => p.selectable).map((p) => p.id)
        }));

        // Al mapear las rutas e hidratar el estado inicial en el fetch:
        setExtendedPois(pois);
        setRoutesConfig(routes);

        // Intentar cargar la selección del usuario previa desde localStorage
        const savedRouteRaw = localStorage.getItem(SELECTED_ROUTE_CACHE_KEY);
        if (savedRouteRaw) {
          try {
            const parsedSavedRoute = JSON.parse(savedRouteRaw);
            if (Array.isArray(parsedSavedRoute) && parsedSavedRoute.length > 0) {
              setSelectedStationIds(parsedSavedRoute);
              setActiveRouteFilter("custom");
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error leyendo ruta guardada:", e);
          }
        }

        // Fallback: si no hay nada guardado, cargar la ruta inicial "completa"
        const initialRoute = routes.find((r) => r.id === "completa")?.pois || [];
        setSelectedStationIds(initialRoute);
        setIsLoading(false);

      })
      .catch((err) => {
        console.error("Error cargando los datos del parque:", err);
        setIsLoading(false);
      });
  }, []);

  // Guardar ruta sin boton guardar
  useEffect(() => {
    if (!isLoading && selectedStationIds.length > 0) {
      localStorage.setItem(SELECTED_ROUTE_CACHE_KEY, JSON.stringify(selectedStationIds));
    }
  }, [selectedStationIds, isLoading]);

  const handleSaveAndStartRoute = () => {
    // Guardar en localStorage
    localStorage.setItem(SELECTED_ROUTE_CACHE_KEY, JSON.stringify(selectedStationIds));
    onNavigate("camara")
  };

  const toggleStation = (id) => {
    const station = extendedPois.find((s) => s.id === id);
    if (!station || !station.selectable) return;

    setActiveRouteFilter("custom");
    setSelectedStationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyRoute = (routeId) => {
    const route = routesConfig.find((r) => r.id === routeId);
    if (route) {
      setActiveRouteFilter(routeId);
      setSelectedStationIds(route.pois);
    }
  };

  const totalMinutes = selectedStationIds.reduce((acc, id) => {
    const station = extendedPois.find((s) => s.id === id && s.selectable);
    return acc + (station ? station.duration || 0 : 0);
  }, 0);

  const formattedTime = () => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const selectableStations = extendedPois.filter((s) => s.selectable);
  const filteredStations = selectableStations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.zone && s.zone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfd] text-[#767775]">
        <p className="font-semibold text-sm animate-pulse">{t("Cargando mapa interactivo...")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-['Manrope',sans-serif] antialiased min-h-screen flex flex-col relative pb-[160px] md:pb-0">
      <style>{`
        .vibrant-glow-primary {
          box-shadow: 0 4px 20px -2px rgba(230, 57, 70, 0.35);
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TopAppBar Desktop */}
      <header className="hidden md:flex bg-[#fcfdfd] w-full top-0 sticky z-40 justify-between items-center px-12 h-16 border-b border-[#e4bebc]/20">
         <img
            src="./horizontal.webp"
            alt="Andoke Logo"
            className="h-14 w-auto object-contain"
            onError={(e) => {
              // Si no encuentra la imagen local del logo, muestra texto estilizado sin romperse
              e.currentTarget.style.display = "none";
            }}
          />
      </header>

      {/* Buscador Móvil (Altura reducida) */}
<div className="md:hidden sticky top-0 z-40 bg-[#fcfdfd]/90 backdrop-blur-md px-4 py-2 border-b border-[#e4bebc]/20 flex items-center">
  <div className="relative w-[85%] sm:w-[88%]">
    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767775] text-xl">
      search
    </span>
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-white border border-[#e4bebc]/50 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:border-[#4ea8de] focus:ring-2 focus:ring-[#4ea8de]/20 transition-all shadow-sm"
      placeholder={t("Buscar atracciones, zonas...")}
      type="text"
    />
  </div>
</div>

      <main className="flex-1 w-full max-w-7xl mx-auto md:px-12 md:py-8 flex flex-col md:flex-row gap-8">
        {/* Columna Izquierda: Mapa e Interacciones */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 relative">

          {/* Buscador Desktop */}
          <div className="hidden md:block relative w-full mb-2">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767775]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#e4bebc]/50 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#4ea8de] focus:ring-2 focus:ring-[#4ea8de]/20 transition-all shadow-sm"
              placeholder={t("Buscar atracciones, zonas...")}
              type="text"
            />
          </div>

          {/* Mapa */}
          <div className="w-full aspect-[4/3] md:aspect-video rounded-none md:rounded-2xl overflow-hidden relative bg-[#f3f4f0] shadow-sm border border-[#e4bebc]/20 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center w-full h-full opacity-80 mix-blend-multiply"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjGbfOqiQM6wmgXWGOlNaF03MKSKi2H-0N_0SaoP06w9qtgalPr_u30QycCvB0JZC83eplydWmWrRvmws8JMFMLVUtgxAfGuoq9GtB96_WIW1ZnqoMEWowpyIYyKv8TI16aUSpft77EiElVs6CkO873DdF2Qm2JixV7zI2IvTvyUWkGaaDt4ETzrClzf9csQTR_CH-3hyQOUFgiqVSLVRK4w1B_HGgVnBjWVFg8y5Vdwt2F6dGqGCMzA')"
              }}
            />

            {/* Markers en el mapa */}
            <div className="absolute inset-0 p-4 pointer-events-none">
              {extendedPois.map((station) => {
                const isSelected = selectedStationIds.includes(station.id);
                const isSelectable = station.selectable;

                return (
                  <button
                    key={station.id}
                    onClick={() => isSelectable && toggleStation(station.id)}
                    style={{ top: station.top, left: station.left }}
                    disabled={!isSelectable}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto transition-transform ${isSelectable ? "cursor-pointer hover:scale-110" : "cursor-default opacity-85"
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all ${!isSelectable
                        ? "bg-slate-500 text-white"
                        : isSelected
                          ? "bg-[#e63946] text-white vibrant-glow-primary scale-110 z-10"
                          : "bg-gray-300 text-gray-600 opacity-60"
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">{station.icon}</span>
                    </div>
                    <span
                      className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap ${!isSelectable
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : isSelected
                          ? "bg-white/95 text-[#767775]"
                          : "bg-gray-200/90 text-gray-500"
                        }`}
                    >
                      {t(station.name)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rutas Sugeridas */}
          <div className="px-4 md:px-0 mt-2">
            <h3 className="font-bold text-xs text-[#767775] mb-2 uppercase tracking-wider">
              {t("Rutas Sugeridas")}
            </h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {routesConfig.map((route) => {
                const isActive = activeRouteFilter === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => applyRoute(route.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${isActive ? route.bgActive : route.bgInactive
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{route.icon}</span>
                    {t(route.title)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 px-4 md:px-0">
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#767775]">{t("Atracciones")}</h2>
                <p className="text-xs text-[#767775]/70">{t("Selecciona o quita lugares para definir recorrido personalizado")}</p>
              </div>
              <span className="font-bold text-xs text-[#4ea8de] bg-[#4ea8de]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                {selectedStationIds.length} {t("de")} {selectableStations.length} {t("Activas")}
              </span>
            </div>

            {/* Lista de Cards */}
            <div className="flex flex-col gap-3 max-h-[1500px] overflow-y-auto hide-scrollbar pb-20 md:pb-4 pr-1">
              {filteredStations.map((station) => {
                const isSelected = selectedStationIds.includes(station.id);
                return (
                  <div
                    key={station.id}
                    onClick={() => toggleStation(station.id)}
                    className={`border rounded-[16px] p-4 transition-all cursor-pointer relative overflow-hidden ${isSelected
                      ? "bg-white border-[#e4bebc]/40 shadow-sm"
                      : "bg-gray-50/70 border-gray-200/60 opacity-60"
                      }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${isSelected ? "bg-[#e63946]" : "bg-gray-300"
                        }`}
                    />

                    <div className="flex justify-between items-start mb-1 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[#767775] flex-shrink-0">
                          {station.icon}
                        </span>
                        <div className="flex flex-col justify-center leading-tight">
                          <h3 className="text-base font-bold text-[#767775] leading-none mb-0.5">{t(station.name)}</h3>
                          <span className="text-[10px] text-gray-400 font-semibold leading-none">{t(station.zone)}</span>
                        </div>
                      </div>
                      <button className="text-[#e63946]">
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0"
                          }}
                        >
                          {isSelected ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs text-[#767775]/80 pl-1 mb-3 line-clamp-2">
                      {station.description}
                    </p>

                    <div className="pt-2 border-t border-[#e2e3df]/30 flex items-center justify-between pl-1">
                      <span className="font-bold text-[10px] text-[#767775] uppercase tracking-wider">
                        {t("Tiempo estimado")}
                      </span>
                      <span className="text-xs font-bold bg-[#f3f4f0] px-2.5 py-1 rounded-full text-[#767775]">
                        ~{station.duration} min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Desktop */}
          <div className="mb-16 hidden md:block mt-auto pt-4 border-t border-[#e2e3df]/30">
            <button
              onClick={handleSaveAndStartRoute}
              className="w-full bg-[#e63946] text-white font-bold text-sm py-4 rounded-full shadow-lg vibrant-glow-primary hover:bg-[#db313f] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">directions_walk</span>
              {t("Guardar mi recorrido")} ({formattedTime()})
            </button>
          </div>
        </div>
      </main>

      {/* CTA Móvil */}
      <div className="mb-16 md:hidden fixed bottom-6 left-4 right-4 z-40">
        <button
          onClick={handleSaveAndStartRoute}
          className="w-full bg-[#e63946] text-white font-bold text-sm py-4 rounded-full shadow-lg vibrant-glow-primary active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">directions_walk</span>
          {t("Guardar mi recorrido")} ({formattedTime()})
        </button>
      </div>
    </div>
  );
};