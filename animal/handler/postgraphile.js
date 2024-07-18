const { postgraphile } = require('postgraphile');
const connectionFilterPlugin = require('postgraphile-plugin-connection-filter');
const pg = require('pg');
require('dotenv').config()

const pgPool = new pg.Pool({
    user: process.env.ANI_DB_USER,
    host: process.env.ANI_DB_HOST,
    database: process.env.ANI_DB_NAME,
    password: process.env.ANI_DB_PASSWORD,
    port: process.env.ANI_DB_PORT,
    ssl: { rejectUnauthorized: false },
});

const handler = postgraphile(pgPool, 'public', {
    graphiql: true,
    enhanceGraphiql: true,
    watchPg: true,
    live: true,
    dynamicJson: true,
    appendPlugins: [connectionFilterPlugin],
});

module.exports.handler = handler;