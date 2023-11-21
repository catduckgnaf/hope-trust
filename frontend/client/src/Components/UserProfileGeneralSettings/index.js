import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { formatUSPhoneNumber, formatUSPhoneNumberPretty, allowNumbersOnly, verifyPhoneFormat, limitInput } from "../../utilities";
import { Row, Col } from "react-simple-flex-grid";
import { US_STATES } from "../../utilities";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateRelationship, resetUserPassword } from "../../store/actions/relationship";
import moment from "moment";
import { checkUserEmail } from "../../store/actions/user";
import { debounce } from "lodash";
import {
  UserMainContent,
  ViewUserModalInner
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  CheckBoxInput,
  Select,
  SelectLabel,
  RequiredStar
} from "../../global-components";

const user_types = [
  { id: "friend", name: "Friend" },
  { id: "family", name: "Family" },
  { id: "parent", name: "Parent" },
  { id: "legal guardian", name: "Legal Guardian" },
  { id: "authorized family member", name: "Authorized Family Member" },
  { id: "trustee", name: "Trustee" },
  { id: "spouse", name: "Spouse" },
  { id: "financial advisor", name: "Financial Advisor" },
  { id: "other", name: "Other" }
];

class UserProfileGeneralSettings extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults } = props;
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      permissions: {},
      defaultPermissions: defaults ? defaults.permissions : [],
      userType: defaults ? defaults.type : "",
      is_custom_user_type: (defaults.type && !user_types.map((ut) => ut.id).includes(defaults.type)) || false,
      phone_error: "",
      fax_error: "",
      initial_email: defaults ? defaults.email : "",
      email: defaults && defaults.email && !defaults.email.includes("hopeportalusers") ? defaults.email : "",
      initial_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
      home_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
      initial_fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
      fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
      is_loading: false,
      primary_contact: defaults ? defaults.primary_contact : false,
      secondary_contact: defaults ? defaults.secondary_contact : false,
      is_checking_email: false,
      check_email_error: "",
      waiting_for_password: false,
      email_valid: (defaults && defaults.email) ? true : false
    };
  }

  updateRelationship = async () => {
    const { updateRelationship, showNotification, defaults } = this.props;
    const { permissions, home_phone, fax, userType, phone_error, fax_error, primary_contact, secondary_contact, email_valid, initial_email } = this.state;
    let { email } = this.state;
    let first_name = this.firstNameInput.value;
    let middle_name = this.middleNameInput.value;
    let last_name = this.lastNameInput.value;
    let address = this.addressInput ? this.addressInput.value : null;
    let address2 = this.address2Input ? this.address2Input.value : null;
    let city = this.cityInput ? this.cityInput.value : null;
    let state = this.stateInput ? this.stateInput.value : null;
    let zip = this.zipInput ? this.zipInput.value : null;
    let birthday = this.birthdayInput ? this.birthdayInput.value : null;
    let gender = this.genderInput ? this.genderInput.value : null;
    let pronouns = this.pronounsInput ? this.pronounsInput.value : null;
    let emergencyContact = this.emergencyContactInput ? this.emergencyContactInput.checked : null;
    let inheritAccount = this.inheritAccount ? this.inheritAccount.checked : null;
    let finalPermissions = [];
    Object.keys(permissions).forEach((category) => {
      if (permissions[category] === "edit") {
        finalPermissions.push(`${category}-edit`);
        finalPermissions.push(`${category}-view`);
      } else if (permissions[category] !== "off") {
        finalPermissions.push(`${category}-${permissions[category]}`);
      }
    });
    finalPermissions = finalPermissions.filter((p) => !p.includes("basic"));
    email = (initial_email && initial_email.includes("hopeportalusers") && !email) ? initial_email : email;
    const isComplete = this.checkCompletion(userType, first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid);
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await updateRelationship({
        first_name,
        middle_name,
        last_name,
        email: (email).toLowerCase(),
        address,
        address2,
        city,
        state,
        zip,
        birthday,
        gender,
        pronouns,
        home_phone: formatUSPhoneNumber(home_phone),
        fax: formatUSPhoneNumber(fax),
        user_type: userType ? userType.toLowerCase() : null,
        emergencyContact,
        primary_contact,
        secondary_contact,
        inherit: inheritAccount
      }, defaults.cognito_id);
      if (created.success) {
        showNotification("success", "Relationship updated", created.message);
      } else {
        showNotification("error", "Relationship update failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields. Some values may not be valid.");
    }
  };

  checkCompletion = (userType, first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid) => {
    const { defaults } = this.props;
    if (defaults.is_partner) {
      return first_name && last_name;
    } else if (defaults.linked_account) {
      return first_name && last_name && userType;
    } else if (userType === "beneficiary") {
      return first_name && last_name && email && gender && (email_valid && !phone_error && !fax_error);
    } else {
      return first_name && last_name && userType && email && home_phone && gender && (email_valid && !phone_error && !fax_error);
    }
  };

  resetPassword = async (user) => {
    const { resetUserPassword } = this.props;
    this.setState({ is_loading: true, waiting_for_password: true });
    await resetUserPassword(user);
    this.setState({ is_loading: false });
    setTimeout(() => {
      this.setState({ waiting_for_password: false });
    }, 60000);
  };

  checkEmail = async (event) => {
    const { checkUserEmail } = this.props;
    const { initial_email, email } = this.state;
    event.persist();

    if (initial_email !== email) {
      if (!this.debouncedFn) {
        this.debouncedFn = debounce(async () => {
          let email = event.target.value;
          if (email.includes("@")) {
            this.setState({ is_checking_email: true });
            const is_valid_email = await checkUserEmail(email, "relationship");
            this.setState({ check_email_error: is_valid_email.message, email_valid: is_valid_email.success, is_checking_email: false });
          } else {
            this.setState({ check_email_error: false });
            this.setState({ email_valid: false });
          }
        }, 1000);
      }
      this.debouncedFn();
    } else {
      this.setState({ check_email_error: false });
      this.setState({ email_valid: true });
    }
  };

  render() {
    const { defaults = {}, updating, viewing } = this.props;
    const { email_valid, is_loading, userType, phone_error, fax_error, initial_phone, initial_fax, email, home_phone, fax, primary_contact, secondary_contact, is_custom_user_type, is_checking_email, check_email_error, waiting_for_password } = this.state;

    return (
      <ViewUserModalInner align="middle" justify="center">

        <UserMainContent span={12}>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
              <Row>
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                  <InputWrapper>
                    <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} First Name:</InputLabel>
                    <Input maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} ref={(input) => this.firstNameInput = input} type="text" defaultValue={defaults.first_name} placeholder="Add a first name..." />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                  <InputWrapper>
                    <InputLabel>Middle Name:</InputLabel>
                    <Input maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} ref={(input) => this.middleNameInput = input} type="text" defaultValue={defaults.middle_name} placeholder="Add a middle name..." />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={4} lg={4} xl={4}>
                  <InputWrapper>
                    <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} Last Name:</InputLabel>
                    <Input maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} ref={(input) => this.lastNameInput = input} type="text" defaultValue={defaults.last_name} placeholder="Add a last name..." />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Address:</InputLabel>
                    <Input
                      readOnly={viewing || defaults.is_partner}
                      ref={(input) => this.addressInput = input}
                      placeholder="Add an address..."
                      autoComplete="new-password"
                      autoFill="off"
                      type="text"
                      name="address1"
                      defaultValue={defaults.address}
                    />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Address 2:</InputLabel>
                    <Input
                      readOnly={viewing || defaults.is_partner}
                      ref={(input) => this.address2Input = input}
                      placeholder="Add an address..."
                      autoComplete="new-password"
                      autoFill="off"
                      type="text"
                      name="address2"
                      defaultValue={defaults.address2}
                    />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>City:</InputLabel>
                    <Input
                      readOnly={viewing || defaults.is_partner}
                      ref={(input) => this.cityInput = input}
                      placeholder="Add a city..."
                      autoComplete="new-password"
                      defaultValue={defaults.city}
                      autoFill="off"
                      type="text"
                      name="city"
                      maxLength={50}
                    />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>State</InputLabel>
                    <SelectLabel>
                      <Select ref={(input) => this.stateInput = input} defaultValue={defaults.state} disabled={viewing || defaults.is_partner}>
                        <option disabled value="">Choose a state</option>
                        {US_STATES.map((state, index) => {
                          return (
                            <option key={index} value={state.name}>{state.name}</option>
                          );
                        })}
                      </Select>
                    </SelectLabel>
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Zip:</InputLabel>
                    <Input
                      readOnly={viewing || defaults.is_partner}
                      onKeyPress={(event) => limitInput(event, 4)}
                      ref={(input) => this.zipInput = input}
                      autoComplete="new-password"
                      autoFill="off"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="99999"
                      placeholder="Add a zip code..."
                      defaultValue={defaults.zip}
                    />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} Email:</InputLabel>
                    <Input id="relationship_email" readOnly={viewing || defaults.is_partner} onKeyUp={this.checkEmail} onChange={(event) => this.setState({ email: event.target.value })} type="email" value={email} placeholder="Add an email..." />
                    {updating && !viewing
                      ? <InputHint margintop={5} error={check_email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_checking_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (check_email_error || (!updating ? "A temporary password will be sent to this email." : ""))}</InputHint>
                      : null
                    }
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Birthday:</InputLabel>
                    <Input readOnly={viewing || defaults.is_partner} max={moment().format("YYYY-MM-DD")} min={moment().subtract(100, "year").format("YYYY-MM-DD")} defaultValue={defaults.birthday} ref={(input) => this.birthdayInput = input} type="date" />
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} Gender</InputLabel>
                    <Select
                      id="gender"
                      ref={(input) => this.genderInput = input}
                      disabled={viewing || defaults.is_partner}
                      defaultValue={defaults.gender || ""}>
                      <option disabled value="">Choose a gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="intersex">Intersex</option>
                    </Select>
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Preferred pronouns</InputLabel>
                    <Select id="pronouns" defaultValue={defaults.pronouns || ""} ref={(input) => this.pronounsInput = input} disabled={viewing || defaults.is_partner}>
                      <option disabled value="">Choose preferred pronouns</option>
                      <option value="female-pronoun">She, Her, Hers</option>
                      <option value="male-pronoun">He, Him, His</option>
                      <option value="nongender-pronoun">They, Them, Theirs</option>
                    </Select>
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>{(userType !== "beneficiary" && updating) ? <RequiredStar>*</RequiredStar> : null} Phone:</InputLabel>
                    <Input
                      id="home_phone"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      type="tel"
                      value={home_phone}
                      minLength={10}
                      maxLength={10}
                      autoFill={false}
                      autoComplete="new-password"
                      placeholder="Enter a phone number..."
                      onFocus={(event) => {
                        this.setState({ [event.target.id]: "" });
                        this.setState({ phone_error: "" });
                      }}
                      onKeyPress={allowNumbersOnly}
                      onBlur={(event) => {
                        if (verifyPhoneFormat(event.target.value)) {
                          this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                          this.setState({ phone_error: "" });
                        } else if (event.target.value) {
                          this.setState({ [event.target.id]: event.target.value });
                          this.setState({ "phone_error": "This is not a valid phone format." });
                        } else {
                          this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_phone) });
                          this.setState({ phone_error: "" });
                        }
                      }}
                      onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                      readOnly={viewing || defaults.is_partner} />
                    {phone_error
                      ? <InputHint error>{phone_error}</InputHint>
                      : null
                    }
                  </InputWrapper>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel>Fax:</InputLabel>
                    <Input
                      id="fax"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      type="tel"
                      value={fax}
                      minLength={10}
                      maxLength={10}
                      autoFill={false}
                      autoComplete="new-password"
                      placeholder="Enter a fax number..."
                      onFocus={(event) => {
                        this.setState({ [event.target.id]: "" });
                        this.setState({ fax_error: "" });
                      }}
                      onKeyPress={allowNumbersOnly}
                      onBlur={(event) => {
                        if (verifyPhoneFormat(event.target.value)) {
                          this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                          this.setState({ fax_error: "" });
                        } else if (event.target.value) {
                          this.setState({ [event.target.id]: event.target.value });
                          this.setState({ "fax_error": "This is not a valid fax format." });
                        } else {
                          this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_fax) });
                          this.setState({ fax_error: "" });
                        }
                      }}
                      onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                      readOnly={viewing || defaults.is_partner} />
                    {fax_error
                      ? <InputHint error>{fax_error}</InputHint>
                      : null
                    }
                  </InputWrapper>
                </Col>
                {userType !== "advisor" && userType !== "beneficiary" && !defaults.is_partner
                  ? (
                    <Col span={12}>
                      {(user_types.map((u_type) => u_type.id).includes(userType) && userType !== "other") || !is_custom_user_type
                        ? (
                          <InputWrapper>
                            <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} Relationship Type:</InputLabel>
                            <SelectLabel>
                              <Select disabled={viewing || userType === "beneficiary"} defaultValue={userType || ""} onChange={(event) => this.setState({ userType: event.target.value === "other" ? "" : event.target.value, is_custom_user_type: event.target.value === "other" })}>
                                <option disabled value="">Choose a user type</option>
                                {user_types.map((u, index) => {
                                  return (
                                    <option key={index} value={u.id}>{u.name}</option>
                                  );
                                })}
                              </Select>
                            </SelectLabel>
                          </InputWrapper>
                        )
                        : (
                          <InputWrapper>
                            <InputLabel>{updating ? <RequiredStar>*</RequiredStar> : null} User Type:</InputLabel>
                            <Input readOnly={viewing || defaults.is_partner} type="text" value={userType} placeholder="What is the relationship?" onChange={(event) => this.setState({ userType: event.target.value })} autoFocus />
                          </InputWrapper>
                        )
                      }
                    </Col>
                  )
                  : null
                }
                {userType !== "beneficiary"
                  ? (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel marginbottom={10} htmlFor="emergency_contact">Emergency contact:</InputLabel>
                        <CheckBoxInput disabled={viewing} id="emergency_contact" ref={(input) => this.emergencyContactInput = input} type="checkbox" defaultChecked={defaults.emergency} />
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
                {!secondary_contact
                  ? (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel marginbottom={10} htmlFor="primary_contact">Primary contact?</InputLabel>
                        <CheckBoxInput disabled={viewing} id="primary_contact" onChange={(event) => this.setState({ primary_contact: event.target.checked })} type="checkbox" defaultChecked={primary_contact} />
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
                {!primary_contact
                  ? (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel marginbottom={10} htmlFor="secondary_contact">Secondary contact?</InputLabel>
                        <CheckBoxInput disabled={viewing} id="secondary_contact" onChange={(event) => this.setState({ secondary_contact: event.target.checked })} type="checkbox" defaultChecked={secondary_contact} />
                      </InputWrapper>
                    </Col>
                  )
                  : null
                }
                {updating || viewing
                  ? null
                  : (
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                      <InputWrapper>
                        <InputLabel marginbottom={10} htmlFor="notify_user">Notify new user:</InputLabel>
                        <CheckBoxInput defaultChecked={true} disabled={viewing || defaults.is_partner} id="notify_user" ref={(input) => this.notifyInput = input} type="checkbox" />
                      </InputWrapper>
                    </Col>
                  )
                }
                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10} htmlFor="inherit_account">Inherit account:</InputLabel>
                    <CheckBoxInput disabled={viewing} id="inherit_account" ref={(input) => this.inheritAccount = input} type="checkbox" defaultChecked={defaults.inherit} />
                  </InputWrapper>
                </Col>
              </Row>
            </Col>
            {!viewing
              ? (
                <Col span={12}>
                  {updating
                    ? <Button disabled={phone_error || fax_error || (email && !email_valid)} type="button" onClick={() => this.updateRelationship()} green nomargin>Update Relationship</Button>
                    : null
                  }
                  {updating && !defaults.is_partner && ((email && email_valid) && !email.includes("hopeportalusers")) && !defaults.linked_account
                    ? <Button type="button" disabled={waiting_for_password} onClick={() => this.resetPassword(defaults)} green>{is_loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : waiting_for_password ? "Password Sent!" : "Send New Password"}</Button>
                    : null
                  }
                </Col>
              )
              : null
            }
          </Row>
        </UserMainContent>
      </ViewUserModalInner>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  updateRelationship: (relationship, cognito_id) => dispatch(updateRelationship(relationship, cognito_id)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  resetUserPassword: (user) => dispatch(resetUserPassword(user))
});
export default connect(mapStateToProps, dispatchToProps)(UserProfileGeneralSettings);