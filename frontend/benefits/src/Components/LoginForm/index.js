import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import authentication from "../../store/actions/authentication";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import { clearMultipartForm } from "../../store/actions/multipart-form";
import { clearClientRegistration } from "../../store/actions/client-registration";
import PropTypes from "prop-types";
import {
  LoginFormMain,
  FormTabs,
  FormTab,
  FormBottomLink,
  LoginButton,
  LoginFormFields
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  FormContainer,
  RequiredStar,
  InputHint
} from "../../global-components";

class LoginForm extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
  }

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: ""
    };
  }

  handleSubmit = async (event) => {
    const {
      email,
      password,
      login,
      runCodeConfirmation,
      showNotification,
      set,
      validateForm
    } = this.props;
    event.preventDefault();

    this.setState({ isLoading: true });
    if (validateForm(email, password)) {
      const loggedIn = await login({ email, password });
      if (!loggedIn.success) {
        if (loggedIn.error) showNotification("error", "Login Error", loggedIn.error.message);
      } else {
        if (loggedIn.user) {
          set("user", loggedIn.user);
          runCodeConfirmation(loggedIn.user.challengeName, loggedIn.user?.challengeParam?.userAttributes?.email || loggedIn.user?.email || email);
        }
      }
    } else {
      showNotification("error", "Login Error", "You must fill in all required fields.");
    }
    this.setState({ isLoading: false });
  };

  checkCaps = (e) => {
    if (e.target.value && e.getModifierState("CapsLock")) {
      this.setState({ error: "Caps lock is on." });
    } else {
      this.setState({ error: "" });
    }
  };

  navigateAndClear = (route) => {
    const { clearMultipartForm, navigateTo, clearClientRegistration } = this.props;
    clearMultipartForm();
    clearClientRegistration();
    navigateTo(route);
  };

  componentWillUnmount() {
    this.setState({ isLoading: false });
  }

  render() {
    let {
      email,
      password,
      set,
      navigateTo,
      focus
    } = this.props;
    const { isLoading, error } = this.state;

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <FormTabs gutter={0}>
          <FormTab span={6} onClick={() => this.navigateAndClear("/login")} active="true">Login</FormTab>
          <FormTab span={6} onClick={() => this.navigateAndClear("/registration")}>Registration</FormTab>
        </FormTabs>
        <LoginFormMain>
          <LoginFormFields>
            <InputWrapper>
              <InputLabel htmlFor="email"><RequiredStar>*</RequiredStar> Email</InputLabel>
              <Input
                autoComplete="username"
                type="email"
                id="email"
                value={email}
                onChange={(event) => set(event.target.id, event.target.value)}
              />
            </InputWrapper>
            <InputWrapper>
              <InputLabel htmlFor="password"><RequiredStar>*</RequiredStar> Password</InputLabel>
              <Input
                value={password}
                onChange={(event) => set(event.target.id, event.target.value)}
                autoComplete="current-password"
                type="password"
                id="password"
                name="password"
                autoFocus={focus}
                onKeyUp={(e) => this.checkCaps(e)}
              />
              {error
                ? <InputHint error={1}>{error}</InputHint>
                : null
              }
            </InputWrapper>
          </LoginFormFields>
          <LoginButton type="submit" secondary nomargin green outline>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Login"}</LoginButton>
          <FormBottomLink onClick={() => navigateTo("/forgot-password", "?type=user")}>Forgot Password</FormBottomLink>
        </LoginFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  router: state.router
});
const dispatchToProps = (dispatch) => ({
  login: (credentials) => dispatch(authentication.login(credentials)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  clearMultipartForm: () => dispatch(clearMultipartForm()),
  clearClientRegistration: () => dispatch(clearClientRegistration())
});
export default connect(mapStateToProps, dispatchToProps)(LoginForm);
