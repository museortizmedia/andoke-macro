import React, { useState, useEffect, useRef } from 'react';
import { useDeviceLanguage } from '../../hooks/useDeviceLanguage';
import AudioPlayer from '../../components/AudioPlayer'
import VideoPlayer from '../../components/VideoPlayer';

const CACHE_KEY = 'visited_stations_cache';
const ROUTE_KEY = 'user_selected_route';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// --- FUNCIONES AUXILIARES DE CACHÉ Y RUTA ---

const getUserSelectedPoiIds = () => {
  try {
    const raw = localStorage.getItem(ROUTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const getValidVisitedStations = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const validStations = parsed.filter((item) => now - item.timestamp < ONE_DAY_MS);

    if (validStations.length !== parsed.length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validStations));
    }
    return validStations;
  } catch (error) {
    console.error('Error al leer caché de estaciones:', error);
    return [];
  }
};

const saveStationToCache = (id, title) => {
  if (!id) return;
  try {
    const current = getValidVisitedStations();
    const now = Date.now();
    const filtered = current.filter((item) => item.id !== id);
    const updated = [
      ...filtered,
      { id, title: title || `Estación ${id}`, timestamp: now }
    ];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error al guardar estación en caché:', error);
  }
};

const checkResourceExists = async (url, expectedType = 'image') => {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return false;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return false;
    }

    if (expectedType === 'image') {
      return contentType.includes('image') || /\.(jpg|jpeg|png|webp|svg)$/i.test(url);
    }
    if (expectedType === 'audio') {
      return contentType.includes('audio') || /\.(mp3|wav|ogg|m4a)$/i.test(url);
    }
    if (expectedType === 'video') {
      return contentType.includes('video') || /\.(mp4|webm)$/i.test(url);
    }

    return true;
  } catch {
    return false;
  }
};

// --- COMPONENTE PRINCIPAL ---

export default function EstacionesView({ onNextStation, onNavigate }) {
  const { language, langSuffixes } = useDeviceLanguage('es');

  const [activeStationId, setActiveStationId] = useState(() => {
    return new URLSearchParams(window.location.search).get('id');
  });

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState(null);
  const [poiData, setPoiData] = useState(null);
  const [totalStations, setTotalStations] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [visitedStations, setVisitedStations] = useState([]);

  // Control de desviación de ruta
  const [showDeviationModal, setShowDeviationModal] = useState(false);

  // Guardamos POIS y STATIONS globales
  const [allPois, setAllPois] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [orderedBlocks, setOrderedBlocks] = useState([]);

  // Estados para Web Audio API
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const currentAudioUrlRef = useRef(null);

  useEffect(() => {
    const syncStationFromURL = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setActiveStationId(searchParams.get('id'));
    };

    window.addEventListener('popstate', syncStationFromURL);
    return () => window.removeEventListener('popstate', syncStationFromURL);
  }, []);

  useEffect(() => {
    setVisitedStations(getValidVisitedStations());
  }, [activeStationId]);

  useEffect(() => {
    stopAudio();
    audioBufferRef.current = null;
    currentAudioUrlRef.current = null;
  }, [activeStationId]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    async function loadStationInfo() {
      try {
        setLoading(true);

        const res = await fetch('/data/parkData.json');
        const parkData = await res.json();

        const rawPois = parkData.POIS || [];
        const rawStations = parkData.STATIONS || [];

        setAllPois(rawPois);
        setAllStations(rawStations);

        const selectedPoiIds = getUserSelectedPoiIds();

        let routeStations = [];
        if (selectedPoiIds) {
          routeStations = rawStations.filter((s) => selectedPoiIds.includes(s.poiId));
        } else {
          routeStations = rawStations;
        }

        if (!activeStationId) {
          setLoading(false);
          return;
        }

        let foundStation = rawStations.find((s) => s.id === activeStationId);
        let foundPoi = null;

        if (foundStation) {
          foundPoi = rawPois.find((p) => p.id === foundStation.poiId);
        } else {
          foundPoi = rawPois.find((p) => p.id === activeStationId);
          foundStation = rawStations.find((s) => s.poiId === activeStationId) || {
            id: activeStationId,
            numeroConsecutivo: 1,
            poiId: foundPoi?.id,
            title: foundPoi?.name || 'Estación',
            contentFolderPath: `public/estaciones/${activeStationId}/`
          };
        }

        // Verificar si la estación escaneada pertenece a la ruta activa del usuario
        if (selectedPoiIds && foundStation) {
          const belongsToRoute = selectedPoiIds.includes(foundStation.poiId);
          if (!belongsToRoute) {
            setShowDeviationModal(true);
          }
        }

        const stationIndexInRoute = routeStations.findIndex((s) => s.id === foundStation.id);
        const total = routeStations.length || 1;
        const currentNum = stationIndexInRoute !== -1 ? stationIndexInRoute + 1 : foundStation.numeroConsecutivo || 1;

        const resolvedTitle = foundStation?.title || foundPoi?.name || `Estación ${activeStationId}`;

        setTotalStations(total);
        setCurrentIndex(currentNum);
        setStationData(foundStation);
        setPoiData(foundPoi);

        saveStationToCache(foundStation.id, resolvedTitle);

        let folderPath = foundStation?.contentFolderPath || `/estaciones/${activeStationId}/`;
        folderPath = folderPath.replace(/^public\//, '/');
        if (!folderPath.startsWith('/')) folderPath = '/' + folderPath;
        if (!folderPath.endsWith('/')) folderPath += '/';

        await scanAndBuildSequentialContent(folderPath, foundPoi, langSuffixes);

      } catch (err) {
        console.error('Error cargando información de la estación:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStationInfo();
  }, [activeStationId, language]);

  const scanAndBuildSequentialContent = async (folderPath, poi, suffixes) => {
    const imgExts = ['jpg', 'jpeg', 'png', 'webp'];
    const videoExts = ['mp4', 'webm'];
    const audioExts = ['mp3', 'm4a', 'wav', 'ogg'];
    const textExts = ['txt'];

    const rawItems = [];

    for (let i = 1; i <= 20; i++) {
      let foundInThisIndex = false;

      for (const suffix of suffixes) {
        for (const ext of textExts) {
          const candidate = `${folderPath}${i}_texto${suffix}.${ext}`;
          try {
            const res = await fetch(candidate);
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && !contentType.includes('text/html')) {
              const rawText = await res.text();
              if (rawText && !rawText.toLowerCase().includes('<!doctype html>')) {
                rawItems.push({ type: 'text', content: rawText, index: i });
                foundInThisIndex = true;
                break;
              }
            }
          } catch (e) { }
        }
        if (foundInThisIndex) break;
      }
      if (foundInThisIndex) continue;

      for (const suffix of suffixes) {
        for (const ext of imgExts) {
          const candidate = `${folderPath}${i}_imagen${suffix}.${ext}`;
          if (await checkResourceExists(candidate, 'image')) {
            rawItems.push({ type: 'image', url: candidate, index: i });
            foundInThisIndex = true;
            break;
          }
        }
        if (foundInThisIndex) break;
      }
      if (foundInThisIndex) continue;

      for (const suffix of suffixes) {
        for (const ext of videoExts) {
          const candidate = `${folderPath}${i}_video${suffix}.${ext}`;
          if (await checkResourceExists(candidate, 'video')) {
            rawItems.push({ type: 'video', url: candidate, index: i });
            foundInThisIndex = true;
            break;
          }
        }
        if (foundInThisIndex) break;
      }
      if (foundInThisIndex) continue;

      for (const suffix of suffixes) {
        for (const ext of audioExts) {
          const candidate = `${folderPath}${i}_audio${suffix}.${ext}`;
          if (await checkResourceExists(candidate, 'audio')) {
            rawItems.push({ type: 'audio', url: candidate, index: i });
            foundInThisIndex = true;
            break;
          }
        }
        if (foundInThisIndex) break;
      }

      if (!foundInThisIndex) break;
    }

    if (!rawItems.some((item) => item.type === 'text') && poi?.description) {
      rawItems.unshift({ type: 'text', content: poi.description, index: 0 });
    }

    const blocks = [];
    let currentGallery = [];

    rawItems.forEach((item) => {
      if (item.type === 'image') {
        currentGallery.push(item.url);
      } else {
        if (currentGallery.length > 0) {
          blocks.push({ type: 'gallery', items: [...currentGallery] });
          currentGallery = [];
        }
        blocks.push(item);
      }
    });

    if (currentGallery.length > 0) {
      blocks.push({ type: 'gallery', items: [...currentGallery] });
    }

    setOrderedBlocks(blocks);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) { }
      sourceNodeRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const toggleWebAudio = async (audioUrl) => {
    if (isPlayingAudio && currentAudioUrlRef.current === audioUrl) {
      stopAudio();
      return;
    }

    try {
      setIsLoadingAudio(true);

      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      stopAudio();

      if (currentAudioUrlRef.current !== audioUrl || !audioBufferRef.current) {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('No se pudo descargar el archivo de audio');
        const arrayBuffer = await response.arrayBuffer();
        audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
        currentAudioUrlRef.current = audioUrl;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(ctx.destination);

      source.onended = () => {
        setIsPlayingAudio(false);
      };

      sourceNodeRef.current = source;
      source.start(0);
      setIsPlayingAudio(true);

    } catch (err) {
      console.error('Error decodificando audio:', err);
      alert('No se pudo decodificar el archivo de audio.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleOpenVisitedStation = (id) => {
    if (typeof onNavigate === 'function') {
      onNavigate(`estaciones?id=${id}`);
    }
  };

  const handleFinishRoute = () => {
    // Aquí puedes registrar el evento/enviar métricas en el futuro
    if (typeof onNavigate === 'function') {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  // Cálculo de progreso global para saber si completó el recorrido
  const selectedPoiIds = getUserSelectedPoiIds();
  const targetStations = selectedPoiIds
    ? allStations.filter((st) => selectedPoiIds.includes(st.poiId))
    : allStations;

  const currentVisitedList = getValidVisitedStations();
  const visitedIds = currentVisitedList.map((v) => v.id);
  const isRouteFinished = targetStations.length > 0 && targetStations.every((st) => visitedIds.includes(st.id));

  // --- VISTA GENERAL (PROGRESO DEL RECORRIDO) ---
  if (!activeStationId) {
    const pendingStations = targetStations.filter((st) => !visitedIds.includes(st.id));
    const visitedInRoute = targetStations.filter((st) => visitedIds.includes(st.id));

    return (
      <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-start p-6 font-sans pt-10 pb-28 max-w-md mx-auto relative">
        <div className="w-14 h-14 bg-rose-100 text-[#e63946] rounded-full flex items-center justify-center mb-3 shadow-sm">
          <span className="material-symbols-outlined text-2xl">map</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Tu Progreso del Recorrido</h2>
        <p className="text-xs text-gray-500 max-w-xs mb-6 text-center">
          Escanea un código QR en cada punto para desbloquear la guía interactiva.
        </p>

        <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-around">
          <div className="text-center">
            <span className="text-2xl font-black text-[#4ea8de]">{visitedInRoute.length}</span>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Vistas</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-100"></div>
          <div className="text-center">
            <span className="text-2xl font-black text-[#e63946]">{pendingStations.length}</span>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Faltantes</p>
          </div>
          <div className="h-8 w-[1px] bg-gray-100"></div>
          <div className="text-center">
            <span className="text-2xl font-black text-gray-700">{targetStations.length}</span>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">En Ruta</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('camara')}
          className="w-full bg-[#e63946] text-white text-sm font-bold py-3.5 px-6 rounded-full shadow-lg hover:bg-[#db313f] transition-all cursor-pointer flex items-center justify-center gap-2 mb-8"
        >
          <span className="material-symbols-outlined text-base">photo_camera</span>
          Escanear Estación
        </button>

        {pendingStations.length > 0 && (
          <div className="w-full text-left mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#e63946]">pending_actions</span>
              Estaciones Pendientes por Visitar
            </h3>
            <div className="flex flex-col gap-2">
              {pendingStations.map((st) => {
                const parentPoi = allPois.find((p) => p.id === st.poiId);
                return (
                  <div
                    key={st.id}
                    className="w-full bg-gray-50 border border-gray-200/80 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#e63946] flex items-center justify-center font-bold text-xs">
                        {st.numeroConsecutivo}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{st.title}</p>
                        <span className="text-[10px] text-gray-400">
                          {parentPoi?.name || 'Ubicación'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Pendiente
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {visitedInRoute.length > 0 && (
          <div className="w-full text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#4ea8de]">task_alt</span>
              Estaciones Visitadas (Últimas 24h)
            </h3>
            <div className="flex flex-col gap-2">
              {visitedInRoute.map((st) => {
                const visitedInfo = visitedIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => handleOpenVisitedStation(st.id)}
                    className="w-full bg-white border border-gray-200 hover:border-[#4ea8de] p-3 rounded-xl flex items-center justify-between text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4ea8de]/10 text-[#4ea8de] flex items-center justify-center font-bold text-xs">
                        {st.numeroConsecutivo}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#4ea8de] transition-colors">
                          {st.title}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-semibold">Completado</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-[#4ea8de] text-sm">
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Botón flotante al haber completado la ruta en la vista general */}
        {isRouteFinished && (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#fcfdfd] via-[#fcfdfd]/90 to-transparent z-40">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleFinishRoute}
                className="w-full py-4 rounded-full bg-[#e63946] text-white font-bold text-sm shadow-lg hover:bg-[#db313f] transition-all flex items-center justify-center gap-2 transform active:scale-95 duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined">flag</span>
                TERMINAR RECORRIDO
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#e63946]">
            progress_activity
          </span>
          <p className="text-sm font-semibold text-[#767775]">Cargando información de la estación...</p>
        </div>
      </div>
    );
  }

  const title = stationData?.title || poiData?.name || `Estación ${activeStationId}`;

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-sans antialiased min-h-screen pb-28 relative">

      {/* MODAL FLOTANTE DE ADVERTENCIA (DESVÍO DE RUTA) */}
      {showDeviationModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 transition-opacity duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4ea8de]/10 text-[#4ea8de] mb-4 mx-auto">
              <span className="material-symbols-outlined text-3xl">location_off</span>
            </div>
            <h3 className="font-bold text-xl text-center text-[#767775] mb-2">Desvío de Ruta</h3>
            <p className="text-sm text-[#767775] text-center mb-8 leading-relaxed">
              📍 Esta estación no está en tu ruta actual. ¿Deseas explorarla de todos modos o volver a tu ruta original?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBack}
                className="w-full py-3.5 px-6 rounded-full bg-[#e63946] text-white font-bold text-sm hover:bg-[#db313f] transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                Volver a mi ruta
              </button>
              <button
                onClick={() => setShowDeviationModal(false)}
                className="w-full py-3.5 px-6 rounded-full bg-gray-100 text-[#767775] font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95 cursor-pointer"
              >
                Explorar estación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#fcfdfd]/90 backdrop-blur-md border-b border-[#1a1c1a]/10 h-16 flex items-center justify-between px-4">
        <button
          onClick={handleBack}
          aria-label="Volver al mapa"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-[#e63946] cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="flex-1 px-4 flex flex-col items-center">
          <span className="text-xs font-semibold text-[#4ea8de] uppercase tracking-wider mb-1">
            Estación {currentIndex} de {totalStations}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#4ea8de] h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / totalStations) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="w-10"></div>
      </header>

      {/* CONTENIDO PRINCIPAL DE LA ESTACIÓN */}
      <main className="pt-20 pb-8 md:max-w-3xl md:mx-auto">
        <div className="px-4 mb-6">
          <h1 className="text-[28px] leading-[34px] font-bold text-[#e63946] -tracking-[0.01em]">
            {title}
          </h1>
        </div>

        {orderedBlocks.map((block, idx) => {


          if (block.type === 'text') {
            // Separamos el contenido por líneas
            const lines = block.content.split('\n');

            return (
              <div key={`text-${idx}`} className="px-4 mb-6 space-y-3">
                {lines.map((line, lineIdx) => {
                  const trimmedLine = line.trim();

                  // Si la línea comienza con # (ejemplo: "# Mi Título")
                  if (trimmedLine.startsWith('#')) {
                    const titleText = trimmedLine.replace(/^#+\s*/, ''); // Extrae el símbolo # y los espacios iniciales

                    return (
                      <h1
                        key={lineIdx}
                        className="text-[28px] leading-[34px] font-bold text-[#e63946] -tracking-[0.01em] my-2"
                      >
                        {titleText}
                      </h1>
                    );
                  }

                  // Si es una línea vacía, mantenemos el espacio visual
                  if (!trimmedLine) {
                    return <div key={lineIdx} className="h-2" />;
                  }

                  // El resto del texto normal
                  return (
                    <p
                      key={lineIdx}
                      className="text-base leading-6 text-[#767775] font-normal"
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            );
          }

          if (block.type === 'gallery') {
            const isSingle = block.items.length === 1;
            return (
              <div key={`gallery-${idx}`} className="px-4 mb-8">
                <div className={isSingle ? "w-full" : "grid grid-cols-2 gap-3"}>
                  {block.items.map((imgSrc, imgIdx) => {
                    // Alterna esquinas según si el índice es par o impar
                    const organicCorners = imgIdx % 2 === 0
                      ? 'rounded-tl-3xl rounded-br-3xl' // Arriba-Izquierda e Inferior-Derecha
                      : 'rounded-tr-3xl rounded-bl-3xl'; // Arriba-Derecha e Inferior-Izquierda

                    return (
                      <div
                        key={imgIdx}
                        className={`${isSingle ? 'w-full aspect-video' : 'aspect-square'
                          } ${organicCorners} overflow-hidden shadow-sm transition-transform duration-300 hover:scale-[1.02]`}
                      >
                        <img
                          className="w-full h-full object-cover"
                          alt={`Recurso ${imgIdx + 1}`}
                          src={imgSrc}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (block.type === 'video') {
            return (
              <div key={`video-${idx}`} className="px-4 mb-8">
                <VideoPlayer src={block.url} poster={block.poster} />
              </div>
            );
          }

          if (block.type === 'audio') {
            return (
              <div key={`audio-${idx}`} className="px-4 mb-8">
                <AudioPlayer src={block.url} title="Escucha la Guía" />
              </div>
            );
          }

          return null;
        })}
      </main>

      {/* FOOTER FLOTANTE */}
      <div className="fixed bottom-16 left-0 w-full bg-[#fcfdfd]/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 flex justify-center">
        {/*isRouteFinished*/ true &&
        <button
            onClick={handleFinishRoute}
            className="w-full max-w-sm bg-[#e63946] text-white text-sm font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-[#db313f] transition-all cursor-pointer transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base">flag</span>
            TERMINAR RECORRIDO
          </button>
        }
      </div>
    </div>
  );
}