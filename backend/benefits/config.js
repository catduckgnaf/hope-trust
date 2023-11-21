const defaults = {
  postgres: {
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    idleTimeoutMillis: 5000,
    max: 500,
    debug: !!process.env.IS_LOCALHOST
  },
  allPermissions: [
    "basic-user",
    "account-admin-view",
    "account-admin-edit",
    "wholesale",
    "retail",
    "agent",
    "group",
    "team"
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
