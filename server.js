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
require("./app/routes/param.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`CodeloTicket API - Server is running on port ${PORT}.`);
});