const { authJwt, authTicketHash } = require("../middleware");
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

  app.post("/api/ticket/login", controller.ticketLogin);

  app.post(
    "/api/ticket/create",
    [
      authJwt.verifyToken,
      check('name').exists({checkFalsy: true}),
      check('muestras').isArray().notEmpty().custom((value, { req }) => {
        const muestras = req.body.muestras;
        for (const muestra of muestras) {
          if(!muestra.name){
            throw new Error('El nombre de las muestras es obligatorio');
          }
        }
        return true;
      }),
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
    "/api/ticket/create-jurado",
    [
      authJwt.verifyToken,
      check('name').exists({checkFalsy: true}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.createJurado
  );

  app.put(
    "/api/ticket/update",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      check('name').exists({checkFalsy: true}),
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

  app.post(
    "/api/ticket/add-muestra",
    [
      authJwt.verifyToken,
      check('ticketId').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      check('name').exists({checkFalsy: true}),
      check('categoriaId').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.addMuestra
  );

  app.put(
    "/api/ticket/update-muestra",
    [
      authJwt.verifyToken,
      check('id').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      check('name').exists({checkFalsy: true}),
      check('categoriaId').exists({checkFalsy: true}).custom((value, { req }) => {return !isNaN(value)}),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      }
    ],
    controller.updateMuestra
  );

  app.delete(
    "/api/ticket/remove-muestra",
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
    controller.removeMuestra
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
    "/api/ticket/jurado-list",
    [
      authJwt.verifyToken,
    ],
    controller.findJuradosAll
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

  app.get("/api/ticket/calificaciones", 
  [
    authTicketHash.verifyHash
  ],
  controller.calificaciones);
};
