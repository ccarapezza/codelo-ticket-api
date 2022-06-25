const db = require("../models");
const Ticket = db.ticket;
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const QRCode = require('qrcode');

let mailTransport = nodemailer.createTransport({
  host: "h1000117.ferozo.com",
  port: 465,
  secure: true,
  auth: {
    user: "codeloticket@cogollosdeloeste.com.ar",
    pass: "k@pwv4294Djr",
  },
});

/**
 * Send email to the given email.
 */
function sendEmail(mailOptions) {
  return mailTransport.sendMail(mailOptions).then(function() {
    console.log('Email sent to: ' + mailOptions.to);
  });
}

/**
 * Send email to customer with your ticket
 */
 async function sendEmailToCustomer(ticket) {
  if(ticket.email&&ticket.nombre&&ticket.hash){
    const qrCodeB64 = await QRCode.toDataURL(ticket.hash);
  
    sendEmail({
      from: '"🎟️ Codelo Ticket 🎟️" <codeloticket@cogollosdeloeste.com.ar>', // sender address
      to: ticket.email, // list of receivers
      subject: "Tu entrada para la 8va Copa Cata del Oeste", // Subject line
      text: "Hola "+ticket.nombre+", aquí tienen tus entradas para la '8va Copa Capa del Oeste'", // plain text body
      
      html: "<p style='text-align: center'>Hola <b>"+ticket.nombre+"</b>, a continuación tenés tus entradas para la '8va Copa Capa del Oeste', podés imprimirla o mostrarla directamente desde tu celular en la entrada.</p><div style='margin: 0 auto 15px; width: fit-content; border: 1px solid black; display: grid;'><div style='text-align: center; background-color: black; color: white; font-weight: bold; padding: 10px;'><p>"+ticket.nombre+" "+ticket.apellido+"</p><p>E-TICKET #"+ticket.id+"</p></div><img src='cid:qr-code-codelo-ticket' style='margin: 0 auto;'/></div><div style='border: 1px solid black; width: fit-content; margin: 0 auto; display:table;'><img width='200' src='cid:logo-copa' style='display: table-cell;'/><ul style='list-style-type: none; display: table-cell; vertical-align: middle; padding: 15px;'><li><b>Fecha:</b> Domingo 17 de Julio</li><li><b>Hora:</b> 12:00 hrs.</li><li><b>Ubicaci&oacute;n:</b> - </li><li><b>Titular:</b> "+ticket.nombre+" "+ticket.apellido+" </li><li><b>DNI:</b> "+ticket.dni+" </li><li><b>Email:</b> "+ticket.email+" </li><li><b>Fecha de compra:</b> "+(new Date(ticket.createdAt).toLocaleString())+" </li></ul></div>",
      attachments: [{
          "filename": "qr-code-codelo-ticket.png",
          "path":qrCodeB64,
          "cid": "qr-code-codelo-ticket"
      },
      {
        "filename": "logo-copa.jpg",
        "path":"app/assets/logo-copa.jpg",
        "cid": "logo-copa"
      }]
    });
  }
}

exports.create = async(req, res) => {
  const data = req.body;
  
  Ticket.create({
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    email: data.email,
    tipo: data.tipo,
    observaciones: data.observaciones,
    pago: true,
    hash: crypto.createHash('sha1').update(data.dni+new Date().getTime().toString()).digest('hex')
  })
  .then(async(ticket) => {
    console.log("Ticket creado: ",ticket);
    sendEmailToCustomer(ticket);
    res.status(200).send({ message: "Ticket creado correctamente!" });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.reserve = async(req, res) => {
  const data = req.body;
  
  Ticket.create({
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    email: data.email,
    tipo: data.tipo,
    observaciones: data.observaciones,
    pago: false,
    hash: crypto.createHash('sha1').update(data.apellido+data.dni+new Date().getTime().toString()).digest('hex')
  })
  .then((ticket) => {
    console.log("Ticket reserved: ",ticket);
    res.status(200).send({ message: "Ticket reserved successfully!" });
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

exports.updatePago = (req, res) => {
  const data = req.body;
  console.log("Update Pago... ");
  Ticket.findOne({
    where:{
      id: data.id
    }
  })
  .then((ticket) => {
    if(!ticket.pago){
      Ticket.update({
        pago: true
      }, {
        where: {
          id: data.id
        }
      })
      .then((updatedCount) => {
        console.log("Ticket pagado: ",ticket);
        sendEmailToCustomer(ticket);
        res.status(200).send({ message: "Ticket pagado correctamente!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
    }else{
      res.status(500).send({ message: "El ticket ya está pago.",ticket });
    }
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });  
};

exports.cutTicketById = (req, res) => {
  const data = req.body;
  cutTicket(req, res, { id: data.id });
}

exports.cutTicketByHash = (req, res) => {
  const data = req.body;
  cutTicket(req, res, { hash: data.hash });
}

const cutTicket = (req, res, where) => {
  const data = req.body;

  Ticket.findOne({
    where:{
      hash: data.hash
    }
  })
  .then((ticket) => {
    if(ticket.pago&&!ticket.ingresado){
      Ticket.update({
        ingresado: true
      }, {
        where: {
          hash: data.hash
        }
      })
      .then((ticket) => {
        res.status(200).send(ticket);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message, ticket });
      });
    }else if(!ticket.pago){
      res.status(500).send({ message: "El ticket no está pago.", ticket });
    }else if(!ticket.ingresado){
      res.status(500).send({ message: "El ticket ya está cortado.", ticket });
    }
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