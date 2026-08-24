// src/services/scannerService.js
import { Html5Qrcode } from 'html5-qrcode';

const CACHE_KEY = 'visited_stations_cache';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Guarda una estación escaneada en el historial de localStorage (últimas 24h)
 */
const saveToHistoryCache = (stationId) => {
  if (!stationId) return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const now = Date.now();

    // Eliminar registros de más de 24 horas y duplicados
    const valid = parsed.filter(
      (item) => now - item.timestamp < ONE_DAY_MS && item.id !== stationId
    );

    const updated = [
      ...valid,
      {
        id: stationId,
        title: `Estación ${stationId}`,
        timestamp: now
      }
    ];

    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error guardando en el historial de caché:', error);
  }
};

class ScannerService {
  constructor() {
    this.listeners = new Set();
    this.nfcReader = null;
    this.isNfcActive = false;
    this.html5Qrcode = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(data) {
    this.listeners.forEach((callback) => callback(data));
  }

  // --- GESTIÓN DE CÁMARA (Ciclo de Vida Limpio) ---

  async startCamera(elementId, onSuccess, onError) {
    await this.stopCamera();

    try {
      this.html5Qrcode = new Html5Qrcode(elementId);

      await this.html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await this.stopCamera();
          onSuccess(decodedText);
        },
        () => {} // Ignorar cuadros sin código QR
      );
      return true;
    } catch (err) {
      if (onError) onError(err);
      return false;
    }
  }

  async stopCamera() {
    if (this.html5Qrcode) {
      try {
        if (this.html5Qrcode.isScanning) {
          await this.html5Qrcode.stop();
        }
        this.html5Qrcode.clear();
      } catch (err) {
        console.warn('Error al detener la cámara limpiamente:', err);
      } finally {
        this.html5Qrcode = null;
      }
    }
  }

  // --- PROCESAMIENTO Y REDIRECCIÓN CENTRALIZADA ---

  processCode(codeText, source = 'DESCONOCIDO', onNavigate) {
    const payload = {
      data: codeText,
      source,
      timestamp: new Date()
    };

    this.notify(payload);

    if (!onNavigate) return;

    try {
      let targetPath = codeText;
      let stationId = null;

      // Evaluar si es una URL absoluta o relativa
      if (codeText.startsWith('http://') || codeText.startsWith('https://')) {
        const url = new URL(codeText);

        if (url.origin === window.location.origin) {
          // Extraer pathname + search (ejemplo: "estaciones?id=EST-001")
          targetPath = `${url.pathname.replace(/^\//, '')}${url.search}`;
          stationId = url.searchParams.get('id');
        } else {
          // Si pertenece a otro dominio externo, redirigir directo
          window.location.href = codeText;
          return;
        }
      } else {
        // Formatos directos: "estaciones?id=EST-001" o simplemente "EST-001"
        if (codeText.includes('?id=')) {
          const params = new URLSearchParams(codeText.split('?')[1]);
          stationId = params.get('id');
        } else if (codeText.startsWith('EST-')) {
          stationId = codeText;
          targetPath = `estaciones?id=${codeText}`;
        }
      }

      // 1. Guardar en el historial de LocalStorage si existe un ID válido
      if (stationId) {
        saveToHistoryCache(stationId);
      }

      // 2. Ejecutar la navegación manteniendo los parámetros completos
      onNavigate(targetPath);
    } catch (err) {
      console.error('Error procesando el código en ScannerService:', err);
      onNavigate(codeText);
    }
  }

  // --- SERVICIO NFC ---

  async initNfc(onNavigate) {
    if (this.isNfcActive) return;

    if (!('NDEFReader' in window)) {
      console.warn('Web NFC no está soportado en este navegador/dispositivo.');
      return;
    }

    try {
      this.nfcReader = new window.NDEFReader();
      await this.nfcReader.scan();
      this.isNfcActive = true;

      this.nfcReader.addEventListener('reading', ({ message }) => {
        for (const record of message.records) {
          if (record.recordType === 'url' || record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding || 'utf-8');
            const data = textDecoder.decode(record.data);
            this.processCode(data, 'NFC', onNavigate);
          }
        }
      });
    } catch (error) {
      console.error('Error al iniciar el servicio NFC:', error);
    }
  }
}

export const scannerService = new ScannerService();