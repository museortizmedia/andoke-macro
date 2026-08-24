import React, { useEffect, useState, useCallback } from 'react';
import { scannerService } from '../../services/scannerService';

export const CameraScanner = ({ onNavigate }) => {
  const [cameraState, setCameraState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [errorMessage, setErrorMessage] = useState('');

  // Detectar entorno de desarrollo
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';

  const initCamera = useCallback(async () => {
    setCameraState('prompt');
    setErrorMessage('');

    const success = await scannerService.startCamera(
      'qr-reader',
      (decodedText) => {
        // Mismo punto de entrada para Cámara QR
        scannerService.processCode(decodedText, 'QR', onNavigate);
      },
      (err) => {
        setCameraState('denied');
        setErrorMessage(
          'No se pudo acceder a la cámara. Revisa los permisos de tu navegador.'
        );
      }
    );

    if (success) {
      setCameraState('granted');
    }
  }, [onNavigate]);

  useEffect(() => {
    // 1. Iniciar cámara al montar el componente
    initCamera();

    // 2. Control de visibilidad de la pestaña/aplicación
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pestaña o app en segundo plano: Liberar cámara inmediatamente
        scannerService.stopCamera();
      } else {
        // Regresó a la app: Reactivar cámara
        initCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Desmontaje estricto (Cambio de ruta / salir del componente)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      scannerService.stopCamera();
    };
  }, [initCamera]);

  // Función para simular el escaneo de una estación en entorno DEV
  const handleSimulateScan = (stationId) => {
    const fullUrl = `${window.location.origin}/estaciones?id=${stationId}`;
    
    // Mismo punto de entrada centralizado para el Botón DEV
    scannerService.processCode(fullUrl, 'DEV_BUTTON', onNavigate);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#fcfdfd] px-4 py-6 font-['Manrope',sans-serif]">
      {/* Encabezado */}
      <div className="w-full max-w-md text-center mt-4">
        <h1 className="text-2xl font-extrabold text-[#767775]">Escáner de Estación</h1>
        <p className="text-xs text-[#767775]/80 mt-1">
          Apunta con la cámara o acerca tu celular a una etiqueta NFC
        </p>
      </div>

      {/* Áreas del Escáner */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 my-auto">
        {/* Visor de Cámara */}
        <div className="relative w-full aspect-square max-w-[280px] bg-black/5 rounded-3xl overflow-hidden border-2 border-emerald-600/30 shadow-inner flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full object-cover"></div>

          {cameraState === 'prompt' && (
            <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-emerald-600 animate-pulse mb-2">
                videocam
              </span>
              <p className="text-xs font-semibold text-gray-700">Iniciando cámara...</p>
            </div>
          )}

          {cameraState === 'denied' && (
            <div className="absolute inset-0 bg-white p-6 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">
                videocam_off
              </span>
              <p className="text-xs text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={initCamera}
                className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Módulo Informativo NFC */}
        <div className="w-full bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600/10 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl animate-pulse">nfc</span>
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-emerald-900">Lectura NFC Activa</h3>
            <p className="text-[11px] text-emerald-700/80 leading-snug">
              También puedes acercar la parte trasera de tu teléfono a la estación.
            </p>
          </div>
        </div>

        {/* Botón de prueba en CameraScanner.jsx */}
        {isDev && (
          <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center gap-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Modo Pruebas (DEV)
            </span>
            <button
              onClick={() => handleSimulateScan('EST-001')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">bug_report</span>
              Probar Estación EST-001
            </button>
          </div>
        )}
      </div>

      <div className="h-12"></div>
    </div>
  );
};