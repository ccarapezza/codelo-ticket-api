const { authJwt } = require("../middleware");
const controller = require("../controllers/ticket.controller");
const { check, validationResult } = require('express-validator');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
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

  app.post(
    "/api/ticket/reserve",
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
    controller.reserve
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
  
  app.put(
    "/api/ticket/cut-ticket-by-id",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.cutTicketById
  );
  
  app.put(
    "/api/ticket/cut-ticket-by-hash",
    [
      authJwt.verifyToken,
      check('hash').exists({checkFalsy: true}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.cutTicketByHash
  );

  app.put(
    "/api/ticket/update-pago",
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
    controller.updatePago
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

  app.put(
    "/api/ticket/resend-email",
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
    controller.resendEmail
  );

  app.put(
    "/api/ticket/resend-all-emails",
    [
      authJwt.verifyToken,
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.resendAllEmails
  );

};
