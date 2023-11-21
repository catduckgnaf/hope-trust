const PgConnection = require("postgresql-easy");
const config = require("../config");
const database = new PgConnection(config.environments[process.env.STAGE].postgres);
module.exports = { database, config };
