const Stripe = require(".");
const { handleStripeError } = require("./utilities");

const deleteDiscountCode = async (code) => {
  return await Stripe.coupons.del(code)
  .then( (coupon) => {
    if (coupon.deleted) {
      return { success: true, coupon };
    } else {
      return { success: false, message: "We could not delete this coupon."};
    }
  })
  .catch( (error) => {
    return { success: false, message: handleStripeError(error) };
  });
};

module.exports = deleteDiscountCode;
