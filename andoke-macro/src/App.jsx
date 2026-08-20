import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './Modules/admin/LoginPage';
import { AdminStations } from './Modules/admin/components/AdminStations';
import AndokeWelcome from './Modules/macro/AndokeWelcome';
import { InteractiveMapContent } from './Modules/macro/InteractiveMapContent';
import { BottomNav } from './components/BottomNav';

// Obtiene la pantalla basándose en el path de la URL
const getScreenFromPath = () => {
  const path = window.location.pathname.replace('/', '').toLowerCase();
  const validScreens = ['inicio', 'mapa', 'estaciones', 'info', 'admin', 'login'];
  return validScreens.includes(path) ? path : 'inicio';
};

function MainAppContent() {
  const [currentScreen, setCurrentScreen] = useState(getScreenFromPath);
  const { isAuthenticated } = useAuth();

  // Escuchar botones de navegación del navegador (Atrás / Adelante)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentScreen(getScreenFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Función envoltorio para cambiar de pantalla y actualizar la URL sin recargar
  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    const newPath = screen === 'inicio' ? '/' : `/${screen}`;
    window.history.pushState(null, '', newPath);
  };

  // Reset del scroll al cambiar de pantalla
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'inicio':
        return <AndokeWelcome onNavigate={handleNavigate} />;
      case 'mapa':
      case 'estaciones':
        return <InteractiveMapContent />;
      case 'info':
        return <AndokeWelcome onNavigate={handleNavigate} />;
      case 'admin':
        if (!isAuthenticated) {
          return <LoginPage onSuccess={() => handleNavigate('admin')} onNavigate={handleNavigate} />;
        }
        return <AdminStations onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onSuccess={() => handleNavigate('admin')} onNavigate={handleNavigate} />;
      default:
        return <AndokeWelcome onNavigate={handleNavigate} />;
    }
  };

  const hideBottomNav = currentScreen === 'admin' || currentScreen === 'login';

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