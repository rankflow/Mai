import React, { useRef, useState, useEffect } from 'react';

interface Message {
  sender: 'user' | 'mai';
  text: string;
}

const API_URL = 'http://localhost:3001/api/chat/send';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'mai', text: 'Hola, soy Mai. ¿En qué puedo acompañarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: userMsg.text })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Error al conectar con Mai');
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'mai', text: data.data.message.content }
        ]);
      }
    } catch (err) {
      setError('Error de red o del servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: '#f1ede2' }}>
      <div className="flex-1 overflow-y-auto px-2 py-4" style={{ maxWidth: 1200, minWidth: 320, width: '100%', margin: '0 auto' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              style={{
                background: msg.sender === 'user' ? 'rgba(144,224,239,0.7)' : 'rgba(241,220,226,0.7)',
                color: '#222',
                borderRadius: 18,
                padding: '10px 20px',
                maxWidth: '95%',
                fontWeight: msg.sender === 'mai' ? 500 : 400,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {error && <div className="text-center text-sm mt-2" style={{ color: '#c00' }}>{error}</div>}
      </div>
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-2 pb-4"
        style={{ maxWidth: 1200, minWidth: 320, width: '100%', margin: '0 auto' }}
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-full border focus:outline-none"
          style={{ background: 'rgba(241,220,226,0.5)', color: '#222', borderColor: '#90E0EF' }}
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-full font-semibold shadow transition disabled:opacity-50 border"
          style={{ background: '#90E0EF', color: '#222', borderColor: '#222' }}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
      <button
        onClick={handleLogout}
        style={{ position: 'fixed', bottom: 16, right: 24, fontSize: 16, color: '#222', background: 'none', border: 'none', textShadow: '0 1px 2px #f1dce2, 0 -1px 2px #f1dce2', fontWeight: 600, cursor: 'pointer', zIndex: 50 }}
        className="hover:underline"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Chat; 