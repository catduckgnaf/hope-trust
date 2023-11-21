import React, { Component } from "react";
import PropTypes from "prop-types";
import { verifyPhoneFormat, formatUSPhoneNumber, formatUSPhoneNumberPretty, limitInput, allowNumbersOnly } from "../../utilities";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { updateUser } from "../../store/actions/user";
import authenticated from "../../store/actions/authentication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import {
  InputWrapper,
  InputLabel,
  Input,
  Button,
  InputHint
} from "../../global-components";
import {
  RowHeader,
  RowBody,
  RowBodyPadding,
  RowContentSection,
  SendVerificationButton,
  LabelAppendage
} from "../../Pages/Settings/style";
import { TwoFactorView, TwoFactorMessage, TwoFactorButton } from "./style";

class TwoFactorSetting extends Component {
  _isMounted = false;

  static propTypes = {
    setupMFA: PropTypes.func.isRequired,
    resetMFA: PropTypes.func.isRequired,
    confirmAttributeVerification: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      initial_phone: formatUSPhoneNumberPretty(user.home_phone),
      home_phone: formatUSPhoneNumberPretty(user.home_phone),
      verifying_phone_number: false,
      code: "",
      is_sending_verification: false,
      is_verifying: false,
      is_saving_phone: false,
      is_resetting_mfa: false,
      is_setting_up_mfa: false,
      phone_error: ""
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  set = (id, value) => this.setState({ [id]: value });

  runVerification = async (attribute) => {
    const { verifyAttribute, showNotification } = this.props;
    this.setState({ is_sending_verification: true });
    const verified = await verifyAttribute(attribute);
    if (verified.success) {
      this.setState({ [`verifying_${attribute}`]: true });
      showNotification("success", "Phone verification", "We sent a code to your phone.");
      this.codeInput.focus();
    } else {
      this.setState({ [`verifying_${attribute}`]: false });
      showNotification("error", "Could not verify", verified.error.message);
    }
    this.setState({ is_sending_verification: false });
  };

  confirmVerification = async (attribute) => {
    const { confirmAttributeVerification, showNotification, session, setupMFA } = this.props;
    const { code } = this.state;
    this.setState({ is_verifying: true });
    const verified = await confirmAttributeVerification(attribute, code);
    if (verified.success) {
      if (session.user.preferredMFA !== "SMS_MFA" && session.user.challengeName !== "SMS_MFA") showNotification("warning", "Two Factor Authentication", "To keep your account as secure as possible, we highly recommend enabling two factor authentication. Click here to enable now.", { action: () => setupMFA("phone_number") });
      this.setState({ [`verifying_${attribute}`]: false });
      showNotification("success", "Phone verified", "We verified your phone, now you can turn on Two Factor Authentication.");
    } else {
      showNotification("error", "Verification Failed", verified.error.message);
    }
    this.setState({ is_verifying: false });
  };

  savePhoneNumber = async () => {
    const { home_phone } = this.state;
    const { updateUser, showNotification } = this.props;
    this.setState({ is_saving_phone: true, verifying_phone_number: false });
    const updated_user = await updateUser({ home_phone: formatUSPhoneNumber(home_phone) }, false, false);
    if (updated_user.success) {
      this.setState({ is_saving_phone: false, home_phone: updated_user.payload.home_phone });
      showNotification("warning", "Verify your phone number", "Verifying your phone number allows for a much more secure HopeTrust experience.");
    } else {
      this.setState({ is_saving_phone: false });
      showNotification("error", "Could not save update user.", "Your phone number could not be updated.");
    }
  };

  reset = async () => {
    const { resetMFA } = this.props;
    this.setState({ is_resetting_mfa: true });
    await resetMFA();
    this.setState({ is_resetting_mfa: false });
  };

  setup = async (type) => {
    const { setupMFA } = this.props;
    this.setState({ is_setting_up_mfa: true });
    await setupMFA(type);
    this.setState({ is_setting_up_mfa: false });
  };

  render() {
    const { user, session } = this.props;
    const { verifying_phone_number, home_phone, initial_phone, code, is_sending_verification, is_verifying, is_saving_phone, is_resetting_mfa, is_setting_up_mfa, phone_error } = this.state;
    const isVerifiedPhone = (user && user.verifications) ? user.verifications.includes("phone_number_verified") : false;
    return (
      <RowBody>
        <RowHeader>
          <Row>
            <Col>Two Factor Authentication</Col>
          </Row>
        </RowHeader>
        <RowBodyPadding paddingtop={55} paddingbottom={33}>
          <RowContentSection span={12}>
            <TwoFactorView>
              <Col xs={12} sm={12} md={2} lg={2} xl={2} style={{ marginBottom: "20px"}}>
                <Button disabled={!home_phone || is_verifying || home_phone === initial_phone || !verifyPhoneFormat(home_phone)} onClick={() => this.savePhoneNumber()} green outline>{is_saving_phone ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Update"}</Button>
              </Col>
              <Col xs={12} sm={12} md={10} lg={10} xl={10}>
                {verifying_phone_number
                  ? (
                    <InputWrapper paddingleft={10} paddingtop={1} marginbottom={1}>
                      <InputLabel>Code
                        <LabelAppendage
                          onClick={() => this.confirmVerification("phone_number")}>
                          <SendVerificationButton disabled={code.length !== 6} width={75} green outline rounded>{is_verifying ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Verify"}</SendVerificationButton>
                        </LabelAppendage>
                      </InputLabel>
                      <Input
                        id="code"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        type="number"
                        value={code}
                        autoComplete="new-password"
                        autoFill={false}
                        placeholder="Enter verification code..."
                        onKeyPress={(event) => limitInput(event, 5)}
                        onChange={(event) => this.set(event.target.id, event.target.value)}
                        ref={(input) => { this.codeInput = input; }}
                        readOnly={is_verifying} />
                    </InputWrapper>
                  )
                  : (
                    <InputWrapper paddingleft={10} paddingtop={1} marginbottom={1} margintop={!isVerifiedPhone ? -15 : -7}>
                      <InputLabel>Mobile
                        {isVerifiedPhone
                          ? <LabelAppendage success>(Verified)</LabelAppendage>
                          : (
                            <LabelAppendage
                              error
                              onClick={() => this.runVerification("phone_number")}>
                              (Not verified) {user.home_phone ? <SendVerificationButton width={75} green outline rounded disabled={is_saving_phone || !verifyPhoneFormat(home_phone)}>{is_sending_verification ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Send Code"}</SendVerificationButton> : null}
                            </LabelAppendage>
                          )
                      }
                      </InputLabel>
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
                          this.set(event.target.id, "");
                          this.set("phone_error", "");
                        }}
                        onKeyPress={allowNumbersOnly}
                        onBlur={(event) => {
                          if (verifyPhoneFormat(event.target.value)) {
                            this.set(event.target.id, formatUSPhoneNumberPretty(event.target.value));
                            this.set("phone_error", "");
                          } else if (event.target.value) {
                            this.set(event.target.id, event.target.value);
                            this.set("phone_error", "This is not a valid phone format.");
                          } else {
                            this.set(event.target.id, formatUSPhoneNumberPretty(initial_phone));
                            this.set("phone_error", "");
                          }
                        }}
                        onChange={(event) => this.set(event.target.id, event.target.value)}
                        readOnly={is_saving_phone} />
                        {phone_error
                          ? <InputHint error>{phone_error}</InputHint>
                          : null
                        }
                    </InputWrapper>
                  )
                }
              </Col>
            </TwoFactorView>
          </RowContentSection>
          <RowContentSection span={12}>
            {(user.home_phone && user.verifications.includes("phone_number_verified") && session.user.preferredMFA === "NOMFA")
              ? (
                <TwoFactorView>
                    <TwoFactorButton xs={12} sm={12} md={2} lg={2} xl={2}><Button disabled={is_saving_phone} onClick={() => this.setup("phone_number")} green outline>{is_setting_up_mfa ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Turn On"}</Button></TwoFactorButton>
                  <TwoFactorMessage xs={12} sm={12} md={10} lg={10} xl={10}>SMS Authentication is not active.</TwoFactorMessage>
                </TwoFactorView>
              )
              : null
            }
            {(user.home_phone && !user.verifications.includes("phone_number_verified")) && session.user.preferredMFA === "NOMFA"
              ? (
                <TwoFactorView>
                  <TwoFactorButton xs={12} sm={12} md={2} lg={2} xl={2}><Button green outline disabled>Turn On</Button></TwoFactorButton>
                  <TwoFactorMessage xs={12} sm={12} md={10} lg={10} xl={10}>You have not verified your phone number, please update your profile.</TwoFactorMessage>
                </TwoFactorView>
              )
              : null
            }
            {user.home_phone && user.verifications.includes("phone_number_verified") && (session.user.preferredMFA === "SMS_MFA" || session.user.challengeName === "SMS_MFA")
              ? (
                <TwoFactorView>
                  <TwoFactorButton xs={12} sm={12} md={2} lg={2} xl={2}><Button disabled={is_saving_phone} onClick={() => this.reset()} green outline>{is_resetting_mfa ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Turn Off"}</Button></TwoFactorButton>
                  <TwoFactorMessage xs={12} sm={12} md={10} lg={10} xl={10}>SMS Authentication is active.</TwoFactorMessage>
                </TwoFactorView>
              )
              : null
            }

            {!user.home_phone
              ? (
                <TwoFactorView>
                  <TwoFactorButton xs={12} sm={12} md={2} lg={2} xl={2}><Button green outline disabled>Turn On</Button></TwoFactorButton>
                  <TwoFactorMessage xs={12} sm={12} md={10} lg={10} xl={10}>You do not have a phone number on file, please update your profile.</TwoFactorMessage>
                </TwoFactorView>
              )
              : null
            }
          </RowContentSection>
        </RowBodyPadding>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  setupMFA: () => dispatch(authenticated.setupMFA()),
  resetMFA: () => dispatch(authenticated.resetMFA()),
  updateUser: (updates, token, notify) => dispatch(updateUser(updates, token, notify)),
  verifyAttribute: (attribute) => dispatch(authenticated.verifyAttribute(attribute)),
  confirmAttributeVerification: (attribute, code) => dispatch(authenticated.confirmAttributeVerification(attribute, code)),
});
export default connect(mapStateToProps, dispatchToProps)(TwoFactorSetting);
