const sms = require("sms-service");
const smsService = new sms.SMSService();

const sendSMS = async (number, message) => {
    const send = await smsService.sendSMS(number, message);
    return send;
};

module.exports = sendSMS;