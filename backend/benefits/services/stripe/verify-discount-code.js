const Stripe = require(".");

const verifyDiscountCode = async (code) => {
  return await Stripe.coupons.retrieve(code)
  .then( (coupon) => {
    if (coupon.valid) {
      return { success: true, coupon };
    } else {
      return { success: false, message: "Coupon is not valid."};
    }
  })
  .catch( (error) => {
    return { success: false, message: "Could not find this coupon."};
  });
};

module.exports = verifyDiscountCode;
