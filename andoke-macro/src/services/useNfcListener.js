// src/hooks/useNfcListener.js
import { useEffect } from 'react';

export const useNfcListener = (onTagRead) => {
  useEffect(() => {
    let ndef;

    const startNfc = async () => {
      if (!('NDEFReader' in window)) {
        console.warn('Web NFC no está soportado en este navegador/dispositivo.');
        return;
      }

      try {
        ndef = new window.NDEFReader();
        await ndef.scan();

        ndef.addEventListener('reading', ({ message, serialNumber }) => {
          for (const record of message.records) {
            if (record.recordType === 'url' || record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const data = textDecoder.decode(record.data);
              if (onTagRead) onTagRead({ data, serialNumber });
            }
          }
        });
      } catch (error) {
        console.error('Error iniciando el servicio NFC:', error);
      }
    };

    startNfc();
  }, [onTagRead]);
};