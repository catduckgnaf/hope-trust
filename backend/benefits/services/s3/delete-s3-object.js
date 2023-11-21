const { s3 } = require(".");

const deleteS3Object = async (account_id, key) => {
  const params = {
    Bucket: `${process.env.STAGE}-uploads-bucket`, 
    Key: `${account_id}/${key}`,
  };
  return s3.deleteObject(params).promise().then((data) => {
    return { success: true, data };
  }).catch((error) => {
    return { success: false, message: error.message };
  });
};

module.exports = deleteS3Object;