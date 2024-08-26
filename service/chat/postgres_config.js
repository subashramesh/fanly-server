require('dotenv').config();
const parse = require("pg-connection-string").parse;

const url = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME_1}`;
const url1 = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST_REPLICA_1}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log(url)
console.log(url1)
const pgconfig = parse(url);
const pgconfig1 = parse(url1);
// const pgconfig = {
//   connectionString: url,
// };

// pgconfig.ssl = { rejectUnauthorized: false };
let caa = `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUNSkKnH5hw0FKJGX3m+yiVRw150MwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvNjU4NzU4NWUtN2FmYS00N2MyLThhYjktMTljYTExZTll
M2YxIFByb2plY3QgQ0EwHhcNMjQwMjE5MTQwNDQ0WhcNMzQwMjE2MTQwNDQ0WjA6
MTgwNgYDVQQDDC82NTg3NTg1ZS03YWZhLTQ3YzItOGFiOS0xOWNhMTFlOWUzZjEg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJEdGx//
FCELLPEUrzczXc5qsEZdVF3t+fiScmlDR2Oe8sxKOI/WhyUx588K+LD9LTGfzs9P
J/+CI2yMzIEDspMuB3HXy077DSXoTtgbWLLxy8aWoP/iX5zmt7x9Mc11vqL8DJRf
fPDPVot2vcQISHWwGtbaIoAgniiNQwHLfLUxK8ircIZWaYv3a0UiaKylWk+U5cWJ
9gp1Wq5AxYnOy8T689kDyB18to6hAUsnrJgoTzNeQJc8x/i1huHTqjzlNT07Q5s+
DxBtPR4ZIwSw0ETsdtdCHzcvZjgcTnfQppp9ezW6U1K0vaXMc6MPIbteOh88Zg6Y
06W4L+VYAqjesG8GbfHROmyNzvreH1TsTHzFnYncp6qpOZpqxc9hsgk8334OdWif
siRiMtLl81SAVRGDTaYsxeKtRhTPwA9ptabp/nFfv7jN3oSxV9FWe0QDHTwPQHhg
Cnl17ZBX0m2yS3ZBZLirVCZ2k1EEQbq5clv/n7qd8RPmBj07quRZlWeVgwIDAQAB
oz8wPTAdBgNVHQ4EFgQUq2YGFnGl32PgAOqHfmashdEzJ9kwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAIpZ3SZHLnIuctuO
eWo7YVdvOhZ6H/jLPH931d94BDJnwKoQlvO5ZTFQjYze8AUYFWILL0tD9YZhpGnU
zZFVaDtqI4uJluT5qhyOv9P6I4ItAejyW33TeaDuAiLZlROPdIxsu8U2aGy5XST5
1RPaZ4vFLcnzFg0Z+PGNnQc7Ztj0a+Tf2t1rh6/tqQmu3wd/ck2w+lgFm/Ye+r34
KId8szQ7Xtet5zadxTc/snVT5O43MaEizd7zgHxiIGQUgaVBdthW6lPAHNVyoOIY
OxA/pJHP9JHfXdwLNO1Xwz7EysyzoIrFMukVEi0R6VxU1RfY3z1/U0m9aqI77cyC
8y8N+RO8l2l3a0SjNZlo7taabr6A36nusoEV4n6vncdqofPTK976Fz+1JruEMZ0M
Y6dnjJYKTCHdVy/e1/KBUKsWbO4It7mJ7nrQiiBa+yjE4jdijSmYMGyF309lJ4Dp
RH9uC9ORWZBbPX47yoI6X0THDjLp+J6NYIlzpUM4IhknTGh7Ag==
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
  