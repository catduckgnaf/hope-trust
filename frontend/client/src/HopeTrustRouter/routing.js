import React, { lazy } from "react";
import { Redirect, Route, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SideBarItem,
  SideBarItemLink,
  SideBarItemIcon,
  SideBarItemTitle,
  Badge
} from "./style";
import hopeCarePlan from "../store/actions/hope-care-plan";
import { navigateTo } from "../store/actions/navigation";
import { openHubspotChat } from "../store/actions/hubspot";
import authentication from "../store/actions/authentication";
import { store, history } from "../store";
import { theme } from "../global-styles";
import { isArray } from "lodash";

const AsyncCancelSubscription = lazy(() => import("../Pages/CancelSubscription"));
const AsyncNotFound = lazy(() => import("../Pages/NotFound"));
const AsyncNotAllowed = lazy(() => import("../Pages/NotAllowed"));
const AsyncLogin = lazy(() => import("../Pages/LoginPage/LoginUser"));
const AsyncClientSignUp = lazy(() => import("../Pages/ClientSignUp/CreateUserPage"));
const AsyncAccountRegistration = lazy(() => import("../Pages/AccountRegistration/CreateAccountPage"));
const AsyncPartnerRegistration = lazy(() => import("../Pages/PartnerAccountRegistration/RegisterPartnerAccount"));
const AsyncPartnerSignUp = lazy(() => import("../Pages/PartnerSignUp/CreatePartnerPage"));
const AsyncMessages = lazy(() => import("../Components/Messages"));
const AsyncPartnerTraining = lazy(() => import("../Pages/PartnerTraining"));
const AsyncAccountView = lazy(() => import("../Pages/AccountView"));
const AsyncDashboard = lazy(() => import("../Pages/Dashboard"));
const AsyncFinances = lazy(() => import("../Pages/Finances"));
const AsyncSchedule = lazy(() => import("../Pages/Schedule"));
const AsyncMedication = lazy(() => import("../Pages/Medication"));
const AsyncProviders = lazy(() => import("../Pages/Providers"));
const AsyncHopeCarePlan = lazy(() => import("../Pages/HopeCarePlan"));
const AsyncAccountUsers = lazy(() => import("../Pages/AccountUsers"));
const AsyncAccountUserSingle = lazy(() => import("../Pages/AccountUserSingle"));
const AsyncDocuments = lazy(() => import("../Pages/Documents"));
const AsyncActivityFeed = lazy(() => import("../Pages/ActivityFeed"));
const AsyncSettings = lazy(() => import("../Pages/Settings"));
const AsyncNotActive = lazy(() => import("../Pages/NotActive"));

const application_status = {
  maintenance: theme.transportationRequestColor,
  major: theme.errorRed,
  minor: theme.notificationOrange,
  none: theme.buttonGreen
};

const routes = [
  {
    path: "/accounts",
    title: "My Accounts",
    exact: true,
    defaultRoute: false,
    Component: AsyncAccountView,
    navigationIcon: "th-large",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: true,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "user",
      redux_list: "accounts",
      count_func: (accounts = []) => {
        let count = 0;
        if (accounts && accounts.length) {
          accounts.forEach((account) => {
            if (!account.approved) count++;
          });
        }
        return count;
      }
    }
  },
  {
    path: "/",
    title: "Dashboard",
    exact: true,
    defaultRoute: false,
    Component: AsyncDashboard,
    navigationIcon: "home-alt",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user"],
    separate: false
  },
  {
    path: "/users",
    title: "Account Users",
    exact: true,
    defaultRoute: false,
    Component: AsyncAccountUsers,
    navigationIcon: "users",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "account-admin-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "relationships"
  },
  {
    path: "/user/:cognito_id",
    title: "User Profile",
    exact: false,
    defaultRoute: false,
    Component: AsyncAccountUserSingle,
    navigationIcon: null,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [
      "account-admin-view"
    ],
    user_types: ["user"],
    separate: false
  },
  {
    path: ["/finances", "/budget", "/assets", "/income", "/myto"],
    title: "Finances",
    exact: true,
    defaultRoute: false,
    Component: AsyncFinances,
    navigationIcon: "chart-pie",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "finance-view",
      "finance-edit",
      "grantor-assets-view",
      "grantor-assets-edit",
      "budget-view",
      "budget-edit"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "finances"
  },
  {
    path: "/providers",
    title: "Providers",
    exact: true,
    defaultRoute: false,
    Component: AsyncProviders,
    navigationIcon: "users-class",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "health-and-life-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "providers"
  },
  {
    path: "/hope-care-plan",
    title: "Hope Care Plan",
    exact: true,
    defaultRoute: false,
    navigationIcon: "hand-holding-seedling",
    Component: AsyncHopeCarePlan,
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "health-and-life-view",
      "finance-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "surveys",
    condition: hopeCarePlan.checkSurveyStatus
  },
  {
    path: "/schedule",
    title: "Schedule",
    exact: true,
    defaultRoute: false,
    Component: AsyncSchedule,
    navigationIcon: "calendar-alt",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "health-and-life-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "schedule"
  },
  {
    path: "/medication",
    title: "Medications",
    exact: true,
    defaultRoute: false,
    Component: AsyncMedication,
    navigationIcon: "capsules",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "health-and-life-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "medications"
  },
  {
    path: "/documents",
    title: "Documents",
    exact: true,
    defaultRoute: false,
    Component: AsyncDocuments,
    navigationIcon: "folders",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false,
    feature_slug: "documents"
  },
  {
    path: "/activity-feed",
    title: "Activity Feed",
    exact: true,
    defaultRoute: false,
    Component: AsyncActivityFeed,
    navigationIcon: "list-alt",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "request-hcc-view"
    ],
    user_types: ["user"],
    separate: false,
    feature_slug: "care_coordination"
  },
  {
    path: "/messages",
    title: "Messages",
    exact: true,
    defaultRoute: false,
    Component: AsyncMessages,
    navigationIcon: "mail-bulk",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false,
    feature_slug: "messaging",
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "message",
      redux_list: "list",
      count_func: (messages = []) => {
        let count = 0;
        if (messages && messages.length) {
          messages = messages.filter((m) => m.to_cognito === store.getState().user.cognito_id);
          messages.forEach((message) => {
            if (!message.read) count++;
          });
        }
        return count;
      }
    }
  },
  {
    path: "/training",
    title: "Training",
    exact: true,
    defaultRoute: false,
    Component: AsyncPartnerTraining,
    navigationIcon: "users-class",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["advisor"],
    separate: false
  },
  {
    path: "/settings",
    title: "Settings",
    exact: true,
    defaultRoute: false,
    Component: AsyncSettings,
    navigationIcon: "users-cog",
    activeRoute: true,
    activeLink: true,
    tags: ["footer"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false
  },
  {
    path: "/cancel-subscription",
    title: "Cancel Subscription",
    exact: true,
    defaultRoute: false,
    Component: AsyncCancelSubscription,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [
      "basic-user",
      "account-admin-view"
    ],
    user_types: ["user", "advisor"],
    separate: false
  },
  {
    path: ["/login", "/forgot-password", "/reset-password", "/force-password", "/resolve", "/mfa-login"],
    title: "Login",
    exact: true,
    defaultRoute: true,
    Component: AsyncLogin,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [],
    user_types: [],
    separate: false
  },
  {
    path: "/client-registration",
    title: "Client Registration",
    exact: true,
    defaultRoute: true,
    Component: AsyncClientSignUp,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [],
    user_types: [],
    separate: false
  },
  {
    path: "/partner-registration",
    title: "Partner Registration",
    exact: true,
    defaultRoute: true,
    Component: AsyncPartnerSignUp,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [],
    user_types: [],
    separate: false
  },
  {
    title: "System Status",
    navigationIcon: "server",
    href: "https://hopetrust.statuspage.io/",
    activeRoute: false,
    activeLink: true,
    tags: ["footer"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false
  },
  {
    title: "Live Chat",
    navigationIcon: "user-headset",
    action: openHubspotChat,
    activeRoute: false,
    activeLink: true,
    tags: ["footer"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false,
    feature_slug: "live_chat",
    disabled: (store) => store.session.zendesk.chat_open || store.session.zendesk.chat_opening,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "session",
      redux_list: "zendesk",
      count_func: (zendesk) => {
        return zendesk.unread || 0;
      }
    }
  },
  {
    title: "Log Out",
    navigationIcon: "sign-out",
    action: authentication.logOut,
    activeRoute: false,
    activeLink: true,
    tags: ["footer"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["user", "advisor"],
    separate: false
  }
];

const buildRoute = ({ exact, defaultRoute, path, key, Component }) => {
  return (
    <Route
      key={key}
      exact={exact}
      default={defaultRoute}
      path={path}
      component={Component}
      history={history} />
  );
};

const ConditionalWrapper = ({ path, children }) => path ? <Link to={path}>{children}</Link> : <>{children}</>;
const buildNavigationItem = ({ disabled, title, path, action, navigationIcon, href, separate, tags, key, user, count }) => {
  let nav_count = 0;
  const nav_path = isArray(path) ? path[0] : path;
  const is_active = isArray(path) ? (path.some((p) => p === store.getState().router.location.pathname)) : store.getState().router.location.pathname === nav_path;
  if (count) nav_count = count.count_func(count.redux_list ? store.getState()[count.redux_key][count.redux_list] : store.getState()[count.redux_key]);
  return (
    <SideBarItem key={key} separate={separate ? 1 : 0} tags={tags}>
      <ConditionalWrapper path={nav_path}>
        <SideBarItemLink disabled={disabled && disabled(store.getState()) ? 1 : 0} active={is_active} onClick={href ? () => window.open(href, "_blank") : () => action ? store.dispatch(action(user)) : store.dispatch(navigateTo(nav_path))}>
          {navigationIcon
            ? (
              <SideBarItemIcon>
                <FontAwesomeIcon icon={["fad", navigationIcon]} />
              </SideBarItemIcon>
            )
            : null
          }
          <SideBarItemTitle
            hide={store.getState().navigation.mini_menu ? 1 : 0}>
              {title}{nav_count ? <Badge color={count ? count.badge_color : 0}>{nav_count}</Badge> : null}
          </SideBarItemTitle>
          {title === "System Status" && store.getState().session.application_status.status
            ? (
              <span
                className="tooltip neutral"
                data-tooltip
                data-tooltip-position="right"
                data-tooltip-content={store.getState().session.application_status.status.description}>
                <FontAwesomeIcon
                  icon={["fas", "circle"]}
                  style={{
                    marginLeft: "8px",
                    fontSize: "12px",
                    color: application_status[store.getState().session.application_status.status.indicator]
                  }}
                />
              </span>
            )
            : null
          }
        </SideBarItemLink>
      </ConditionalWrapper>
    </SideBarItem>
  );
};

const buildPermissionedRoutes = (user, session) => {
  const account_id = session.account_id;
  const accounts = store.getState().accounts;
  const relationships = store.getState().relationship.list;
  const activeAccount = accounts.find((account) => account.account_id === account_id);
  const activeUser = relationships.find((u) => u.cognito_id === user.cognito_id);
  const permissions = activeAccount ? activeAccount.permissions : [];
  const features = (activeAccount && activeAccount.features) ? activeAccount.features : {};
  let allRoutes = [];

  allRoutes = routes.map((route, key) => {
    const { path, activeRoute, Component, exact, defaultRoute, requiredPermissions, is_global, user_types, feature_slug, condition } = route;
    let theRoute;
    if (!condition || (condition && !condition().result)) theRoute = buildRoute({ exact, defaultRoute, path, key, Component });
    const isAuthorized = permissions.some((permission) => requiredPermissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (theRoute) {
      if (activeUser) {
          const current_user = activeUser;
          const is_partner = current_user.type === "advisor";
          const user_type = is_partner ? current_user.type : "user";
          const user_can_access = user_types.includes(user_type) && isAuthorized && featureEnabled;

          if (activeRoute) {
            if (!user_can_access && !is_global) {
              return (
                <Route
                  exact={exact}
                  default={defaultRoute}
                  path={path}
                  render={(props) => <AsyncNotAllowed {...props} title="Not Allowed" />} key={key} />
              );
            } else if (theRoute) {
              return theRoute;
            }
            return false;
          }
        } else if (defaultRoute && activeRoute) {
          return theRoute;
        }
    }
    return false;
  });

  if ((user && user.status !== "active")) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotActive {...props} title="User Not Active" />} key="102" />);
  } else if (user && !accounts.length && user.is_partner) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.push(<Route default={true} render={(props) => <AsyncPartnerRegistration {...props} title="Account Registration" />} key="101" />);
  } else if (user && !accounts.length && !user.is_partner) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.push(<Route default={true} render={(props) => <AsyncAccountRegistration {...props} title="Account Registration" />} key="101" />);
  } else if (user && accounts.length && relationships.length) {
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="100" />);
    allRoutes.unshift(<Route key="98" default={true} exact path="/login"><Redirect from="/login" to={user.is_partner ? "/accounts" : "/"} /></Route>);
  } else {
    allRoutes.push(<Route key="99" default={true} exact path="/"><Redirect from="/" to="/login" /></Route>);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="100" />);
  }

  const filtered_routes = allRoutes.filter((route) => route);
  return filtered_routes;
};

const buildPermissionedNavigation = (user, session) => {
  const account_id = session.account_id;
  const accounts = store.getState().accounts;
  const relationships = store.getState().relationship.list;
  const activeAccount = accounts.find((account) => account.account_id === account_id);
  const activeUser = relationships.find((u) => u.cognito_id === user.cognito_id);
  const permissions = activeAccount ? activeAccount.permissions : [];
  const features = (activeAccount && activeAccount.features) ? activeAccount.features : {};
  let allNavigationItems = [];

  allNavigationItems = routes.map((route, key) => {
    const { disabled, count, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, feature_slug, condition } = route;
    let theNavigationItem;
    if (!condition || (condition && !condition().result)) theNavigationItem = buildNavigationItem({ disabled, count, user, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, key });
    const isAuthorized = permissions.some((permission) => requiredPermissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (theNavigationItem) {
      if (activeUser) {
        const current_user = activeUser;
        const is_partner = current_user.type === "advisor";
        const user_type = is_partner ? current_user.type : "user";
        const user_can_access = user_types.includes(user_type) && isAuthorized && featureEnabled;
        if (user_can_access && activeLink) return theNavigationItem;
        return false;
      } else if (activeLink) {
        return theNavigationItem;
      }
    }
    return false;
  });
  const filtered_items = allNavigationItems.filter((nav) => nav);
  return filtered_items;
};

export { buildPermissionedNavigation, buildPermissionedRoutes, routes };
