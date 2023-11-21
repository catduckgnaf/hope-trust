import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import ForgotPasswordForm from "../../Components/ForgotPasswordForm";
import { Fade } from "@gfazioli/react-animatecss";
import ConfirmForgotPasswordForm from "../../Components/ConfirmForgotPasswordForm";
import {
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationWrapperItemInner
} from "../../global-components";
import { ForgotPasswordViewContainer, ForgotPasswordLogoContainer, ForgotPasswordLogo } from "./style";
import logo from "../../assets/images/logo-large.svg";

class ForgotPassword extends Component {

  constructor(props) {
    super(props);
    const { location } = props;
    document.title = "Forgot Password";

    this.state = {
      email: location.query.email || "",
      type: location.query.type || "",
      resetting: !!location.query.resetting || false,
      password: "",
      confirm_password: "",
      confirmationRequired: false,
      code: "",
      force_submit: false
    };
  }

  runCodeConfirmation = () => this.setState({ confirmationRequired: true });
  set = (id, value) => this.setState({ [id]: value });

  render() {
    const { confirmationRequired, email, code, password, confirm_password, force_submit, resetting, type } = this.state;
    const { history } = this.props;

    return (
      <ForgotPasswordViewContainer>
        <ForgotPasswordLogoContainer>
          <ForgotPasswordLogo src={logo} alt="HopeTrust Logo"/>
        </ForgotPasswordLogoContainer>
        <AuthenticationWrapper>
          <AuthenticationWrapperItem maxWidth={780}>
            <AuthenticationWrapperItemInner>
              <Fade animate={true}>
                {confirmationRequired
                  ? <ConfirmForgotPasswordForm
                      set={this.set}
                      email={email}
                      password={password}
                      confirm_password={confirm_password}
                      code={code}
                      history={history}
                      resetting={resetting}
                      type={type}
                    />
                  : <ForgotPasswordForm
                      set={this.set}
                      runCodeConfirmation={this.runCodeConfirmation}
                      email={email}
                      force_submit={force_submit}
                      history={history}
                    />
                }
              </Fade>
            </AuthenticationWrapperItemInner>
          </AuthenticationWrapperItem>
        </AuthenticationWrapper>
      </ForgotPasswordViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ForgotPassword);
