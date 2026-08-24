import React, { useState, useEffect } from 'react';

const CACHE_KEY = 'visited_stations_cache';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
      return false; // Evita el fallback a index.html en Vite
    }

    if (expectedType === 'image') {
      return contentType.includes('image') || /\.(jpg|jpeg|png|webp|svg)$/i.test(url);
    }
    if (expectedType === 'audio') {
      return contentType.includes('audio') || /\.(mp3|wav|ogg)$/i.test(url);
    }
    if (expectedType === 'video') {
      return contentType.includes('video') || /\.(mp4|webm)$/i.test(url);
    }

    return true;
  } catch {
    return false;
  }
};

export default function EstacionesView({ onNextStation, onNavigate }) {
  const [activeStationId, setActiveStationId] = useState(() => {
    return new URLSearchParams(window.location.search).get('id');
  });

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState(null);
  const [poiData, setPoiData] = useState(null);
  const [totalStations, setTotalStations] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [visitedStations, setVisitedStations] = useState([]);
  const [orderedBlocks, setOrderedBlocks] = useState([]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

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
    if (!activeStationId) {
      setLoading(false);
      return;
    }

    async function loadStationInfo() {
      try {
        setLoading(true);

        const res = await fetch('/data/parkData.json');
        const parkData = await res.json();

        let foundStation = parkData.STATIONS?.find((s) => s.id === activeStationId);
        let foundPoi = null;

        if (foundStation) {
          foundPoi = parkData.POIS?.find((p) => p.id === foundStation.poiId);
        } else {
          foundPoi = parkData.POIS?.find((p) => p.id === activeStationId);
          foundStation = parkData.STATIONS?.find((s) => s.poiId === activeStationId) || {
            id: activeStationId,
            numeroConsecutivo: 1,
            poiId: foundPoi?.id,
            title: foundPoi?.name || 'Estación',
            contentFolderPath: `estaciones/${activeStationId}/`
          };
        }

        const selectables = parkData.POIS?.filter((p) => p.selectable) || [];
        const total = parkData.STATIONS?.length || selectables.length || 1;
        const currentNum = foundStation?.numeroConsecutivo || 1;
        const resolvedTitle = foundStation?.title || foundPoi?.name || `Estación ${activeStationId}`;

        setTotalStations(total);
        setCurrentIndex(currentNum);
        setStationData(foundStation);
        setPoiData(foundPoi);

        saveStationToCache(activeStationId, resolvedTitle);

        let folderPath = foundStation?.contentFolderPath || `/estaciones/${activeStationId}/`;
        folderPath = folderPath.replace(/^public\//, '/');
        if (!folderPath.startsWith('/')) folderPath = '/' + folderPath;
        if (!folderPath.endsWith('/')) folderPath += '/';

        await scanAndBuildSequentialContent(folderPath, foundPoi);

      } catch (err) {
        console.error('Error cargando información de la estación:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStationInfo();
  }, [activeStationId]);

  const scanAndBuildSequentialContent = async (folderPath, poi) => {
    const imgExts = ['jpg', 'jpeg', 'png', 'webp'];
    const videoExts = ['mp4', 'webm'];
    const audioExts = ['mp3', 'wav', 'ogg'];
    const textExts = ['txt'];

    const rawItems = [];

    for (let i = 1; i <= 20; i++) {
      let foundInThisIndex = false;

      // Check Texto primero o paralelo
      for (const ext of textExts) {
        const candidate = `${folderPath}${i}_texto.${ext}`;
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
        } catch (e) {}
      }
      if (foundInThisIndex) continue;

      // Check Imagen
      for (const ext of imgExts) {
        const candidate = `${folderPath}${i}_imagen.${ext}`;
        if (await checkResourceExists(candidate, 'image')) {
          rawItems.push({ type: 'image', url: candidate, index: i });
          foundInThisIndex = true;
          break;
        }
      }
      if (foundInThisIndex) continue;

      // Check Video
      for (const ext of videoExts) {
        const candidate = `${folderPath}${i}_video.${ext}`;
        if (await checkResourceExists(candidate, 'video')) {
          rawItems.push({ type: 'video', url: candidate, index: i });
          foundInThisIndex = true;
          break;
        }
      }
      if (foundInThisIndex) continue;

      // Check Audio
      for (const ext of audioExts) {
        const candidate = `${folderPath}${i}_audio.${ext}`;
        if (await checkResourceExists(candidate, 'audio')) {
          rawItems.push({ type: 'audio', url: candidate, index: i });
          foundInThisIndex = true;
          break;
        }
      }

      // Detener si en el índice actual no existe ningún archivo con el prefijo i_
      if (!foundInThisIndex) break;
    }

    if (!rawItems.some((item) => item.type === 'text') && poi?.description) {
      rawItems.unshift({ type: 'text', content: poi.description, index: 0 });
    }

    // Agrupar imágenes consecutivas en bloques de galería
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

  const toggleAudio = () => {
    if (!audioRef) return;
    if (isPlayingAudio) {
      audioRef.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.play();
      setIsPlayingAudio(true);
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

  if (!activeStationId) {
    return (
      <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-start p-6 text-center font-sans pt-12">
        <div className="w-16 h-16 bg-rose-100 text-[#e63946] rounded-full flex items-center justify-center mb-4 shadow-sm">
          <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Estación No Especificada</h2>
        <p className="text-sm text-gray-500 max-w-xs mb-6">
          Por favor, escanea un código QR o aproxima un tag NFC para cargar la información de una estación.
        </p>

        <button
          onClick={() => onNavigate && onNavigate('camara')}
          className="bg-[#e63946] text-white text-sm font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#db313f] transition-all cursor-pointer flex items-center gap-2 mb-8"
        >
          <span className="material-symbols-outlined text-base">photo_camera</span>
          Ir al Escáner
        </button>

        {visitedStations.length > 0 && (
          <div className="w-full max-w-sm text-left border-t border-gray-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#767775] mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#4ea8de]">history</span>
              Estaciones Vistas (Últimas 24h)
            </h3>
            <div className="flex flex-col gap-2">
              {visitedStations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleOpenVisitedStation(st.id)}
                  className="w-full bg-white border border-gray-200 hover:border-[#4ea8de] p-3 rounded-xl flex items-center justify-between text-left transition-all shadow-sm hover:shadow-md cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4ea8de]/10 text-[#4ea8de] flex items-center justify-center font-bold text-xs">
                      {st.id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#4ea8de] transition-colors">
                        {st.title}
                      </p>
                      <span className="text-[10px] text-gray-400">Guardado en caché</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-[#4ea8de] text-sm">
                    chevron_right
                  </span>
                </button>
              ))}
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
  const zoneName = poiData?.zone || 'Zona del Parque';
  const icon = poiData?.icon || 'location_on';

  return (
    <div className="bg-[#fcfdfd] text-[#767775] font-sans antialiased min-h-screen pb-24">
      <header className="fixed top-0 w-full z-50 bg-[#fcfdfd]/90 backdrop-blur-md border-b border-[#1a1c1a]/10 h-16 flex items-center justify-between px-4">
        <button
          onClick={handleBack}
          aria-label="Volver al mapa"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#e2e3df]/20 transition-colors text-[#e63946] cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="flex-1 px-4 flex flex-col items-center">
          <span className="text-xs font-semibold text-[#767775] mb-1 uppercase tracking-widest">
            Estación {currentIndex} de {totalStations}
          </span>
          <div className="w-full bg-[#e2e3df] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#4ea8de] h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / totalStations) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="w-10"></div>
      </header>

      <main className="pt-20 pb-8 md:max-w-3xl md:mx-auto">
        <div className="px-4 mb-6">
          <h1 className="text-[28px] leading-[34px] font-bold text-[#e63946] -tracking-[0.01em]">
            {title}
          </h1>
        </div>

        {orderedBlocks.map((block, idx) => {
          if (block.type === 'text') {
            return (
              <div key={`text-${idx}`} className="px-4 mb-6">
                <p className="text-base leading-6 text-[#767775] font-normal whitespace-pre-line">
                  {block.content}
                </p>
              </div>
            );
          }

          if (block.type === 'gallery') {
            const isSingle = block.items.length === 1;
            return (
              <div key={`gallery-${idx}`} className="px-4 mb-8">
                <div className={isSingle ? "w-full" : "grid grid-cols-2 gap-3"}>
                  {block.items.map((imgSrc, imgIdx) => (
                    <div
                      key={imgIdx}
                      className={`${
                        isSingle ? 'w-full aspect-video' : 'aspect-square'
                      } rounded-xl overflow-hidden border border-[#767775]/10 bg-gray-100 shadow-sm`}
                    >
                      <img
                        className="w-full h-full object-cover"
                        alt={`Recurso ${imgIdx + 1}`}
                        src={imgSrc}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (block.type === 'video') {
            return (
              <div key={`video-${idx}`} className="px-4 mb-8">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-[#767775]/10 bg-black">
                  <video src={block.url} controls className="w-full h-full object-cover" />
                </div>
              </div>
            );
          }

          if (block.type === 'audio') {
            return (
              <div key={`audio-${idx}`} className="px-4 mb-8">
                <h2 className="text-xl font-semibold text-[#e63946] mb-3">Escucha la Guía</h2>
                <audio
                  ref={(ref) => setAudioRef(ref)}
                  src={block.url}
                  onEnded={() => setIsPlayingAudio(false)}
                />
                <div className="bg-white border border-[#767775]/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <button
                    onClick={toggleAudio}
                    className="w-12 h-12 bg-[#4ea8de] text-[#fcfdfd] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#70c7ff] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">
                      {isPlayingAudio ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#4ea8de]">
                      {isPlayingAudio ? 'Reproduciendo audio...' : 'Audio Guía disponible'}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </main>

      <div className="fixed bottom-0 w-full bg-[#fcfdfd]/95 backdrop-blur-md border-t border-[#767775]/5 p-4 z-50 flex justify-center">
        <button
          onClick={onNextStation}
          className="w-full max-w-sm bg-[#e63946] text-white text-sm font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-[#db313f] transition-all cursor-pointer"
        >
          Siguiente Estación
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}