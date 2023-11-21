const HelloSign = require("hellosign-sdk")({ key: process.env.HELLOSIGN_API_KEY });
module.exports = HelloSign;