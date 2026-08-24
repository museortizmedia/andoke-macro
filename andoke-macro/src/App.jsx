import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './Modules/admin/LoginPage';
import { AdminStations } from './Modules/admin/components/AdminStations';
import AndokeWelcome from './Modules/macro/AndokeWelcome';
import { InteractiveMapContent } from './Modules/macro/InteractiveMapContent';
import { CameraScanner } from './Modules/recorrido/CameraScanner';
import { BottomNav } from './components/BottomNav';
import { NotFoundPage } from './components/NotFoundPage';
import { scannerService } from './services/scannerService';
import EstacionesView from './Modules/recorrido/EstacionesView';
import AboutProjectView from './Modules/macro/AboutProjectView';

// Extrae el segmento principal de la ruta
const getScreenFromPath = () => {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return 'inicio';

  const firstSegment = segments[0].toLowerCase();
  const validScreens = ['inicio', 'mapa', 'camara', 'estaciones', 'info', 'admin', 'login'];

  if (segments.length > 1 || !validScreens.includes(firstSegment)) {
    return '404';
  }

  return firstSegment;
};

function MainAppContent() {
  const [currentScreen, setCurrentScreen] = useState(getScreenFromPath);
  const { isAuthenticated } = useAuth();

  const handleNavigate = useCallback((target) => {
    const validScreens = ['inicio', 'mapa', 'camara', 'estaciones', 'info', 'admin', 'login'];

    let cleanScreen = 'inicio';
    let fullPath = '/';

    if (target.includes('?')) {
      const urlObj = new URL(target, window.location.origin);
      const pathSegment = urlObj.pathname.replace(/^\//, '').toLowerCase();

      cleanScreen = validScreens.includes(pathSegment) ? pathSegment : '404';
      fullPath = `${urlObj.pathname}${urlObj.search}`;
    } else {
      const pathSegment = target.replace(/^\//, '').toLowerCase();
      cleanScreen = validScreens.includes(pathSegment) ? pathSegment : '404';
      fullPath = cleanScreen === 'inicio' ? '/' : `/${cleanScreen}`;
    }

    // 1. Actualizar estado de la pantalla
    setCurrentScreen(cleanScreen);

    // 2. Escribir en la barra de direcciones CON el ID (sin recargar la página)
    window.history.pushState(null, '', fullPath);

    // 3. Disparar evento para que EstacionesView reaccione al cambio de parámetros
    window.dispatchEvent(new Event('popstate'));
  }, []);

  // Inicializar servicio NFC permanente
  useEffect(() => {
    scannerService.initNfc(handleNavigate);
  }, [handleNavigate]);

  // Escuchar navegación del historial (Atrás / Adelante)
  useEffect(() => {
    const handlePopState = () => setCurrentScreen(getScreenFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reset del scroll al cambiar de pantalla
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'inicio':
        return <AndokeWelcome onNavigate={handleNavigate} />;
      case 'mapa':
        return <InteractiveMapContent />;
      case 'camara':
        return <CameraScanner onNavigate={handleNavigate} />;
      case 'estaciones':
        return <EstacionesView onNavigate={handleNavigate} />;
      case 'info':
        return <AboutProjectView onNavigate={handleNavigate} />;
      case 'admin':
        if (!isAuthenticated) {
          return <LoginPage onSuccess={() => handleNavigate('admin')} onNavigate={handleNavigate} />;
        }
        return <AdminStations onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onSuccess={() => handleNavigate('admin')} onNavigate={handleNavigate} />;
      case '404':
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const hideBottomNav = ['admin', 'login', '404'].includes(currentScreen);

  return (
    <div className="relative min-h-screen bg-[#fcfdfd]">
      {renderScreen()}
      {!hideBottomNav && (
        <BottomNav activeTab={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}