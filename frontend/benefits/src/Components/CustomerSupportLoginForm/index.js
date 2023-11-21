import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import authentication from "../../store/actions/authentication";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import PropTypes from "prop-types";
import {
  CustomerServiceLoginFormMain,
  FormTabs,
  FormTab,
  FormBottomLink,
  LoginButton,
  CustomerServiceLoginFormFields
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  FormContainer,
  RequiredStar
} from "../../global-components";

class CustomerServiceLoginForm extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
  }

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  handleSubmit = async (event) => {
    const {
      email,
      password,
      login,
      runCodeConfirmation,
      set,
      showNotification,
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
          runCodeConfirmation(loggedIn.user.challengeName);
        }
      }
    } else {
      showNotification("error", "Credentials Error", "You must fill in all required fields. Email must be a Hope Trust email.");
    }
    this.setState({ isLoading: false });
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
    const { isLoading } = this.state;

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <FormTabs gutter={0}>
          <FormTab span={6} onClick={() => navigateTo("/login")} active="true">Login</FormTab>
          <FormTab span={6} onClick={() => navigateTo("/signup")}>Signup</FormTab>
        </FormTabs>
        <CustomerServiceLoginFormMain>
          <CustomerServiceLoginFormFields>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
              <Input
                autoComplete="username"
                type="email"
                id="email"
                value={email}
                onChange={(event) => set(event.target.id, event.target.value)}
              />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Password</InputLabel>
              <Input
                value={password}
                onChange={(event) => set(event.target.id, event.target.value)}
                autoComplete="current-password"
                type="password"
                id="password"
                autoFocus={focus}
              />
            </InputWrapper>
          </CustomerServiceLoginFormFields>
          <LoginButton type="submit" green outline secondary nomargin>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Login"}</LoginButton>
          <FormBottomLink onClick={() => navigateTo("/forgot-password", "?type=customer_support")}>Forgot Password</FormBottomLink>
        </CustomerServiceLoginFormMain>
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
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(CustomerServiceLoginForm);
