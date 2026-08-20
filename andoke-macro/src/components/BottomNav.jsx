import React from 'react';

export const BottomNav = ({ activeTab, onNavigate }) => {
  const navItems = [
    { key: 'inicio', label: 'Inicio', icon: 'home' },
    { key: 'mapa', label: 'Mapa', icon: 'map' },
    { key: 'estaciones', label: 'Estaciones', icon: 'eco' },
    { key: 'info', label: 'Info', icon: 'info' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 px-4 py-2 flex justify-around items-center shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};