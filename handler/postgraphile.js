const { postgraphile } = require('postgraphile');
const connectionFilterPlugin = require('postgraphile-plugin-connection-filter');
const pg = require('pg');
require('dotenv').config()

const pgPool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: false,
});

const handler = postgraphile(pgPool, 'public', {
    graphiql: true,
    enhanceGraphiql: true,
    graphqlRoute: '/v2/graphql',
    graphiqlRoute: '/v2/graphiql',
    watchPg: true,
    live: true,
    dynamicJson: true,
    appendPlugins: [connectionFilterPlugin],
});

module.exports.handler = handler;