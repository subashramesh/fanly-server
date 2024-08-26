require('dotenv').config();
const parse = require("pg-connection-string").parse;

const url = `postgres://${process.env.DB_USER_SUPA}:${process.env.DB_PASSWORD_SUPA}@${process.env.DB_HOST_SUPA}:${process.env.DB_PORT_SUPA}/${process.env.DB_NAME_SUPA}`;
const url1 = `postgres://${process.env.DB_USER_SUPA}:${process.env.DB_PASSWORD_SUPA}@${process.env.DB_HOST_REPLICA_1}:${process.env.DB_PORT_SUPA}/${process.env.DB_NAME_SUPA}`;
console.log(url)
console.log(url1)
const pgconfig = parse(url);
const pgconfig1 = parse(url1);
// const pgconfig = {
//   connectionString: url,
// };

// pgconfig.ssl = { rejectUnauthorized: false };
let caa = `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUP7HFNL1F7Mcl0xzJJHPsT+tDmcIwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvN2Q4MTdjODItODkzNC00MDAwLTgxMjUtYWQzYTc0NzMz
NjM5IFByb2plY3QgQ0EwHhcNMjQwNjA1MDYyNTIxWhcNMzQwNjAzMDYyNTIxWjA6
MTgwNgYDVQQDDC83ZDgxN2M4Mi04OTM0LTQwMDAtODEyNS1hZDNhNzQ3MzM2Mzkg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMsVwZKL
N+0EaiVUeNsjrbdJaxKwR4AjbkoudJTIAAp4Pkg/8ssqCe+QQ3XqrQiAtxIdTDVb
qr41LDTcO0JYzRL+A8yzFFFSEBvIuuLt2EI+U0NJjVFP5EpD0ElZeSxuG4YZQx8y
SkZOkwUYD7sCktHldqrnTAuPVz8ewXEDQMi0zhZU5BrT0cMVQQRQ7438mWDJJ6wT
TuCPwHJXaU2Bq7Xhh67OSHLNp79WXI0ArokKJyI7QVD2c6nolFF/4W1XwnPBWN+o
J4CioUAhh+MBJkLRnmkyqZQsjKPYjNBatHLMTxd83NUA8m8PnQ8bdzSlXjroE20P
OXN0VhBFXqgHqL3e58wRvOWpu590+QklztX4DkGO9fgyQNwF8nKvGuotms6CtlAI
pi5YR161UygV6BuG9QwO+9cssZ0p0747JGJmntE7gVoVlLt8ynVVnqcQQfOX/me5
6v6mQfLqqkcrq6WKR34S9Ox68t9eGNG5vrfhK1mFBpH+lrecyGOA7S20EQIDAQAB
oz8wPTAdBgNVHQ4EFgQUR+V1KBCOgZWuUsAdg1wJ504HTKwwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBALcXS+PesCK+01Ai
8Hqz9tzal6847iKJtb+fcTHTIKJY7Tc/m614lRL8eQCh+VnoVTgF+BH8DBUtGWO5
g2mkJbd+qxoZCcEqrECLZJMFvI5qMdx1/RQiWd1wIjXitLLG7KUVlo29TyGNjGcT
q4sLjAdiIRmccDnDUtFPmJ8pCIDicnX1QrE4qHPdx2+YQtDQxYeGSQnOpOc6oe3t
ciwPxWwBw0IHuSKXPosWCVY3r5rkVbHG9ByTpCROrqtl+SNTcrAu8EtifDY+lfbL
9tjA+iLvE12sWWyOwCDVTYM/Wd6YIhBZVrs82IK1dcNFD0Q/4AmHNo0S8Q23qE6v
oyecStZwY3K0FYqQmTzHhH+miENY0R39WTlFLkZXOGtTzjHm0+fguZPeeSSY1Q2Y
BskEJCwjtMeuXoFUpL1Mvk9hF9WAtIq+HnDCfqZ786EElWy/mrZcQqgcitD03D3N
0a6h9yUt9RI9j/s6cah8GNbdBnF2obzovrbTqb+gFz4DHIC+aQ==
-----END CERTIFICATE-----
`
// pgconfig.ssl = {
//   ca: caa
// };
pgconfig.ssl = false

pgconfig.pool = {};
pgconfig.pool.max = 5;
pgconfig.pool.min = 5;
pgconfig.pool.acquireTimeoutMillis = 60000;
pgconfig.createTimeoutMillis = 30000;
pgconfig.idleTimeoutMillis = 600000;
pgconfig.createRetryIntervalMillis = 200;

module.exports = {
  development: {
    client: 'pg',
    connection: pgconfig,
    replicas: [
      {
        client: 'pg',
        connection: pgconfig1,
      },
    ],
  },
  
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
  