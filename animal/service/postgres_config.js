require('dotenv').config();
const parse = require("pg-connection-string").parse;

const url = `postgres://${process.env.ANI_DB_USER}:${process.env.ANI_DB_PASSWORD}@${process.env.ANI_DB_HOST}:${process.env.ANI_DB_PORT}/${process.env.ANI_DB_NAME}`;

const pgconfig = parse(url);
// const pgconfig = {
//   connectionString: url,
// };

pgconfig.ssl = false;
// PGSSLMODE=no-verify 
pgconfig.pool = {};
pgconfig.pool.max = 5;
pgconfig.pool.min = 5;
pgconfig.pool.acquireTimeoutMillis = 60000;
pgconfig.createTimeoutMillis = 30000;
pgconfig.idleTimeoutMillis = 600000;
pgconfig.createRetryIntervalMillis = 200;
console.log(pgconfig)
module.exports = {
  development: {
    client: 'pg',
    connection: pgconfig,
    retryOnInitFail: true,
  }
}


// module.exports = {
//     development: {
//       client: 'pg',
//       connection: {
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         user: process.env.DB_USER,
//         password: `${process.env.DB_PASSWORD}`,
//         database: process.env.DB_NAME,
//         charset: 'utf8',
//         ssl: {
//           rejectUnauthorized: false
//         }
//       },
//       pool: {}
//     }
//   };
  