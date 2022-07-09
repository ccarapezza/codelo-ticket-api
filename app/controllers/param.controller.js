const db = require("../models");
const Param = db.param;

exports.update = (req, res) => {
  const data = req.body;

  Param.update({
    value: data.value,
  }, {
    where: {
      name: data.name
    }
  })
  .then((param) => {
    res.status(200).send(param);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.findAll = (req, res) => {
  Param.findAll().then((params) => {
    res.status(200).send(params);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};