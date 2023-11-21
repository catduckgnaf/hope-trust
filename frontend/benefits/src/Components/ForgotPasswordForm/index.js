import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import authentication from "../../store/actions/authentication";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { verifyEmailFormat } from "../../utilities";
import PropTypes from "prop-types";
import {
  ForgotPasswordFormMain,
  ForgotPasswordHeader,
  ForgotPasswordHeaderMessage,
  ForgotPasswordFormFields,
  ForgotPasswordButton
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  FormContainer,
  RequiredStar,
  Button
} from "../../global-components";

class ForgotPasswordForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  static propTypes = {
    forgotPassword: PropTypes.func.isRequired
  }

  handleSubmit = async (event) => {
    const { email, forgotPassword, runCodeConfirmation, showNotification } = this.props;
    this.setState({ isLoading: true });
    event.preventDefault();
    if (verifyEmailFormat(email)) {
      const forgot = await forgotPassword(email);
      if (forgot) {
        if (!forgot.success) {
          showNotification("error", "Password Error", forgot.message);
          this.setState({ isLoading: false });
        } else {
          showNotification("success", "Password Sent", "We sent a verification code to your email or phone.");
          runCodeConfirmation();
        }
      }
    } else {
      showNotification("error", "Password Error", "You must enter a valid email.");
      this.setState({ isLoading: false });
    }
  }

  componentDidMount() {
    const { force_submit } = this.props;
    if (force_submit) document.getElementById("reset-password-button").click();
  }

  componentWillUnmount() {
    this.setState({ isLoading: false });
  }

  render() {
    let { history, email, set } = this.props;
    const { isLoading } = this.state;

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <ForgotPasswordFormMain>
          <ForgotPasswordHeader>Reset Password</ForgotPasswordHeader>
          <ForgotPasswordHeaderMessage>Enter your email to reset your password.</ForgotPasswordHeaderMessage>
          <ForgotPasswordFormFields>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
              <Input
                type="email"
                autoComplete="username"
                id="email"
                value={email}
                onChange={(event) => set(event.target.id, event.target.value)}
              />
            </InputWrapper>
          </ForgotPasswordFormFields>
          <ForgotPasswordButton nomargin disabled={!verifyEmailFormat(email)} id="reset-password-button" type="submit" secondary green outline>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Reset Password"}</ForgotPasswordButton>
          <Button type="button" outline danger onClick={() => history.goBack()}>Cancel</Button>
        </ForgotPasswordFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  forgotPassword: (email) => dispatch(authentication.forgotPassword(email)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
});
export default connect(mapStateToProps, dispatchToProps)(ForgotPasswordForm);
