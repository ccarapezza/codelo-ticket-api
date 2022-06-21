const db = require("../models");
const Ticket = db.ticket;
const crypto = require('crypto');

exports.create = async(req, res) => {
  const data = req.body;
  
  Ticket.create({
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    email: data.email,
    tipo: data.tipo,
    hash: crypto.createHash('sha1').update(data.apellido+data.dni+new Date().getTime().toString()).digest('hex')
  })
  .then((ticket) => {
    console.log("Ticket created: ",ticket);
    res.status(200).send({ message: "Ticket registered successfully!" });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.update = (req, res) => {
  const data = req.body;

  Ticket.update({
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    email: data.email,
    tipo: data.tipo,
  }, {
    where: {
      id: data.id
    }
  })
  .then((ticket) => {
    res.status(200).send(ticket);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.delete = (req, res) => {
  const data = req.body;

  Ticket.destroy({
    where: {
      id: data.id
    }
  })
  .then((response) => {
    res.status(200).send({ message: "Ticket eliminado correctamente" });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.findAll = (req, res) => {
  Ticket.findAll().then((tickets) => {
    res.status(200).send(tickets);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.getById = (req, res) => {
  const id = req.query.id;
  Ticket.findOne({
    include: [{
        model: Muestra,
        include: [Categoria],
      }, {
        model: Mesa,
        as: "mesa"
      },
      {
        model: Mesa,
        as: "mesaSecundaria"
      }],
    where:{
      id: id
    }
  })
  .then((ticket) => {
    res.status(200).send(ticket);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.ticketVerify = (req, res) => {
  const hash = req.body.hash;
  Ticket.findOne({
    where: {
      hash: hash,
    }
  }).then((ticket) => {
    if(ticket){
      res.status(200).send(ticket);
    }else{
      res.status(500).send({ message: "Datos inválidos." });  
    }
  }).catch((err) => {
    res.status(500).send({ message: err.message });
  });
};