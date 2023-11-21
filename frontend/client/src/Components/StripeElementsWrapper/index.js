import React, { Component } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../config";
import { StripeElementWrapperMain } from "./style";

const stripePromise = loadStripe(config.stripe.STRIPE_PUBLIC_KEY);
const options = {};

class StripeElementsWrapper extends Component {

  render() {
    return(
      <StripeElementWrapperMain>
        <Elements stripe={stripePromise} options={options}>
          {this.props.children}
        </Elements>
      </StripeElementWrapperMain>
    );
  }

}

export default StripeElementsWrapper;