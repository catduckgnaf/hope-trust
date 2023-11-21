import React, { useEffect, useCallback } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import {
  StripeBillingFormRow,
  StripeBillingFormCol,
  CustomFormStyles,
  StripeInputWrapper,
  StripeBillingFormInput,
  BrandElement,
  StripeBillingFormLabel,
  StripeBillingFormLineItem,
  StripeBillingFormLineItemPadding,
  StripeBillingFormLineItemInner,
  StripeBillingFormLineItemSection,
  StripeBillingFormLineItemText,
  StripeBillingFormLineItemSubText,
  StripeBillingFormLineItemCost,
  StripeBilllingFormInputSections,
  StripeBillingFormInputSection,
  StripeBillingFormInputApplyLink,
  DiscountFieldMessage,
  CardInfoOverlay,
  CardInfoOverlayPadding,
  CardInfoOverlayInner,
  CardInfoOverlayText,
  CardInfoOverlayBrand,
  CardInfoOverlayButton
} from "./style";
import {
  FormInputGroup
} from "../../Components/multipart-form/elements.styles";
import { addPaymentSource, verifyDiscount } from "../../store/actions/stripe";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCardIcon, allowNumbersOnly } from "../../utilities";
import { isString } from "lodash";

export const StripeBillingForm = (props) => {
  const { stateRetriever, stateConsumer, bulkComposeState, type } = props;
  const dispatch = useDispatch();
  const plans = useSelector((state) => state.plans);
  const user = useSelector((state) => state.user);
  const stripe = useStripe();
  const elements = useElements();

  const clearStripeForm = useCallback(async () => {
    const els = [CardNumberElement, CardExpiryElement, CardCvcElement];
    els.forEach((el) => elements.getElement(el).clear());
    bulkComposeState("registration_config", {
      payment_method_created: false,
      token: null,
      card_number: false,
      card_exp: false,
      card_cvc: false,
      card_brand: "",
      card_zip: "",
      is_creating_token: false
    });
  }, [bulkComposeState, elements]);

  const runStripeTokenCreation = useCallback(async () => {
    stateConsumer("is_creating_token", true, "registration_config");
    if (user.customer_id) {
      const paymentMethod = await stripe.createPaymentMethod({ type: "card", card: elements.getElement(CardNumberElement) });
      if (!paymentMethod.error) {
        const cardElement = elements.getElement(CardNumberElement);
        let result = await stripe.createToken(cardElement, { name: stateRetriever("card_name"), address_zip: stateRetriever("card_zip"), currency: "usd" });
        if (result.error) {
          dispatch(showNotification("error", "Payment Error", result.error.message));
          stateConsumer("payment_method_created", false, "registration_config");
          stateConsumer("is_creating_token", false, "registration_config");
          return false;
        }
        if (result.token) {
          stateConsumer("token", result.token, "registration_config");
          return dispatch(addPaymentSource(result.token, true))
            .then(async () => {
              stateConsumer("payment_method_created", false, "registration_config");
              stateConsumer("is_creating_token", false, "registration_config");
              return true;
            });
        }
      }
    }
  }, [dispatch, elements, stateConsumer, stateRetriever, stripe, user.customer_id]);

  const checkForUnappliedDiscount = (event) => {
    const discount_code = stateRetriever("discount_code");
    if (discount_code && isString(discount_code)) {
      if ((event && event.relatedTarget && event.relatedTarget.id !== "apply_discount_button") || !event.relatedTarget) {
        dispatch(showNotification("error", "Unapplied Discount", "Did you forget to apply your discount? Make sure to click the 'Apply' button or clear the field."));
        stateConsumer("discount_unnapplied", true, "registration_config");
        return true;
      }
      stateConsumer("discount_unnapplied", false, "registration_config");
      return false;
    }
    stateConsumer("discount_unnapplied", false, "registration_config");
    return false;
  };

  const checkForUnappliedReferral = (event) => {
    const referral_code = stateRetriever("referral_code");
    if (referral_code && isString(referral_code)) {
      if ((event && event.relatedTarget && event.relatedTarget.id !== "apply_referral_button") || !event.relatedTarget) {
        dispatch(showNotification("error", "Unapplied Referral", "Did you forget to apply your referral? Make sure to click the 'Apply' button or clear the field."));
        stateConsumer("referral_unnapplied", true, "registration_config");
        return true;
      }
      stateConsumer("referral_unnapplied", false, "registration_config");
      return false;
    }
    stateConsumer("referral_unnapplied", false, "registration_config");
    return false;
  };

  const verifyDiscountCode = async (code) => {
    if (code) code = code.replace(/\s+/g, "");
    stateConsumer("is_verifying_discount", true, "registration_config");
    dispatch(verifyDiscount(code))
    .then((coupon) => {
      stateConsumer("is_verifying_discount", false, "registration_config");
      if (coupon) {
        if (coupon.metadata.isReferral === "true") {
          dispatch(showNotification("error", "Invalid Discount", "This code is not valid as a discount."));
        } else {
          stateConsumer("discount_code", coupon, "registration_config");
          stateConsumer("discount_unnapplied", false, "registration_config");
        }
      }
    });
  };

  const verifyReferral = async (code) => {
    if (code) code = code.replace(/\s+/g, "");
    stateConsumer("is_verifying_referral", true, "registration_config");
    dispatch(verifyDiscount(code))
    .then((coupon) => {
      stateConsumer("is_verifying_referral", false, "registration_config");
      if (coupon && coupon.partner) {
        if (coupon.metadata.isReferral === "true") {
          stateConsumer("referral_code", coupon, "registration_config");
          stateConsumer("referral_unnapplied", false, "registration_config");
        } else {
          dispatch(showNotification("error", "Invalid Referral", "This is not a valid referral code. Please check with your advisor for a valid referral code."));
        }
      }
    });
  };

  const card_icon = getCardIcon(stateRetriever("card_brand"));
  const referral_code = stateRetriever("referral_code");
  const discount_code = stateRetriever("discount_code");
  const plan = stateRetriever("plan_choice") || plans.active_partner_plans.find((p) => p.name === user.partner_data.plan_type);
  let coupon = plan.coupon;
  let monthly_cost = (plan && plan.monthly) ? (plan.monthly / 100) : 0;
  let discounted = coupon ? (((coupon.percent_off ? (coupon.percent_off * monthly_cost) : coupon.amount_off)) / 100) : 0;
  if (plan && coupon) monthly_cost = (monthly_cost - discounted);
  if (discount_code && !isString(discount_code) && !coupon) {
    let monthly_cost = (plan && plan.monthly) ? (plan.monthly / 100) : 0;
    coupon = discount_code;
    discounted = (((discount_code.percent_off ? (discount_code.percent_off * monthly_cost) : discount_code.amount_off)) / 100);
    monthly_cost = (monthly_cost - discounted);
  }
  const total = ((plan.monthly / 100) + (plan.one_time_cost || 0)) - discounted;
  const payment_method_created = stateRetriever("payment_method_created");

  useEffect(() => {
    async function run() {
      if (payment_method_created) await runStripeTokenCreation();
    };
    run();
  }, [runStripeTokenCreation, payment_method_created]);

  return (
    <StripeBillingFormRow gutter={40}>
      <StripeBillingFormCol xs={12} sm={12} md={6} lg={6} xl={6}>
        {stateRetriever("token") || stateRetriever("is_creating_token")
          ? (
            <CardInfoOverlay>
              <CardInfoOverlayPadding>
                {stateRetriever("is_creating_token")
                  ? (
                    <CardInfoOverlayInner>
                      <CardInfoOverlayText>
                        <FontAwesomeIcon icon={["fad", "spinner"]} size="4x" spin />
                      </CardInfoOverlayText>
                    </CardInfoOverlayInner>
                  )
                  : (
                    <CardInfoOverlayInner>
                      {stateRetriever("card_brand")
                        ? (
                          <CardInfoOverlayBrand>
                            <FontAwesomeIcon icon={[card_icon.icon_type, card_icon.icon]} style={{ color: card_icon.color }} />
                          </CardInfoOverlayBrand>
                        )
                        : null
                      }
                      <CardInfoOverlayText>Edit Payment Method?</CardInfoOverlayText>
                      <CardInfoOverlayButton primary type="button" onClick={() => clearStripeForm()}>Edit</CardInfoOverlayButton>
                    </CardInfoOverlayInner>
                  )
                }
              </CardInfoOverlayPadding>
            </CardInfoOverlay>
          )
          : null
        }
        <StripeBillingFormRow>
          <StripeBillingFormCol span={12}>
            <FormInputGroup>
              <StripeBillingFormLabel required={1}>Name On Card</StripeBillingFormLabel>
              <StripeBillingFormInput value={stateRetriever("card_name")} type="text" valid={stateRetriever("card_name")} placeholder="John Doe" onChange={(event) => stateConsumer("card_name", event.target.value, "registration_config")}/>
            </FormInputGroup>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

        <StripeBillingFormRow>
          <StripeBillingFormCol span={12}>
            <FormInputGroup>
              <StripeBillingFormLabel required={1}>Card Number</StripeBillingFormLabel>
              <StripeInputWrapper>
                <CardNumberElement
                  options={{ ...CustomFormStyles }}
                  onReady={() => {
                    if (!stateRetriever("token")) {
                      stateConsumer("card_number", false, "registration_config");
                      stateConsumer("card_brand", "", "registration_config");
                    }
                  }}
                  onChange={(e) => {
                    if (e.brand) stateConsumer("card_brand", e.brand, "registration_config");
                    stateConsumer("card_number", e.complete, "registration_config");
                  }}
                />
                <BrandElement>
                  {stateRetriever("card_brand")
                    ? <FontAwesomeIcon icon={[card_icon.icon_type, card_icon.icon]} style={{ color: card_icon.color }} />
                    : null
                  }
                </BrandElement>
              </StripeInputWrapper>
            </FormInputGroup>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

        <StripeBillingFormRow>
          <StripeBillingFormCol span={12}>
            <FormInputGroup>
              <StripeBillingFormLabel required={1}>Card Expiration</StripeBillingFormLabel>
              <StripeInputWrapper>
                <CardExpiryElement
                  options={{ ...CustomFormStyles }}
                  onReady={() => {
                    if (!stateRetriever("token")) stateConsumer("card_exp", false, "registration_config");
                  }}
                  onChange={(e) => {
                    stateConsumer("card_exp", e.complete, "registration_config");
                  }}
                />
              </StripeInputWrapper>
            </FormInputGroup>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

        <StripeBillingFormRow gutter={20}>
          <StripeBillingFormCol xs={12} sm={12} md={6} lg={6} xl={6}>
            <FormInputGroup>
              <StripeBillingFormLabel required={1}>Card CVC</StripeBillingFormLabel>
              <StripeInputWrapper>
                <CardCvcElement
                  options={{ ...CustomFormStyles }}
                  onReady={() => {
                    if (!stateRetriever("token")) stateConsumer("card_cvc", false, "registration_config");
                  }}
                  onChange={(e) => {
                    stateConsumer("card_cvc", e.complete, "registration_config");
                  }}
                />
              </StripeInputWrapper>
            </FormInputGroup>
          </StripeBillingFormCol>

          <StripeBillingFormCol xs={12} sm={12} md={6} lg={6} xl={6}>
            <FormInputGroup>
              <StripeBillingFormLabel required={1}>Card Zip</StripeBillingFormLabel>
              <StripeBillingFormInput
                value={stateRetriever("card_zip")}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                valid={stateRetriever("card_zip") ? (stateRetriever("card_zip").length === 5) : true}
                max={99999}
                min={0}
                placeholder="08859"
                onChange={(event) => stateConsumer("card_zip", event.target.value, "registration_config")}
                onKeyPress={allowNumbersOnly}
              />
            </FormInputGroup>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

      </StripeBillingFormCol>
      <StripeBillingFormCol xs={12} sm={12} md={6} lg={6} xl={6}>

        {type !== "partner"
          ? (
            <StripeBillingFormRow>
              <StripeBillingFormCol span={12}>
                <StripeBilllingFormInputSections gutter={20}>
                  <StripeBillingFormInputSection span={12}>
                    <StripeBillingFormLabel>Referral Code</StripeBillingFormLabel>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={10}>
                    <FormInputGroup>
                      <StripeBillingFormInput
                        value={referral_code ? (referral_code.id || referral_code) : ""}
                        type="text"
                        valid={!stateRetriever("referral_unnapplied")}
                        onBlur={(e) => checkForUnappliedReferral(e)}
                        onChange={(event) => stateConsumer("referral_code", event.target.value, "registration_config")}
                      />
                    </FormInputGroup>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={2}>
                    <StripeBillingFormInputApplyLink
                      type="button"
                      disabled={!referral_code} id="apply_referral_button"
                      onClick={() => verifyReferral(referral_code ? (referral_code.id || referral_code) : "")}>{stateRetriever("is_verifying_referral") ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                    </StripeBillingFormInputApplyLink>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={12}>
                    {referral_code && referral_code.valid && referral_code.partner
                      ? <DiscountFieldMessage paddingbottom={1}>{`Your account will be linked to ${referral_code.partner.first_name} ${referral_code.partner.last_name} at ${referral_code.partner.name}`}</DiscountFieldMessage>
                      : null
                    }
                  </StripeBillingFormInputSection>
                </StripeBilllingFormInputSections>
              </StripeBillingFormCol>
            </StripeBillingFormRow>
          )
          : null
        }

        {!plan.coupon
          ? (
            <StripeBillingFormRow>
              <StripeBillingFormCol span={12}>
                <StripeBilllingFormInputSections gutter={20}>
                  <StripeBillingFormInputSection span={12}>
                    <StripeBillingFormLabel>Discount Code</StripeBillingFormLabel>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={10}>
                    <FormInputGroup>
                      <StripeBillingFormInput
                        value={discount_code ? (discount_code.id || discount_code) : ""}
                        type="text"
                        valid={!stateRetriever("discount_unnapplied")}
                        onBlur={(e) => checkForUnappliedDiscount(e)}
                        onChange={(event) => stateConsumer("discount_code", event.target.value, "registration_config")}
                      />
                    </FormInputGroup>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={2}>
                    <StripeBillingFormInputApplyLink
                      type="button"
                      disabled={!discount_code} id="apply_discount_button"
                      onClick={() => verifyDiscountCode(discount_code ? (discount_code.id || discount_code) : "")}>{stateRetriever("is_verifying_discount") ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                    </StripeBillingFormInputApplyLink>
                  </StripeBillingFormInputSection>
                  <StripeBillingFormInputSection span={12}>
                    {discount_code && discount_code.valid
                      ? <DiscountFieldMessage paddingbottom={1}>{discount_code.percent_off ? `${discount_code.percent_off}% discount applied!` : `$${(discount_code.amount_off / 100)} discount applied!`}</DiscountFieldMessage>
                      : null
                    }
                  </StripeBillingFormInputSection>
                </StripeBilllingFormInputSections>
              </StripeBillingFormCol>
            </StripeBillingFormRow>
          )
          : null
        }

        <StripeBillingFormRow>
          <StripeBillingFormCol span={12}>
            <StripeBillingFormLineItem>
              <StripeBillingFormLineItemPadding>
                <StripeBillingFormLineItemInner margintop={20}>
                  <StripeBillingFormLineItemSection span={6} align="left">
                    <StripeBillingFormLineItemText>Monthly Fee:</StripeBillingFormLineItemText>
                  </StripeBillingFormLineItemSection>
                  <StripeBillingFormLineItemSection span={6} align="right">
                    <StripeBillingFormLineItemCost>${(plan.monthly / 100)}</StripeBillingFormLineItemCost>
                  </StripeBillingFormLineItemSection>
                </StripeBillingFormLineItemInner>
              </StripeBillingFormLineItemPadding>
            </StripeBillingFormLineItem>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

        {plan.one_time_cost
          ? (
            <StripeBillingFormRow>
              <StripeBillingFormCol span={12}>
                <StripeBillingFormLineItem>
                  <StripeBillingFormLineItemPadding>
                    <StripeBillingFormLineItemInner>
                      <StripeBillingFormLineItemSection span={6} align="left">
                        <StripeBillingFormLineItemText>One Time Cost:</StripeBillingFormLineItemText>
                      </StripeBillingFormLineItemSection>
                      <StripeBillingFormLineItemSection span={6} align="right">
                        <StripeBillingFormLineItemCost>${plan.one_time_cost}</StripeBillingFormLineItemCost>
                      </StripeBillingFormLineItemSection>
                    </StripeBillingFormLineItemInner>
                  </StripeBillingFormLineItemPadding>
                </StripeBillingFormLineItem>
              </StripeBillingFormCol>
            </StripeBillingFormRow>
          )
          : null
        }

        {discounted
          ? (
            <StripeBillingFormRow>
              <StripeBillingFormCol span={12}>
                <StripeBillingFormLineItem>
                  <StripeBillingFormLineItemPadding>
                    <StripeBillingFormLineItemInner>
                      <StripeBillingFormLineItemSection span={6} align="left">
                        <StripeBillingFormLineItemText>Discount:</StripeBillingFormLineItemText>
                        <StripeBillingFormLineItemSubText>{(coupon.percent_off || coupon.amount_off) ? `(${(coupon.percent_off ? `${coupon.percent_off}%` : `$${coupon.amount_off / 100}`)} off ${coupon.duration === "repeating" ? ` for ${coupon.duration_in_months} months` : ` ${coupon.duration}`})` : ""}</StripeBillingFormLineItemSubText>
                      </StripeBillingFormLineItemSection>
                      <StripeBillingFormLineItemSection span={6} align="right">
                        <StripeBillingFormLineItemCost>-${discounted}</StripeBillingFormLineItemCost>
                      </StripeBillingFormLineItemSection>
                    </StripeBillingFormLineItemInner>
                  </StripeBillingFormLineItemPadding>
                </StripeBillingFormLineItem>
              </StripeBillingFormCol>
            </StripeBillingFormRow>
          )
          : null
        }

        <StripeBillingFormRow>
          <StripeBillingFormCol span={12}>
            <StripeBillingFormLineItem>
              <StripeBillingFormLineItemPadding>
                <StripeBillingFormLineItemInner>
                  <StripeBillingFormLineItemSection span={6} align="left">
                    <StripeBillingFormLineItemText>Due Now:</StripeBillingFormLineItemText>
                  </StripeBillingFormLineItemSection>
                  <StripeBillingFormLineItemSection span={6} align="right">
                    <StripeBillingFormLineItemCost>${total > 0 ? total : 0}</StripeBillingFormLineItemCost>
                  </StripeBillingFormLineItemSection>
                </StripeBillingFormLineItemInner>
              </StripeBillingFormLineItemPadding>
            </StripeBillingFormLineItem>
          </StripeBillingFormCol>
        </StripeBillingFormRow>

      </StripeBillingFormCol>
    </StripeBillingFormRow>
  );
};