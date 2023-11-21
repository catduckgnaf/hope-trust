require("dotenv").config();
const AWS = require("aws-sdk");
const credentials = { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY };
const cognitoClient = new AWS.CognitoIdentityServiceProvider({ ...credentials, region: process.env.REGION });
const UserPoolId = process.env.USER_POOL_ID;
const ClientUserPoolId = process.env.CLIENT_USER_POOL_ID;
const BenefitsUserPoolId = process.env.BENEFITS_USER_POOL_ID;

module.exports = { cognitoClient, UserPoolId, ClientUserPoolId, BenefitsUserPoolId };
