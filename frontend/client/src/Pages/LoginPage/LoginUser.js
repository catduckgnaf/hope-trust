import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { MultipartForm, MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { changeFormSlide } from "../../store/actions/multipart-form";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import LoginSlide from "./slides/login.slide";
import ForcePasswordSlide from "./slides/force.slide";
import ForgotPasswordSlide from "./slides/forgot.slide";
import ResetPasswordSlide from "./slides/reset.slide";
import LoginWithMFASlide from "./slides/mfa.slide";
import ResolveSlide from "./slides/resolve.slide";
import signup_background from "../../assets/images/signup_background.jpeg";
import authenticated from "../../store/actions/authentication";
import { forgotPassword, confirmForgotPassword, cancelSignup } from "../../store/actions/user";
import { showNotification } from "../../store/actions/notification";
import { sleep } from "../../utilities";
import { getCoreSettings } from "../../store/actions/customer-support";
import { clearAll } from "../../store/actions/session";
import { navigateTo } from "../../store/actions/navigation";

const initialState = {
  loading: false
};

const pathnames = {
  "/login": "login",
  "/forgot-password": "forgot",
  "/reset-password": "reset",
  "/force-password": "force",
  "/resolve": "resolve",
  "/mfa-login": "mfa"
};

class LoginPage extends Component {
  constructor(props) {
    super(props);
    const { changeFormSlide, location, login_state } = props;
    this.state = {
      flow: login_state.flow
    };
    if (location.query.email) this.composeState("login_email", decodeURIComponent(location.query.email), "login_details");
    if (location.query.slide) changeFormSlide(location.query.slide);
  }

  async componentDidMount() {
    const { location } = this.props;
    if (pathnames[location.pathname]) await this.setFlow(pathnames[location.pathname]);
  }

  composeState = (key, value, collector, local = false) => {
    const { updateLogin } = this.props;
    if (!local) updateLogin(collector, key, value);
    else this.setState({ [key]: value });
  };

  retrieveValueFromState = (key, local = false) => {
    const { login_state } = this.props;
    if (!local) {
      let flat = {};
      let state = Object.assign(flat, ...Object.keys(login_state).map((reg_key) => login_state[reg_key]));
      if (state[key]) return state[key];
      return login_state[key];
    }
    return this.state[key];
  };

  runVerification = async (email) => {
    const { forgotPassword } = this.props;
    this.composeState("is_verifying", true, "forgot_details");
    const forgot = await forgotPassword(email);
    if (forgot.success) this.composeState("email_verified", true, "forgot_details");
    else this.composeState("email_verified", false, "forgot_details");
    this.composeState("is_verifying", false, "forgot_details");
  };

  confirmForgotPassword = async (email, code, password) => {
    const { confirmForgotPassword } = this.props;
    const confirmed = await confirmForgotPassword(
      email,
      code,
      password
    );
    if (confirmed.success) {
      this.setFlow("login");
      this.composeState("login_email", email, "login_details");
    }
  };

  confirmSignIn = async (code) => {
    const { showNotification, confirmSignIn } = this.props;
    const confirmed = await confirmSignIn(this.retrieveValueFromState("login_user"), code);
    if (!confirmed.success) showNotification("error", "MFA Error", confirmed.error.message);
  };

  login = async (user) => {
    const { login, showNotification } = this.props;
    this.setState({ loading: true });
    if (!user.password) user.password = this.state.login_password;
    const loggedIn = await login({ ...user });
    if (!loggedIn) {
      showNotification("error", "Login Error", "Something went wrong.");
      this.setFlow("login");
      this.setState({ loading: false });
      return { success: false };
    }
    if (loggedIn.user && loggedIn.user.challengeName) {
      this.composeState("login_user", loggedIn.user, "login_details");
      await sleep(2000);
      switch (loggedIn.user.challengeName) {
        case "SMS_MFA":
          this.setFlow("mfa", false);
          break;
        case "NEW_PASSWORD_REQUIRED":
          this.composeState("force_email", loggedIn.email, "force_details");
          this.setFlow("force", false);
          break;
        case "UserNotConfirmedException":
          this.setFlow("resolve", false);
          break;
        case "PasswordResetRequiredException":
          this.setFlow("reset", false);
          break;
        default:
          break;
      }
    }
    if (!loggedIn.success && loggedIn.error) showNotification("error", "Login Error", loggedIn.error.message);
    this.setState({ loading: false });
    return loggedIn;
  };

  completeNewPassword = async (user) => {
    const { completeNewPassword } = this.props;
    this.setState({ loading: true });
    await completeNewPassword(user, this.state.force_password, this.retrieveValueFromState("login_email"));
  };

  setFlow = async (flow, clear = true) => {
    const { setFlow } = this.props;
    if (clear) this.setState(initialState);
    this.setState({ loading: true, flow }, () => setFlow(flow, clear));
    await sleep(2000);
    this.setState({ loading: false });
  };

  resolve = async (email) => {
    const { cancelSignup, showNotification } = this.props;
    this.setState({ loading: true });
    const cancel = await cancelSignup(email);
    if (cancel.success) {
      showNotification("success", "Registration Cancelled", "Something went wrong during your registration. Please try registering again.");
      this.setFlow("login");
    }
  };

  navigateTo = (location, query) => {
    const { navigateTo, clearAll } = this.props;
    clearAll();
    navigateTo(location, query);
  };

  render() {
    const { location, clearRegistrations, getCoreSettings } = this.props;
    const { loading } = this.state;
    let configuration = new MultipartFormConfig({
      slides: [
        LoginSlide,
        ForgotPasswordSlide,
        ForcePasswordSlide,
        ResetPasswordSlide,
        LoginWithMFASlide,
        ResolveSlide
      ],
      splitLayout: false
    });
    return (
      <Container background_image={signup_background}>
        <MultipartForm
          loading={loading}
          config={configuration}
          state={this.state} 
          stateConsumer={this.composeState}
          stateRetriever={this.retrieveValueFromState}
          stateCollection="login"
          helpers={{
            login: this.login,
            setFlow: this.setFlow,
            location,
            checkEmail: this.checkEmail,
            runVerification: this.runVerification,
            confirmSignIn: this.confirmSignIn,
            confirmForgotPassword: this.confirmForgotPassword,
            completeNewPassword: this.completeNewPassword,
            navigateTo: this.navigateTo,
            clearRegistrations,
            getCoreSettings
          }}
        />
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  location: state.router.location,
  login_state: state.login
});
const dispatchToProps = (dispatch) => ({
  getCoreSettings: (override) => dispatch(getCoreSettings(override)),
  clearAll: () => dispatch(clearAll()),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  cancelSignup: (email) => dispatch(cancelSignup(email)),
  updateLogin: (collector, key, value) => dispatch(authenticated.updateLogin(collector, key, value)),
  login: (user) => dispatch(authenticated.login(user)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide)),
  setFlow: (flow, clear) => dispatch(authenticated.setFlow(flow, clear)),
  forgotPassword: (email) => dispatch(forgotPassword(email)),
  confirmForgotPassword: (email, code, password) => dispatch(confirmForgotPassword(email, code, password)),
  confirmSignIn: (email, code) => dispatch(authenticated.confirmSignIn(email, code)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  completeNewPassword: (user, password) => dispatch(authenticated.completeNewPassword(user, password)),
  clearRegistrations: () => dispatch(authenticated.clearRegistrations())
});
export default connect(mapStateToProps, dispatchToProps)(LoginPage);
