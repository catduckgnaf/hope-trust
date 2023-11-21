const { s3 } = require(".");

const createS3Object = async (file, type, key, bucket_name) => {
  const params = {
    Body: file, 
    Bucket: `${process.env.STAGE}-${bucket_name}`, 
    Key: key, 
    ServerSideEncryption: "AES256",
    ContentType: type,
    ContentEncoding: type
  };
  return s3.putObject(params).promise().then((data) => {
    return { success: true, data };
  }).catch((error) => {
    return { success: false, message: error.message };
  });
};

module.exports = createS3Object;