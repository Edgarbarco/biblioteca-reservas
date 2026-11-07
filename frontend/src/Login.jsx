import { useState } from 'react';
import { request } from './api';

export default function Login({ onLogin, mensaje }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    try {
      const user = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '60px auto' }}>
      <h2>Reserva de salas</h2>
      {mensaje && <p style={{ color: 'orange' }}>{mensaje}</p>}
      <input
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Contrasena"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8 }}
      />
      <button onClick={handleSubmit}>Entrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}