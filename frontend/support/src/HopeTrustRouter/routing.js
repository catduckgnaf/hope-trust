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
import authentication from "../store/actions/authentication";
import { store, history } from "../store";
import { theme } from "../global-styles";
import moment from "moment";

const AsyncOverview = lazy(() => import("../Pages/Overview"));
const AsyncPendingApprovals = lazy(() => import("../Components/PendingApprovals"));
const AsyncCustomerSupportAccounts = lazy(() => import("../Components/CustomerSupportAccounts"));
const AsyncPartnerAccounts = lazy(() => import("../Components/PartnerAccounts"));
const AsyncBenefitsSettings = lazy(() => import("../Components/BenefitsSettings"));
const AsyncUsers = lazy(() => import("../Components/Users"));
const AsyncTicketManagement = lazy(() => import("../Components/TicketManagement"));

const AsyncSecurityQuestionSettings = lazy(() => import("../Components/SecurityQuestionSettings"));
const AsyncReferralSettings = lazy(() => import("../Components/ReferralSettings"));
const AsyncCommerceSettings = lazy(() => import("../Components/CommerceSettings"));
const AsyncLeadSettings = lazy(() => import("../Components/LeadSettings"));
const AsyncMessageSettings = lazy(() => import("../Components/MessageSettings"));

const AsyncCarePlanSurveys = lazy(() => import("../Pages/CarePlanSurveys"));
const AsyncContinuingEducation = lazy(() => import("../Pages/ContinuingEducation"));
const AsyncNotFound = lazy(() => import("../Pages/NotFound"));
const AsyncNotAllowed = lazy(() => import("../Pages/NotAllowed"));
const AsyncCustomerSupportSignup = lazy(() => import("../Pages/CustomerSupportSignup"));
const AsyncCustomerSupportLogin = lazy(() => import("../Pages/CustomerSupportLogin"));
const AsyncForgotPassword = lazy(() => import("../Pages/ForgotPassword"));
const AsyncResetPassword = lazy(() => import("../Pages/ResetPassword"));
const AsyncDocuments = lazy(() => import("../Pages/Documents"));
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
    path: "/",
    title: "Overview",
    exact: true,
    defaultRoute: false,
    Component: AsyncOverview,
    navigationIcon: "chart-line",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "basic-user"
    ],
    user_types: ["customer-support"],
    separate: false
  },
  {
    path: "/client-management",
    title: "Client Accounts",
    exact: true,
    defaultRoute: false,
    Component: AsyncCustomerSupportAccounts,
    navigationIcon: "users",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-accounts-view"
    ],
    user_types: ["customer-support"],
    separate: false
  },
  {
    path: "/partner-management",
    title: "Partner Accounts",
    exact: true,
    defaultRoute: false,
    Component: AsyncPartnerAccounts,
    navigationIcon: "user-tie",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-partners-view"
    ],
    user_types: ["customer-support"],
    separate: false
  },
  {
    path: "/benefits-management",
    title: "Benefits",
    exact: true,
    defaultRoute: false,
    Component: AsyncBenefitsSettings,
    navigationIcon: "user-hard-hat",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-benefits-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "customer_support",
      redux_list: "",
      count_func: (customer_support) => {
        const pending_group = (customer_support.group_approvals || []).filter((ga) => ga.status === "pending");
        const pending_wholesale = (customer_support.wholesale_approvals || []).filter((wa) => wa.status === "pending");
        return (pending_group.length + pending_wholesale.length)
      }
    }
  },
  {
    path: "/pending-membership-requests",
    title: "Pending Approvals",
    exact: true,
    defaultRoute: false,
    Component: AsyncPendingApprovals,
    navigationIcon: "user-clock",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-users-view",
      "hopetrust-accounts-view",
      "hopetrust-partners-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "customer_support",
      redux_list: "pending_approvals",
      count_func: (pending_approvals) => {
        return pending_approvals.length
      }
    }
  },
  {
    path: "/user-management",
    title: "Users",
    exact: true,
    defaultRoute: false,
    Component: AsyncUsers,
    navigationIcon: "user",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-users-view"
    ],
    user_types: ["customer-support"],
    separate: true
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
      "hopetrust-super-admin",
      "hopetrust-documents-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: "documents"
  },
  {
    path: "/partner-organizations",
    title: "Organizations",
    exact: true,
    defaultRoute: false,
    Component: AsyncReferralSettings,
    navigationIcon: "user-tie",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-organizations-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: "",
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "referral",
      redux_list: "list",
      count_func: (orgs = []) => {
        let count = 0;
        if (orgs && orgs.length) {
          orgs.forEach((org) => {
            if (!org.domains.length) count++;
          });
        }
        return count;
      }
    }
  },
  {
    path: "/security-questions",
    title: "Security Questions",
    exact: true,
    defaultRoute: false,
    Component: AsyncSecurityQuestionSettings,
    navigationIcon: "lock-alt",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-security-questions-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: ""
  },
  {
    path: "/commerce",
    title: "Commerce",
    exact: true,
    defaultRoute: false,
    Component: AsyncCommerceSettings,
    navigationIcon: "boxes",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-commerce-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: ""
  },
  {
    path: "/ticket-management",
    title: "Tickets",
    exact: true,
    defaultRoute: false,
    Component: AsyncTicketManagement,
    navigationIcon: "user-headset",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-tickets-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: "",
    count: {
      badge_color: theme.hopeTrustBlue,
      redux_key: "tickets",
      redux_list: "list",
      count_func: (tickets = []) => {
        let count = 0;
        if (tickets && tickets.length) {
          tickets.forEach((ticket) => {
            if (ticket.status === "new") count++;
          });
        }
        return count;
      }
    }
  },
  {
    path: "/message-management",
    title: "Messages",
    exact: true,
    defaultRoute: false,
    Component: AsyncMessageSettings,
    navigationIcon: "mail-bulk",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "basic-user"
    ],
    user_types: ["customer-support"],
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
    path: "/leads",
    title: "Leads",
    exact: true,
    defaultRoute: false,
    Component: AsyncLeadSettings,
    navigationIcon: "users",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-leads-edit",
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: ""
  },
  {
    path: "/surveys",
    title: "Surveys",
    exact: true,
    defaultRoute: false,
    Component: AsyncCarePlanSurveys,
    navigationIcon: "poll-people",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-surveys-view"
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: ""
  },
  {
    path: "/ce-management",
    title: "CE Management",
    exact: true,
    defaultRoute: false,
    Component: AsyncContinuingEducation,
    navigationIcon: "school",
    activeRoute: true,
    activeLink: true,
    tags: ["body"],
    requiredPermissions: [
      "hopetrust-super-admin",
      "hopetrust-ce-view",
    ],
    user_types: ["customer-support"],
    separate: false,
    feature_slug: "",
    count: {
      badge_color: theme.errorRed,
      redux_key: "ce_management",
      redux_list: "list",
      count_func: (ce_items = []) => {
        let count = 0;
        if (ce_items && ce_items.length) {
          ce_items.forEach((ce) => {
            const is_course_renewal_soon = moment(ce.course_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.course_renewal).isSameOrBefore(moment());
            const is_provider_renewal_soon = moment(ce.provider_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.provider_renewal).isSameOrBefore(moment());
            if (is_course_renewal_soon || is_provider_renewal_soon) count++;
          });
        }
        return count;
      }
    }
  },
  {
    path: "/signup",
    title: "Signup",
    exact: true,
    defaultRoute: true,
    Component: AsyncCustomerSupportSignup,
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
    Component: AsyncCustomerSupportLogin,
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
    user_types: ["customer-support"],
    separate: false
  },
  {
    path: "/settings",
    title: "Settings",
    exact: true,
    defaultRoute: false,
    Component: AsyncSettings,
    navigationIcon: "cogs",
    activeRoute: true,
    activeLink: true,
    tags: ["footer"],
    requiredPermissions: [
      "basic-user"
    ],
    user_types: ["customer-support"],
    separate: false
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
    user_types: ["customer-support"],
    separate: false
  }
];

const buildRoute = ({ exact, defaultRoute, path, title, key, Component }) => {
  return (
    <Route
      exact={exact}
      default={defaultRoute}
      path={path}
      component={Component}
      key={key}
      history={history} />
  );
};

const ConditionalWrapper = ({ path, children }) => path ? <Link to={path}>{children}</Link> : <>{children}</>;
const buildNavigationItem = ({ disabled, title, path, action, navigationIcon, href, separate, tags, key, user, count }) => {
  let nav_count = 0;
  if (count) nav_count = count.count_func(count.redux_list ? store.getState()[count.redux_key][count.redux_list] : store.getState()[count.redux_key]);
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
    const { title, path, activeRoute, Component, exact, defaultRoute, requiredPermissions, is_global, user_types, feature_slug } = route;
    const theRoute = buildRoute({ exact, defaultRoute, path, title, key, Component });
    const isAuthorized = requiredPermissions.every((permission) => permissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (activeUser) {
      const current_user = activeUser;
      const user_type = current_user.type;
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
    return false;
  });

  if ((user && user.status !== "active")) {
    allRoutes = allRoutes.filter((route) => route && route.props.default);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotActive {...props} title="User Not Active" />} key="102" />);
  } else if (user) {
    allRoutes.unshift(<Route key="98" default={true} exact path="/login"><Redirect from="/login" to="/" /></Route>);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="100" />);
  } else {
    allRoutes.push(<Route key="99" default={true} exact path="/"><Redirect from="/" to="/login" /></Route>);
    allRoutes.push(<Route default={true} render={(props) => <AsyncNotFound {...props} title="404 - Not Found" />} key="100" />);
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
    const { disabled, count, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, feature_slug } = route;
    const theNavigationItem = buildNavigationItem({ disabled, count, user, title, path, action, navigationIcon, activeLink, requiredPermissions, href, separate, tags, is_global, user_types, key });
    const isAuthorized = requiredPermissions.every((permission) => permissions.includes(permission));
    const featureEnabled = feature_slug ? features[feature_slug] : true;

    if (activeUser) {
      const current_user = activeUser;
      const user_type = current_user.type;
      const user_can_access = user_types.includes(user_type) && isAuthorized && featureEnabled;
      if (user_can_access && activeLink) return theNavigationItem;
      return false;
    } else if (activeLink) {
      return theNavigationItem;
    }
    return false;
  });
  const filtered_items = allNavigationItems.filter((nav) => nav);
  return filtered_items;
};

export { buildPermissionedNavigation, buildPermissionedRoutes, routes };
