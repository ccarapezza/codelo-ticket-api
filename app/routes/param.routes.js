const { authJwt } = require("../middleware");
const controller = require("../controllers/param.controller");
const { check, validationResult } = require('express-validator');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.put(
    "/api/param/update",
    [
      authJwt.verifyToken,
      check('name').exists({checkFalsy: true}),
      check('value').exists({checkFalsy: true}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.update
  );

  app.get(
    "/api/param/list",
    [
      authJwt.verifyToken,
    ],
    controller.findAll
  );

};
