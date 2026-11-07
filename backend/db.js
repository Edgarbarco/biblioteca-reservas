const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './biblioteca.sqlite',
  logging: false,
});

module.exports = sequelize;