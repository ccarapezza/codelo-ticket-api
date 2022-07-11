const db = require("../models");
const Ticket = db.ticket;
const Param = db.param;
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const QRCode = require('qrcode');

let mailTransport = nodemailer.createTransport({
  host: "h1000117.ferozo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD
  },
});

const EMAIL_MESSAGE_TEMPLATE = `<p style='text-align: center'>%MESSAGE%</p>
  <div style='margin: 0 auto 15px; width: fit-content; border: 1px solid black; display: grid;'>
    <div style='text-align: center; background-color: black; color: white; font-weight: bold; padding: 10px;'>
      <p>%NOMBRE% %APELLIDO%</p><p>E-TICKET #%TICKET_ID%</p>
    </div>
    <img src='cid:qr-code-codelo-ticket' style='margin: 0 auto;'/>
  </div>
  <div style='border: 1px solid black; width: fit-content; margin: 0 auto; display:table;'>
    <img width='200' src='cid:logo-copa' style='display: table-cell;'/>
    <ul style='list-style-type: none; display: table-cell; vertical-align: middle; padding: 15px;'>
      <li><b>Fecha:</b> %EVENT_DATE%</li><li><b>Hora:</b> %EVENT_TIME%</li><li><b>Ubicaci&oacute;n:</b> %EVENT_LOCATION% </li><li><b>Titular:</b> %NOMBRE% %APELLIDO% </li><li><b>DNI:</b> %DNI% </li><li><b>Email:</b> %EMAIL% </li><li><b>Fecha de compra:</b> %FECHA_COMPRA% </li>
    </ul>
  </div>`;

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

    const params = await Param.findAll();

    let subject = "Tu entrada -";
    let msgContent = "-";
    let eventDate = "-";
    let eventTime = "-";
    let eventLocation = "-";
    
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      switch (param.name) {
        case "EMAIL_SUBJECT":
          subject = param.value;
          subject = subject.replace("%NOMBRE%", ticket.nombre)
          break;
        case "EMAIL_MESSAGE":
          msgContent = param.value;
          msgContent = msgContent.replace(/%NOMBRE%/g, "<b>"+ticket.nombre+"</b>")
          break;
        case "EMAIL_EVENT_DATE":
          eventDate = param.value;
          break;
        case "EMAIL_EVENT_HOUR":
          eventTime = param.value;
          break;
        case "EMAIL_EVENT_LOCATION":
          eventLocation = param.value;
          break;
      }
    }

    let message = EMAIL_MESSAGE_TEMPLATE;
    message = message.replace("%MESSAGE%", msgContent);
    message = message.replace(/%NOMBRE%/g, ticket.nombre);
    message = message.replace(/%APELLIDO%/g, ticket.apellido);
    message = message.replace("%TICKET_ID%", ticket.id);
    message = message.replace("%EVENT_DATE%", eventDate);
    message = message.replace("%EVENT_TIME%", eventTime);
    message = message.replace("%EVENT_LOCATION%", eventLocation);
    message = message.replace("%DNI%", ticket.dni);
    message = message.replace("%EMAIL%", ticket.email);
    message = message.replace("%FECHA_COMPRA%", new Date(ticket.createdAt).toLocaleString());
  
    sendEmail({
      from: '"🎟️ Codelo Ticket 🎟️" <codeloticket@cogollosdeloeste.com.ar>', // sender address
      to: ticket.email, // list of receivers
      subject: subject, // Subject line
      text: msgContent, // plain text body
      html: message,
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
    hash: crypto.createHash('sha1').update(data.dni+new Date().getTime().toString()).digest('hex')
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
      res.status(400).send({ message: "El ticket ya está pago.",ticket });
    }
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });  
};

exports.cutTicketById = (req, res) => {
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
      res.status(400).send({ message: "El ticket no está pago.", ticket });
    }else if(!ticket.ingresado){
      res.status(400).send({ message: "El ticket ya está cortado.", ticket });
    }
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
};

exports.cutTicketByHash = (req, res) => {
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

exports.resendEmail = (req, res) => {
  const data = req.body;
  console.log("Resend email... ");
  Ticket.findOne({
    where:{
      id: data.id
    }
  })
  .then((ticket) => {
    if(!ticket.pago){
      sendEmailToCustomer(ticket);
      res.status(200).send({ message: "E-Ticket enviado correctamente al destinatario!" });
    }else{
      res.status(400).send({ message: "El ticket no está pago.",ticket });
    }
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });  
};

exports.resendAllEmails = (req, res) => {
  const data = req.body;
  console.log("Resend all emails... ");
  Ticket.findAll({
    where:{
      id: data.id,
      pago: true
    }
  })
  .then((tickets) => {
    tickets.forEach(ticket => {
      sendEmailToCustomer(ticket);
    });
    res.status(200).send({ message: "E-Tickets enviados a los destinatarios." });
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });  
};