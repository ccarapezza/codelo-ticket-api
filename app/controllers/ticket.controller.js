const db = require("../models");
const Ticket = db.ticket;
const Muestra = db.muestra;
const Calificacion = db.calificacion;
const Categoria = db.categoria;
const Mesa = db.mesa;
const Dojo = db.dojo;
const Op = db.Sequelize.Op;
const crypto = require('crypto');

exports.create = async(req, res) => {
  const data = req.body;

  const ticketsN = await Ticket.findAll({raw: true, attributes: ['n']});
  const usedTicketsNs = ticketsN.map((ticket)=>ticket.n);
  let availableTicketsN = new Array();
  for(let i=1; i<120; i++){
    if(!usedTicketsNs.includes(i)){
      availableTicketsN.push(i);
    }
  }
  const n = availableTicketsN[Math.floor(Math.random() * availableTicketsN.length)];

  const muestraN = await Muestra.findAll({raw: true, attributes: ['n']});
  const usedMuestrasNs = muestraN.map((muestra)=>muestra.n);
  let availableMuestraN = new Array();
  for(let i=1; i<120; i++){
    if(!usedMuestrasNs.includes(i)){
      availableMuestraN.push(i);
    }
  }

  Ticket.create({
    name: data.name,
    dojoId: data.dojoId,
    grow: data.grow,
    n: n,
    hash: crypto.createHash('sha1').update(data.id+data.name+new Date().getTime().toString()).digest('hex')
  })
  .then((ticket) => {
    const hashedMuestras = data.muestras.map((muestra) => {
      const n = availableMuestraN[Math.floor(Math.random() * availableMuestraN.length)];
      availableMuestraN.push(n);
      return {
        ...muestra,
        n: n,
        hash: crypto.createHash('sha1').update(data.id+data.name+muestra.id+muestra.name+new Date().getTime().toString()).digest('hex')
      };
    });
    Muestra.bulkCreate(hashedMuestras).then((muestras) => {
      ticket.addMuestras(muestras).then(() => {
        res.status(200).send({ message: "Ticket registered successfully!" });
      });
    });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.createJurado = async(req, res) => {
  const data = req.body;

  const ticketsN = await Ticket.findAll({raw: true, attributes: ['n']});
  const usedTicketsNs = ticketsN.map((ticket)=>ticket.n);
  let availableTicketsN = new Array();
  for(let i=1; i<120; i++){
    if(!usedTicketsNs.includes(i)){
      availableTicketsN.push(i);
    }
  }
  const n = availableTicketsN[Math.floor(Math.random() * availableTicketsN.length)];

  Ticket.create({
    name: data.name,
    esJurado: true,
    n: n,
    hash: crypto.createHash('sha1').update(data.id+data.name+new Date().getTime().toString()).digest('hex')
  })
  .then((ticket) => {
    res.status(200).send({ message: "Jurado registered successfully!" });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.update = (req, res) => {
  const data = req.body;

  Ticket.update({
    name: data.name,
    dojoId: data.dojoId,
    grow: data.grow,
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

exports.removeMuestra = (req, res) => {
  const id = req.body.id;
  
  Muestra.destroy({
    where: {
      id: id
    }
  })
  .then((response) => {
    res.status(200).send({ message: "Muestra eliminada correctamente" });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.addMuestra = async(req, res) => {
  const data = req.body;
  const ticketId = data.ticketId;

  const muestraN = await Muestra.findAll({raw: true, attributes: ['n']});
  const usedMuestrasNs = muestraN.map((muestra)=>muestra.n);
  let availableMuestraN = new Array();
  for(let i=1; i<120; i++){
    if(!usedMuestrasNs.includes(i)){
      availableMuestraN.push(i);
    }
  }
  const n = availableMuestraN[Math.floor(Math.random() * availableMuestraN.length)];

  Ticket.findOne({
    where: {
      id: ticketId
    }
  })
  .then((ticket) => {

    Muestra.create({
      n: n,
      name: data.name,
      description: data.description,
      categoriaId: data.categoriaId,
      hash: crypto.createHash('sha1').update(ticketId+data.name+new Date().getTime().toString()).digest('hex')
    }).then((muestra) => {

      ticket.addMuestra(muestra).then((muestra) => {
        res.status(200).send(muestra);
      }).catch((err) => {
        res.status(500).send({ message: err.message });
      });
      
    }).catch((err) => {
      res.status(500).send({ message: err.message });
    });

  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.updateMuestra = (req, res) => {
  const data = req.body;

  Muestra.update({
    name: data.name,
    description: data.description,
    categoriaId: data.categoriaId,
  }, {
    where: {
      id: data.id
    }
  })
  .then((muestra) => {
    res.status(200).send(muestra);
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
  Ticket.findAll({
    include: [
      {
        model: Muestra,
        include: [Categoria],
      },
      {
        model: Mesa,
        as: "mesa"
      },
      {
        model: Mesa,
        as: "mesaSecundaria"
      },
      {
        model: Dojo
      }],
    where:{
      esJurado: false
    }
  })
  .then((tickets) => {
    res.status(200).send(tickets);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.findJuradosAll = (req, res) => {
  Ticket.findAll({
    include: [
      {
        model: Muestra,
        include: [Categoria],
      },
      {
        model: Mesa
      },
      {
        model: Dojo
      }],
    where:{
      esJurado: true
    }
  })
  .then((tickets) => {
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

exports.ticketLogin = (req, res) => {
  const hash = req.body.hash;
  Ticket.findOne({
    where: {
      hash: hash,
    },
    include: [{model: Mesa, as: "mesa"}, {model: Mesa, as: "mesaSecundaria"}]
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

exports.calificaciones = (req, res) => {
  const ticketId = req.ticket?.id;
  Calificacion.findAll({
    where: {
      ticketId: {
        [Op.eq]: ticketId
      }
    },
    include: [ Muestra ]
  }).then((calificaciones) => {
    res.status(200).send({ calificaciones:
      calificaciones.map((calificacion)=>{
        return({
          presentacion: calificacion.presentacion,
          aromaApagado: calificacion.aromaApagado,
          aromaPrendido: calificacion.aromaPrendido,
          saborApagado: calificacion.saborApagado,
          saborPrendido: calificacion.saborPrendido,
          createdAt: calificacion.createdAt,
          updatedAt: calificacion.updatedAt,
          muestra:{
            id: calificacion.muestra.id,
            n: calificacion.muestra.n,
            hash: calificacion.muestra.hash,
          }
        })
      })
    });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};
