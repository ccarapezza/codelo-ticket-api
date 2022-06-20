module.exports = (sequelize, Sequelize) => {
  const Particiante = sequelize.define("tickets", {
    n: {
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    hash: {
      type: Sequelize.STRING
    },
    grow: {
      type: Sequelize.STRING
    },
    esJurado: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  });

  return Particiante;
};
