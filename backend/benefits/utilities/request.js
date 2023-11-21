const moment = require("moment");

// set basic headers for response
const getHeaders = () => {
  return {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8"
  };
};

// return generic response if the Lambda function is already initialized
const warm = {
  statusCode: 200,
  headers: getHeaders(),
  body: JSON.stringify({
    success: true,
    message: "This function is warm. Exiting early."
  })
};

// return generic response if referred by a headless browser
const headless = {
  statusCode: 200,
  headers: getHeaders(),
  body: JSON.stringify({
    success: true,
    message: "This is a headless browser. Exiting early."
  })
};

const isExpired = (created, expires_in) => {
  let start = moment(created);
  let end = moment(start).add(expires_in, "seconds");
  return moment().isAfter(end);
};

const extractJSON = (str) => {
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf("{", firstOpen + 1);
  do {
    firstClose = str.lastIndexOf("}");
    if (firstClose <= firstOpen) {
      return null;
    }
    do {
      candidate = str.substring(firstOpen, firstClose + 1);
      try {
        var res = JSON.parse(candidate);
        return [res, firstOpen, firstClose + 1];
      }
      catch (e) {
        console.log("Failed to parse JSON");
      }
      firstClose = str.substr(0, firstClose).lastIndexOf("}");
    } while (firstClose > firstOpen);
    firstOpen = str.indexOf("{", firstOpen + 1);
  } while (firstOpen !== -1);
};

module.exports = {
  getHeaders,
  warm,
  headless,
  isExpired,
  extractJSON
};
