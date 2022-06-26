const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Ticket = db.ticket;
const Role = db.role;
const User = db.user;

db.sequelize.sync();
/*
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and Resync Database with { force: true }");
  initial();
});
*/

// simple route
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido Codelo-Ticket API. MAIN (" + process.env.NODE_ENV + ")",
  });
});

app.get("/api/data", async (req, res) => {

  const ticketData = await Ticket.findAll({
    attributes: [[db.sequelize.fn('COUNT', 'id'), 'count']],
  });

  res.json({
    tickets: ticketData[0]    
  });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/ticket.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`CodeloTicket API - Server is running on port ${PORT}.`);
});

function initial() {
  Role.create({
      id: 1,
      name: "user",
  });

  Role.create({
      id: 2,
      name: "moderator",
  });

  Role.create({
      id: 3,
      name: "admin",
  });

  User.create({
      username: "admin",
      email: "admin@admin.com",
      password: "$2a$08$6e/QNEys..r1DPhtHqxVvOtMAfYOg.60p6wW8VANtapcyZg652aRS", //admin
      /*
      password: "$2a$08$ANDS1Yo6EQSQfzHQoybU2eBCR.3Ut6t4AL099R8hI3J.NE.o4vEaW", //23737nefasta
      password: "$2a$08$r7xBr0LQtrwkFjm27mNyountfloLujhhNF/6Adzl./VecMGUi0gVu", //c0p43d3n
      password: "$2a$08$7ceHWSMUYjCJbW8Aal8BVuTLqKn8LBjwWgKlV0tpx5S6DzeBLzmqC", //QKfbt4fLAT
      password: "$2a$08$6e/QNEys..r1DPhtHqxVvOtMAfYOg.60p6wW8VANtapcyZg652aRS", //admin
      */
  }).then((user) => {
      user.setRoles([1]);
  });
}