import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import { limitInput } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from "react-stripe-elements";
import {
  InputWrapper,
  InputLabel,
  Input,
  FormContainer,
  RequiredStar,
  Button,
  CheckBoxInput
} from "../../global-components";
import {
  BillingContainer,
  StripePaymentMain,
  StripePaymentSections,
  StripePaymentSection,
  PaymentCardInfoContainer,
  PaymentCardInfo,
  PaymentReviewSection,
  PaymentReviewHeader,
  CustomFormStyles,
  PaymentButtonContainer,
  PaymentButtonItem
} from "./style";
import { addPaymentSource, closePaymentMethodsModal } from "../../store/actions/stripe";

class BillingForm extends Component {

  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      card_name: `${user.first_name} ${user.last_name}`,
      zip: user.zip || "",
      loading_update: false,
      primary: true
    };
  }

  createSource = async () => {
    let { stripe, user } = this.props;
    const { zip, card_name } = this.state;
    let response = await stripe.createToken({
      name: card_name,
      currency: "usd",
      address_zip: zip,
      address_country: "US"
    });
    if (response.token) {
      const owner = {};
      if (user.email) owner.email = user.email;
      if (card_name) owner.name = card_name;
      if (user.home_phone) owner.phone = user.home_phone;
      if (zip) owner.address = { postal_code: zip };
      let created = await stripe.createSource({
        type: "card",
        token: response.token.id,
        currency: "usd",
        owner
      });
      if (created.source) {
        return { success: true, data: created.source };
      } else {
        return { success: false, message: created.error.message };
      }
    } else {
      return { success: false, message: response.error.message };
    }
  }

  onStripeChange = (event) => {
    this.setState({ [event.elementType]: event.complete ? "complete" : "" });
  };

  clearForm = () => {
    this._number.clear();
    this._exp.clear();
    this._cvc.clear();
    this.card_name.value = "";
    this.setState({
      zip: "",
      primary: true
    });
  };

  validateFields = () => {
    const { cardNumber, cardExpiry, cardCvc, card_name, zip = 0 } = this.state;
    const stripe_fields = [cardNumber, cardExpiry, cardCvc].every((f) => f === "complete");
    return stripe_fields && (card_name && zip.length === 5);
  };

  submit = async (e) => {
    e.preventDefault();
    const { primary } = this.state;
    const { addPaymentSource, showNotification, closePaymentMethodsModal } = this.props;
    this.setState({ loading_update: true });
    if (this.validateFields()) {
      const source = await this.createSource();
      if (source.success) {
        await addPaymentSource(source.data, primary);
        closePaymentMethodsModal();
      } else {
        showNotification("error", "Error Creating Source", "There was a problem creating the new payment source.");
      }
    } else {
      showNotification("error", "Missing Fields", "You must fill in all required fields.");
    }
    this.setState({ loading_update: false });
  };

  componentDidMount() {
    // Fix Stripes broken rendering, remove iframe nodes from the dom before rendering a new one.
    const frames = document.querySelectorAll("iframe[name^=__privateStripeController]");
    for (var i = 0; i < frames.length; i++) frames[i].parentNode.removeChild(frames[i]);
  }

  render() {
    const { card_name, zip, loading_update, primary } = this.state;
    const { standalone = false, closePaymentMethodsModal } = this.props;
    return (
      <BillingContainer xs={12} sm={12} md={12} lg={standalone ? 12 : 6} xl={standalone ? 12 : 6}>
        <StripePaymentMain>
          <StripePaymentSections>
            <StripePaymentSection span={12}>
              <PaymentCardInfoContainer>
                {!standalone
                  ? (
                    <PaymentReviewSection span={12}>
                      <PaymentReviewHeader>Add Payment Method</PaymentReviewHeader>
                    </PaymentReviewSection>
                  )
                  : null
                }
                <PaymentCardInfo span={12}>
                  <FormContainer onSubmit={this.submit}>

                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Name on Card</InputLabel>
                      <Input
                        ref={(input) => this.card_name = input}
                        type="text"
                        value={card_name}
                        placeholder="James Earl Jones"
                        onChange={(event) => this.setState({ card_name: event.target.value })}
                      />
                    </InputWrapper>

                    <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}` }}>
                      <InputLabel><RequiredStar>*</RequiredStar> Card Number</InputLabel>
                      <CardNumberElement id="cardnumber" {...{ ...CustomFormStyles }} onReady={(element) => this._number = element} onChange={this.onStripeChange} />
                    </InputWrapper>

                    <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}` }}>
                      <InputLabel><RequiredStar>*</RequiredStar> Expiration</InputLabel>
                      <CardExpiryElement id="cardexpiration" {...{ ...CustomFormStyles }} onReady={(element) => this._exp = element} onChange={this.onStripeChange} />
                    </InputWrapper>

                    <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}` }}>
                      <InputLabel><RequiredStar>*</RequiredStar> CVC</InputLabel>
                      <CardCvcElement id="cvc" {...{ ...CustomFormStyles }} onReady={(element) => this._cvc = element} onChange={this.onStripeChange} />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        max="99999"
                        autoComplete="new-password"
                        autoFill="off"
                        value={zip}
                        placeholder="07734"
                        onKeyPress={(event) => limitInput(event, 4)}
                        onChange={(event) => this.setState({ zip: event.target.value })}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Set as default payment method?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={primary}
                        onChange={(event) => this.setState({ primary: event.target.checked })}
                        type="checkbox"
                      />
                    </InputWrapper>
                    <PaymentButtonContainer gutter={20}>
                      <PaymentButtonItem span={standalone ? 4 : 6}>
                        <Button widthPercent={100} green type="submit">{loading_update ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Add Card"}</Button>
                      </PaymentButtonItem>
                      <PaymentButtonItem span={standalone ? 4 : 6}>
                        <Button widthPercent={100} blue onClick={() => this.clearForm()} type="button">Reset Form</Button>
                      </PaymentButtonItem>
                      <PaymentButtonItem span={standalone ? 4 : 6}>
                        {standalone
                          ? <Button widthPercent={100} danger onClick={() => closePaymentMethodsModal()} type="button">Cancel</Button>
                          : null
                        }
                      </PaymentButtonItem>
                    </PaymentButtonContainer>
                  </FormContainer>
                </PaymentCardInfo>
              </PaymentCardInfoContainer>
            </StripePaymentSection>
          </StripePaymentSections>
        </StripePaymentMain>
      </BillingContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  addPaymentSource: (source, primary) => dispatch(addPaymentSource(source, primary)),
  closePaymentMethodsModal: () => dispatch(closePaymentMethodsModal())
});
export default connect(mapStateToProps, dispatchToProps)(injectStripe(BillingForm));
