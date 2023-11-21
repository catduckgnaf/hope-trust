const { s3 } = require(".");

const moveAndDeleteFile = async ({ parent_folder, new_folder, new_key, old_folder, old_key }) => {
  const copyparams = {
    Bucket: `${process.env.STAGE}-uploads-bucket`,
    Key: `${parent_folder}/${new_folder}/${new_key}`,
    CopySource: `${process.env.STAGE}-uploads-bucket/${parent_folder}/${old_folder}/${old_key}`,
  };

  await s3.copyObject(copyparams).promise();

  const deleteparams = {
    Bucket: `${process.env.STAGE}-uploads-bucket`,
    Key: `${parent_folder}/${old_folder}/${old_key}`
  };

  return s3.deleteObject(deleteparams).promise().then((data) => {
    if (data.DeleteMarker) return { success: true, data };
    return { success: false };
  }).catch((error) => {
    return { success: false, message: error.message };
  });
};

module.exports = moveAndDeleteFile;