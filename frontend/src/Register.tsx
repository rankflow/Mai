import React, { useState } from 'react';

const API_URL = 'http://localhost:3001/api/auth/register';

interface RegisterProps {
  onAuthSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email || !password || !username) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error desconocido');
      } else {
        setSuccess(true);
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Registro con Google: próximamente disponible');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-0 w-full max-w-sm"
      style={{ boxShadow: 'none' }}
    >
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#222' }}>Crear cuenta</h2>
      {error && <div className="mb-4 text-sm" style={{ color: '#222' }}>{error}</div>}
      {success && <div className="mb-4 text-sm" style={{ color: '#222' }}>¡Registro exitoso!</div>}
      <button
        type="button"
        onClick={handleGoogleRegister}
        className="w-full flex items-center justify-center gap-2 py-2 mb-6 font-semibold rounded-full shadow transition border border-gray-300"
        style={{ background: '#f1dce2', color: '#222', borderColor: '#90E0EF' }}
      >
        <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.7 30.18 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.13 13.09 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.27 37.27 46.1 31.45 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.29c-1.13-3.36-1.13-6.93 0-10.29l-7.98-6.2C-1.13 17.09-1.13 30.91 1.69 39.91l7.98-6.2z"/><path fill="#EA4335" d="M24 46c6.18 0 11.64-2.05 15.19-5.59l-7.19-5.6c-2.01 1.35-4.59 2.14-8 2.14-6.44 0-11.87-3.59-14.33-8.79l-7.98 6.2C6.73 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
        Registrarse con Google <span className="text-xs" style={{ color: '#222' }}>(próximamente)</span>
      </button>
      <div className="mb-4 text-left">
        <label className="block mb-1" htmlFor="username" style={{ color: '#222' }}>Usuario</label>
        <input
          id="username"
          type="text"
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{ background: 'rgba(241, 220, 226, 0.5)', color: '#222', borderColor: '#222' }}
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block mb-1" htmlFor="email" style={{ color: '#222' }}>Email</label>
        <input
          id="email"
          type="email"
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{ background: 'rgba(241, 220, 226, 0.5)', color: '#222', borderColor: '#222' }}
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
      </div>
      <div className="mb-6 text-left">
        <label className="block mb-1" htmlFor="password" style={{ color: '#222' }}>Contraseña</label>
        <input
          id="password"
          type="password"
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{ background: 'rgba(241, 220, 226, 0.5)', color: '#222', borderColor: '#222' }}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 font-semibold rounded-full shadow transition disabled:opacity-50 border"
        style={{ background: '#90E0EF', color: '#222', borderColor: '#222' }}
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
};

export default Register; 