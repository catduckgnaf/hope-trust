import React, { Component, Suspense } from "react";
import { Switch } from "react-router-dom";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import ReactAvatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isIdle, isActive, onAction, onRefresh, injectUserSnap } from "../store/actions/utilities";
import { openInstalliOSWebAppModal } from "../store/actions/session";
import { getCoreSettings } from "../store/actions/customer-support";
import Div100vh from "react-div-100vh";
import { isMobile, isTablet } from "react-device-detect";
import { checkForIOS, isGlobalRoute } from "../utilities";
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
  LogoIconLoader,
  LogoImg,
  AccountAvatarContainer,
  AccountAvatarTitle,
  AccountAvatar,
  PartnerLogo,
  MobileWrapper,
  MobileHeader,
  MobileContent,
  MobileFooter,
  SidebarBody,
  SidebarHeader,
  SidebarWrapper,
  SidebarFooter
} from "./style";
import LoaderOverlay from "../Components/LoaderOverlay";
import { buildPermissionedRoutes, buildPermissionedNavigation } from "./routing";
import { navigateTo, toggleMobileNavigation } from "../store/actions/navigation";
import authenticated from "../store/actions/authentication";
import icons from "../assets/icons";
import logo from "../assets/images/menu-logo.svg";
import Alert from "../Components/Alert";
import { PullToRefresh, PullDownContent, ReleaseContent, RefreshContent } from "react-js-pull-to-refresh";
import { conditional_components } from "./conditional_components";
import { store } from "../store";
import CustomErrorBoundary from "../HOC/error-boundary";
import RouteError from "../Pages/RouteError";

const ConditionalWrapper = ({ children, data, onRefresh }) => {
  const { accounts, user, navigateTo, toggleMobileNavigation, location, notification } = data;
  if (!isMobile && !isTablet) {
    return (
      <MobileWrapper>
        <MobileHeader>
          {notification.show
            ? <Alert config={notification.notification_config} path={location.pathname}/>
            : null
          }
          {((user.is_partner && user.partner_data.approved) || (user && !user.is_partner && accounts.length)) && !isGlobalRoute(location.pathname)
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
      <PullToRefresh
        pullDownContent={<PullDownContent />}
        releaseContent={<ReleaseContent />}
        refreshContent={<RefreshContent />}
        pullDownThreshold={150}
        onRefresh={onRefresh}
        triggerHeight={50}
        backgroundColor="white"
        startInvisible={true}>
        <Div100vh>
          <MobileWrapper>
            <MobileHeader>
              {notification.show
                ? <Alert config={notification.notification_config} path={location.pathname} />
                : null
              }
              {((user.is_partner && user.partner_data.approved) || (user && !user.is_partner && accounts.length)) && !isGlobalRoute(location.pathname)
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
      </PullToRefresh>
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
    relationship: PropTypes.object.isRequired
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
    const { login, user } = this.props;
    if (user) await login();
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
    if (!customer_support.requestedCoreSettings && !customer_support.isFetchingCoreSettings) {
      getCoreSettings(true);
    }
  }

  render() {
    const {
      accounts,
      user,
      session,
      loader,
      navigation,
      navigateTo,
      toggleMobileNavigation,
      relationship,
      isIdle,
      isActive,
      onAction,
      location,
      onRefresh,
      notification,
      hello_sign
    } = this.props;
    const { isIPad, isIPhone } = this.state;
    const activeAccount = (accounts.length) ? accounts.find((account) => account.account_id === session.account_id) : false;
    const permissionedRoutes = buildPermissionedRoutes(user, session);
    const permissionedNavigation = (user && activeAccount) ? buildPermissionedNavigation(user, session) : false;
    const navigation_items = permissionedNavigation ? permissionedNavigation.filter((e) => e) : [];
    const activeUser = activeAccount ? relationship.list.find((u) => u.cognito_id === user.cognito_id) : false;
    const beneficiary = activeAccount ? relationship.list.find((u) => u.type === "beneficiary") : (relationship.list.length ? relationship.list.find((u) => u.type === "beneficiary") : false);
    const current_subscription = (activeAccount && activeAccount.subscription) ? activeAccount.subscription : {};
    const subscription_payer = activeAccount ? relationship.list.find((u) => u.customer_id === current_subscription.customer_id) : false;
    const conditional = conditional_components({ activeAccount, isIPad, isIPhone, isIdle, isActive, onAction, toggleMobileNavigation, store: store.getState() });

    return (
      <ConditionalWrapper data={{ accounts, user, navigateTo, toggleMobileNavigation, location, notification }} onRefresh={() => onRefresh(document.title)}>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Partner Agreement.pdf">{null}</a>

        {loader.show
          ? <LoaderOverlay fixed={1} show={loader.show} message={loader.message} />
          : null
        }

        {conditional.map((item, index) => item.condition ? <item.Component key={index} {...item.props} /> : null )}

        <MainWrapper>

          {(activeUser && activeUser.status === "active") && !isGlobalRoute(location.pathname)
            ? (
              <SideBar open={navigation.show} ref={this.setWrapperRef} id="side-bar">

                <SidebarWrapper open={navigation.show}>
                  <SidebarHeader>
                    {!relationship.isFetching
                      ? (
                        <LogoHeader>
                          {beneficiary
                            ? (
                              <AccountAvatarContainer>
                                {beneficiary
                                  ? <AccountAvatar src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${beneficiary.cognito_id}?${Date.now()}`} />
                                  : <ReactAvatar size={100} name={`${beneficiary.first_name} ${beneficiary.last_name}`} round />
                                }
                                {subscription_payer && subscription_payer.is_partner
                                  ? (
                                    <PartnerLogo>
                                      <div className="tooltip neutral" {...{"data-tooltip": "", "data-tooltip-position": "bottom", "data-tooltip-content": `Subscription sponsored by ${subscription_payer.partner_data.name}`}}>
                                        <ReactAvatar size={40} name={subscription_payer.partner_data.name} src={subscription_payer.partner_data.logo} round />
                                      </div>
                                    </PartnerLogo>
                                  )
                                  : null
                                }
                                {activeAccount && activeAccount.benefits_config && activeAccount.benefits_config.logo
                                  ? (
                                    <PartnerLogo>
                                      <div className="tooltip neutral" {...{ "data-tooltip": "", "data-tooltip-position": "bottom", "data-tooltip-content": `Employee Benefit account for ${activeAccount.benefits_config.name}` }}>
                                        <ReactAvatar size={40} name={activeAccount.benefits_config.name} src={activeAccount.benefits_config.logo} round />
                                      </div>
                                    </PartnerLogo>
                                  )
                                  : null
                                }
                                <AccountAvatarTitle>{beneficiary.first_name || `${activeUser.first_name} ${activeUser.last_name}`}{beneficiary ? " (Beneficiary)" : null}</AccountAvatarTitle>
                              </AccountAvatarContainer>
                            )
                            : (
                              <>
                                {activeUser
                                  ? (
                                    <AccountAvatarContainer>
                                      {activeUser
                                        ? <AccountAvatar src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${activeUser.cognito_id}?${Date.now()}`} />
                                        : <ReactAvatar size={100} name={`${activeUser.first_name} ${activeUser.last_name}`} round />
                                      }
                                      <AccountAvatarTitle>{`${activeUser.first_name} ${activeUser.last_name}`}</AccountAvatarTitle>
                                    </AccountAvatarContainer>
                                  )
                                  : <LogoImg src={logo} />
                                }
                              </>
                            )
                          }
                        </LogoHeader>
                      )
                      : (
                        <LogoIconLoader>
                          <FontAwesomeIcon icon={["fad", "spinner-third"]} spin />
                        </LogoIconLoader>
                      )
                    }
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
            <Suspense fallback={<LoaderOverlay message="Loading..." show={!loader.show} />}>
              <CustomErrorBoundary FallbackComponent={RouteError}>
                <Switch>{permissionedRoutes}</Switch>
              </CustomErrorBoundary>
            </Suspense>
          </MainContent>
        </MainWrapper>
      </ConditionalWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  request: state.request,
  navigation: state.navigation,
  documents: state.documents,
  provider: state.provider,
  relationship: state.relationship,
  survey: state.survey,
  grantor_assets: state.grantor_assets,
  beneficiary_assets: state.beneficiary_assets,
  income: state.income,
  benefits: state.benefits,
  budgets: state.budgets,
  plaid: state.plaid,
  account: state.account,
  myto: state.myto,
  pdf: state.pdf,
  schedule: state.schedule,
  medication: state.medication,
  class_marker: state.class_marker,
  hello_sign: state.hello_sign,
  partners: state.partners,
  location: state.router.location,
  security: state.security,
  notification: state.notification,
  plans: state.plans,
  loader: state.loader,
  customer_support: state.customer_support,
  message: state.message
});
const dispatchToProps = (dispatch) => ({
  login: () => dispatch(authenticated.login()),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  toggleMobileNavigation: () => dispatch(toggleMobileNavigation()),
  isIdle: (event) => dispatch(isIdle(event)),
  isActive: (event) => dispatch(isActive(event)),
  onAction: (event) => dispatch(onAction(event)),
  openInstalliOSWebAppModal: () => dispatch(openInstalliOSWebAppModal()),
  onRefresh: (action) => dispatch(onRefresh(action)),
  injectUserSnap: (user, session) => dispatch(injectUserSnap(user, session)),
  getCoreSettings: (override) => dispatch(getCoreSettings(override))
});
export default connect(mapStateToProps, dispatchToProps)(HopeTrustRouter);
