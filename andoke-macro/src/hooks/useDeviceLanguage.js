import { useSyncExternalStore, useCallback } from 'react';
import { translations } from '../utils/translations';

// 1. Estado fuera de React (Store Singleton)
const getInitialLang = () => {
  const savedLang = localStorage.getItem('app_user_language');
  if (savedLang) return savedLang;
  const rawLang = navigator.language || navigator.userLanguage || 'es';
  return rawLang.split('-')[0].toLowerCase();
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
    localStorage.setItem('app_user_language', formattedLang);
    // Notificar a todos los componentes suscritos para que se re-rendericen en masa
    listeners.forEach((callback) => callback());
  }
};

// Escuchar cambios de idioma del sistema/navegador automáticamente
if (typeof window !== 'undefined') {
  window.addEventListener('languagechange', () => {
    if (!localStorage.getItem('app_user_language')) {
      const rawLang = navigator.language || navigator.userLanguage || 'es';
      languageStore.setLanguage(rawLang.split('-')[0].toLowerCase());
    }
  });
}

// 3. Custom Hook ultraligero
export function useDeviceLanguage() {
  // useSyncExternalStore sintoniza cualquier componente con el store global
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
    changeLanguage, // Permite forzar el cambio desde cualquier componente
    isSpanish: language === 'es',
    langSuffixes: language !== 'es' ? [`_${language}`, ''] : [''],
    t
  };
}