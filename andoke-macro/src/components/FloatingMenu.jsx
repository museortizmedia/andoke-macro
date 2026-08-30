import React, { useState, useRef, useEffect } from 'react';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const { language, t } = useDeviceLanguage();

  const [formData, setFormData] = useState({
    type: 'felicitacion',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const menuRef = useRef(null);

  // Cerrar menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSuggestionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback enviado:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSuggestionOpen(false);
      setIsOpen(false);
      setFormData({ type: 'felicitacion', email: '', message: '' });
    }, 2000);
  };

  return (
    <div ref={menuRef} className="fixed top-2.5 right-4 z-50">
      {/* Botón de 3 Líneas (Menú Hamburguesa) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isSuggestionOpen) setIsSuggestionOpen(false);
        }}
        aria-label="Abrir opciones"
        className="flex h-10 w-10 items-center justify-center text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Menú Desplegable Principal */}
      {isOpen && !isSuggestionOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 text-slate-800 shadow-xl backdrop-blur-md transition-all animate-fade-in-down">
          {/* Indicador de Idioma */}
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold border-b border-slate-100 text-slate-600">
            <span>{t("Idioma")}:</span>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-slate-800">
              <span>{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
              <span className="uppercase">{language}</span>
            </div>
          </div>

          {/* Opción Buzón de Opiniones */}
          <button
            onClick={() => setIsSuggestionOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 mt-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-4 h-4 text-emerald-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            <span>{t("Buzón de Opiniones")}</span>
          </button>
        </div>
      )}

      {/* Ventana Flotante del Formulario de Sugerencias */}
      {isOpen && isSuggestionOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-4 text-slate-800 shadow-xl backdrop-blur-md transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <button
              onClick={() => setIsSuggestionOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              ← {t("Volver")}
            </button>
            <h3 className="text-xs font-bold text-slate-900">{t("Buzón de Opiniones")}</h3>
          </div>

          {submitted ? (
            <div className="py-6 text-center text-emerald-600 font-medium text-xs">
              {t("¡Gracias por tus comentarios!")} 🙌
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">{t("Tipo de mensaje")}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="felicitacion">🎉 {t("Felicitación")}</option>
                  <option value="sugerencia">💡 {t("Sugerencia")}</option>
                  <option value="queja">⚠️ {t("Queja")}</option>
                  <option value="reclamo">🚨 {t("Reclamo")}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">{t("Correo (opcional)")}</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">{t("Mensaje")} *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={t("Escribe tu mensaje aquí...")}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="mt-1 w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 shadow-md"
              >
                {t("Enviar Reporte")}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}