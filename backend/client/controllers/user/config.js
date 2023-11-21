const defaults = {
  postgres: {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 5000,
    max: 100,
    application_name: process.env.SERVICE
  },
  allPermissions: [
    "basic-user",
    "hopetrust-super-admin"
  ],
  cognitoPoolId: process.env.USER_POOL_ID
};

const environments = {
  development: defaults,
  production: defaults,
  staging: defaults
};
module.exports.environments = environments;
module.exports.environment = () => environments;
