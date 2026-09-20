import { useSyncExternalStore, useCallback } from 'react';
import { translations } from '../utils/translations';

const STORAGE_KEY = 'app_user_language';

// Resuelve la región del navegador a 'es' o 'en'
const resolveSupportedLanguage = () => {
  if (typeof navigator === 'undefined') return 'es';

  // Toma el primer idioma preferido del navegador (ej. 'de-DE' o 'en-US')
  const primaryLang = (navigator.languages?.[0] || navigator.language || 'es').toLowerCase();
  
  // Si empieza con 'es' (es, es-ES, es-CO, etc.) usa español, de lo contrario inglés
  return primaryLang.startsWith('es') ? 'es' : 'en';
};

// 1. Estado fuera de React (Store Singleton)
const getInitialLang = () => {
  if (typeof window !== 'undefined') {
    const savedLang = sessionStorage.getItem(STORAGE_KEY);
    if (savedLang) return savedLang;
  }
  
  return resolveSupportedLanguage();
};

let currentLanguage = getInitialLang();
const listeners = new Set();

// 2. Suscripción a cambios de idioma
const languageStore = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot() {
    return currentLanguage;
  },
  setLanguage(newLang) {
    const formattedLang = newLang.toLowerCase();
    if (formattedLang === currentLanguage) return;
    
    currentLanguage = formattedLang;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, formattedLang);
    }
    
    listeners.forEach((callback) => callback());
  }
};

// Escuchar cambios de idioma del sistema/navegador automáticamente
if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', () => {
    // Solo actualiza automáticamente si el usuario no fijó manualmente un idioma en la sesión activa
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      languageStore.setLanguage(resolveSupportedLanguage());
    }
  });
}

// 3. Custom Hook ultraligero
export function useDeviceLanguage() {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot
  );

  const changeLanguage = useCallback((newLang) => {
    languageStore.setLanguage(newLang);
  }, []);

  const t = useCallback(
    (text) => {
      if (language === 'es' || !translations[text]) {
        return text;
      }
      return translations[text][language] || text;
    },
    [language]
  );

  return {
    language,
    changeLanguage,
    isSpanish: language === 'es',
    langSuffixes: language !== 'es' ? [`_${language}`, ''] : [''],
    t
  };
}