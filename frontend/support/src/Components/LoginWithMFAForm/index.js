import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import authentication from "../../store/actions/authentication";
import { showNotification } from "../../store/actions/notification";
import PropTypes from "prop-types";
import ReactPinCodeInput from "react-pin-field";
import {
  InputWrapper,
  FormContainer,
  Button
} from "../../global-components";
import {
  LoginWithMFAFormMain,
  LoginWithMFAFormFields,
  LoginWithMFAButton,
  LoginWithMFAHeader,
  LoginWithMFAHeaderMessage,
  LoginWithMFAHeaderSecondaryMessage
} from "./style";

class LoginWithMFAForm extends Component {
  static propTypes = {
    confirmSignIn: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.myRef = React.createRef();
  }

  handleSubmit = async (event) => {
    const { user, single_code, showNotification, confirmSignIn } = this.props;
    event.preventDefault();

    if (single_code.length === 6) {
      const confirmed = await confirmSignIn(user, single_code);
      if (!confirmed.success) showNotification("error", "MFA Error", confirmed.error.message);
    } else {
      showNotification("error", "MFA Error", "You must enter a verification code.");
    }
  }

  componentDidMount() {
    this.myRef.current.inputs[0].focus();
  }

  logOut = () => {
    const { logOut, set, email } = this.props;
    set("confirmationRequired", false);
    set("email", email);
    logOut();
  }

  render() {
    const { single_code, set, user, complete } = this.props;
    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <LoginWithMFAFormMain>
          <LoginWithMFAHeader>Verify Your Account</LoginWithMFAHeader>
          <LoginWithMFAHeaderMessage>Enter the code that was sent to your phone.</LoginWithMFAHeaderMessage>
          {user && user.challengeParam
            ? <LoginWithMFAHeaderSecondaryMessage>Code was sent to number ending in {user.challengeParam.CODE_DELIVERY_DESTINATION.replace("+*******", "")}.</LoginWithMFAHeaderSecondaryMessage>
            : <LoginWithMFAHeaderSecondaryMessage>Code was sent to your mobile device.</LoginWithMFAHeaderSecondaryMessage>
          }
          <LoginWithMFAFormFields>
            <InputWrapper className="pin-field-container">
              <ReactPinCodeInput
                className="pin-field"
                onComplete={() => set("complete", true)}
                length={6}
                onChange={(array) => set("single_code", array)}
                type="number"
                value={single_code}
                validate="0123456789"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="new-password"
                inputMode="number"
                ref={this.myRef}
              />
            </InputWrapper>
          </LoginWithMFAFormFields>
          <LoginWithMFAButton disabled={single_code.length !== 6 && !complete} type="submit" secondary green outline>Verify</LoginWithMFAButton>
          <Button type="button" outline danger onClick={() => this.logOut()}>Cancel</Button>
        </LoginWithMFAFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  logOut: () => dispatch(authentication.logOut()),
  confirmSignIn: (user, code) => dispatch(authentication.confirmSignIn(user, code)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(LoginWithMFAForm);
