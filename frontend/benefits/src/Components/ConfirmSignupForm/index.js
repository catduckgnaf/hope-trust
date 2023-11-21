import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { limitInput } from "../../utilities";
import { confirmSignUp, resendSignUp, cancelSignup } from "../../store/actions/signup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { showLoader, hideLoader } from "../../store/actions/loader";
import {
  ConfirmSignupFormMain,
  ConfirmSignupFormFields,
  ConfirmSignupButton,
  ConfirmSignupHeader,
  ConfirmSignupHeaderMessage
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  FormContainer
} from "../../global-components";

class ConfirmSignUpForm extends Component {
  static propTypes = {
    confirmSignUp: PropTypes.func.isRequired,
    resendSignUp: PropTypes.func.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  validateForm = (code) => code.length === 6;

  handleSubmit = async (event) => {
    const { details, confirmSignUp, showLoader, hideLoader } = this.props;
    event.preventDefault();
    showLoader();
    await confirmSignUp(details);
    hideLoader();
  };

  resend = async () => {
    const { creator_email, resendSignUp } = this.props;
    this.setState({ isLoading: true });
    setTimeout(async () => {
      await resendSignUp(creator_email);
      this.setState({ isLoading: false });
    }, 2000);
  };

  render() {
    const { creator_email, details, setNewState, cancelSignup } = this.props;
    const { isLoading } = this.state;
    const { code } = details;
    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <ConfirmSignupFormMain>
          <ConfirmSignupHeader>Verify Your Account</ConfirmSignupHeader>
          <ConfirmSignupHeaderMessage>Enter the code that was sent to your email.</ConfirmSignupHeaderMessage>
          <ConfirmSignupFormFields>
            <InputWrapper>
              <InputLabel>Verification Code</InputLabel>
              <Input
                type="number"
                id="code"
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyPress={(event) => limitInput(event, 5)}
                value={code}
                onChange={(event) => setNewState(event.target.id, event.target.value)}
              />
            </InputWrapper>
          </ConfirmSignupFormFields>
          <Row gutter={20}>
            <Col xs={12} sm={12} md={6} lg={4} xl={4}>
              <ConfirmSignupButton disabled={!this.validateForm(code)} type="submit" outline green secondary>Verify</ConfirmSignupButton>
            </Col>
            <Col xs={12} sm={12} md={6} lg={4} xl={4}>
              <ConfirmSignupButton type="button" onClick={() => this.resend()} primary outline blue>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Resend"}</ConfirmSignupButton>
            </Col>
            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
              <ConfirmSignupButton type="button" onClick={() => cancelSignup(4, creator_email)} primary outline danger>Cancel</ConfirmSignupButton>
            </Col>
          </Row>
        </ConfirmSignupFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  confirmSignUp: (fields) => dispatch(confirmSignUp(fields)),
  resendSignUp: (email) => dispatch(resendSignUp(email)),
  showLoader: () => dispatch(showLoader()),
  hideLoader: () => dispatch(hideLoader()),
  cancelSignup: (step, email) => dispatch(cancelSignup(step, email))
});
export default connect(mapStateToProps, dispatchToProps)(ConfirmSignUpForm);
