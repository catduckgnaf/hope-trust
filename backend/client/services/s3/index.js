require("dotenv").config();
const AWS = require("aws-sdk");
const credentials = { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY };
const s3 = new AWS.S3({ ...credentials, region: process.env.REGION, apiVersion: "2006-03-01", signatureVersion: "v4" });

module.exports = { s3 };
