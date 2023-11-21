const { s3 } = require(".");

const getS3Object = async (account_id, key) => {
  var params = {
    Bucket: `${process.env.STAGE}-uploads-bucket`,
    Key: `${account_id}/${key}`,
  };
  return s3.getObject(params).promise().then((data) => {
    const url = s3.getSignedUrl("getObject", { ...params, Expires: 120 });
    return { success: true, url };
  }).catch((error) => {
    return { success: false, message: error.message };
  });
};

module.exports = getS3Object;