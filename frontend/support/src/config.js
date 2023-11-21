const defaults = {
  system: {
    name: process.env.REACT_APP_NAME
  },
  s3: {
    REGION: process.env.REACT_APP_REGION,
    BUCKET: `${process.env.REACT_APP_STAGE}-uploads-bucket`
  },
  apiGateway: [
    {
      region: process.env.REACT_APP_REGION,
      endpoint: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/support`,
      name: "support",
    },
    {
      region: process.env.REACT_APP_REGION,
      endpoint: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/support/accounts`,
      name: "accounts",
    }
  ],
  stripe: {
    STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY
  },
  cognito: {
    REGION: process.env.REACT_APP_REGION,
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_APP_CLIENT_ID,
    IDENTITY_POOL_ID: process.env.REACT_APP_IDENTITY_POOL_ID
  },
  usersnap: {
    USERSNAP_API_KEY: process.env.REACT_APP_USERSNAP_API_KEY
  },
  google: {
    FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY
  }
};

const environments = {
  development: {
    system: {
      name: "hopetrust-cs"
    },
    s3: {
      REGION: "us-east-1",
      BUCKET: "hopetrust-cs-development-uploads-bucket"
    },
    apiGateway: [
      {
        region: "us-east-1",
        endpoint: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/support" : "http://localhost:3100",
        name: "support",
      },
      {
        region: "us-east-1",
        endpoint: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/support/accounts" : "http://localhost:3101",
        name: "accounts",
      }
    ],
    stripe: {
      STRIPE_PUBLIC_KEY: "pk_test_OmQvyJhD0F6pd7gXZeraTzxs00PUvqQMUN"
    },
    cognito: {
      REGION: "us-east-1",
      USER_POOL_ID: "us-east-1_mShZQZlyg",
      APP_CLIENT_ID: "ut7aadqs6dbgiibhd1n9coesj",
      IDENTITY_POOL_ID: "us-east-1:733db774-31b2-40a9-ab8d-23033ce786f9"
    },
    usersnap: {
      USERSNAP_API_KEY: "2107dc64-3812-41f4-91d7-903f1161a065"
    },
    google: {
      FIREBASE_API_KEY: "AIzaSyC_jPceGZqyYrJlH5mCXCtIX51X3Ojs5Ww"
    }
  },
  production: defaults,
  staging: defaults
};
module.exports = environments[process.env.REACT_APP_STAGE || "development"];