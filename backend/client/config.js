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
    "account-admin-view",
    "account-admin-edit",
    "finance-view",
    "finance-edit",
    "health-and-life-view",
    "health-and-life-edit",
    "grantor-assets-view",
    "grantor-assets-edit",
    "request-hcc-view",
    "request-hcc-edit",
    "myto-view",
    "myto-edit",
    "budget-view",
    "budget-edit"
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
