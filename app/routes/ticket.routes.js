const { authJwt } = require("../middleware");
const controller = require("../controllers/ticket.controller");
const { check, validationResult } = require('express-validator');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, x-access-hash, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/ticket/verify", controller.ticketVerify);

  app.post(
    "/api/ticket/create",
    [
      authJwt.verifyToken,
      check('nombre').exists({checkFalsy: true}),
      check('apellido').exists({checkFalsy: true}),
      check('dni').exists({checkFalsy: true}),
      check('tipo').exists({checkFalsy: true}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.create
  );

  app.put(
    "/api/ticket/update",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      check('nombre').exists({checkFalsy: true}),
      check('apellido').exists({checkFalsy: true}),
      check('dni').exists({checkFalsy: true}),
      check('tipo').exists({checkFalsy: true}),
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

  app.delete(
    "/api/ticket/delete",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.delete
  );

  app.get(
    "/api/ticket/list",
    [
      authJwt.verifyToken,
    ],
    controller.findAll
  );

  app.get(
    "/api/ticket",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.getById
  );

};
