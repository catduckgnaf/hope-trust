import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import { limitInput } from "../../utilities";
import { createSignupError } from "../../store/actions/signup";
import { verifyDiscount } from "../../store/actions/product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import { lighten } from "polished";
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
  Hint,
  FormContainer,
  FormSuccess,
  RequiredStar
} from "../../global-components";
import {
  StripePaymentMain,
  StripePaymentSections,
  StripePaymentSection,
  PaymentCardInfoContainer,
  PaymentCardInfo,
  PaymentReviewContainer,
  PaymentReviewSection,
  PaymentReviewHeader,
  PaymentReviewBody,
  PaymentReviewFooter,
  PaymentFooterInputContainer,
  PaymentFooterInput,
  PaymentFooterInputLabel,
  PaymentFooterInputButton,
  PaymentFooterInputButtonContainer,
  PaymentReviewLineItems,
  PaymentReviewLineItem,
  LineItemTitle,
  LineItemCost,
  LineItemCostText,
  CustomFormStyles,
  PaymentHint
} from "./style";
import { isString } from "lodash";

class StripePaymentForm extends Component {

  constructor(props) {
    super(props);
    const { user, is_partner_creation, details } = props;
    if (user.coupon && user.coupon.valid && user.coupon.id && is_partner_creation && !details.referral_code) this.verifyDiscountCode(user.coupon.id);
    this.state = {
      is_verifying_discount: false,
      is_verifying_referral: false,
      discount_unnapplied: false,
      referral_unnapplied: false
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { stripe, details, signupUser, setNewState, createSignupError } = this.props;
    const { paymentNameOnCard, paymentZip } = details;
    if (!this.checkForUnappliedDiscount({}) && !this.checkForUnappliedReferral({})) {
      setNewState("is_creating_account", true);
      const tokenResponse = await stripe.createToken({ name: paymentNameOnCard, currency: "usd", address_zip: paymentZip });
      if (!tokenResponse.error) {
        setNewState("tokenResponse", tokenResponse);
        signupUser();
      } else {
        createSignupError(tokenResponse.error, "Payment token creation");
        setNewState("is_creating_account", false);
      }
    }
  };

  onStripeChange = (event) => {
    const { setNewState } = this.props;
    setNewState([event.elementType], event.complete ? "complete" : "");
  };

  verifyDiscountCode = async (code) => {
    const { setNewState, verifyDiscount, showNotification } = this.props;
    if (code) code = code.replace(/\s+/g, "");
    this.setState({ is_verifying_discount: true });
    const coupon = await verifyDiscount(code);
    this.setState({ is_verifying_discount: false });
    if (coupon) {
      if (coupon.metadata.isReferral === "true") {
        showNotification("error", "Invalid Discount", "This code is not valid as a discount.");
      } else {
        setNewState("discountCode", coupon);
        this.setState({ discount_unnapplied: false });
      }
    }
  };

  verifyReferral = async (code) => {
    const { setNewState, verifyDiscount, showNotification } = this.props;
    if (code) code = code.replace(/\s+/g, "");
    this.setState({ is_verifying_referral: true });
    const coupon = await verifyDiscount(code);
    this.setState({ is_verifying_referral: false });
    if (coupon) {
      if (coupon.metadata.isReferral === "true") {
        setNewState("referral_code", coupon);
        this.setState({ referral_unnapplied: false });
      } else {
        showNotification("error", "Invalid Referral", "This is not a valid referral code. Please check with your advisor for a valid referral code.");
      }
    }
  };

  getErrorStyles = (id) => {
    const { missingFields } = this.props;
    if (missingFields[id]) {
      return {
        style: {
          base: {
            color: `${theme.fontGrey}`,
            lineHeight: "40px",
            "::placeholder": {
              color: `${lighten(0.25, theme.errorRed)}`,
              fontWeight: "300",
              fontSize: "13px"
            },
          },
          invalid: {
            color: "#9e2146",
          },
        }
      };
    } else {
      return {};
    }
  };

  checkForUnappliedDiscount = (event) => {
    const { showNotification, details } = this.props;
    const { discountCode } = details;
    if (discountCode && isString(discountCode)) {
      if ((event && event.relatedTarget && event.relatedTarget.id !== "apply_discount_button") || !event.relatedTarget) {
        showNotification("error", "Unapplied Discount", "Did you forget to apply your discount? Make sure to click the 'Apply' button or clear the field.");
        this.setState({ discount_unnapplied: true });
        return true;
      }
      this.setState({ discount_unnapplied: false });
      return false;
    }
    this.setState({ discount_unnapplied: false });
    return false;
  };

  checkForUnappliedReferral = (event) => {
    const { showNotification, details } = this.props;
    const { referral_code } = details;
    if (referral_code && isString(referral_code)) {
      if ((event && event.relatedTarget && event.relatedTarget.id !== "apply_referral_button") || !event.relatedTarget) {
        showNotification("error", "Unapplied Referral", "Did you forget to apply your referral? Make sure to click the 'Apply' button or clear the field.");
        this.setState({ referral_unnapplied: true });
        return true;
      }
      this.setState({ referral_unnapplied: false });
      return false;
    }
    this.setState({ referral_unnapplied: false });
    return false;
  };

  componentDidMount() {
    const { user, setNewState, details } = this.props;
    setNewState("paymentNameOnCard", (details.first && details.last) ? `${details.first} ${details.last}` : `${user.first_name} ${user.last_name}`);
  }

  render() {
    const { is_verifying_discount, is_verifying_referral, discount_unnapplied, referral_unnapplied } = this.state;
    const { setNewState, details, missingFields, is_partner_creation } = this.props;
    const { paymentNameOnCard, paymentZip, planChoice, discountCode, referral_code, responsibility } = details;
    const currency_format = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    let monthly = (planChoice.monthly/100) || 0;
    let monthly_discount = ((discountCode.percent_off ? (((discountCode.percent_off / 100) * monthly)) : (discountCode.amount_off / 100) || 0));
    if (planChoice.coupon) monthly_discount = ((planChoice.coupon.percent_off ? (((planChoice.coupon.percent_off / 100) * monthly)) : planChoice.coupon.amount_off/100));
    return (
      <StripePaymentMain>
        <StripePaymentSections gutter={25}>
          <StripePaymentSection xs={12} sm={5} md={7} lg={7} xl={7}>
            <PaymentCardInfoContainer>
              <PaymentReviewSection span={12}>
                <PaymentReviewHeader>Payment Information</PaymentReviewHeader>
              </PaymentReviewSection>
              <PaymentCardInfo span={12}>
                <FormContainer onSubmit={this.handleSubmit} autoComplete="off">

                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Name on Card</InputLabel>
                    <Input
                      ref={(input) => this.name = input}
                      type="text"
                      id="paymentNameOnCard"
                      value={paymentNameOnCard}
                      placeholder="James Earl Jones"
                      onChange={(event) => setNewState(event.target.id, event.target.value)}
                    />
                  </InputWrapper>

                  <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}` }}>
                    <InputLabel><RequiredStar>*</RequiredStar> Card Number</InputLabel>
                    <CardNumberElement id="cardnumber" {...{...CustomFormStyles, ...this.getErrorStyles("cardNumber")}} onReady={(element) => this._number = element} onChange={this.onStripeChange} />
                  </InputWrapper>

                  <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}`}}>
                    <InputLabel><RequiredStar>*</RequiredStar> Expiration</InputLabel>
                    <CardExpiryElement id="cardexpiration" {...{...CustomFormStyles, ...this.getErrorStyles("cardExpiry")}} onReady={(element) => this._exp = element} onChange={this.onStripeChange} />
                  </InputWrapper>

                  <InputWrapper style={{ borderBottom: `1px solid ${theme.lineGrey}` }}>
                    <InputLabel><RequiredStar>*</RequiredStar> CVC</InputLabel>
                    <CardCvcElement id="cvc" {...{...CustomFormStyles, ...this.getErrorStyles("cardCvc")}} onReady={(element) => this._cvc = element} onChange={this.onStripeChange} />
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
                    <Input
                      ref={(input) => this.zip = input}
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="paymentZip"
                      value={paymentZip}
                      placeholder="07734"
                      onKeyPress={(event) => limitInput(event, 4)}
                      onChange={(event) => setNewState(event.target.id, event.target.value)}
                      missing={missingFields["paymentZip"] ? 1 : 0}
                    />
                  </InputWrapper>
                  <button type="submit" id="payment_form_button" style={{ display: "none", opacity: 0 }}></button>
                </FormContainer>
              </PaymentCardInfo>
            </PaymentCardInfoContainer>
          </StripePaymentSection>
          <StripePaymentSection xs={12} sm={7} md={5} lg={5} xl={5}>
            <PaymentReviewContainer>
              <PaymentReviewSection span={12}>
                <PaymentReviewHeader>Review</PaymentReviewHeader>
              </PaymentReviewSection>
              <PaymentReviewSection span={12}>
                <PaymentReviewBody>
                  <PaymentReviewLineItems>
                    {planChoice.one_time_fee
                      ? (
                        <PaymentReviewLineItem>
                          <LineItemTitle>One Time Fee </LineItemTitle> <LineItemCost><LineItemCostText>${(planChoice.one_time_fee/100).toLocaleString("en-US", currency_format)}</LineItemCostText></LineItemCost>
                        </PaymentReviewLineItem>
                      )
                      : null
                    }
                    {planChoice.monthly
                      ? (
                        <PaymentReviewLineItem>
                          <LineItemTitle>Monthly Fee {planChoice.billing_days ? `(billed after ${planChoice.billing_days} days)` : (planChoice.one_time_fee) ? "(billed after 30 days)" : ""}</LineItemTitle> <LineItemCost><LineItemCostText>${monthly.toLocaleString("en-US", currency_format)}</LineItemCostText></LineItemCost>
                        </PaymentReviewLineItem>
                      )
                      : null
                    }
                    {planChoice.coupon
                      ? (
                        <>
                          <PaymentReviewLineItem>
                            <LineItemTitle>Discount {planChoice.coupon && (planChoice.coupon.percent_off || planChoice.coupon.amount_off/100) ? `(${(planChoice.coupon.percent_off ? `${planChoice.coupon.percent_off}%` : `$${planChoice.coupon.amount_off / 100}`)} off ${planChoice.coupon.duration === "repeating" ? ` for ${planChoice.coupon.duration_in_months} months` : ` ${planChoice.coupon.duration}`})` : ""}</LineItemTitle> <LineItemCost><LineItemCostText>-${(monthly_discount).toLocaleString("en-US", currency_format)}</LineItemCostText></LineItemCost>
                          </PaymentReviewLineItem>
                          {planChoice.coupon.duration !== "repeating"
                            ? <Hint paddingtop={5} paddingleft={5}>{planChoice.coupon.duration === "once" ? "This discount will be applied to your first monthly charge." : "This discount will be applied forever to your monthly charge."}</Hint>
                            : null
                          }
                        </>
                      )
                      : null
                    }
                    {discountCode.valid
                      ? (
                        <>
                          <PaymentReviewLineItem>
                            <LineItemTitle>Discount {(discountCode.percent_off || discountCode.amount_off/100) ? `(${(discountCode.percent_off ? `${discountCode.percent_off}%` : `$${discountCode.amount_off / 100}`)} off ${discountCode.duration === "repeating" ? ` for ${discountCode.duration_in_months} months` : ` ${discountCode.duration}`})` : ""}</LineItemTitle> <LineItemCost><LineItemCostText>-${(monthly_discount).toLocaleString("en-US", currency_format)}</LineItemCostText></LineItemCost>
                          </PaymentReviewLineItem>
                          {discountCode.duration !== "repeating"
                            ? <Hint paddingtop={5} paddingleft={5}>{discountCode.duration === "once" ? "This discount will be applied to your first monthly charge." : "This discount will be applied forever to your monthly charge."}</Hint>
                            : null
                          }
                        </>
                      )
                      : null
                    }
                    {!is_partner_creation
                      ? (
                        <PaymentFooterInputContainer gutter={20}>
                          <PaymentFooterInput xs={8} sm={8} md={8} lg={10} xl={10}>
                            <PaymentFooterInputLabel>Referral Code</PaymentFooterInputLabel>
                            <Input
                              type="text"
                              id="referral_code"
                              value={referral_code ? referral_code.id : ""}
                              placeholder="**********"
                              onChange={(event) => setNewState(event.target.id, event.target.value)}
                              onBlur={(e) => this.checkForUnappliedReferral(e)}
                              missing={referral_unnapplied ? 1 : 0}
                              autoComplete="off"
                            />
                            {referral_code.valid && referral_code.partner
                              ? <FormSuccess paddingbottom={1}>{`Your account will be linked to ${referral_code.partner.first_name} ${referral_code.partner.last_name} at ${referral_code.partner.name}`}</FormSuccess>
                              : null
                            }
                          </PaymentFooterInput>
                          <PaymentFooterInputButtonContainer xs={4} sm={4} md={4} lg={2} xl={2}>
                            <PaymentFooterInputButton
                              disabled={!referral_code}
                              id="apply_referral_button"
                              type="button"
                              role="button"
                              onClick={() => this.verifyReferral(referral_code)}
                              widthPercent={100}
                              secondary
                              blue
                              outline>
                              {is_verifying_referral ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                            </PaymentFooterInputButton>
                          </PaymentFooterInputButtonContainer>
                        </PaymentFooterInputContainer>
                      )
                      : (
                        <>
                          {referral_code && referral_code.valid && is_partner_creation
                            ? (
                              <PaymentFooterInputContainer gutter={20}>
                                <PaymentFooterInput xs={8} sm={8} md={8} lg={10} xl={10}>
                                  <PaymentFooterInputLabel>Referral Code Applied:</PaymentFooterInputLabel>
                                  <FormSuccess paddingtop={1} paddingbottom={1}>{referral_code.id}</FormSuccess>
                                </PaymentFooterInput>
                              </PaymentFooterInputContainer>
                            )
                            : null
                          }
                        </>
                      )
                    }
                    {!planChoice.coupon && responsibility === "client"
                      ? (
                        <PaymentFooterInputContainer paddingtop={1} gutter={20}>
                          <PaymentFooterInput xs={8} sm={8} md={8} lg={10} xl={10}>
                            <PaymentFooterInputLabel>Discount Code</PaymentFooterInputLabel>
                            <Input
                              type="text"
                              id="discountCode"
                              value={discountCode ? discountCode.id : ""}
                              placeholder="**********"
                              onChange={(event) => setNewState(event.target.id, event.target.value)}
                              onBlur={(e) => this.checkForUnappliedDiscount(e)}
                              missing={discount_unnapplied ? 1 : 0}
                              autoComplete="off"
                            />
                            {discountCode && discountCode.valid
                              ? <FormSuccess paddingbottom={1}>{discountCode.percent_off ? `${discountCode.percent_off}% discount applied!` : `$${(discountCode.amount_off / 100)} discount applied!`}</FormSuccess>
                              : null
                            }
                          </PaymentFooterInput>
                          <PaymentFooterInputButtonContainer xs={4} sm={4} md={4} lg={2} xl={2}>
                            <PaymentFooterInputButton
                              disabled={!discountCode || discountCode.valid}
                              id="apply_discount_button"
                              type="button"
                              role="button"
                              onClick={() => this.verifyDiscountCode(discountCode)}
                              widthPercent={100}
                              secondary
                              blue
                              outline>
                              {is_verifying_discount ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                            </PaymentFooterInputButton>
                          </PaymentFooterInputButtonContainer>
                        </PaymentFooterInputContainer>
                      )
                      : null
                    }
                  </PaymentReviewLineItems>
                </PaymentReviewBody>
              </PaymentReviewSection>
              <PaymentReviewSection span={12}>
                <PaymentReviewFooter>
                  <PaymentReviewLineItem>
                    <LineItemTitle>Due Now:</LineItemTitle> <LineItemCost><LineItemCostText green>${planChoice.one_time_fee ? (planChoice.one_time_fee / 100) : (monthly_discount ? (((monthly - monthly_discount) > 0) ? (monthly - monthly_discount) : 0) : monthly).toLocaleString("en-US", currency_format)}</LineItemCostText></LineItemCost>
                  </PaymentReviewLineItem>
                </PaymentReviewFooter>
              </PaymentReviewSection>
            </PaymentReviewContainer>
            <PaymentHint>{planChoice.hint}</PaymentHint>
          </StripePaymentSection>
        </StripePaymentSections>
      </StripePaymentMain>
    );
  }
}

const mapStateToProps = (state) => ({
  signup: state.signup,
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  verifyDiscount: (code) => dispatch(verifyDiscount(code)),
  createSignupError: (error, resource) => dispatch(createSignupError(error, resource)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(injectStripe(StripePaymentForm));
