module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define("tickets", {
    nombre: {
      type: Sequelize.STRING
    },
    apellido: {
      type: Sequelize.STRING
    },
    dni: {
      type: Sequelize.STRING
    },
    tipo: {
      type: Sequelize.STRING
    },
    ingresado: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  });

  return Ticket;
};
