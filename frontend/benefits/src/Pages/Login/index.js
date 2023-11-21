import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "beautiful-react-redux";
import LoginForm from "../../Components/LoginForm";
import { Fade } from "@gfazioli/react-animatecss";
import ForceChangePasswordForm from "../../Components/ForceChangePasswordForm";
import LoginWithMFAForm from "../../Components/LoginWithMFAForm";
import ResolveConfirmationForm from "../../Components/ResolveConfirmationForm";
import {
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationWrapperItemInner,
  Version
} from "../../global-components";
import { LoginViewContainer, LoginLogo, LoginLogoContainer } from "./style";
import logo from "../../assets/images/logo-large.svg";

class Login extends Component {

  constructor(props) {
    super(props);
    const { location } = props;
    document.title = "Login";

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

  validateForm = (...args) => args.every((argument) => argument.length > 0);
  runCodeConfirmation = (status, email) => this.setState({ confirmationRequired: status, email, error: "" });
  set = (id, value) => this.setState({ [id]: value });

  render() {
    const { confirmationRequired, code, single_code, email, password, newPassword, confirmNewPassword, user, focus, complete } = this.state;
    const { history, customer_support } = this.props;

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
                      history={history}
                    />
                  : null
                }

                {confirmationRequired === "SMS_MFA"
                  ? <LoginWithMFAForm
                      set={this.set}
                      email={email}
                      single_code={single_code}
                      complete={complete}
                      user={user}
                    />
                  : null
                }

                {confirmationRequired === "PasswordResetRequiredException"
                  ? <Redirect
                      to={`/reset-password?email=${email}`}
                    />
                  : null
                }

                {confirmationRequired === "UserNotConfirmedException"
                  ? <ResolveConfirmationForm email={email} set={this.set} />
                  : null
                }

                {!confirmationRequired
                  ? <LoginForm
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
        <Version>Version: {customer_support.core_settings && customer_support.core_settings.benefits_app_version ? customer_support.core_settings.benefits_app_version : "1.0"}</Version>
      </LoginViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  location: state.router.location,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Login);
