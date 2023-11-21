const aws = require("aws-sdk");
const ses = new aws.SES({ region: "us-east-1", key: process.env.ACCESS_KEY, secret: process.env.SECRET_KEY });
const params = { RuleSetName: "SES-receipt-ruleset" };
console.log("Attempting to activate SES Ruleset.");
ses.setActiveReceiptRuleSet(params, function(err, data) {
  if (err) console.log(`ERROR: ${err.code}`, err.message);
  else console.log("Receipt Rule Activated: SES-receipt-ruleset");
});