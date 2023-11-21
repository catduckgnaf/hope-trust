import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Fade } from "@gfazioli/react-animatecss";
import ConfirmForgotPasswordForm from "../../Components/ConfirmForgotPasswordForm";
import {
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationWrapperItemInner
} from "../../global-components";
import { ResetPasswordViewContainer, ResetPasswordLogoContainer, ResetPasswordLogo } from "./style";
import logo from "../../assets/images/logo-large.svg";

class ResetPassword extends Component {

  constructor(props) {
    super(props);
    const { location } = props;
    document.title = "Reset Password";

    this.state = {
      email: location.query.email || "",
      password: "",
      confirm_password: "",
      code: ""
    };
  }

  set = (id, value) => this.setState({ [id]: value });

  render() {
    const { email, code, password, confirm_password } = this.state;
    const { history } = this.props;

    return (
      <ResetPasswordViewContainer>
        <ResetPasswordLogoContainer>
          <ResetPasswordLogo src={logo} alt="HopeTrust Logo"/>
        </ResetPasswordLogoContainer>
        <AuthenticationWrapper>
          <AuthenticationWrapperItem maxWidth={780}>
            <AuthenticationWrapperItemInner>
              <Fade animate={true}>
                <ConfirmForgotPasswordForm
                  set={this.set}
                  email={email}
                  password={password}
                  confirm_password={confirm_password}
                  code={code}
                  history={history}
                />
              </Fade>
            </AuthenticationWrapperItemInner>
          </AuthenticationWrapperItem>
        </AuthenticationWrapper>
      </ResetPasswordViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ResetPassword);
