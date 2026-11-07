const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const sequelize = require('./db');
const { User, Room, Booking } = require('./models');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(session({
  secret: 'cambia-este-secreto',
  resave: false,
  saveUninitialized: false,
  rolling: true, // renueva la cookie en cada peticion (inactividad)
  cookie: {
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30 minutos
  },
}));

// Middleware: exige sesion activa
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Listado de salas
app.get('/api/rooms', requireAuth, async (req, res) => {
  const rooms = await Room.findAll();
  res.json(rooms);
});

// Listado de reservas
app.get('/api/bookings', requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    include: [Room],
    order: [['date', 'ASC'], ['startTime', 'ASC']],
  });
  res.json(bookings);
});

// Crear reserva (con regla de solapamiento)
app.post('/api/bookings', requireAuth, async (req, res) => {
  const { roomId, date, startTime, endTime } = req.body;

  // Validaciones basicas
    // Validaciones basicas
    const timeFormat = /^([01]\d|2[0-3]):[0-5]\d$/;
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    const dateIsValid = dateFormat.test(date) && !isNaN(new Date(date).getTime());
  
    if (!roomId || !dateIsValid || !timeFormat.test(startTime) || !timeFormat.test(endTime)) {
      return res.status(400).json({ error: 'Datos invalidos (fecha YYYY-MM-DD, hora HH:MM)' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la de fin' });
    }

  const room = await Room.findByPk(roomId);
  if (!room) {
    return res.status(404).json({ error: 'La sala no existe' });
  }

  // Regla de negocio: no permitir horarios solapados en la misma sala y fecha
  const conflict = await Booking.findOne({
    where: {
      roomId,
      date,
      startTime: { [Op.lt]: endTime },
      endTime: { [Op.gt]: startTime },
    },
  });
  if (conflict) {
    return res.status(409).json({ error: 'La sala ya esta reservada en ese horario' });
  }

  const booking = await Booking.create({
    roomId,
    userId: req.session.userId,
    date,
    startTime,
    endTime,
  });
  res.status(201).json(booking);
});

// Arranque: crea tablas y datos de prueba
async function start() {
  await sequelize.sync();

  if ((await User.count()) === 0) {
    await User.create({
      username: 'edgar',
      passwordHash: await bcrypt.hash('1234', 10),
    });
  }
  if ((await Room.count()) === 0) {
    await Room.bulkCreate([
      { name: 'Sala A', capacity: 4 },
      { name: 'Sala B', capacity: 8 },
      { name: 'Sala C', capacity: 12 },
    ]);
  }

  app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
}

start();