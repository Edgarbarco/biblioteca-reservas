import { useEffect, useState } from 'react';
import { request } from './api';

export default function Reservas({ user, onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function cargarDatos() {
    try {
      setRooms(await request('/rooms'));
      setBookings(await request('/bookings'));
    } catch (err) {
      // el 401 ya lo maneja api.js; otros errores se muestran aqui
      if (err.status !== 401) setError(err.message);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleSubmit() {
    setError('');
    setOk('');
    try {
      await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({ roomId: Number(roomId), date, startTime, endTime }),
      });
      setOk('Reserva creada');
      cargarDatos();
    } catch (err) {
      if (err.status !== 401) setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Hola, {user.username}</h2>
        <button onClick={onLogout}>Cerrar sesion</button>
      </div>

      <h3>Salas</h3>
      <ul>
        {rooms.map((r) => (
          <li key={r.id}>{r.name} (capacidad: {r.capacity})</li>
        ))}
      </ul>

      <h3>Nueva reserva</h3>
      <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
        <option value="">Elige una sala</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      <button onClick={handleSubmit}>Reservar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {ok && <p style={{ color: 'green' }}>{ok}</p>}

      <h3>Reservas existentes</h3>
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            {b.Room ? b.Room.name : 'Sala ' + b.roomId} - {b.date} de {b.startTime} a {b.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
}