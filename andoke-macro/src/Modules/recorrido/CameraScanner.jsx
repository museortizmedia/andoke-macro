import React, { useEffect, useState, useCallback, useRef } from 'react';
import { scannerService } from '../../services/scannerService';

// --------------------------------------------------------------------------
// LISTADO DE PRUEBAS EN CÓDIGO
// --------------------------------------------------------------------------
const DEV_TEST_CODES = [
  { label: 'Estación 01', value: 'EST-001' },
  { label: 'Estación 02', value: 'EST-002' },
  { label: 'Estación 03', value: 'EST-003' },
  { label: 'Estación 04', value: 'EST-004' },
  { label: 'Estación 05', value: 'EST-005' },
  { label: 'Estación 06', value: 'EST-006' },
  { label: 'Estación 07', value: 'EST-007' },
  { label: 'Estación 08', value: 'EST-008' },
  { label: 'Estación 09', value: 'EST-009' },
  { label: 'URL Directa Completa', value: 'http://localhost:5173/estaciones?id=EST-001' },
  { label: 'Código Inválido / Error', value: 'CODIGO_DESCONOCIDO_123' }
];

// Helper para detectar el sistema operativo
const getMobileOS = () => {
  if (typeof window === 'undefined') return 'Unknown';
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  return 'Desktop';
};

export const CameraScanner = ({ onNavigate }) => {
  const [cameraState, setCameraState] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [errorMessage, setErrorMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [deviceOS, setDeviceOS] = useState('Desktop');
  const [hasWebNFC, setHasWebNFC] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Detectar S.O. y soporte técnico de Web NFC al montar
    const os = getMobileOS();
    setDeviceOS(os);
    setHasWebNFC('NDEFReader' in window);
  }, []);

  const initCamera = useCallback(async () => {
    setCameraState('prompt');
    setErrorMessage('');

    const success = await scannerService.startCamera(
      'qr-reader',
      (decodedText) => {
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
    initCamera();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        scannerService.stopCamera();
      } else {
        initCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      scannerService.stopCamera();
    };
  }, [initCamera]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    const result = await scannerService.scanImageFile(file);

    if (result.success) {
      scannerService.processCode(result.text, 'QR_FILE', onNavigate);
    } else {
      setFileError(result.error || 'No se pudo leer el código QR de la imagen.');
    }
    
    e.target.value = '';
  };

  const handleSimulateSelect = (e) => {
    const codeValue = e.target.value;
    if (!codeValue) return;

    const codeToProcess = codeValue.startsWith('http')
      ? codeValue
      : `${window.location.origin}/estaciones?id=${codeValue}`;

    scannerService.processCode(codeToProcess, 'DEV_LIST', onNavigate);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#fcfdfd] px-4 py-6 font-['Manrope',sans-serif]">
      <div id="qr-file-temp-element" style={{ display: 'none' }}></div>

      {/* Encabezado */}
      <div className="w-full max-w-md text-center mt-4">
        <h1 className="text-2xl font-extrabold text-[#767775]">Escáner</h1>
        <p className="text-xs text-[#767775]/80 mt-1">
          Apunta con la cámara al QR o acerca tu celular a una estación
        </p>
      </div>

      {/* Áreas del Escáner */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 my-auto">
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

        {/* Input file nativo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Botón selector de archivo (Solo visible en pantallas PC/pantallas medianas en adelante) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="hidden md:flex w-full max-w-[280px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-emerald-600">upload_file</span>
          Subir imagen QR desde equipo
        </button>

        {fileError && (
          <p className="hidden md:block text-[11px] font-medium text-rose-600 text-center px-4">{fileError}</p>
        )}

        {/* Módulo Informativo NFC condicionado al S.O. y soporte técnico */}
        <div className="w-full bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 mt-2">
          <div className="w-12 h-12 bg-emerald-600/10 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl animate-pulse">nfc</span>
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-emerald-900">
              Lectura NFC {hasWebNFC ? 'Activa' : 'Informativa'}
            </h3>
            <p className="text-[11px] text-emerald-700/80 leading-snug">
              {deviceOS === 'iOS' ? (
                'Acerca la parte superior de tu IPhone a la etiqueta de la estación'
              ) : deviceOS === 'Android' ? (
                'Acerca la parte trasera de tu Android a la etiqueta de la estación.'
              ) : (
                'Lectura NFC optimizada para dispositivos móviles Android con NFC habilitado.'
              )}
            </p>
          </div>
        </div>

        {/* SELECTOR DE CÓDIGOS PARA PRUEBAS (Solo en pantallas PC) */}
        <div className="hidden md:flex w-full p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col items-center gap-2 text-center mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Pruebas Rápidas
          </span>
          <select
            onChange={handleSimulateSelect}
            defaultValue=""
            className="w-full bg-white border border-amber-300 text-amber-900 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="" disabled>
              -- Selecciona un QR para simular --
            </option>
            {DEV_TEST_CODES.map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-6"></div>
    </div>
  );
};