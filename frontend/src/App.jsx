import { useEffect, useState } from 'react';
import { request, setOnUnauthorized } from './api';
import Login from './Login';
import Reservas from './Reservas';

export default function App() {
  const [user, setUser] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Si cualquier peticion responde 401, volvemos al login
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setMensaje('Tu sesion expiro. Inicia sesion de nuevo.');
    });
  }, []);

  function handleLogin(u) {
    setMensaje('');
    setUser(u);
  }

  async function handleLogout() {
    await request('/logout', { method: 'POST' });
    setMensaje('');
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} mensaje={mensaje} />;
  }
  return <Reservas user={user} onLogout={handleLogout} />;
}
