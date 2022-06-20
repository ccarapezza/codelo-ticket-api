const db = require("../models");
const Ticket = db.ticket;
const Mesa = db.mesa;

verifyHash = (req, res, next) => {
  let hash = req.headers["x-access-hash"];

  if (!hash) {
    return res.status(403).send({
      message: "No hash provided!"
    });
  }

  Ticket.findOne({
    where: {
      hash: hash,
    },
    include: [{model: Mesa, as: "mesa"}, {model: Mesa, as: "mesaSecundaria"}]
  }).then((ticket) => {
    if(ticket){
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
};

const authTicketHash = {
  verifyHash: verifyHash
};

module.exports = authTicketHash;
