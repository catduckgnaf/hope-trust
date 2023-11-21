require("dotenv").config();
const AWS = require("aws-sdk");
const credentials = { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY };
let cognitoClient = new AWS.CognitoIdentityServiceProvider({ ...credentials, region: process.env.REGION });
let UserPoolId = process.env.USER_POOL_ID;

module.exports = { cognitoClient, UserPoolId };
