'use strict';

const Knex = require('knex');
const postgres_config = require('./postgres_config');
const knex = connect();

function connect(){
  try {
    // console.log(process.env);
    let config = postgres_config.development;
  // console.log(config);
  let knex;
  knex = connectWithUnixSockets(config);

  let replicas = config.replicas || [];

  knex.replicas = [];

  for (let i = 0; i < replicas.length; i++) {
    const e = replicas[i];
    knex.replicas.push(connectWithUnixSockets(e));
  }

  // console.log(knex);

  return knex;
  } catch (error) {
    console.log(error);
    return null;
  }
  
}

function connectWithUnixSockets(config) {
  return Knex(config);
}

const insert = (table, data, res) => {
  return knex(table)
          .insert(data, res)
}

const update = (table, options = { fields: {}, conditions: [] }) => {
  const { fields, conditions } = options
  return knex(table)
          .where(builder => {
              conditions.forEach(condition => {
                  builder.where(...condition)
              });
          })
          .update(fields)
          .then(data => data)
}

const count = (table, options = { fields: {}, conditions: [] }) => {
  const { fields, conditions } = options
  return knex(table)
          .count('id')
          .where(builder => {
              conditions.forEach(condition => {
                  builder.where(...condition)
              });
          }).then(data => data)
}

const select = (table, options = { fields: [], conditions: [], orderBy: null, order: 'ASC'}) => {
const { fields, conditions, orderBy, order} = options

let query = knex(table)
.select(fields)
.where(builder => {
    conditions.forEach(condition => {
        builder.where(...condition)
    });
});

if(orderBy && order) {
    query = query.orderBy(orderBy, order);
}

return query.then(data => data)
}

const delete2 = (table, options = { conditions: [] }) => {
const { conditions } = options
return knex(table)
        .where(builder => {
            conditions.forEach(condition => {
                builder.where(...condition)
            });
        })
        .del()
        .then(data => data)
}

const fun = (functionName, options = {params: ''}) => {
  const { params } = options
  return knex.raw(`select * from ${functionName}(${params})`)
  .then(data => {
    // console.log(data)


    return data.rows;
  }
    
    )
}

module.exports = {
  knex:knex,
  select: select,
  insert: insert,
  update: update,
  count: count,
  fun: fun,
  delete2: delete2
}