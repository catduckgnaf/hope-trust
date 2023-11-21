var aws = require("aws-sdk");
var ses = new aws.SES({ region: "us-east-1", key: process.env.ACCESS_KEY, secret: process.env.SECRET_KEY });

const sendEmail = async (config) => {
  const params = {
    Destination: {
      ToAddresses: [config.to]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: config.message
        },
        Text: {
          Charset: "UTF-8",
          Data: config.altText
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: config.subject
      }
    },
    ReplyToAddresses: [config.from],
    Source: config.from
  };

  const sendPromise = ses.sendEmail(params).promise();

  return sendPromise.then((data) => {
    console.log("RESULT: ", data.MessageId);
    return true;
  }).catch((err) => {
    console.error("ERROR: ", err, err.stack);
    return false;
  });
};

module.exports = sendEmail;