const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

const Room = sequelize.define('Room', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
});

const Booking = sequelize.define('Booking', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false }, // formato "HH:MM"
  endTime: { type: DataTypes.STRING, allowNull: false },   // formato "HH:MM"
});

Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Room, Booking };