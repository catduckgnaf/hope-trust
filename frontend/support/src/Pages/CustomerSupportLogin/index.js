import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "beautiful-react-redux";
import CustomerServiceLoginForm from "../../Components/CustomerSupportLoginForm";
import { Fade } from "@gfazioli/react-animatecss";
import ForceChangePasswordForm from "../../Components/ForceChangePasswordForm";
import LoginWithMFAForm from "../../Components/LoginWithMFAForm";
import {
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationWrapperItemInner,
  Version
} from "../../global-components";
import { LoginViewContainer, LoginLogo, LoginLogoContainer } from "./style";
import logo from "../../assets/images/logo-large.svg";

class CustomerServiceLogin extends Component {

  constructor(props) {
    super(props);
    const { location } = props;
    document.title = "Customer Service Login";

    this.state = {
      email: location.query.email || "",
      focus: !!location.query.email,
      password: "",
      newPassword: "",
      confirmNewPassword: "",
      confirmationRequired: false,
      code: "",
      user: false,
      single_code: "",
      complete: false
    };
  }

  validateForm = (email, password) => (email.includes("@hopetrust.com")) && password.length > 0;
  runCodeConfirmation = (status) => this.setState({ confirmationRequired: status, error: "" });
  set = (id, value) => this.setState({ [id]: value });

  render() {
    const { confirmationRequired, code, single_code, email, password, newPassword, confirmNewPassword, user, focus, complete } = this.state;
    const { customer_support } = this.props;

    return (
      <LoginViewContainer>
        <LoginLogoContainer>
          <LoginLogo src={logo} alt="HopeTrust Logo"/>
        </LoginLogoContainer>
        <AuthenticationWrapper>
          <AuthenticationWrapperItem maxWidth={780}>
            <AuthenticationWrapperItemInner>
              <Fade animate={true}>
                {confirmationRequired === "NEW_PASSWORD_REQUIRED"
                  ? <ForceChangePasswordForm
                      set={this.set}
                      email={email}
                      newPassword={newPassword}
                      confirmNewPassword={confirmNewPassword}
                      code={code}
                      user={user}
                      validateForm={this.validateForm}
                    />
                  : null
                }

                {confirmationRequired === "SMS_MFA"
                  ? <LoginWithMFAForm
                      set={this.set}
                      email={email}
                      single_code={single_code}
                      user={user}
                      complete={complete}
                    />
                  : null
                }

                {confirmationRequired === "PasswordResetRequiredException"
                  ? <Redirect
                      to={`/reset-password?email=${email}`}
                    />
                  : null
                }

                {!confirmationRequired
                  ? <CustomerServiceLoginForm
                      set={this.set}
                      runCodeConfirmation={this.runCodeConfirmation}
                      email={email}
                      password={password}
                      validateForm={this.validateForm}
                      focus={focus}
                    />
                  : null
                }
              </Fade>
            </AuthenticationWrapperItemInner>
          </AuthenticationWrapperItem>
        </AuthenticationWrapper>
        <Version>Version: {(customer_support.core_settings && customer_support.core_settings.support_app_version) ? customer_support.core_settings.support_app_version : "1.0"}</Version>
      </LoginViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  location: state.router.location,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(CustomerServiceLogin);
