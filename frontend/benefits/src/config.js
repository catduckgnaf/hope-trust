const defaults = {
  system: {
    name: process.env.REACT_APP_NAME
  },
  s3: {
    REGION: process.env.REACT_APP_REGION,
    BUCKET: `${process.env.REACT_APP_STAGE}-uploads-bucket`
  },
  apiGateway: {
    REGION: process.env.REACT_APP_REGION,
    URL: `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/benefits`,
    NAME: process.env.REACT_APP_API_SERVICE
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
  hellosign: {
    HELLOSIGN_CLIENT_ID: process.env.REACT_APP_HELLOSIGN_CLIENT_ID
  },
  stripe: {
    STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY
  },
  google: {
    GOOGLE_ANALYTICS_TRACKING_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID,
    FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY
  }
};

const environments = {
  development: {
    system: {
      name: "hopetrust-benefits"
    },
    s3: {
      REGION: "us-east-1",
      BUCKET: "hopetrust-benefits-development-uploads-bucket"
    },
    apiGateway: {
      REGION: "us-east-1",
      URL: !process.env.REACT_APP_LOCAL ? "https://development-api.hopecareplan.com/benefits" : "http://localhost:3006",
      NAME: "hopetrust-benefits-backend-development-api"
    },
    cognito: {
      REGION: "us-east-1",
      USER_POOL_ID: "us-east-1_5aLBlyNR0",
      APP_CLIENT_ID: "7cah79k801v7rp5ea6rf87blia",
      IDENTITY_POOL_ID: "us-east-1:7954c95e-1d19-4882-9a54-ad344a63b379"
    },
    hellosign: {
      HELLOSIGN_CLIENT_ID: "eaaca32675dd4f5b3bc77805fe201793"
    },
    google: {
      GOOGLE_ANALYTICS_TRACKING_ID: "UA-200857227-1",
      FIREBASE_API_KEY: "AIzaSyC_jPceGZqyYrJlH5mCXCtIX51X3Ojs5Ww"
    },
    stripe: {
      STRIPE_PUBLIC_KEY: "pk_test_OmQvyJhD0F6pd7gXZeraTzxs00PUvqQMUN"
    },
    usersnap: {
      USERSNAP_API_KEY: "2107dc64-3812-41f4-91d7-903f1161a065"
    }
  },
  production: defaults,
  staging: defaults
};
module.exports = environments[process.env.REACT_APP_STAGE || "development"];