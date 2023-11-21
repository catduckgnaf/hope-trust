import React, { Component, Suspense } from "react";
import { Switch } from "react-router-dom";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import ReactAvatar from "react-avatar";
import { isIdle, isActive, onAction, getApplicationStatus, injectUserSnap } from "../store/actions/utilities";
import { openInstalliOSWebAppModal } from "../store/actions/session";
import { getCoreSettings } from "../store/actions/customer-support";
import { getAccountFeatures } from "../store/actions/account";
import Div100vh from "react-div-100vh";
import { isMobile, isTablet } from "react-device-detect";
import { checkForIOS, isGlobalRoute } from "../utilities";
import LoaderOverlay from "../Components/LoaderOverlay";
import {
  MainViewContainer,
  MainWrapper,
  MainWrapperHeader,
  MainWrapperHeaderPadding,
  MainWrapperInner,
  MainWrapperSection,
  MainWrapperSectionInner,
  MainWrapperHeaderLogo,
  MainWrapperHeaderMenu,
  SideBar,
  SideBarList,
  SideBarNav,
  MainContent,
  LogoHeader,
  LogoImg,
  AccountAvatarContainer,
  AccountAvatarTitle,
  MobileWrapper,
  MobileHeader,
  MobileContent,
  MobileFooter,
  SidebarBody,
  SidebarHeader,
  SidebarWrapper,
  SidebarFooter
} from "./style";
import Alert from "../Components/Alert";
import authenticated from "../store/actions/authentication";
import { buildPermissionedRoutes, buildPermissionedNavigation } from "./routing";
import { navigateTo, toggleMobileNavigation } from "../store/actions/navigation";
import icons from "../assets/icons";
import logo from "../assets/images/menu-logo.svg";
import { conditional_components } from "./conditional_components";
import { store } from "../store";
import config from "../config";
const Gateway = config.apiGateway.find((gateway) => gateway.name === "support");

const ConditionalWrapper = ({ children, data, onRefresh }) => {
  const { user, navigateTo, toggleMobileNavigation, location, notification } = data;
  if (!isMobile && !isTablet) {
    return (
      <MobileWrapper>
        <MobileHeader>
          {notification.show
            ? <Alert config={notification.notification_config} path={location.pathname} />
            : null
          }
          {(user && user.accounts.length) && !isGlobalRoute(location.pathname)
            ? (
              <MainWrapperHeader>
                <MainWrapperHeaderPadding>
                  <MainWrapperInner>
                    <MainWrapperSection span={3} align="left">
                      <MainWrapperSectionInner>
                        <MainWrapperHeaderLogo onClick={() => navigateTo("/")} src={icons.whiteLogoOnly} alt="HopeTrust Logo" width={40} />
                      </MainWrapperSectionInner>
                    </MainWrapperSection>
                    <MainWrapperSection span={9} align="right">
                      <MainWrapperSectionInner>
                        <MainWrapperHeaderMenu>
                          <MainWrapperHeaderLogo onClick={() => toggleMobileNavigation()} src={icons.mobileMenuToggle} alt="HopeTrust Menu" width={25} />
                        </MainWrapperHeaderMenu>
                      </MainWrapperSectionInner>
                    </MainWrapperSection>
                  </MainWrapperInner>
                </MainWrapperHeaderPadding>
              </MainWrapperHeader>
            )
            : null
          }
        </MobileHeader>
        <MobileContent>
          <MainViewContainer>{children}</MainViewContainer>
        </MobileContent>
        <MobileFooter></MobileFooter>
      </MobileWrapper>
    );
  } else {
    return (
      <Div100vh>
        <MobileWrapper>
          <MobileHeader>
            {notification.show
              ? <Alert config={notification.notification_config} path={location.pathname} />
              : null
            }
            {(user && user.accounts.length) && !isGlobalRoute(location.pathname)
              ? (
                <MainWrapperHeader>
                  <MainWrapperHeaderPadding>
                    <MainWrapperInner>
                      <MainWrapperSection span={3} align="left">
                        <MainWrapperSectionInner>
                          <MainWrapperHeaderLogo onClick={() => navigateTo("/")} src={icons.whiteLogoOnly} alt="HopeTrust Logo" width={40} />
                        </MainWrapperSectionInner>
                      </MainWrapperSection>
                      <MainWrapperSection span={9} align="right">
                        <MainWrapperSectionInner>
                          <MainWrapperHeaderMenu>
                            <MainWrapperHeaderLogo onClick={() => toggleMobileNavigation()} src={icons.mobileMenuToggle} alt="HopeTrust Menu" width={25} />
                          </MainWrapperHeaderMenu>
                        </MainWrapperSectionInner>
                      </MainWrapperSection>
                    </MainWrapperInner>
                  </MainWrapperHeaderPadding>
                </MainWrapperHeader>
              )
              : null
            }
          </MobileHeader>
          <MobileContent>
            {children}
          </MobileContent>
          <MobileFooter></MobileFooter>
        </MobileWrapper>
      </Div100vh>
    );
  }
};

class HopeTrustRouter extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    loader: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    documents: PropTypes.object.isRequired
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    const {
      openInstalliOSWebAppModal,
    } = props;
    const { isIPad, isIPhone, prompt } = checkForIOS();
    this.state = { isIPad, isIPhone, is_downloading_agreement: false };
    if (prompt) openInstalliOSWebAppModal();
  }

  async componentDidMount() {
    const { login } = this.props;
    await login();
  }

  componentDidUpdate() {
    const {
      session,
      user,
      injectUserSnap,
      customer_support,
      getCoreSettings
    } = this.props;
    if (user && !document.getElementById("usersnap-embed-script") && !document.getElementsByName("us-entrypoint-buttonV2").length) injectUserSnap(user, session);
    if (!customer_support.requestedCoreSettings && !customer_support.isFetchingCoreSettings) getCoreSettings(true);
  }

  render() {
    const {
      user,
      session,
      loader,
      navigation,
      notification,
      navigateTo,
      toggleMobileNavigation,
      isIdle,
      isActive,
      onAction,
      location
    } = this.props;
    const { isIPad, isIPhone } = this.state;
    const activeAccount = (user && user.accounts) ? user.accounts.find((account) => account.account_id === session.account_id) : false;
    const permissionedRoutes = buildPermissionedRoutes(user, session);
    const permissionedNavigation = (user && activeAccount) ? buildPermissionedNavigation(user, session) : false;
    const navigation_items = permissionedNavigation ? permissionedNavigation.filter((e) => e) : [];
    const activeUser = activeAccount ? activeAccount.users.find((u) => u.cognito_id === user.cognito_id) : false;
    const conditional = conditional_components({ activeAccount, isIPad, isIPhone, isIdle, isActive, onAction, toggleMobileNavigation, store: store.getState() });

    return (
      <ConditionalWrapper data={{ user, navigateTo, toggleMobileNavigation, location, notification }}>

        {loader.show
          ? <LoaderOverlay fixed={1} show={loader.show} message={loader.message} />
          : null
        }

        {conditional.map((item, index) => item.condition ? <item.Component key={index} {...item.props} /> : null)}

        <MainWrapper>

          {(activeUser && activeUser.status === "active") && !isGlobalRoute(location.pathname)
            ? (
              <SideBar open={navigation.show} ref={this.setWrapperRef} id="side-bar">

                <SidebarWrapper>
                  <SidebarHeader>
                    <LogoHeader>
                      {activeUser
                        ? (
                          <AccountAvatarContainer>
                            <ReactAvatar size={100} src={`${Gateway.endpoint}/users/get-user-avatar/${activeUser.cognito_id}`} name={`${activeUser.first_name} ${activeUser.last_name}`} round />
                            <AccountAvatarTitle>{`${activeUser.first_name} ${activeUser.last_name}`}</AccountAvatarTitle>
                          </AccountAvatarContainer>
                        )
                        : <LogoImg src={logo} />
                      }
                    </LogoHeader>
                    <SideBarNav>
                      <SideBarList>{navigation_items.filter((n) => n.props.tags.includes("header"))}</SideBarList>
                    </SideBarNav>
                  </SidebarHeader>
                  <SidebarBody>
                    <SideBarNav>
                      <SideBarList>{navigation_items.filter((n) => n.props.tags.includes("body"))}</SideBarList>
                    </SideBarNav>
                  </SidebarBody>
                  <SidebarFooter>
                    <SideBarNav>
                      <SideBarList>{navigation_items.filter((n) => n.props.tags.includes("footer"))}</SideBarList>
                    </SideBarNav>
                  </SidebarFooter>
                </SidebarWrapper>

              </SideBar>
            )
            : null
          }
          <MainContent logged_in={activeUser ? 1 : 0}>
            <Suspense fallback={<LoaderOverlay message="Loading..." />}>
              <Switch>{permissionedRoutes}</Switch>
            </Suspense>
          </MainContent>
        </MainWrapper>
      </ConditionalWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  loader: state.loader,
  navigation: state.navigation,
  documents: state.documents,
  account: state.account,
  location: state.router.location,
  security: state.security,
  referral: state.referral,
  notification: state.notification,
  plans: state.plans,
  product: state.product,
  customer_support: state.customer_support,
  message: state.message,
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams,
  tickets: state.tickets,
  ce_management: state.ce_management,
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({
  login: () => dispatch(authenticated.login()),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  toggleMobileNavigation: () => dispatch(toggleMobileNavigation()),
  isIdle: (event) => dispatch(isIdle(event)),
  isActive: (event) => dispatch(isActive(event)),
  onAction: (event) => dispatch(onAction(event)),
  openInstalliOSWebAppModal: () => dispatch(openInstalliOSWebAppModal()),
  getApplicationStatus: () => dispatch(getApplicationStatus()),
  injectUserSnap: (user, session) => dispatch(injectUserSnap(user, session)),
  getAccountFeatures: (account_id) => dispatch(getAccountFeatures(account_id)),
  getCoreSettings: (override) => dispatch(getCoreSettings(override))
});
export default connect(mapStateToProps, dispatchToProps)(HopeTrustRouter);
