import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { showNotification } from "../../store/actions/notification";
import PasswordStrengthBar from "react-password-strength-bar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { checkPasswordConditions } from "../../utilities";
import PropTypes from "prop-types";
import {
  ForgotPasswordConfirmationFormMain,
  ForgotPasswordConfirmationFormFields,
  ForgotPasswordConfirmationHeader,
  ForgotPasswordConfirmationHeaderMessage
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  FormContainer,
  Button,
  RequiredStar,
  RevealPassword
} from "../../global-components";
import authenticated from "../../store/actions/authentication";

class ForgotPasswordConfirmation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isLoadingResend: false
    };
  }

  static propTypes = {
    confirmForgotPassword: PropTypes.func.isRequired,
    forgotPassword: PropTypes.func.isRequired
  }
  static defaultProps = {};

  validateForm = (email, code, password, confirm_password) => {
    if (email && code && password && confirm_password) return true;
    return false;
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { confirmForgotPassword, email, code, password, confirm_password, showNotification, resetting = false, type } = this.props;
    if (this.validateForm(email, code, password, confirm_password)) {
      this.setState({ isLoading: true });
      const confirmed = await confirmForgotPassword(email, code, password, resetting, type);
      if (!confirmed.success) showNotification("error", "Verification Error", confirmed.error.message);
      this.setState({ isLoading: false });
    } else {
      showNotification("error", "Forgot Password Error", "You must fill in all fields.");
    }
  };

  resend = async () => {
    const { email, forgotPassword, showNotification } = this.props;
    this.setState({ isLoadingResend: true });
    setTimeout(async () => {
      const resent = await forgotPassword(email);
      if (resent.success) showNotification("success", "New Code Sent", "We resent your confirmation code.");
      if (resent.message) showNotification("error", "Verification Error", resent.message);
      this.setState({ isLoadingResend: false });
    }, 2000);
  };

  render() {
    const { history, set, code, password, confirm_password, email } = this.props;
    const { isLoading, isLoadingResend, revealed } = this.state;
    const passwordCheck = checkPasswordConditions(8, password, confirm_password);

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <ForgotPasswordConfirmationFormMain>
          <ForgotPasswordConfirmationHeader>Verify your account</ForgotPasswordConfirmationHeader>
          <ForgotPasswordConfirmationHeaderMessage>Enter the code we sent you and choose a new password</ForgotPasswordConfirmationHeaderMessage>
          <ForgotPasswordConfirmationFormFields>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
              <Input
                type="email"
                value={email}
                readOnly={true}
              />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Verification Code</InputLabel>
              <Input
                type="text"
                id="code"
                value={code}
                onChange={(event) => set(event.target.id, event.target.value)}
                placeholder="Enter your verification code..."
              />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> New Password (at least 8 characters, 1 number, 1 uppercase)</InputLabel>
              <Input
                type={revealed ? "text" : "password"}
                autoComplete="new-password"
                id="password"
                value={password}
                onChange={(event) => set(event.target.id, event.target.value)}
                placeholder="********"
              />
              <RevealPassword top={30} onClick={() => this.setState({ revealed: !revealed })}><FontAwesomeIcon icon={["fad", revealed ? "eye-slash" : "eye"]} /></RevealPassword>
              <PasswordStrengthBar password={password} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Confirm Password</InputLabel>
              <Input
                type={revealed ? "text" : "password"}
                autoComplete="confirm-password"
                id="confirm_password"
                value={confirm_password}
                onChange={(event) => set(event.target.id, event.target.value)}
                placeholder="********"
              />
              {password && confirm_password
                ? <InputHint error={passwordCheck.pass ? 0 : 1} success={passwordCheck.pass ? 1 : 0}>{passwordCheck.message}</InputHint>
                : null
              }
            </InputWrapper>
          </ForgotPasswordConfirmationFormFields>
          <Row>
            <Col span={4}>
              <Button widthPercent={80} marginbottom={10} disabled={!(code && email && passwordCheck.pass)} type="submit" secondary green outline>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Verify"}</Button>
            </Col>
            <Col span={4}>
              <Button widthPercent={80} marginbottom={10} type="button" onClick={() => this.resend()} primary outline blue>{isLoadingResend ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Resend"}</Button>
            </Col>
            <Col span={4}>
              <Button widthPercent={80} marginbottom={10} type="button" outline danger onClick={() => history.goBack()}>Cancel</Button>
            </Col>
          </Row>
        </ForgotPasswordConfirmationFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  forgotPassword: (email) => dispatch(authenticated.forgotPassword(email)),
  confirmForgotPassword: (email, code, password, resetting, type) => dispatch(authenticated.confirmForgotPassword(email, code, password, resetting, type))
});
export default connect(mapStateToProps, dispatchToProps)(ForgotPasswordConfirmation);
