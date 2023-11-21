import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { US_STATES, formatUSPhoneNumberPretty, verifyPhoneFormat, allowNumbersOnly, limitInput } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import {} from "./style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { claimThisEmail } from "../../store/actions/utilities";
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
  Select,
  Button
} from "../../global-components";

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
          checkUserEmail(email, "client");
        } else {
          setNewState("client_email_error", false);
          setNewState("client_email_valid", false);
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  render() {
    let { details, setNewState, claimThisEmail, missingFields, client_email_error, client_email_valid, is_checking_client_email } = this.props;
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
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> State</InputLabel>
                <Select missing={missingFields["beneficiaryState"] ? 1 : 0} id="beneficiaryState" ref={(input) => this.beneficiaryState = input} value={details.beneficiaryState} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a state</option>
                  {US_STATES.map((state, index) => {
                    return (
                      <option key={index} value={state.name}>{state.name}</option>
                    );
                  })}
                </Select>
            </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
                <Input
                  type="number"
                  autoComplete="new-password"
                  autofill="off"
                  name="zip"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  ref={(input) => this.beneficiaryZip = input}
                  id="beneficiaryZip"
                  value={details.beneficiaryZip}
                  placeholder="49503"
                  onKeyPress={(event) => limitInput(event, 4)}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["beneficiaryZip"] ? 1 : 0}
                  onFocus={(event) => setNewState(event.target.id, "")}
                />
              </InputWrapper>
            </Col>
          </Row>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <Row>
                <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Gender at birth</InputLabel>
                    <Select missing={missingFields["beneficiaryGender"] ? 1 : 0} id="beneficiaryGender" value={details.beneficiaryGender} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                      <option disabled value="">Choose a gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="intersex">Intersex</option>
                    </Select>
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Preferred pronouns</InputLabel>
                    <Select missing={missingFields["beneficiaryPronouns"] ? 1 : 0} id="beneficiaryPronouns" value={details.beneficiaryPronouns} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                      <option disabled value="">Choose preferred pronouns</option>
                      <option value="female-pronoun">She, Her, Hers</option>
                      <option value="male-pronoun">He, Him, His</option>
                      <option value="nongender-pronoun">They, Them, Theirs</option>
                    </Select>
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Birthday</InputLabel>
                    <Input
                      type="date"
                      id="beneficiaryBirthday"
                      value={details.beneficiaryBirthday}
                      onChange={(event) => setNewState(event.target.id, event.target.value)}
                      required
                      missing={missingFields["beneficiaryBirthday"] ? 1 : 0}
                      max={moment().format("YYYY-MM-DD")}
                      min={moment().subtract(100, "year").format("YYYY-MM-DD")}
                    />
                  </InputWrapper>
                </Col>
              </Row>
              <Row>
                {!details.noBeneficiaryEmail
                  ? (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel>Email</InputLabel>
                        <Input
                          autoComplete="new-password"
                          autofill="off"
                          type="text"
                          name="email"
                          id="beneficiaryEmail"
                          value={details.beneficiaryEmail}
                          placeholder="you@email.com"
                          onKeyUp={this.checkEmail}
                            onChange={(event) => setNewState(event.target.id, (event.target.value || "").toLowerCase().replace(/\s+/g, ""))}
                        />
                        {details.beneficiaryEmail
                          ? (
                            <>
                              <InputHint margintop={5} error={client_email_error ? 1 : 0} success={client_email_valid ? 1 : 0}>{is_checking_client_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (client_email_error || "Beneficiary must have access to this email")}</InputHint>
                              {client_email_error && !client_email_valid
                                ? <Button type="button" small rounded nomargin margintop={10} outline danger onClick={() => claimThisEmail(details.beneficiaryEmail)}>I own this email</Button>
                                : null
                              }
                            </>
                          )
                          : null
                        }
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
                {details.beneficiaryEmail
                  ? (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}>Send Email to Beneficiary?&nbsp;&nbsp;<Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>If you would like the beneficiary to be involved, check here to send an email with a temporary password.</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip></InputLabel>
                        <CheckBoxInput
                          defaultChecked={details.notifyBeneficiary}
                          onChange={(event) => setNewState(event.target.id, event.target.checked)}
                          type="checkbox"
                          id="notifyBeneficiary"
                        />
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
                {!details.beneficiaryEmail
                  ? (
                    <Col xs={12} sm={12} md={details.noBeneficiaryEmail ? 12 : 6} lg={details.noBeneficiaryEmail ? 12 : 6} xl={details.noBeneficiaryEmail ? 12 : 6}>
                      <InputWrapper>
                        <InputLabel error={!details.noBeneficiaryEmail ? 1 : 0} marginbottom={10}>Beneficiary does not have email, check here</InputLabel>
                        <CheckBoxInput
                          defaultChecked={details.noBeneficiaryEmail}
                          onChange={(event) => setNewState(event.target.id, event.target.checked)}
                          type="checkbox"
                          id="noBeneficiaryEmail"
                        />
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
              </Row>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel>Phone</InputLabel>
                <Input
                  id="beneficiaryPhone"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                  value={details.beneficiaryPhone}
                  minLength={10}
                  maxLength={10}
                  autoFill={false}
                  autoComplete="new-password"
                  placeholder="Enter a phone number..."
                  onFocus={(event) => {
                    setNewState(event.target.id, "");
                    this.setState({ phone_error: "" });
                  }}
                  onKeyPress={allowNumbersOnly}
                  onBlur={(event) => {
                    if (verifyPhoneFormat(event.target.value)) {
                      setNewState(event.target.id, formatUSPhoneNumberPretty(event.target.value));
                      this.setState({ phone_error: "" });
                    } else if (event.target.value) {
                      setNewState(event.target.id, event.target.value);
                      this.setState({ "phone_error": "This is not a valid phone format." });
                    } else {
                      this.setState({ phone_error: "" });
                    }
                  }}
                  onChange={(event) => setNewState(event.target.id, event.target.value)} />
                {phone_error
                  ? <InputHint error>{phone_error}</InputHint>
                  : null
                }
              </InputWrapper>
            </Col>
          </Row>
        </Col>
      </Row>
    </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  claimThisEmail: (email) => dispatch(claimThisEmail(email))
});
export default connect(mapStateToProps, dispatchToProps)(BeneficiarySignUpForm);
