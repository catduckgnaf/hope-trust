import React, { Component } from "react";
import { StripeProvider, Elements } from "react-stripe-elements";
import BillingForm from "../BillingForm";
import config from "../../config";
import { loadStripe } from "@stripe/stripe-js/pure";

class BillingContainer extends Component {

  constructor() {
    super();
    this.state = { stripe: null };
  }

  async componentDidMount() {
    const stripe = await loadStripe(config.stripe.STRIPE_PUBLIC_KEY);
    this.setState({ stripe });
  }

  render() {
    const { stripe } = this.state;
    const { standalone } = this.props;
    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <BillingForm standalone={standalone} />
        </Elements>
      </StripeProvider>
    );
  }
}

export default BillingContainer;
