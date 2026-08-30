import React from 'react';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';

export const BottomNav = ({ activeTab, onNavigate }) => {
  const { t } = useDeviceLanguage();

  const navItems = [
    { key: 'inicio', label: 'Inicio', icon: 'home' },
    { key: 'mapa', label: 'Mapa', icon: 'map' },
    { key: 'camara', label: 'Escanear', icon: 'camera' },
    { key: 'estaciones', label: 'Estaciones', icon: 'eco' },
    { key: 'info', label: 'Info', icon: 'info' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 px-2 py-2 flex justify-between items-center shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[11px] mt-0.5">{t(item.label)}</span>
          </button>
        );
      })}
    </nav>
  );
};