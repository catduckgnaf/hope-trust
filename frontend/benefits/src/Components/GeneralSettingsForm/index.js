import React, { Component } from "react";
import { Prompt } from "react-router";
import { connect } from "beautiful-react-redux";
import { merge, debounce } from "lodash";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { updateUser, checkUsername } from "../../store/actions/user";
import { showNotification } from "../../store/actions/notification";
import authenticated from "../../store/actions/authentication";
import { US_STATES, limitInput } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
  InputWrapper,
  SelectWrapper,
  InputLabel,
  Input,
  Select,
  RequiredStar,
  InputHint
} from "../../global-components";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  LabelAppendage,
  VerifyAttributeButton,
  SendVerificationButton,
  SettingsButtonContainer
} from "../../Pages/Settings/style";
import { SaveProfileButton } from "./style";

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
    const { user, session } = props;
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
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
        username: user.username || ""
      },
      updatedProfileInfo: {},
      verifications: user.verifications,
      verifying_email: false,
      code: "",
      shouldBlockNavigation: false,
      permissions: account.permissions,
      is_loading: false,
      is_verifying: false,
      is_sending_verification: false,
      account,
      username_error: "",
      username_valid: true,
      is_loading_username: false
    };
  }

  componentDidUpdate = () => {
    const { shouldBlockNavigation } = this.state;
    if (shouldBlockNavigation) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
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
    this.setState({ is_sending_verification: true });
    await verifyAttribute(attribute);
    this.setState({ [`verifying_${attribute}`]: true, is_sending_verification: false });
  };

  confirmVerification = async (attribute, code) => {
    const { confirmAttributeVerification } = this.props;
    this.setState({ is_verifying: true });
    await confirmAttributeVerification(attribute, code);
    this.setState({ [`verifying_${attribute}`]: false, is_verifying: false });
  };

  saveSettings = async () => {
    const {
      updateUser,
      showNotification
    } = this.props;
    let {
      updatedProfileInfo,
      profileInfo
    } = this.state;
    let isChanged = Object.keys(updatedProfileInfo).length;
    if (this.checkCompletion(profileInfo)) {
      if (isChanged) {
        const { first_name, middle_name, last_name, address, address2, city, state, zip, email, gender, pronouns, birthday, username } = updatedProfileInfo;
        this.setState({ is_loading: true });
        await updateUser({ first_name, middle_name, last_name, address, address2, city, state, zip, email, gender, pronouns, birthday, username });
        this.setState({ shouldBlockNavigation: false, updatedProfileInfo: {}, is_loading: false }, window.onbeforeunload = null);
      }
    } else {
      showNotification("error", "Update Failed", "You must fill in all required fields.");
    }
  };

  checkUsername = async (event) => {
    const { checkUsername, user } = this.props;
    event.persist();
    if ((event.target.value && (user.username !== event.target.value))) {
      if (!this.debouncedFn) {
        this.debouncedFn = debounce(async () => {
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
      this.debouncedFn();
    } else {
      this.setState({ username_error: false });
      this.setState({ username_valid: true });
    }
  };

  checkCompletion = (profile_info) => {
    const { first_name, last_name, address, city, state, zip, email } = profile_info;
    return first_name && last_name && address && city && state && zip && email;
  };

  render() {
    const { user } = this.props;
    const {
      profileInfo,
      verifying_email,
      code,
      verifications,
      shouldBlockNavigation,
      is_loading,
      is_verifying,
      is_sending_verification,
      updatedProfileInfo,
      account,
      username_error,
      username_valid,
      is_loading_username
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
      username
    } = profileInfo;
    const isVerifiedEmail = verifications.includes("email_verified");
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
                      id="code"
                      type="text"
                      value={code}
                      onChange={(event) => this.setOther(event.target.id, event.target.value)}
                      onKeyPress={(event) => limitInput(event, 5)}
                    />
                    <VerifyAttributeButton
                      width={75} rounded
                      onClick={() => this.confirmVerification("email", code)}>{is_verifying ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Verify"}
                    </VerifyAttributeButton>
                  </InputWrapper>
                )
                : (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Email
                      {isVerifiedEmail
                          ? (
                            <LabelAppendage
                              style={{color: "green"}}>(Verified)
                            </LabelAppendage>
                          ) : (
                            <LabelAppendage
                              onClick={() => this.runVerification("email")}>
                              <SendVerificationButton width={75} rounded>{is_sending_verification ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Send Code"}</SendVerificationButton>
                            </LabelAppendage>
                          )
                        }
                    </InputLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly />
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
                      autofill="off"
                      type="username"
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
                <InputLabel>Gender</InputLabel>
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
                <InputLabel>Preferred pronouns</InputLabel>
                <Select id="pronouns" value={pronouns || ""} onChange={(event) => this.set(event.target.id, event.target.value)}>
                  <option disabled value="">Choose preferred pronouns</option>
                  <option value="female-pronoun">She, Her, Hers</option>
                  <option value="male-pronoun">He, Him, His</option>
                  <option value="nongender-pronoun">They, Them, Theirs</option>
                </Select>
              </InputWrapper>
              <InputWrapper>
                <InputLabel>Birth Date</InputLabel>
                <Input id="birthday" type="date" value={birthday} onChange={(event) => this.set(event.target.id, event.target.value)} max={moment().format("YYYY-MM-DD")} min={moment().subtract(100, "year").format("YYYY-MM-DD")} />
              </InputWrapper>
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection>
          <SettingsButtonContainer span={12}>
            <SaveProfileButton disabled={!Object.keys(updatedProfileInfo).length} type="button" onClick={() => this.saveSettings()} small nomargin primary green outline>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Profile"}</SaveProfileButton>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  updateUser: (updates) => dispatch(updateUser(updates)),
  checkUsername: (username) => dispatch(checkUsername(username)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  verifyAttribute: (attribute) => dispatch(authenticated.verifyAttribute(attribute)),
  confirmAttributeVerification: (attribute, code) => dispatch(authenticated.confirmAttributeVerification(attribute, code)),
});
export default connect(mapStateToProps, dispatchToProps)(GeneralSettingsForm);
