const HelloSign = require(".");

const getHelloSignDownloadLink = async (signature_id) => {
  return HelloSign.signatureRequest.download(signature_id, { file_type: "pdf", get_url: true })
  .then((res) => {
    return { success: true, data: res };
  }).catch((err) => {
    console.log(err);
    return { success: false, message: err.message };
  });

};

module.exports = getHelloSignDownloadLink;