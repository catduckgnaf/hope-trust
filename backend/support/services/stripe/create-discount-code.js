const Stripe = require(".");
const { generateCodeDigits } = require("./utilities");
const { v1 } = require("uuid");

const createDiscountCode = async (user, prefix, options, metadata) => {
  let dicount_code = generateCodeDigits();
  return await Stripe.coupons.create({
    ...options,
    id: `${prefix}_${dicount_code}`,
    name: `${prefix}_${dicount_code}`,
    metadata: {
      email: user.email,
      cognito_id: user.cognito_id,
      ...metadata
    },
  },
  { idempotencyKey: v1() })
    .then((coupon) => {
      return coupon;
    })
    .catch((error) => {
      return false;
    });
};

module.exports = createDiscountCode;
