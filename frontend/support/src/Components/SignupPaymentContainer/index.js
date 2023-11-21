import React, { Component } from "react";
import { StripeProvider, Elements } from "react-stripe-elements";
import StripePaymentForm from "../StripePaymentForm";
import config from "../../config";
import { loadStripe } from "@stripe/stripe-js/pure";

class SignupPaymentContainer extends Component {

  constructor() {
    super();
    this.state = { stripe: null };
  }

  async componentDidMount() {
    const stripe = await loadStripe(config.stripe.STRIPE_PUBLIC_KEY);
    this.setState({ stripe });
  }

  render() {
    const { setNewState, details, signupUser, termsAccepted, SAASAccepted, missingFields, is_user_creation, is_partner_creation } = this.props;
    const { stripe } = this.state;
    return (
      <StripeProvider stripe={stripe}>
        <Elements>
          <StripePaymentForm is_user_creation={is_user_creation} is_partner_creation={is_partner_creation} missingFields={missingFields} SAASAccepted={SAASAccepted} termsAccepted={termsAccepted} setNewState={setNewState} details={details} signupUser={signupUser} />
        </Elements>
      </StripeProvider>
    );
  }
}

export default SignupPaymentContainer;
