const express = require('express');
const path = require('path');
const http = require('http');
// const adminRouter = require('./admin/routes.js');
const cors = require('cors');
const pm2 = require('pm2');
// const fcmXmpp = require('./service/firebase/fcm_xmpp.js');
const { createAdapter } = require('@socket.io/redis-adapter');
const bodyParser = require('body-parser');
// const jobs = require('./jobs/jobs.js');
require('./service/firebase/firebase.js');
const app = express();
require('dotenv').config();
const socketIo = require('socket.io');
const {Redis} = require('ioredis');

const preview = require('./handler/preview.js');

// const postgraphile = require('./animal/handler/postgraphile.js');
// const graph = require('./handler/postgraphile.js');

app.set('view engine', 'pug');

const io = socketIo() ;
app.io = io;
global.io = io;

app.use(preview.router);

// app.use(cors());

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
console.log(`Redis Host: ${redisHost}, Redis Port: ${redisPort}`);
const serviceUri = 'rediss://default:AVNS_7FeXjGYYdecFfnayCAL@caching-2f13ceb3-rahuvaran88-d22e.h.aivencloud.com:10923';
// const pubClient = new Redis(redisPort, redisHost);
const pubClient = new Redis();
global.redisPub = pubClient;
const subClient = pubClient.duplicate();
global.redisSub = subClient;

io.adapter(createAdapter( pubClient, subClient ));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Flavour, X-Star, X-Package");
  next();
});

app.use(bodyParser.json());
// app.use(postgraphile.handler);
// app.use(graph.handler);

const router = require('./route/route.js');
// const animal = require('./animal/route/route.js');

app.use((req, res, next) => {
  next();
});

// Route handlers
app.use('/api/v1', router.router);
// app.use('/api/v1/admin', adminRouter.router);
// app.use('/api/v2', animal.router);
app.use('/', express.static('public'));

app.get('/.well-known/assetlinks.json', async (req, res) => {
  res.json([
    {
      "relation": [
        "delegate_permission/common.handle_all_urls"
      ],
      "target": {
        "namespace": "android_app",
        "package_name": "com.timesmed.wego",
        "sha256_cert_fingerprints": [
          "DB:A7:65:1F:2F:92:5D:CE:2E:3D:5D:8E:CC:80:9D:E8:7B:8F:CC:0D:36:97:95:F4:B3:1A:7E:A4:3A:46:26:34"
        ]
      }
    }
  ]);
});

app.get('/app-ads.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'app-ads.txt'));
});

app.get('/.well-known/acme-challenge/_kYd_Hjxfo71zt6E-S6F4PPOtki2ohg0GiM1Y2f7xKg', (req, res) => {
  return res.send('_kYd_Hjxfo71zt6E-S6F4PPOtki2ohg0GiM1Y2f7xKg.muIfSoW97hDwcEzQ7C2O9lqNhj6fHslozjQ6dh6B4xI');
});

const server = http.Server(app);
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

// Function to start the server
async function start() {
  var port = process.env.PORT || 8170;
  let pmId = `${process.env.pm_id}`;
  
  // if (pmId !== '0') {
  //   port += 1;
  // }
  
  // Start server
  server.listen(port, () => {
    console.log(`Server Started ID ${pmId}`);
  });
}

start();

module.exports = server;
