import React, { Component } from "react";
import { Prompt } from "react-router";
import { connect } from "beautiful-react-redux";
import { merge, debounce, uniq, orderBy } from "lodash";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { resetMFA, setupMFA, updateUser, checkUsername, checkUserEmail } from "../../store/actions/user";
import { showNotification } from "../../store/actions/notification";
import authenticated from "../../store/actions/authentication";
import { US_STATES, limitInput, verifyPhoneFormat, formatUSPhoneNumberPretty, formatUSPhoneNumber, sleep } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { advisor_types } from "../../store/actions/partners";
import ToggleSwitch from "../ToggleSwitch";
import moment from "moment";
import {
  InputWrapper,
  SelectWrapper,
  InputLabel,
  Input,
  InputHint,
  Select,
  SelectLabel,
  RequiredStar,
  CheckBoxInput,
  Button
} from "../../global-components";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  LabelAppendage,
  VerifyAttributeButton,
  SettingsButtonContainer
} from "../../Pages/Settings/style";
import {
  SaveProfileButton,
  TwoFactorSection,
  TwoFactorText,
  TwoFactorSwitch
} from "./style";
import DatePicker from "react-datepicker";
import CustomDateInput from "../../Components/CustomDateInput";
import "react-datepicker/dist/react-datepicker.css";

class GeneralSettingsForm extends Component {
  static propTypes = {
    verifyAttribute: PropTypes.func.isRequired,
    confirmAttributeVerification: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const advisor_type = user.is_partner ? advisor_types.find((a) => a.name === user.partner_data.partner_type) : {};
    this.state = {
      profileInfo: {
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
        address2: user.address2 || "",
        city: user.city || "",
        state: user.state || "",
        zip: user.zip || "",
        email: user.email,
        avatar: user.avatar || "",
        gender: user.gender || "",
        pronouns: user.pronouns || "",
        birthday: user.birthday || "",
        user_type: user.type || advisor_type.alias || "",
        primary_contact: user.primary_contact,
        secondary_contact: user.secondary_contact,
        emergency: user.emergency,
        inherit: user.inherit,
        username: user.username || "",
        home_phone: user.home_phone || ""
      },
      phone_error: "",
      phone_valid: !!user.home_phone,
      is_loading_phone: false,
      updatedProfileInfo: {},
      verifications: user.verifications,
      verifying_email: false,
      verifying_phone_number: false,
      code: "",
      shouldBlockNavigation: false,
      permissions: account.permissions,
      is_loading: false,
      is_verifying_email: false,
      is_verifying_phone_number: false,
      is_sending_email_verification: false,
      is_sending_phone_number_verification: false,
      account,
      username_error: "",
      username_valid: true,
      is_loading_username: false,
      email_error: "",
      email_valid: !!user.email,
      is_loading_email: false,
      two_factor: session.user.preferredMFA === "SMS_MFA",
      is_resetting_mfa: false,
      is_setting_up_mfa: false
    };
  }

  set = (id, value) => {
    let { profileInfo, updatedProfileInfo } = this.state;
    updatedProfileInfo[id] = value;
    const newState = merge(profileInfo, updatedProfileInfo);
    this.setState({
      profileInfo: newState,
      updatedProfileInfo,
      shouldBlockNavigation: true
    });
  };

  setOther = (id, value) => this.setState({ [id]: value });

  runVerification = async (attribute) => {
    const { verifyAttribute } = this.props;
    this.setState({ [`is_sending_${attribute}_verification`]: true });
    await verifyAttribute(attribute);
    this.setState({ [`verifying_${attribute}`]: true, [`is_sending_${attribute}_verification`]: false, code: "" });
  };

  confirmVerification = async (attribute, code) => {
    const { confirmAttributeVerification } = this.props;
    this.setState({ [`is_verifying_${attribute}`]: true });
    await confirmAttributeVerification(attribute, code);
    this.setState({ [`verifying_${attribute}`]: false, [`is_verifying_${attribute}`]: false, code: "" }, () => showNotification("warning", "Two Factor Authentication", "To keep your account as secure as possible, we highly recommend enabling two factor authentication."));
  };

  saveSettings = async () => {
    const {
      updateUser,
      showNotification,
      user
    } = this.props;
    let {
      updatedProfileInfo,
      profileInfo,
      phone_valid
    } = this.state;
    let isChanged = Object.keys(updatedProfileInfo).length;
    if (this.checkCompletion({ ...profileInfo, phone_valid })) {
      if (isChanged) {
        const { first_name, middle_name, last_name, address, address2, city, state, zip, email, gender, pronouns, birthday, user_type, primary_contact, secondary_contact, emergency, inherit, username, home_phone } = updatedProfileInfo;
        this.setState({ is_loading: true });
        const saved = await updateUser({ first_name, middle_name, last_name, address, address2, city, state, zip, email, gender, pronouns, birthday, username, user_type, primary_contact, secondary_contact, emergency, inherit, home_phone });
        if (saved.success && email && user.email !== email) this.setState({ "verifying_email": true }, () => document.getElementById("email_code").focus());
        this.setState({ shouldBlockNavigation: false, updatedProfileInfo: {}, phone_error: "", is_loading: false }, window.onbeforeunload = null);
      }
    } else {
      showNotification("error", "Update Failed", "You must fill in all required fields.");
    }
  };

  checkCompletion = (profile_info) => {
    const { first_name, last_name, address, city, state, zip, email, birthday, user_type, gender, pronouns, home_phone, phone_valid } = profile_info;
    const { user } = this.props;
    const { username_valid, email_valid } = this.state;
    let is_complete = false;
    if (user.is_partner) {
      is_complete = first_name && last_name && address && city && state && zip && email && gender && username_valid && home_phone && email_valid && phone_valid;
    } else if (user_type === "beneficiary") {
      is_complete = first_name && last_name && address && city && state && zip && email && birthday && gender && pronouns && username_valid && email_valid && home_phone && phone_valid;
    } else {
      is_complete = first_name && last_name && address && city && state && zip && email && birthday && user_type && gender && username_valid && email_valid && home_phone && phone_valid;
    }
    if (is_complete && zip & zip.length !== 5) is_complete = false;
    return is_complete;
  };

  checkUsername = async (event) => {
    const { checkUsername, user } = this.props;
    event.persist();
    if ((event.target.value && (user.username !== event.target.value))) {
      if (!this.usernameDebouncedFn) {
      this.usernameDebouncedFn = debounce(async () => {
        let username = event.target.value;
        if (username) {
          this.setState({ is_loading_username: true });
          const usernameCheck = await checkUsername(username);
          if (usernameCheck.success) {
            this.setState({ username_error: usernameCheck.message, error_code: "", username_valid: true });
          } else {
            this.setState({ username_error: usernameCheck.message, error_code: usernameCheck.error_code, username_valid: false });
          }
        } else {
          this.setState({ username_error: false, error_code: "", username_valid: false });
        }
        this.setState({ is_loading_username: false });
      }, 1000);
    }
    this.usernameDebouncedFn();
    } else {
      this.setState({ username_error: false });
      this.setState({ username_valid: true });
    }
  };

  checkUserEmail = async (event) => {
    const { checkUserEmail, user } = this.props;
    event.persist();
    if ((event.target.value && (user.email !== event.target.value))) {
      if (!this.emailDebouncedFn) {
        this.emailDebouncedFn = debounce(async () => {
          let email = event.target.value;
          if (email.includes("@")) {
            this.setState({ is_loading_email: true });
            const emailCheck = await checkUserEmail(email);
            if (emailCheck.success) {
              this.setState({ email_error: emailCheck.message, error_code: "", email_valid: true });
            } else {
              this.setState({ email_error: emailCheck.message, error_code: emailCheck.error_code, email_valid: false });
            }
          } else {
            this.setState({ email_error: false, error_code: "", email_valid: false });
          }
          this.setState({ is_loading_email: false });
        }, 1000);
      }
      this.emailDebouncedFn();
    } else {
      this.setState({ email_error: false });
      this.setState({ email_valid: true });
    }
  };

  checkPhone = async (event) => {
    const { user } = this.props;
    event.persist();
    if ((event.target.value && (user.home_phone !== event.target.value))) {
      if (!this.phoneDebouncedFn) {
        this.phoneDebouncedFn = debounce(async () => {
          let phone = event.target.value;
          if (phone) {
            this.setState({ is_loading_phone: true });
            const phoneCheck = verifyPhoneFormat(phone);
            if (phoneCheck) {
              this.setState({ phone_error: "Great, this phone number is valid", phone_valid: true });
            } else {
              this.setState({ phone_error: "This phone number is not valid", phone_valid: false });
            }
          } else {
            this.setState({ phone_error: false, phone_valid: false });
          }
          await sleep(2000);
          this.setState({ is_loading_phone: false });
        }, 1000);
      }
      this.phoneDebouncedFn();
    } else {
      this.setState({ phone_error: false });
      this.setState({ phone_valid: true });
    }
  };

  reset = async () => {
    const { resetMFA, showNotification } = this.props;
    this.setState({ is_resetting_mfa: true });
    await resetMFA();
    this.setState({ is_resetting_mfa: false }, () => showNotification("error", "Two Factor Authentication Disabled", "We highly recommend that you enable two factor authentication to keep your account secure."));
  };

  setup = async (type) => {
    const { setupMFA, showNotification } = this.props;
    this.setState({ is_setting_up_mfa: true });
    await setupMFA(type);
    this.setState({ is_setting_up_mfa: false }, () => showNotification("success", "Two Factor Authentication Enabled", "Two factor authentication is now active on your account."));
  };

  render() {
    const {
      profileInfo,
      verifying_email,
      verifying_phone_number,
      code,
      shouldBlockNavigation,
      permissions,
      is_loading,
      is_verifying_email,
      is_verifying_phone_number,
      is_sending_email_verification,
      is_sending_phone_number_verification,
      updatedProfileInfo,
      account,
      username_error,
      username_valid,
      is_loading_username,
      email_error,
      email_valid,
      is_loading_email,
      phone_error,
      phone_valid,
      is_loading_phone,
      two_factor,
      is_resetting_mfa,
      is_setting_up_mfa
    } = this.state;
    const {
      first_name,
      middle_name,
      last_name,
      address,
      address2,
      city,
      state,
      zip,
      email,
      gender,
      pronouns,
      birthday,
      user_type,
      primary_contact,
      secondary_contact,
      emergency,
      inherit,
      username,
      home_phone
    } = profileInfo;
    const { user, session, customer_support } = this.props;
    const isVerifiedEmail = user.verifications.includes("email_verified") && user.email === email;
    const isVerifiedPhone = user.verifications.includes("phone_number_verified") && user.home_phone === formatUSPhoneNumber(home_phone);
    const contact_categories = uniq(customer_support.core_settings.contact_types.map((c) => c.child_category));
    return (
      <RowBody>
        <Prompt
          when={shouldBlockNavigation}
          message="You have unsaved changes to your profile, are you sure you want to leave?"
        />
        <RowHeader>
          <Row>
            <Col>General Profile</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
        </RowContentSection>
        <RowContentSection span={12}>
          <RowBodyPadding gutter={50} paddingbottom={1}>
            <RowContentSection xs={12} sm={12} md={12} lg={6} xl={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> First Name</InputLabel>
                <Input
                  id="first_name"
                  type="text"
                  value={first_name}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                  placeholder="Enter a first name..."
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel>Middle Name</InputLabel>
                <Input
                  id="middle_name"
                  type="text"
                  value={middle_name}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                  placeholder="Enter a middle name..."
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Last Name</InputLabel>
                <Input
                  id="last_name"
                  type="text"
                  value={last_name}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                  placeholder="Enter a last name..."
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Address</InputLabel>
                <Input
                  id="address"
                  autoComplete="new-password"
                  autoFill="off"
                  type="text"
                  name="address1"
                  value={address}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel>Address 2</InputLabel>
                <Input
                  id="address2"
                  autoComplete="new-password"
                  autoFill="off"
                  type="text"
                  name="address2"
                  value={address2}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> City</InputLabel>
                <Input
                  id="city"
                  autoComplete="new-password"
                  autoFill="off"
                  type="text"
                  name="city"
                  value={city}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                  placeholder="Enter a city..."
                />
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> State</InputLabel>
                <Select id="state" value={(state || "")} onChange={(event) => this.set(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a state</option>
                  {US_STATES.map((formState, index) => {
                    return (
                      <option key={index} value={formState.name}>{formState.name}</option>
                    );
                  })}
                </Select>
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
                <Input
                  onKeyPress={(event) => limitInput(event, 4)}
                  id="zip"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="99999"
                  autoComplete="new-password"
                  autoFill="off"
                  name="zip"
                  value={zip}
                  onChange={(event) => this.set(event.target.id, event.target.value)}
                  onFocus={(event) => this.set(event.target.id, "")}
                  placeholder="Enter a zip code..."
                />
              </InputWrapper>
            </RowContentSection>
            <RowContentSection xs={12} sm={12} md={12} lg={6} xl={6}>
              {verifying_email
                ? (
                  <InputWrapper>
                    <InputLabel>Code</InputLabel>
                    <Input
                      id="email_code"
                      type="number"
                      value={code}
                      autoFill={false}
                      autoComplete="new-password"
                      autoFocus={true}
                      placeholder="******"
                      onChange={(event) => this.setOther("code", event.target.value)}
                      onKeyPress={(event) => limitInput(event, 5)}
                    />
                    <VerifyAttributeButton
                      width={75}
                      disabled={code.length !== 6}
                      onClick={() => this.confirmVerification("email", code)}>{is_verifying_email ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Verify"}
                    </VerifyAttributeButton>
                  </InputWrapper>
                )
                : (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Email
                      {isVerifiedEmail && (user.email === email)
                          ? (
                            <LabelAppendage
                              style={{color: "green"}}>(Verified)
                            </LabelAppendage>
                          ) : null
                        }
                        {!isVerifiedEmail
                          ? (
                            <LabelAppendage
                              onClick={() => this.runVerification("email")}>
                              {user.email && user.email === email
                                ? <Button marginleft={10} green small>{is_sending_email_verification ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Send Code"}</Button>
                                : null
                              }
                            </LabelAppendage>
                          )
                          : null
                        }
                    </InputLabel>
                    {!user.is_partner
                      ? (
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => this.set(event.target.id, event.target.value)}
                          onKeyUp={this.checkUserEmail} />
                      )
                      : (
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          readOnly />
                      )
                    }
                    {email_error && user.email !== email
                      ? <InputHint margintop={5} error={email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_loading_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : email_error}</InputHint>
                      : null
                    }
                  </InputWrapper>
                )
              }
              {account.features && account.features.messaging
                ? (
                  <InputWrapper>
                    <InputLabel>Username</InputLabel>
                    <Input
                      autoComplete="new-password"
                      autoFocus={!user.username}
                      autoFill="off"
                      type="text"
                      name="username"
                      id="username"
                      value={username}
                      placeholder={user.cognito_id}
                      onKeyUp={this.checkUsername}
                      onChange={(event) => this.set(event.target.id, (event.target.value || "").toLowerCase().replace(/\s+/g, ""))}
                    />
                    {!username_error
                      ? <InputHint margintop={5}>{username || user.username || user.cognito_id}{`@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`}</InputHint>
                      : <InputHint margintop={5} error={username_error ? 1 : 0} success={username_valid ? 1 : 0}>{is_loading_username ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : username_error}</InputHint>
                    }
                  </InputWrapper>
                )
                : null
              }
              <SelectWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Gender</InputLabel>
                <Select
                  id="gender"
                  value={gender || ""}
                  onChange={(event) => this.set(event.target.id, event.target.value)}>
                  <option disabled value="">Choose a gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                </Select>
              </SelectWrapper>
              <InputWrapper>
                <InputLabel>{user_type === "beneficiary" ? <RequiredStar>*</RequiredStar> : null} Preferred pronouns</InputLabel>
                <Select id="pronouns" value={pronouns || ""} onChange={(event) => this.set(event.target.id, event.target.value)}>
                  <option disabled value="">Choose preferred pronouns</option>
                  <option value="female-pronoun">She, Her, Hers</option>
                  <option value="male-pronoun">He, Him, His</option>
                  <option value="nongender-pronoun">They, Them, Theirs</option>
                </Select>
              </InputWrapper>
              <InputWrapper>
                <InputLabel>{!user.is_partner ? <RequiredStar>*</RequiredStar> : null} Birth Date</InputLabel>
                <DatePicker
                  selected={birthday ? new Date(moment(birthday).utc().format("YYYY-MM-DD")) : null}
                  dateFormat="MMMM d, yyyy"
                  customInput={<CustomDateInput flat />}
                  onChange={(date) => this.set("birthday", moment(date).utc().format("YYYY-MM-DD"))}
                  placeholderText="Choose a birth date"
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  withPortal
                  minDate={new Date(moment().subtract(100, "year").format("YYYY-MM-DD"))}
                  value={birthday ? new Date(moment(birthday).utc().format("YYYY-MM-DD")) : null}
                />
              </InputWrapper>

              {(permissions.includes("account-admin-edit") && user_type !== "beneficiary" && !user.is_partner) || (session.is_switching && permissions.includes("account-admin-edit"))
                ? (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Relationship Type:</InputLabel>
                    <SelectLabel>
                      <Select id="user_type" value={((user_type || "").toLowerCase())} onChange={(event) => this.set(event.target.id, event.target.value)}>
                        <option disabled value="">Choose a user type</option>
                        {contact_categories.map((category, i) => {
                          const options = customer_support.core_settings.contact_types.filter((c) => c.child_category === category);
                          return (
                            <optgroup key={i} label={category}>
                              {orderBy(options, "type", "asc").map((o, k) => {
                                return <option key={k} value={o.type.toLowerCase()}>{o.type}</option>
                              })}
                            </optgroup>
                          );
                        })}
                      </Select>
                    </SelectLabel>
                  </InputWrapper>
                )
                : null
              }
              {verifying_phone_number
                ? (
                  <InputWrapper>
                    <InputLabel>Code</InputLabel>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      autoFocus={true}
                      autoComplete="new-password"
                      autoFill={false}
                      placeholder="******"
                      onChange={(event) => this.setOther(event.target.id, event.target.value)}
                      onKeyPress={(event) => limitInput(event, 5)}
                    />
                    <VerifyAttributeButton
                      width={75}
                      disabled={code.length !== 6}
                      onClick={() => this.confirmVerification("phone_number", code)}>{is_verifying_phone_number ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Verify"}
                    </VerifyAttributeButton>
                  </InputWrapper>
                )
                : (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Mobile Phone
                      {isVerifiedPhone
                        ? (
                          <LabelAppendage
                            style={{ color: "green" }}>(Verified)
                          </LabelAppendage>
                        ) : (
                          <LabelAppendage
                            onClick={() => this.runVerification("phone_number")}>
                            {user.home_phone && (user.home_phone === formatUSPhoneNumber(home_phone))
                              ? <Button marginleft={10} green small>{is_sending_phone_number_verification ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Send Code"}</Button>
                              : null
                            }
                          </LabelAppendage>
                        )
                      }
                    </InputLabel>
                    <Input
                      id="home_phone"
                      type="tel"
                      autoComplete="tel"
                      autoFill="off"
                      value={verifyPhoneFormat(home_phone) ? formatUSPhoneNumberPretty(home_phone) : home_phone}
                      minLength={10}
                      placeholder="xxx-xxx-xxxx"
                      onKeyUp={this.checkPhone}
                      onBlur={(event) => (verifyPhoneFormat(event.target.value) && formatUSPhoneNumber(event.target.value) !== user.home_phone) ? this.set(event.target.id, formatUSPhoneNumber(event.target.value)) : null}
                      onChange={(event) => this.set(event.target.id, event.target.value)}
                    />
                    {phone_error && !isVerifiedPhone && user.home_phone !== formatUSPhoneNumber(home_phone)
                      ? <InputHint margintop={5} error={!phone_valid} success={phone_valid}>{is_loading_phone ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : phone_error}</InputHint>
                      : null
                    }
                  </InputWrapper>
                )
              }
              {user.home_phone && isVerifiedPhone && account.features && account.features.two_factor_authentication
                ? (
                  <InputWrapper>
                    <InputLabel>Two Factor Authentication</InputLabel>
                    <Row>
                      <Col span={8}>
                        <TwoFactorSection>
                          <TwoFactorText>
                            Help protect your account from unauthorized access by requiring a second authentication method in addition to your password.
                          </TwoFactorText>
                        </TwoFactorSection>
                      </Col>
                      <Col span={4}>
                        <TwoFactorSection>
                          <TwoFactorSwitch>
                            {!is_resetting_mfa && !is_setting_up_mfa
                              ? <ToggleSwitch
                                label="Off"
                                label2="On"
                                id="two_factor"
                                float="right"
                                checked={two_factor || session.user.preferredMFA === "SMS_MFA"}
                                onChange={(event) => {
                                  this.setOther("two_factor", event.target.checked);
                                  if (event.target.checked) {
                                    this.setup("phone_number");
                                  } else {
                                    this.reset();
                                  }
                                }}
                              />
                              : <FontAwesomeIcon icon={["far", "spinner"]} spin />
                            }
                          </TwoFactorSwitch>
                        </TwoFactorSection>
                      </Col>
                    </Row>
                  </InputWrapper>
                )
                : null
              }
              {/* <InputWrapper>
                <InputLabel>Theme</InputLabel>
                <Row>
                  <Col span={8}>
                    <TwoFactorSection>
                      <TwoFactorText>
                        We have optimized Hope Trust for the visually impaired. Set your application theme to dark mode to take advantage of these accessibility settings.
                      </TwoFactorText>
                    </TwoFactorSection>
                  </Col>
                  <Col span={4}>
                    <TwoFactorSection>
                      <TwoFactorSwitch>
                        <ToggleSwitch
                          label="Light"
                          label2="Dark"
                          id="theme"
                          float="right"
                          checked={theme === "dark"}
                          onChange={(event) => {
                            const t = event.target.checked ? "dark" : "light";
                            this.setState({ theme: t });
                            localStorage.setItem("theme", t);
                            document.documentElement.setAttribute("data-theme", t);
                          }}
                        />
                      </TwoFactorSwitch>
                    </TwoFactorSection>
                  </Col>
                </Row>
              </InputWrapper> */}
              {((!permissions.includes("hopetrust-super-admin") && permissions.includes("account-admin-edit") && user_type !== "beneficiary" && !user.is_partner)) || (session.is_switching && !permissions.includes("hopetrust-super-admin") && permissions.includes("account-admin-edit"))
                ? (
                  <>
                    <InputWrapper>
                      <InputLabel marginbottom={10} htmlFor="emergency">Emergency contact?</InputLabel>
                      <CheckBoxInput id="emergency" onChange={(event) => this.set(event.target.id, event.target.checked)} type="checkbox" defaultChecked={emergency} />
                    </InputWrapper>
                    {!secondary_contact
                      ? (
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="primary_contact">Primary contact?</InputLabel>
                          <CheckBoxInput id="primary_contact" onChange={(event) => this.set(event.target.id, event.target.checked)} type="checkbox" defaultChecked={primary_contact} />
                        </InputWrapper>
                      )
                      : null
                    }
                    {!primary_contact
                      ? (
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="secondary_contact">Secondary contact?</InputLabel>
                          <CheckBoxInput id="secondary_contact" onChange={(event) => this.set(event.target.id, event.target.checked)} type="checkbox" defaultChecked={secondary_contact} />
                        </InputWrapper>
                      )
                      : null
                    }
                    <InputWrapper>
                      <InputLabel marginbottom={10} htmlFor="inherit">Inherit Account?</InputLabel>
                      <CheckBoxInput id="inherit" onChange={(event) => this.set(event.target.id, event.target.checked)} type="checkbox" defaultChecked={inherit} />
                    </InputWrapper>
                  </>
                )
                : null
              }
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection>
          <SettingsButtonContainer span={12}>
            <SaveProfileButton disabled={!Object.keys(updatedProfileInfo).length || !this.checkCompletion({ ...profileInfo, phone_valid })} type="button" onClick={() => this.saveSettings()} small nomargin primary green>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Profile"}</SaveProfileButton>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  updateUser: (updates) => dispatch(updateUser(updates)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  verifyAttribute: (attribute) => dispatch(authenticated.verifyAttribute(attribute)),
  confirmAttributeVerification: (attribute, code) => dispatch(authenticated.confirmAttributeVerification(attribute, code)),
  checkUsername: (username) => dispatch(checkUsername(username)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  setupMFA: () => dispatch(setupMFA()),
  resetMFA: () => dispatch(resetMFA())
});
export default connect(mapStateToProps, dispatchToProps)(GeneralSettingsForm);
