module.exports = (sequelize, Sequelize) => {
  const Param = sequelize.define("params", {
    name: {
      type: Sequelize.STRING
    },
    value: {
      type: Sequelize.STRING
    }
  });

  return Param;
};
