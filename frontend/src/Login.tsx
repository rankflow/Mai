import React, { useState } from 'react';

const API_URL = 'http://localhost:3001/api/auth/login';

interface LoginProps {
  onAuthSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email || !password) {
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
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error desconocido');
      } else {
        setSuccess(true);
        localStorage.setItem('token', data.data.token);
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-0 w-full max-w-sm"
      style={{ boxShadow: 'none' }}
    >
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#222' }}>Iniciar sesión</h2>
      {error && <div className="mb-4 text-sm" style={{ color: '#222' }}>{error}</div>}
      {success && <div className="mb-4 text-sm" style={{ color: '#222' }}>¡Login exitoso!</div>}
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
          autoComplete="current-password"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 font-semibold rounded-full shadow transition disabled:opacity-50"
        style={{ background: '#90E0EF', color: '#222' }}
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default Login; 