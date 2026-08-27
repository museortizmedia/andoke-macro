import { useState, useEffect } from 'react';

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

  return {
    language,
    isSpanish: language === 'es',
    // Retorna la lista de sufijos priorizada: ['_en', ''] si es 'en', o [''] si es 'es'
    langSuffixes: language !== 'es' ? [`_${language}`, ''] : ['']
  };
}