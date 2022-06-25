module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define("tickets", {
    nombre: {
      type: Sequelize.STRING
    },
    apellido: {
      type: Sequelize.STRING
    },
    dni: {
      type: Sequelize.STRING,
      unique: true,
    },
    email: {
      type: Sequelize.STRING
    },
    tipo: {
      type: Sequelize.STRING
    },
    observaciones: {
      type: Sequelize.STRING
    },
    pago: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ingresado: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hash: {
      type: Sequelize.STRING
    },
  });

  return Ticket;
};
