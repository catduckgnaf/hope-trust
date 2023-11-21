import React, { lazy } from "react";
import { Route, Link, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SideBarItem,
  SideBarItemLink,
  SideBarItemIcon,
  SideBarItemTitle,
  Badge
} from "./style";
import { navigateTo } from "../store/actions/navigation";
import { openHubspotChat } from "../store/actions/session";
import authentication from "../store/actions/authentication";
import { store, history } from "../store";
import { theme } from "../global-styles";

const AsyncNotFound = lazy(() => import("../Pages/NotFound"));
const AsyncNotApproved = lazy(() => import("../Pages/NotApproved"));
const AsyncDashboard = lazy(() => import("../Pages/Dashboard"));
const AsyncNotAllowed = lazy(() => import("../Pages/NotAllowed"));
const AsyncAccountRegistration = lazy(() => import("../Pages/AccountRegistration/CreateAccountPage"));
const AsyncRegistration = lazy(() => import("../Pages/Registration/CreateUser"));
const AsyncLogin = lazy(() => import("../Pages/Login"));
const AsyncForgotPassword = lazy(() => import("../Pages/ForgotPassword"));
const AsyncResetPassword = lazy(() => import("../Pages/ResetPassword"));
const AsyncDocuments = lazy(() => import("../Pages/Documents"));
const AsyncAccountUsers = lazy(() => import("../Pages/AccountUsers"));
const AsyncSettings = lazy(() => import("../Pages/Settings"));
const AsyncNotActive = lazy(() => import("../Pages/NotActive"));
const AsyncMessages = lazy(() => import("../Components/Messages"));
const AsyncGroupApprovals = lazy(() => import("../Components/GroupApprovals"));
const AsyncWholesaleApprovals = lazy(() => import("../Components/WholesaleApprovals"));

const application_status = {
  maintenance: theme.transportationRequestColor,
  major: theme.errorRed,
  minor: theme.notificationOrange,
  none: theme.buttonGreen
};

const routes = [
  {
    path: "/",
    title: "Dashboard",
    exact: true,
    defaultRoute: false,
    Component: AsyncDashboard,
    navigationIcon: "house",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "account-admin-view",
      "account-admin-edit"
    ],
    user_types: ["wholesale", "retail", "agent", "group", "team"],
    separate: true
  },
  {
    path: "/account-users",
    title: "Account Users",
    exact: true,
    defaultRoute: false,
    Component: AsyncAccountUsers,
    navigationIcon: "users",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "account-admin-view",
      "account-admin-edit"
    ],
    user_types: ["wholesale", "retail", "group", "team"],
    separate: false,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "relationship",
      redux_list: "list",
      count_func: (users = []) => {
        let count = 0;
        if (users && users.length) {
          users.forEach((user) => {
            if (!user.approved) count++;
          });
        }
        return count;
      }
    }
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
      "account-admin-view",
      "account-admin-edit"
    ],
    user_types: ["wholesale", "retail", "agent", "group", "team"],
    separate: false,
    feature_slug: "documents"
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
    user_types: ["wholesale", "retail", "agent", "group", "team"],
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
    path: "/group-connections",
    title: "Connections",
    exact: true,
    defaultRoute: false,
    Component: AsyncGroupApprovals,
    navigationIcon: "exchange",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user",
      "group",
      "account-admin-view"
    ],
    user_types: ["group"],
    separate: false,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "groups",
      redux_list: "group_approvals",
      count_func: (approvals = []) => {
        let count = 0;
        if (approvals && approvals.length) {
          approvals = approvals.filter((a) => a.status === "pending");
          approvals.forEach(() => count++);
        }
        return count;
      }
    }
  },
  {
    path: "/wholesale-connections",
    title: "Connections",
    exact: true,
    defaultRoute: false,
    Component: AsyncWholesaleApprovals,
    navigationIcon: "exchange",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "basic-user",
      "wholesale",
      "account-admin-view",
      "account-admin-edit"
    ],
    user_types: ["wholesale"],
    separate: false,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "wholesale",
      redux_list: "wholesale_approvals",
      count_func: (approvals = []) => {
        let count = 0;
        if (approvals && approvals.length) {
          approvals = approvals.filter((a) => a.status === "pending");
          approvals.forEach(() => count++);
        }
        return count;
      }
    }
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
    tags: ["body"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["wholesale", "retail", "agent", "group", "team"],
    separate: false
  },
  {
    path: "/registration",
    title: "Registration",
    exact: true,
    defaultRoute: true,
    Component: AsyncRegistration,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [],
    user_types: [],
    separate: false
  },
  {
    path: "/login",
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
    path: "/forgot-password",
    title: "Forgot Password",
    exact: true,
    defaultRoute: true,
    Component: AsyncForgotPassword,
    activeRoute: true,
    activeLink: false,
    requiredPermissions: [],
    user_types: [],
    separate: false
  },
  {
    path: "/reset-password",
    title: "Reset Password",
    exact: true,
    defaultRoute: true,
    Component: AsyncResetPassword,
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
    user_types: ["wholesale", "retail", "agent", "group", "team"],
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
    user_types: ["wholesale", "retail", "agent", "group", "team"],
    disabled: (store) => store.session.zendesk.chat_open,
    separate: false,
    feature_slug: "live_chat"
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
    user_types: ["wholesale", "retail", "agent", "group", "team"],
    separate: false
  }
];

const buildRoute = ({ exact, defaultRoute, path, title, key, Component }) => {
  if (defaultRoute) {
    return (
      <Route
        exact={exact}
        default={defaultRoute}
        path={path}
        component={(props) => <Component {...props} />}
        key={key}
        history={history} />
    );
  } else {
    return (
      <Route
        exact={exact}
        default={defaultRoute}
        path={path}
        component={(props) => <Component {...props} />}
        key={key}
        history={history} />
    );
  }
};

const ConditionalWrapper = ({ path, children }) => path ? <Link to={path}>{children}</Link> : <>{children}</>;
const buildNavigationItem = ({ disabled, count, title, path, action, navigationIcon, href, separate, tags, key, user }) => {
  let nav_count = 0;
  if (count) nav_count = count.count_func(store.getState()[count.redux_key][count.redux_list]);
  return (
    <SideBarItem key={key} separate={separate ? 1 : 0} tags={tags}>
      <ConditionalWrapper path={path}>
        <SideBarItemLink disabled={disabled && disabled(store.getState()) ? 1 : 0} active={(path && store.getState().router.location.pathname === path) ? 1 : 0} onClick={href ? () => window.open(href, "_blank") : () => action ? store.dispatch(action(user)) : store.dispatch(navigateTo(path))}>
          {navigationIcon
            ? (
              <SideBarItemIcon>
                <FontAwesomeIcon icon={["fad", navigationIcon]} />
              </SideBarItemIcon>
            )
            : null
          }
          <SideBarItemTitle hide={store.getState().navigation.mini_menu ? 1 : 0}>{title}{nav_count ? <Badge color={count ? count.badge_color : 0}>{nav_count}</Badge> : null}</SideBarItemTitle>
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
  const activeAccount = (user && user.accounts) ? user.accounts.find((account) => account.account_id === account_id) : false;
  const activeUser = activeAccount ? activeAccount.users.find((u) => u.cognito_id === user.cognito_id) : false;
  const permissions = activeAccount ? activeAccount.permissions : [];
  const features = (activeAccount && activeAccount.features) ? activeAccount.features : {};
  let allRoutes = [];

  allRoutes = routes.map((route, key) => {
    const { disabled, title, path, activeRoute, Component, exact, defaultRoute, requiredPermissions, is_global, user_types, feature_slug, condition } = route;
    let theRoute;
    if (!condition || (condition && !condition().result)) theRoute = buildRoute({ disabled, exact, defaultRoute, path, title, key, Component });
    const isAuthorized = permissions.some((permission) => requiredPermissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (theRoute) {
      if (activeUser) {
          const current_user = activeUser;
          const user_can_access = user_types.includes(current_user.type) && isAuthorized && featureEnabled;

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
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotActive {...props} title="User Not Active" />} key="104" />);
  } else if (user && !user.accounts.length) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.unshift(<Route default={true} render={(props) => <AsyncAccountRegistration {...props} title="Account Registration" />} key="101" />);
  } else if (user && user.accounts.length && !user.accounts[0].approved) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.push(<Route default={true} render={(props) => <AsyncAccountRegistration {...props} title="Account Registration" />} key="102" />);
    allRoutes.unshift(<Route default={true} render={(props) => <AsyncNotApproved {...props} title="Awaiting Approval" />} key="103" />);
  } else if (user && user.accounts.length && user.accounts[0].approved && !user.accounts[0].permissions.some((permission) => ["account-admin-view", "account-admin-edit"].includes(permission))) {
    allRoutes.unshift(<Route key="106" default={true} exact path="/login"><Redirect from="/login" to="/settings" /></Route>);
    allRoutes.unshift(<Route key="106" default={true} exact path="/"><Redirect from="/" to="/settings" /></Route>);
  } else if (user) {
    allRoutes.unshift(<Route key="98" default={true} exact path="/login"><Redirect from="/login" to="/" /></Route>);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="100" />);
  } else {
    allRoutes.push(<Route key="99" default={true} exact path="/"><Redirect from="/" to="/login" /></Route>);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="105" />);
  }

  const filtered_routes = allRoutes.filter((route) => route);
  return filtered_routes;
};

const buildPermissionedNavigation = (user, session) => {
  const account_id = session.account_id;
  const activeAccount = (user && user.accounts) ? user.accounts.find((account) => account.account_id === account_id) : false;
  const activeUser = activeAccount ? activeAccount.users.find((u) => u.cognito_id === user.cognito_id) : false;
  const permissions = activeAccount ? activeAccount.permissions : [];
  const features = (activeAccount && activeAccount.features) ? activeAccount.features : {};
  let allNavigationItems = [];

  allNavigationItems = routes.map((route, key) => {
    const { count, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, feature_slug, condition } = route;
    let theNavigationItem;
    if (!condition || (condition && !condition().result)) theNavigationItem = buildNavigationItem({ count, user, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, key });
    const isAuthorized = permissions.some((permission) => requiredPermissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (theNavigationItem) {
      if (activeUser) {
        const current_user = activeUser;
        const user_can_access = user_types.includes(current_user.type) && isAuthorized && featureEnabled;
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
