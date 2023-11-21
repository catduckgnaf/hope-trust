import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersOnly, US_STATES, verifyPhoneFormat, formatUSPhoneNumberPretty, limitInput, checkPasswordConditions } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import {} from "./style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import PasswordStrengthBar from "react-password-strength-bar";
import { claimThisEmail } from "../../store/actions/utilities";
import { debounce } from "lodash";
import {
  InputWrapper,
  InputLabel,
  InputHint,
  Input,
  FormContainer,
  RequiredStar,
  Select,
  RevealPassword,
  Button
} from "../../global-components";

class CustomerSupportUserSignUpForm extends Component {
  static propTypes = {
    details: PropTypes.instanceOf(Object).isRequired,
    setNewState: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      revealed: false,
      other_phone_error: "",
      home_phone_error: "",
      fax_error: ""
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
          setNewState("creator_email_error", false);
          setNewState("creator_email_valid", false);
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  render() {
    let { details, setNewState, updateBulkState, claimThisEmail, showNotification, missingFields, creator_email_error, creator_email_valid, is_checking_creator_email } = this.props;
    const { revealed, other_phone_error, home_phone_error, fax_error } = this.state;
    const passwordCheck = checkPasswordConditions(8, details.password, details.confirmPassword);

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
                  id="first_name"
                  value={details.first_name}
                  placeholder="Joe"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["first_name"] ? 1 : 0}
                  required
                />
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={4} lg={4} xl={4}>
              <InputWrapper>
                <InputLabel>Middle Name</InputLabel>
                <Input
                  type="text"
                  id="middle_name"
                  value={details.middle_name}
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
                  id="last_name"
                  value={details.last_name}
                  placeholder="Jones"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["last_name"] ? 1 : 0}
                  required
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
                  id="address"
                  value={details.address}
                  placeholder="400 Commerce Ave"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  required
                  missing={missingFields["address"] ? 1 : 0}
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
                  id="address2"
                  value={details.address2}
                  placeholder="Apartment 4"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["address2"] ? 1 : 0}
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
                  id="city"
                  value={details.city}
                  placeholder="Grand Rapids"
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["city"] ? 1 : 0}
                  required
                />
              </InputWrapper>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> State</InputLabel>
                  <Select missing={missingFields["state"] ? 1 : 0} id="state" value={details.state} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a state</option>
                  {US_STATES.map((state, index) => {
                    return (
                      <option key={index} value={state.name}>{state.name}</option>
                    );
                  })}
              </Select>
            </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Zipcode</InputLabel>
                <Input
                  type="number"
                  autoComplete="new-password"
                  autofill="off"
                  name="zip"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="zip"
                  value={details.zip}
                  placeholder="49503"
                  onKeyPress={(event) => limitInput(event, 4)}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["zip"] ? 1 : 0}
                  required
                />
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Birthday</InputLabel>
                <Input
                  type="date"
                  id="birthday"
                  value={details.birthday}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["birthday"] ? 1 : 0}
                  required
                />
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Gender</InputLabel>
                <Select missing={missingFields["gender"] ? 1 : 0} id="gender" value={details.gender} onChange={(event) => setNewState(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                </Select>
              </InputWrapper>
            </Col>
          </Row>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
                <Input
                  autoComplete="new-password"
                  autofill="off"
                  type="text"
                  name="email"
                  id="email"
                  value={details.email}
                  placeholder="you@email.com"
                  onKeyUp={this.checkEmail}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  missing={missingFields["email"] ? 1 : 0}
                  required
                />
                <InputHint margintop={5} error={creator_email_error ? 1 : 0} success={creator_email_valid ? 1 : 0}>{is_checking_creator_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (creator_email_error || "You must have access to this email")}</InputHint>
                  {creator_email_error && !creator_email_valid && details.email.includes("@hopetrust.com")
                  ? <Button type="button" small rounded nomargin margintop={10} outline danger onClick={() => claimThisEmail(details.email)}>I own this email</Button>
                  : null
                }
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Office Phone</InputLabel>
                <Input
                  id="other_phone"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                  value={details.other_phone}
                  minLength={10}
                  maxLength={10}
                  autoFill={false}
                  autoComplete="new-password"
                  placeholder="Enter a phone number..."
                  missing={missingFields["other_phone"] ? 1 : 0}
                  onFocus={(event) => {
                    setNewState(event.target.id, "");
                    this.setState({ other_phone_error: "" });
                  }}
                  onKeyPress={allowNumbersOnly}
                  onBlur={(event) => {
                    if (verifyPhoneFormat(event.target.value)) {
                      setNewState(event.target.id, formatUSPhoneNumberPretty(event.target.value));
                      this.setState({ other_phone_error: "" });
                    } else if (event.target.value) {
                      setNewState(event.target.id, event.target.value);
                      this.setState({ "other_phone_error": "This is not a valid phone format." });
                    } else {
                      this.setState({ other_phone_error: "" });
                    }
                  }}
                  onChange={(event) => setNewState(event.target.id, event.target.value)} />
                  {other_phone_error
                    ? <InputHint error>{other_phone_error}</InputHint>
                    : null
                  }
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Mobile Phone</InputLabel>
                <Input
                  id="home_phone"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                  value={details.home_phone}
                  minLength={10}
                  maxLength={10}
                  autoFill={false}
                  autoComplete="new-password"
                  placeholder="Enter a phone number..."
                  onFocus={(event) => {
                    setNewState(event.target.id, "");
                    this.setState({ home_phone_error: "" });
                  }}
                  onKeyPress={allowNumbersOnly}
                  onBlur={(event) => {
                    if (verifyPhoneFormat(event.target.value)) {
                      setNewState(event.target.id, formatUSPhoneNumberPretty(event.target.value));
                      this.setState({ home_phone_error: "" });
                    } else if (event.target.value) {
                      setNewState(event.target.id, event.target.value);
                      this.setState({ "home_phone_error": "This is not a valid phone format." });
                    } else {
                      this.setState({ home_phone_error: "" });
                    }
                  }}
                  onChange={(event) => setNewState(event.target.id, event.target.value)} />
                  {home_phone_error
                    ? <InputHint error>{home_phone_error}</InputHint>
                    : null
                  }
              </InputWrapper>
            </Col>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel>Fax Number</InputLabel>
                <Input
                  id="fax"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="tel"
                  value={details.fax}
                  minLength={10}
                  maxLength={10}
                  autoFill={false}
                  autoComplete="new-password"
                  placeholder="Enter a phone number..."
                  onFocus={(event) => {
                    setNewState(event.target.id, "");
                    this.setState({ fax_error: "" });
                  }}
                  onKeyPress={allowNumbersOnly}
                  onBlur={(event) => {
                    if (verifyPhoneFormat(event.target.value)) {
                      setNewState(event.target.id, formatUSPhoneNumberPretty(event.target.value));
                      this.setState({ fax_error: "" });
                    } else if (event.target.value) {
                      setNewState(event.target.id, event.target.value);
                      this.setState({ "fax_error": "This is not a valid fax format." });
                    } else {
                      this.setState({ fax_error: "" });
                    }
                  }}
                  onChange={(event) => setNewState(event.target.id, event.target.value)} />
                  {fax_error
                    ? <InputHint error>{fax_error}</InputHint>
                    : null
                  }
              </InputWrapper>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Create Account Password (at least 16 alphanumeric characters, 1 number, 1 uppercase)</InputLabel>
                <Input
                  value={details.password}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  type={revealed ? "text" : "password"}
                  placeholder="********"
                  id="password"
                  missing={missingFields["password"] ? 1 : 0}
                  required
                />
                <RevealPassword onClick={() => this.setState({ revealed: !revealed })}><FontAwesomeIcon icon={["fad", revealed ? "eye-slash" : "eye"]} /></RevealPassword>
                <PasswordStrengthBar password={details.password} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={16} />
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Confirm Password</InputLabel>
                <Input
                  value={details.confirmPassword}
                  onChange={(event) => setNewState(event.target.id, event.target.value)}
                  type={revealed ? "text" : "password"}
                  placeholder="********"
                  id="confirmPassword"
                  missing={missingFields["confirmPassword"] ? 1 : 0}
                  required
                />
                {details.password && details.confirmPassword
                  ? <InputHint error={passwordCheck.pass ? 0 : 1} success={passwordCheck.pass ? 1 : 0}>{passwordCheck.message}</InputHint>
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
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  claimThisEmail: (email) => dispatch(claimThisEmail(email))
});
export default connect(mapStateToProps, dispatchToProps)(CustomerSupportUserSignUpForm);
