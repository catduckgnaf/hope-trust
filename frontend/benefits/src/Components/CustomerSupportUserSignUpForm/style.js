
--boundary_.oOo._KGd/dC3HY4DUuXgPloTm0eTII1cDiQmU
Content-Length: 1195
Content-Type: application/octet-stream
X-File-MD5: a378e4607dfa800984b02605bfc3d9b9
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/CustomerSupportLoginForm/style.js

import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Button } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const CustomerServiceLoginFormMain = styled.div`
  width: 70%;
  position: relative;
  margin: auto;
`;

export const CustomerServiceLoginFormFields = styled.div`
  padding: 20px 0;
`;

export const FormTabs = styled(Row)`

`;

export const FormTab = styled(Col)`
  background: ${theme.white};
  padding: 5px 0 20px 0;
  margin-bottom: 35px;
  cursor: pointer
  font-weight: 300;
  font-size: 16px;

  ${media.lessThan("990px")`
    font-size: 14px;
  `};

  ${media.lessThan("500px")`
    font-size: 12px;
  `};

  ${(props) => props.active === "true" && css`
    border-bottom: 2px solid ${theme.buttonGreen};
  `};
`;

export const FormBottomLink = styled.div`
  color: ${theme.hopeTrustBlueLink};
  display: block;
  font-size: 12px;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    color: ${theme.hopeTrustBlue};
  }
  &:active {
    color: ${theme.hopeTrustBlueDarker};
  }
`;

export const LoginButton = styled(Button)`
  width: 100%;
`;

--boundary_.oOo._KGd/dC3HY4DUuXgPloTm0eTII1cDiQmU
Content-Length: 4040
Content-Type: application/octet-stream
X-File-MD5: 80c312120a951dba47cf4e9bf1c0a753
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/CustomerSupportLoginForm/index.js

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

--boundary_.oOo._KGd/dC3HY4DUuXgPloTm0eTII1cDiQmU
Content-Length: 440
Content-Type: application/octet-stream
X-File-MD5: 23795f38491ed68ee3354ac96009aca9
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/DefaultLoader/index.js

import React, { Component } from "react";
import {
  DefaultLoaderMain,
  DefaultLoaderImage
} from "./style";
import loader4 from "../../assets/images/loader4.svg";

class DefaultLoader extends Component {

  render() {
    const { width } = this.props;
    return (
      <DefaultLoaderMain>
        <DefaultLoaderImage width={width} src={loader4} alt="Loading..."/>
      </DefaultLoaderMain>
    );
  }
}

export default DefaultLoader;

--boundary_.oOo._KGd/dC3HY4DUuXgPloTm0eTII1cDiQmU
Content-Length: 243
Content-Type: application/octet-stream
X-File-MD5: 892b17960063b9aabd1bf4c3445f0622
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/DefaultLoader/style.js

import styled from "styled-components";

export const DefaultLoaderMain = styled.div`
  height: 100%;
  text-align: center;
  justify-content: center;
  display: flex;
`;

export const DefaultLoaderImage = styled.img`
  align-self: center;
`;

--boundary_.oOo._KGd/dC3HY4DUuXgPloTm0eTII1cDiQmU
Content-Length: 2715
Content-Type: application/octet-stream
X-File-MD5: 06a0dea98dabb249f68734cfb2911af8
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/Container/index.js

import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import {
  MainContainer,
  ContainerMain,
  ContainerPadding,
  ContainerInner,
  ContainerInnerTitle,
  ContainerHeader,
  ContainerSection
} from "./style";

class Container extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    title: PropTypes.string,
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.nu