const config = require("../config");
let database = require("postgresql-query");
database.config(config.environments[process.env.STAGE].postgres);

const handlers = {
  queryAll: async (table) => {
    return database.query(`SELECT * FROM ${table}`)
      .then((results) => {
        return results;
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
  },
  query: async (statement, ...arguments) => {
    return database.query(statement, arguments)
    .then((results) => {
      return results;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
  },
  queryOne: async (statement, ...arguments) => {
    return database.queryOne(statement, arguments)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  },
  multiQuery: async (queries) => {
    return database.query([...queries])
      .then((...results) => {
        return results;
      })
      .catch((error) => {
        console.log(error);
        return [];
      });
  },
  insert: async (table, fields, returning = "*") => {
    return database.update({
      table,
      fields,
      returnValue: returning
    })
      .then((result) => {
        return result[0];
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  },
  update: async (table, fields, where, returning = "*") => {
    return database.update({
      table,
      fields,
      where,
      returnValue: returning
    })
      .then((result) => {
        return result[0];
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  },
  updateById: async (table, id, fields, returning = "*") => {
    return database.update({
      table,
      fields,
      where: {
        id
      },
      returnValue: returning
    })
      .then((result) => {
        return result[0];
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  },
  delete: async (statement, ...arguments) => {
    return database.query(statement, arguments)
      .then((result) => {
        return !result.length;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  },
  deleteById: async (table, id) => {
    return database.query(`DELETE FROM ${table} WHERE id = $1`, id)
      .then((result) => {
        return !result.length;
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  }
};
module.exports = { database: handlers, config };
