const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Flavour");
  next();
});

app.use(bodyParser.json());

app.use('/', express.static('public'));


const server = http.Server(app);

// Function to start the server
async function start() {
  var port = process.env.PORT || 8170;
  server.listen(port, () => {
    console.log(`Server Started ID `);
  });
}

start();

module.exports = server;
