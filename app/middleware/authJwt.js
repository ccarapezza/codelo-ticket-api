const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Ticket = db.ticket;
const Mesa = db.mesa;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({
        message: "Forbidden!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

verifyTokenOrJudgeHash = (req, res, next) => {
  let hash = req.headers["x-access-hash"];
  let token = req.headers["x-access-token"];

  if (hash) {
    Ticket.findOne({
      where: {
        hash: hash,
      },
      include: [{model: Mesa, as: "mesa"}, {model: Mesa, as: "mesaSecundaria"}]
    }).then((ticket) => {
      if(ticket&&ticket?.esJurado){
        req.ticket = ticket?.toJSON();
        next();
      }else{
        return res.status(403).send({
          message: "Forbidden!"
        });
      }
    }).catch((err) => {
      res.status(500).send({ message: err.message });
    });
  }else if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).send({
          message: "Forbidden!"
        });
      }
      req.userId = decoded.id;
      next();
    });
  }else{
    return res.status(403).send({
      message: "No token or hash provided!"
    });
  }

};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(401).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator Role!"
      });
    });
  });
};

isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator or Admin Role!"
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin,
  verifyTokenOrJudgeHash: verifyTokenOrJudgeHash
};
module.exports = authJwt;
