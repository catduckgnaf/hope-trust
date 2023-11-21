const HelloSign = require(".");

const getHelloSignEmbedURL = async (signatureId) => {
  return HelloSign.embedded.getSignUrl(signatureId)
    .then((res) => {
        return { success: true, data: res.embedded.sign_url };
    }).catch((err) => {
        return { success: false, message: err.message };
    });

};

module.exports = getHelloSignEmbedURL;