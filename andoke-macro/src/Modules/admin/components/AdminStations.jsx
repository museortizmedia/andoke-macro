import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export const AdminStations = () => {
  const { logout } = useAuth();

  // Handles nativos de File System Access API
  const [fileHandle, setFileHandle] = useState(null); // parkData.json
  const [dirHandle, setDirHandle] = useState(null);   // Carpeta raíz public/
  const [hasPermission, setHasPermission] = useState(false);

  // Estado global de parkData
  const [parkData, setParkData] = useState({ POIS: [], STATIONS: [], PREDEFINED_ROUTES: [] });
  const [loading, setLoading] = useState(false);

  // Navegación
  const [tabActiva, setTabActiva] = useState('puntos'); // 'puntos' | 'estaciones'

  // Modales
  const [showModalEstacion, setShowModalEstacion] = useState(false);
  const [showModalPunto, setShowModalPunto] = useState(false);

  // Estado de Edición
  const [estacionActual, setEstacionActual] = useState(null);
  const [puntoActual, setPuntoActual] = useState(null);

  // Archivos dinámicos de la estación seleccionada
  const [archivosEstacion, setArchivosEstacion] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);

  // ==========================================
  // HELPERS NATIVOS PARA PERSISTENCIA (INDEXEDDB)
  // ==========================================
  const initIDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ParkDataAppDB', 2);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  };

  const saveHandleToIDB = async (key, handle) => {
    const db = await initIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      const request = store.put(handle, key);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  };

  const getHandleFromIDB = async (key) => {
    const db = await initIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const request = store.get(key);
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  };

  const removeHandleFromIDB = async (key) => {
    const db = await initIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  };

  // Inyección de fuentes e íconos de Google
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

  // Recargar handles guardados en sesión anterior
  useEffect(() => {
    const autoLoadSavedHandles = async () => {
      try {
        const savedFileHandle = await getHandleFromIDB('parkDataHandle');
        const savedDirHandle = await getHandleFromIDB('publicDirHandle');

        if (savedFileHandle) {
          let permFile = await savedFileHandle.queryPermission({ mode: 'readwrite' });
          if (permFile === 'prompt') permFile = await savedFileHandle.requestPermission({ mode: 'readwrite' });
          if (permFile === 'granted') {
            setFileHandle(savedFileHandle);
            await cargarDatosDesdeHandle(savedFileHandle);
            setHasPermission(true);
          }
        }

        if (savedDirHandle) {
          let permDir = await savedDirHandle.queryPermission({ mode: 'readwrite' });
          if (permDir === 'prompt') permDir = await savedDirHandle.requestPermission({ mode: 'readwrite' });
          if (permDir === 'granted') {
            setDirHandle(savedDirHandle);
          }
        }
      } catch (err) {
        console.warn('Error al restaurar handles de IndexedDB:', err);
      }
    };

    autoLoadSavedHandles();
  }, []);

  // --- SELECCIONAR Y LEER parkData.json ---
  const handleSeleccionarArchivo = async () => {
    try {
      if (!('showOpenFilePicker' in window)) {
        alert('Tu navegador no soporta File System Access API. Usa Google Chrome o Microsoft Edge.');
        return;
      }

      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Archivo JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });

      if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
        setFileHandle(handle);
        setHasPermission(true);
        await saveHandleToIDB('parkDataHandle', handle);
        await cargarDatosDesdeHandle(handle);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error al seleccionar archivo JSON:', err);
    }
  };

  // --- SELECCIONAR CARPETA PÚBLICA (public/) ---
  const handleSeleccionarCarpeta = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Tu navegador no soporta selección de carpetas nativa.');
        return;
      }

      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
        setDirHandle(handle);
        await saveHandleToIDB('publicDirHandle', handle);
        alert(`Carpeta "${handle.name}" vinculada con éxito.`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error al seleccionar carpeta:', err);
    }
  };

  const cargarDatosDesdeHandle = async (handle) => {
    setLoading(true);
    try {
      const file = await handle.getFile();
      const content = await file.text();
      const data = JSON.parse(content);

      setParkData({
        POIS: data.POIS || [],
        STATIONS: data.STATIONS || data.estaciones || [],
        PREDEFINED_ROUTES: data.PREDEFINED_ROUTES || []
      });
    } catch (err) {
      console.error('Error al leer el archivo JSON:', err);
      alert('El archivo no contiene un JSON válido.');
    } finally {
      setLoading(false);
    }
  };

  const updateAndSaveParkData = async (newDataOrUpdater) => {
    setParkData((prev) => {
      const updatedData = typeof newDataOrUpdater === 'function' ? newDataOrUpdater(prev) : newDataOrUpdater;

      if (fileHandle && hasPermission) {
        (async () => {
          try {
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(updatedData, null, 2));
            await writable.close();
          } catch (err) {
            console.error('Error al guardar en JSON:', err);
          }
        })();
      }

      return updatedData;
    });
  };

  const handleQuitarArchivo = async () => {
    if (confirm('¿Desvincular el archivo JSON y la carpeta de recursos?')) {
      await removeHandleFromIDB('parkDataHandle');
      await removeHandleFromIDB('publicDirHandle');
      setFileHandle(null);
      setDirHandle(null);
      setHasPermission(false);
      setParkData({ POIS: [], STATIONS: [], PREDEFINED_ROUTES: [] });
    }
  };

  // ==========================================
  // LÓGICA DE GESTIÓN DE ARCHIVOS CON PREFIJOS
  // ==========================================
  const getStationDirHandle = async (stationId) => {
    if (!dirHandle) return null;
    try {
      let estacionesFolder;
      try {
        estacionesFolder = await dirHandle.getDirectoryHandle('estaciones', { create: true });
      } catch (e) {
        estacionesFolder = dirHandle;
      }
      return await estacionesFolder.getDirectoryHandle(stationId, { create: true });
    } catch (err) {
      console.error(`Error al acceder a la carpeta de la estación ${stationId}:`, err);
      return null;
    }
  };

  const listarArchivosEstacion = async (stationId) => {
    setCargandoArchivos(true);
    setArchivosEstacion([]);
    try {
      const stationDir = await getStationDirHandle(stationId);
      if (!stationDir) return;

      const archivos = [];
      for await (const entry of stationDir.values()) {
        if (entry.kind === 'file') {
          archivos.push(entry.name);
        }
      }
      // Ordenar alfabética/numéricamente
      archivos.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
      setArchivosEstacion(archivos);
    } catch (err) {
      console.error('Error al listar archivos:', err);
    } finally {
      setCargandoArchivos(false);
    }
  };

  const handleSubirRecursoGenerico = async (file, tipoBase) => {
    if (!file || !dirHandle || !estacionActual) {
      alert('Debes seleccionar un archivo y tener la carpeta raíz vinculada.');
      return;
    }

    try {
      const stationDir = await getStationDirHandle(estacionActual.id);
      if (!stationDir) throw new Error('No se pudo acceder a la carpeta de la estación.');

      const ext = file.name.split('.').pop().toLowerCase();

      // 1. Obtener TODOS los archivos existentes en la carpeta de la estación
      const existentes = [];
      for await (const entry of stationDir.values()) {
        if (entry.kind === 'file') {
          existentes.push(entry.name);
        }
      }

      // 2. Buscar el mayor número de prefijo global (coincida con cualquier tipo: X_imagen, X_texto, X_audio, etc.)
      let maxNum = 0;
      const regexGlobal = /^(\d+)_[a-zA-Z0-9]+\./i;

      existentes.forEach((nombre) => {
        const match = nombre.match(regexGlobal);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });

      // 3. Generar el nuevo prefijo secuencial único
      const nuevoPrefijo = maxNum + 1;
      const nombreFinal = `${nuevoPrefijo}_${tipoBase}.${ext}`;

      // 4. Guardar el archivo directamente en disco
      const fileTargetHandle = await stationDir.getFileHandle(nombreFinal, { create: true });
      const writable = await fileTargetHandle.createWritable();
      await writable.write(file);
      await writable.close();

      alert(`Archivo guardado exitosamente como: ${nombreFinal}`);
      await listarArchivosEstacion(estacionActual.id);
    } catch (err) {
      console.error('Error al guardar archivo:', err);
      alert('Ocurrió un error al intentar escribir el archivo en el disco.');
    }
  };

  const handleEliminarArchivoLocal = async (nombreArchivo) => {
    if (!confirm(`¿Eliminar ${nombreArchivo} del disco duro?`)) return;

    try {
      const stationDir = await getStationDirHandle(estacionActual.id);
      if (stationDir) {
        await stationDir.removeEntry(nombreArchivo);
        await listarArchivosEstacion(estacionActual.id);
      }
    } catch (err) {
      console.error('Error eliminando archivo:', err);
      alert('No se pudo eliminar el archivo.');
    }
  };

  // --- HANDLERS PUNTOS Y ESTACIONES ---
  const handleNuevoPunto = () => {
    setPuntoActual({
      id: '',
      name: '',
      duration: 15,
      zone: '',
      description: '',
      selectable: true,
      icon: 'place',
      mapCoords: { top: '50%', left: '50%' }
    });
    setShowModalPunto(true);
  };

  const handleGuardarPunto = (e) => {
    e.preventDefault();
    if (!puntoActual.id) return alert('El ID del POI es obligatorio');

    const formattedPoi = {
      ...puntoActual,
      id: puntoActual.id.toLowerCase().trim().replace(/\s+/g, '_'),
      duration: Number(puntoActual.duration) || 0
    };

    updateAndSaveParkData((prev) => {
      const idx = prev.POIS.findIndex((p) => p.id === formattedPoi.id);
      let updatedPois = [...prev.POIS];
      if (idx >= 0) updatedPois[idx] = formattedPoi;
      else updatedPois.push(formattedPoi);
      return { ...prev, POIS: updatedPois };
    });

    setShowModalPunto(false);
  };

  const handleEliminarPunto = (id) => {
    if (confirm(`¿Deseas eliminar el POI "${id}"?`)) {
      updateAndSaveParkData((prev) => ({
        ...prev,
        POIS: prev.POIS.filter((p) => p.id !== id)
      }));
    }
  };

  const handleNuevaEstacion = () => {
    const nextNum = (parkData.STATIONS?.length || 0) + 1;
    const nextId = `EST-${String(nextNum).padStart(3, '0')}`;

    const nuevaEst = {
      id: nextId,
      numeroConsecutivo: nextNum,
      poiId: parkData.POIS[0]?.id || '',
      title: '',
      estado: 'activa',
      contentFolderPath: `public/estaciones/${nextId}/`
    };

    setEstacionActual(nuevaEst);
    setShowModalEstacion(true);
    listarArchivosEstacion(nextId);
  };

  const handleAbrirEditarEstacion = (estacion) => {
    setEstacionActual(estacion);
    setShowModalEstacion(true);
    listarArchivosEstacion(estacion.id);
  };

  const handleGuardarEstacion = (e) => {
    e.preventDefault();
    if (!estacionActual.poiId) return alert('Debes seleccionar un POI.');

    updateAndSaveParkData((prev) => {
      const idx = prev.STATIONS.findIndex((s) => s.id === estacionActual.id);
      let updated = [...prev.STATIONS];
      if (idx >= 0) updated[idx] = estacionActual;
      else updated.push(estacionActual);
      return { ...prev, STATIONS: updated };
    });
    setShowModalEstacion(false);
  };

  const handleEliminarEstacion = (id) => {
    if (confirm(`¿Deseas eliminar la estación ${id}?`)) {
      updateAndSaveParkData((prev) => ({
        ...prev,
        STATIONS: prev.STATIONS.filter((s) => s.id !== id)
      }));
    }
  };

  return (
    <div className="bg-[#faf9f7] text-[#1a1c1b] font-['Manrope',sans-serif] min-h-screen w-full flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex flex-col h-screen py-12 w-64 flex-shrink-0 bg-[rgba(82,183,136,0.1)] border-r border-[#e4bebc] sticky top-0">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-extrabold text-[#006590]">Andoke Admin</h1>
        </div>

        <ul className="flex flex-col gap-2 pr-4 mb-auto">
          <li>
            <button
              onClick={() => setTabActiva('puntos')}
              className={`w-full flex items-center gap-4 py-2 ${tabActiva === 'puntos' ? 'bg-[#ffdad8] text-[#410007] font-bold' : 'text-[#767775] hover:bg-[#e8e8e6]'
                } rounded-r-full pl-4 transition-all`}
            >
              <span className="material-symbols-outlined">place</span>
              <span>Puntos de Visita</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setTabActiva('estaciones')}
              className={`w-full flex items-center gap-4 py-2 ${tabActiva === 'estaciones' ? 'bg-[#ffdad8] text-[#410007] font-bold' : 'text-[#767775] hover:bg-[#e8e8e6]'
                } rounded-r-full pl-4 transition-all`}
            >
              <span className="material-symbols-outlined">hub</span>
              <span>Estaciones</span>
            </button>
          </li>
        </ul>

        <div className="px-4 space-y-3">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-[#e3e2e0] text-[#1a1c1a] py-2 rounded-full font-bold text-xs hover:bg-[#dadad7] transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Salir
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* HEADER CON CONTROLES NATIVOS */}
        <header className="bg-white border-b border-[#e8e8e6] px-6 py-4 sticky top-0 z-40 flex flex-wrap justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#006590]">folder_managed</span>
            <div>
              <h2 className="text-sm font-bold text-[#1a1c1b]">Sincronizador Local</h2>
              <p className="text-[11px] text-[#767775]">
                {fileHandle ? `JSON: ${fileHandle.name}` : 'Sin JSON'} |{' '}
                {dirHandle ? `Carpeta: ${dirHandle.name}` : 'Carpeta no vinculada'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSeleccionarArchivo}
              className="bg-[#006590] hover:bg-[#004e70] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              {fileHandle ? 'Cambiar JSON' : 'Vincular parkData.json'}
            </button>

            <button
              onClick={handleSeleccionarCarpeta}
              className={`${dirHandle ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-600 hover:bg-amber-700'
                } text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors`}
            >
              <span className="material-symbols-outlined text-sm">folder_open</span>
              {dirHandle ? 'Carpeta Conectada' : 'Vincular Carpeta dist/'}
            </button>

            {hasPermission && (
              <button
                onClick={handleQuitarArchivo}
                className="bg-[#ffdad8] text-[#b7102a] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Desvincular
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12">
          {!hasPermission ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
              <span className="material-symbols-outlined text-6xl text-[#006590] mb-4">folder_managed</span>
              <h3 className="text-xl font-bold text-[#1a1c1b] mb-2">Vincular Archivos Locales</h3>
              <p className="text-xs text-[#767775] mb-6">
                Selecciona tu archivo <code>parkData.json</code> y tu carpeta raíz <code>public/</code> para editar el mapa y subir archivos con prefijos numéricos directamente a disco.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSeleccionarArchivo}
                  className="bg-[#e63946] hover:bg-[#b7102a] text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 text-xs"
                >
                  <span className="material-symbols-outlined text-sm">file_open</span> Cargar parkData.json
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20 text-[#006590] font-bold">Cargando...</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* TAB 1: PUNTOS DE VISITA */}
              {tabActiva === 'puntos' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-[#b7102a]">Puntos de Visita (POIs)</h2>
                      <p className="text-[#767775] text-xs mt-1">Atracciones e hitos del mapa</p>
                    </div>
                    <button
                      onClick={handleNuevoPunto}
                      className="bg-[#e63946] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#b7102a]"
                    >
                      <span className="material-symbols-outlined">add</span> Nuevo Punto
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow border border-[#e8e8e6] overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#f4f4f1] border-b border-[#e8e8e6] text-[#767775] text-xs">
                          <th className="p-4">Ícono / ID</th>
                          <th className="p-4">Nombre</th>
                          <th className="p-4">Zona</th>
                          <th className="p-4">Duración</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parkData.POIS.map((punto) => (
                          <tr key={punto.id} className="border-b border-[#e8e8e6] text-sm">
                            <td className="p-4 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#006590]">
                                {punto.icon || 'place'}
                              </span>
                              <span className="font-mono text-xs text-gray-500">{punto.id}</span>
                            </td>
                            <td className="p-4 font-bold text-[#1a1c1a]">{punto.name}</td>
                            <td className="p-4 text-xs text-gray-600">{punto.zone || '-'}</td>
                            <td className="p-4 text-xs">{punto.duration} min</td>
                            <td className="p-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setPuntoActual(punto);
                                  setShowModalPunto(true);
                                }}
                                className="p-2 bg-[#eeeeeb] hover:bg-[#e3e2e0] rounded-lg text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleEliminarPunto(punto.id)}
                                className="p-2 bg-[#ffdad8] text-[#b7102a] rounded-lg text-xs"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ESTACIONES */}
              {tabActiva === 'estaciones' && (
                <div>
                  <div className="flex justify-between items-center mb-12">
                    <div>
                      <h2 className="text-3xl font-bold text-[#b7102a]">Estaciones del Parque</h2>
                      <p className="text-[#767775] mt-1">
                        Puntos NFC/QR. Los recursos se renombra e insertan con prefijo numérico.
                      </p>
                    </div>
                    <button
                      onClick={handleNuevaEstacion}
                      className="bg-[#e63946] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#b7102a]"
                    >
                      <span className="material-symbols-outlined">add</span> Nueva Estación
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {parkData.STATIONS.map((estacion) => {
  const poiAsociado = parkData.POIS.find((p) => p.id === estacion.poiId);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(estacion.id)}`;

  return (
    <div
      key={estacion.id}
      className="bg-white rounded-xl shadow border border-[#e8e8e6] flex flex-col overflow-hidden"
    >
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">
            Consecutivo #{estacion.numeroConsecutivo}
          </span>
          <h4 className="font-mono text-xl font-bold">{estacion.id}</h4>
        </div>
        <span className="material-symbols-outlined text-slate-400">sensors</span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#b7102a] mb-1">
              {estacion.title || 'Sin Título'}
            </h3>
            <p className="text-xs text-[#767775]">
              POI: <span className="font-semibold text-slate-800">{poiAsociado?.name || 'N/A'}</span>
            </p>
          </div>

          {/* Renderizado del Código QR */}
          <div className="flex flex-col items-center flex-shrink-0 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <img
              src={qrUrl}
              alt={`QR para ${estacion.id}`}
              className="w-16 h-16 object-contain"
              loading="lazy"
            />
            <a
              href={qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-[#006590] hover:underline font-bold mt-1"
            >
              Descargar
            </a>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-end gap-2 border-t">
          <button
            onClick={() => handleAbrirEditarEstacion(estacion)}
            className="bg-[#eeeeeb] hover:bg-[#e3e2e0] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span> Gestionar Recursos
          </button>
          <button
            onClick={() => handleEliminarEstacion(estacion.id)}
            className="bg-[#ffdad8] text-[#b7102a] font-bold text-xs p-2 rounded-lg"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
})}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL POI */}
      {showModalPunto && puntoActual && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <form onSubmit={handleGuardarPunto} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-[#b7102a]">Punto de Visita</h3>
            <div>
              <label className="text-xs font-bold text-[#767775]">ID Único</label>
              <input
                type="text"
                required
                disabled={parkData.POIS.some((p) => p.id === puntoActual.id)}
                className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                value={puntoActual.id}
                onChange={(e) => setPuntoActual({ ...puntoActual, id: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#767775]">Nombre</label>
              <input
                type="text"
                required
                className="w-full border p-2 rounded-lg text-sm"
                value={puntoActual.name || ''}
                onChange={(e) => setPuntoActual({ ...puntoActual, name: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button type="button" onClick={() => setShowModalPunto(false)} className="px-4 py-2 bg-[#eeeeeb] text-xs font-bold rounded-lg">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#e63946] text-white text-xs font-bold rounded-lg">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL GESTIÓN DE RECURSOS DE ESTACIÓN */}
      {showModalEstacion && estacionActual && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-[#b7102a]">Estación {estacionActual.id}</h3>
              <button onClick={() => setShowModalEstacion(false)} className="text-gray-400 hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarEstacion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#767775]">POI Perteneciente</label>
                  <select
                    required
                    className="w-full border p-2 rounded-lg text-sm mt-1"
                    value={estacionActual.poiId}
                    onChange={(e) => setEstacionActual({ ...estacionActual, poiId: e.target.value })}
                  >
                    <option value="">-- Seleccionar POI --</option>
                    {parkData.POIS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#767775]">Título</label>
                  <input
                    type="text"
                    required
                    className="w-full border p-2 rounded-lg text-sm mt-1"
                    value={estacionActual.title || ''}
                    onChange={(e) => setEstacionActual({ ...estacionActual, title: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="text-xs bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg">
                Actualizar Datos Básicos
              </button>
            </form>

            <hr />

            {/* SECCIÓN DE UPLOAD CON PREFIJOS */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#006590]">Subir Recursos a Disco (Prefijos Consecutivos)</h4>

              {!dirHandle && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                  Debes vincular la carpeta raíz en el menú superior para subir archivos directamente.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Botón Imagen */}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border p-3 rounded-lg flex flex-col items-center justify-center gap-1 text-center">
                  <span className="material-symbols-outlined text-emerald-600">image</span>
                  <span className="text-[11px] font-bold">Subir Imagen</span>
                  <span className="text-[9px] text-gray-500">(X_imagen.jpg)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!dirHandle}
                    onChange={(e) => {
                      if (e.target.files[0]) handleSubirRecursoGenerico(e.target.files[0], 'imagen');
                    }}
                  />
                </label>

                {/* Botón Audio */}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border p-3 rounded-lg flex flex-col items-center justify-center gap-1 text-center">
                  <span className="material-symbols-outlined text-amber-600">audiotrack</span>
                  <span className="text-[11px] font-bold">Subir Audio</span>
                  <span className="text-[9px] text-gray-500">(X_audio.mp3)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={!dirHandle}
                    onChange={(e) => {
                      if (e.target.files[0]) handleSubirRecursoGenerico(e.target.files[0], 'audio');
                    }}
                  />
                </label>

                {/* Botón Video */}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border p-3 rounded-lg flex flex-col items-center justify-center gap-1 text-center">
                  <span className="material-symbols-outlined text-indigo-600">movie</span>
                  <span className="text-[11px] font-bold">Subir Video</span>
                  <span className="text-[9px] text-gray-500">(X_video.mp4)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={!dirHandle}
                    onChange={(e) => {
                      if (e.target.files[0]) handleSubirRecursoGenerico(e.target.files[0], 'video');
                    }}
                  />
                </label>

                {/* Botón Texto */}
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border p-3 rounded-lg flex flex-col items-center justify-center gap-1 text-center">
                  <span className="material-symbols-outlined text-rose-600">description</span>
                  <span className="text-[11px] font-bold">Subir Texto</span>
                  <span className="text-[9px] text-gray-500">(X_texto.txt)</span>
                  <input
                    type="file"
                    accept=".txt,.json"
                    className="hidden"
                    disabled={!dirHandle}
                    onChange={(e) => {
                      if (e.target.files[0]) handleSubirRecursoGenerico(e.target.files[0], 'texto');
                    }}
                  />
                </label>
              </div>

              {/* LISTADO DE ARCHIVOS EXISTENTES EN DISCO */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <span className="text-xs font-bold text-gray-700 block mb-2">
                  Archivos en <code>public/estaciones/{estacionActual.id}/</code>
                </span>

                {cargandoArchivos ? (
                  <p className="text-xs text-gray-400">Escaneando disco...</p>
                ) : archivosEstacion.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No hay archivos guardados en esta carpeta.</p>
                ) : (
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {archivosEstacion.map((nombre) => (
                      <li key={nombre} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                        <span className="font-mono text-slate-800">{nombre}</span>
                        <button
                          onClick={() => handleEliminarArchivoLocal(nombre)}
                          className="text-red-600 hover:text-red-800 font-bold"
                          title="Eliminar de disco"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModalEstacion(false)}
                className="px-4 py-2 bg-[#eeeeeb] text-xs font-bold rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};