import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage = ({ onSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login({ username, password });
    if (success) {
      if (onSuccess) onSuccess();
      else if (onNavigate) onNavigate('admin');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] px-4 font-['Manrope',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-[#e8e8e6] p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img 
    src="/horizontal.webp" 
    alt="Andoke Logo" 
    className="h-32 w-auto object-contain" 
  />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#5b403f] mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-[#8f6f6e]/30 rounded-lg focus:outline-none focus:border-[#006590]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5b403f] mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#8f6f6e]/30 rounded-lg focus:outline-none focus:border-[#006590]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#e63946] text-white font-bold py-3 rounded-full hover:bg-[#b7102a] transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Botón opcional para regresar a la vista pública sin iniciar sesión */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('inicio')}
            className="w-full mt-4 text-xs font-bold text-[#767775] hover:text-[#1a1c1b] transition-colors text-center block"
          >
            ← Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
};