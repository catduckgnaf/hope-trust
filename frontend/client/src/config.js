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
      endpoint: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/client`,
      name: "client",
    },
    {
      region: process.env.REACT_APP_REGION,
      endpoint: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/client/users`,
      name: "users",
    }
  ],
  cognito: {
    REGION: process.env.REACT_APP_REGION,
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID,
    APP_CLIENT_ID: process.env.REACT_APP_APP_CLIENT_ID,
    IDENTITY_POOL_ID: process.env.REACT_APP_IDENTITY_POOL_ID
  },
  stripe: {
    STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY
  },
  usersnap: {
    USERSNAP_API_KEY: process.env.REACT_APP_USERSNAP_API_KEY
  },
  dropbox: {},
  hellosign: {
    HELLOSIGN_CLIENT_ID: process.env.REACT_APP_HELLOSIGN_CLIENT_ID
  },
  plaid: {
    PLAID_PUBLIC_KEY: process.env.REACT_APP_PLAID_PUBLIC_KEY,
    PLAID_ENVIRONMENT: process.env.REACT_APP_STAGE !== "production" ? "development" : "production",
    WEBHOOK_URL: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/client/plaid/webhooks/update`
  },
  google: {
    GOOGLE_ANALYTICS_TRACKING_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID,
    FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY
  }
};

const environments = {
  development: {
    system: {
      name: "hopetrust"
    },
    s3: {
      REGION: "us-east-1",
      BUCKET: "development-uploads-bucket"
    },
    apiGateway: [
      {
        region: process.env.REACT_APP_REGION,
        endpoint: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/client" : "http://localhost:3200",
        name: "client",
      },
      {
        region: process.env.REACT_APP_REGION,
        endpoint: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/client/users" : "http://localhost:3201",
        name: "users",
      }
    ],
    cognito: {
      REGION: "us-east-1",
      USER_POOL_ID: "us-east-1_mV9zA6WW8",
      APP_CLIENT_ID: "2u90or7bjqh3ure0b91in9vd0h",
      IDENTITY_POOL_ID: "us-east-1:e8ea35be-36da-4f11-a37a-8f1cdcce0e3a"
    },
    stripe: {
      STRIPE_PUBLIC_KEY: "pk_test_OmQvyJhD0F6pd7gXZeraTzxs00PUvqQMUN"
    },
    usersnap: {
      USERSNAP_API_KEY: "2107dc64-3812-41f4-91d7-903f1161a065"
    },
    dropbox: {},
    hellosign: {
      HELLOSIGN_CLIENT_ID: "eaaca32675dd4f5b3bc77805fe201793"
    },
    plaid: {
      PLAID_PUBLIC_KEY: "63f11ebe33ab6c9df7b69d40ba9523",
      PLAID_ENVIRONMENT: "sandbox",
      WEBHOOK_URL: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/client/plaid/webhooks/update" : "http://localhost:3200/plaid/webhooks/update",
    },
    google: {
      GOOGLE_ANALYTICS_TRACKING_ID: "G-MQN5PZKEN3",
      FIREBASE_API_KEY: "AIzaSyC_jPceGZqyYrJlH5mCXCtIX51X3Ojs5Ww"
    }
  },
  production: defaults,
  staging: defaults
};
module.exports = environments[process.env.REACT_APP_STAGE || "development"];