
--boundary_.oOo._rk5LwgqyMOjAp3bBep2vkQkSJ2aUgC/o
Content-Length: 789
Content-Type: application/octet-stream
X-File-MD5: 03ff3ff199fa0edcd7f72c822543d9ab
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/client/src/Components/BillingContainer/index.js

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

--boundary_.oOo._rk5LwgqyMOjAp3bBep2vkQkSJ2aUgC/o
Content-Length: 16979
Content-Type: application/octet-stream
X-File-MD5: 624db5f61210de2180d26226aeec6525
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/client/src/Components/BeneficiarySignUpForm/index.js

import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { US_STATES, formatUSPhoneNumberPretty, verifyPhoneFormat, allowNumbersOnly, limitInput } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import {} from "./style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "react-simple-tooltip";
import moment from "moment";
import { debounce } from "lodash";
import { theme } from "../../global-styles";
import { lighten } from "polished";
import { isMobileOnly } from "react-device-detect";
import {
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  CheckBoxInput,
  FormContainer,
  RequiredStar,
  Select
} from "../../global-components";
import DatePicker from "react-datepicker";
import CustomDateInput from "../CustomDateInput";

class BeneficiarySignUpForm extends Component {
  static propTypes = {
    details: PropTypes.instanceOf(Object).isRequired,
    setNewState: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      phone_error: ""
    };
  }
  
  checkEmail = (event) => {
    const { checkUserEmail, setNewState } = this.props;
    event.persist();

    if (!this.debouncedFn) {
      this.debouncedFn = debounce(() => {
        let email = event.target.value;
        if (email.includes("@")) {
          checkUserEmail(email, "beneficiary");
        } else {
          setNewState("beneficiary_email_error", false);
          setNewState("beneficiary_email_valid", false);
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  render() {
    let { details, setNewState, missingFields, beneficiary_email_error, beneficiary_email_valid, is_partner_creation = false, is_user_creation = false, is_checking_beneficiary_email } = this.props;
    const breakpointSize = (details.user_type !== "beneficiary" || is_user_creation) ? 6 : 12;
    const breakpointSizeDouble = (details.user_type === "beneficiary" && !is_partner_creation) ? 6 : 12;
    const { phone_error } = this.state;

    return (
    <FormContainer>
      <Row gutter={20}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Row>
            <Col xs={12} sm={12} md={4} lg={4} xl={4}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> First Name</InputLabel>
                <Input
                  type="text"
                  id="beneficiaryFirst"
                  value={details.beneficiaryFirst}
                  placeholder="Joe"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["beneficiaryFirst"] ? 1 : 0}
                />
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={4} lg={4} xl={4}>
              <InputWrapper>
                <InputLabel>Middle Name</InputLabel>
                <Input
                  type="text"
                  id="beneficiaryMiddle"
                  value={details.beneficiaryMiddle}
                  placeholder="James"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                />
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={4} lg={4} xl={4}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Last Name</InputLabel>
                <Input
                  type="text"
                  id="beneficiaryLast"
                  value={details.beneficiaryLast}
                  placeholder="Jones"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["beneficiaryLast"] ? 1 : 0}
                />
              </InputWrapper>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Address</InputLabel>
                <Input
                  type="text"
                  name="address1"
                  id="beneficiaryAddress"
                  value={details.beneficiaryAddress}
                  placeholder="400 Commerce Ave"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["beneficiaryAddress"] ? 1 : 0}
                />
              </InputWrapper>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel>Address 2</InputLabel>
                <Input
                  autoComplete="new-password"
                  autofill="off"
                  type="text"
                  name="address2"
                  ref={(input) => this.beneficiaryAddress2 = input}
                  id="beneficiaryAddress2"
                  value={details.beneficiaryAddress2}
                  placeholder="Apartment 4"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                />
              </InputWrapper>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> City</InputLabel>
                <Input
                  autoComplete="new-password"
                  autofill="off"
                  type="text"
                  name="city"
                  ref={(input) => this.beneficiaryCity = input}
                  id="beneficiaryCity"
                  value={details.beneficiaryCity}
                  placeholder="Grand Rapids"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["beneficiaryCity"] ? 1 : 0}
                />
              </InputWrapper>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={breakpointSize} lg={breakpointSize} xl={breakpointSize}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> State</InputLabel>
                <Select missing={missingFields["beneficiaryState"] ? 1 : 0} id="beneficiaryState" ref={(input) => this.beneficiaryState = input} value={details.beneficiaryState} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a state</option>
                  {US_STATES.map((state, index) => {
                    return (
                      <option key={in