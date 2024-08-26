const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { router } = require('./route/route.js');
const { response } = require('./middleware/response.js');
const postgraphile = require('./handler/postgraphile.js');
const app = express();
require('dotenv').config()

app.use(cors({ origin: '*' }))
app.use(bodyParser.json());
app.use(postgraphile.handler)


app.use('/api/v1',response , router);

app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000');
});

module.exports.handler = serverless(app);