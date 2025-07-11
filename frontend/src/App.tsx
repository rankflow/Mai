import React, { useState, useEffect, useCallback } from 'react';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  // Permite que Login/Register notifiquen autenticación exitosa
  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // Sombra rosa para mejorar contraste en texto claro
  const textShadow = '0 1px 2px #f1dce2, 0 -1px 2px #f1dce2';

  if (isAuthenticated) {
    return <Chat />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f1ede2' }}>
      <div className="w-full max-w-md">
        {showRegister ? (
          <>
            <Register onAuthSuccess={handleAuthSuccess} />
            <div className="mt-4 text-center">
              <span style={{ color: '#222' }}>¿Ya tienes cuenta? </span>
              <button
                style={{ color: '#222', textShadow }}
                className="hover:underline font-semibold"
                onClick={() => setShowRegister(false)}
              >
                Inicia sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <Login onAuthSuccess={handleAuthSuccess} />
            <div className="mt-4 text-center">
              <span style={{ color: '#222' }}>¿No tienes cuenta? </span>
              <button
                style={{ color: '#222', textShadow }}
                className="hover:underline font-semibold"
                onClick={() => setShowRegister(true)}
              >
                Regístrate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;