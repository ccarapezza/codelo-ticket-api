module.exports = (sequelize, Sequelize) => {
  const Param = sequelize.define("params", {
    name: {
      type: Sequelize.STRING,
      unique: true
    },
    value: {
      type: Sequelize.STRING
    }
  });

  return Param;
};
