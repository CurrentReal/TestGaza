var dbinfo = require('./db_info.json');
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: dbinfo.host,
    user: dbinfo.user,
    password: dbinfo.password,
    database: dbinfo.database
  },
  pool: { min: 0, max: 7 }
})

/*
// knex for App Engine
const Knex = require('knex');
const knex = connect();
function connect () {
  const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  // Connect to the database
  const knex = Knex({
    client: 'mysql',
    connection: config
  });

  return knex;
}
*/
module.exports = knex;
