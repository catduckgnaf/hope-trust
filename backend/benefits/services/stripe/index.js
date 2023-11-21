const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
Stripe.setMaxNetworkRetries(2);
module.exports = Stripe;
