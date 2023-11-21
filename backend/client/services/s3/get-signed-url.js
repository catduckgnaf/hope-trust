const { s3 } = require(".");

const getSignedURL = async (config) => {
  var paramaters = {
    Bucket: `${process.env.STAGE}-uploads-bucket`,
    Key: `${config.account_id}/${config.key}`,
    ContentType: config.type
  };
  const url = s3.getSignedUrl(config.method, { ...paramaters, ...config.urlConfig });
  return url;
};

module.exports = getSignedURL;