import { useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations'; // Ajusta la ruta a tu archivo de diccionario

export function useDeviceLanguage(defaultLang = 'es') {
  const [language, setLanguage] = useState(() => {
    const rawLang = navigator.language || navigator.userLanguage || defaultLang;
    return rawLang.split('-')[0].toLowerCase();
  });

  useEffect(() => {
    const handleLanguageChange = () => {
      const rawLang = navigator.language || navigator.userLanguage || defaultLang;
      setLanguage(rawLang.split('-')[0].toLowerCase());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [defaultLang]);

  // Función t("Texto") que ya conoce el idioma actual
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
    isSpanish: language === 'es',
    langSuffixes: language !== 'es' ? [`_${language}`, ''] : [''],
    t // para traducir textos
  };
}