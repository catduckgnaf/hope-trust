const pjson = require("./package.json");

module.exports.default = () => {
  return {
    [`${pjson.name}Warmer`]: {
      "memorySize": 128,
      "concurrency": 2,
      "cleanFolder": true,
      "role": "arn:aws:iam::876754924956:role/IamRoleLambdaExecution",
      "timeout": 30,
      "prewarm": true,
      "enabled": [
        "staging",
        "production"
      ],
      "tracing": false,
      "verbose": false,
      "events": [
        {
          "schedule": "rate(15 minutes)"
        }
      ]
    }
  };
};