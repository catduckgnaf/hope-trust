import React, { Component, lazy, Suspense } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { getUserNotificationPreferences } from "../../store/actions/user";
import { getSecurityQuestions, getUserSecurityQuestionResponses } from "../../store/actions/security-questions";
import { navigateTo } from "../../store/actions/navigation";
import { setActiveFinanceTab } from "../../store/actions/finance";
import { getEvents } from "../../store/actions/schedule";
import { getProviders } from "../../store/actions/provider";
import { getMedications } from "../../store/actions/medication";
import Container from "../../Components/Container";
import RequestButton from "../../Components/RequestButton";
import UsersWidget from "../../Components/UsersWidget";
import GenerationWidget from "../../Components/GenerationWidget";
import ContactWidget from "../../Components/ContactWidget";
import WidgetLoader from "../../Components/WidgetLoader";
import HopeCarePlanWidget from "../../Components/HopeCarePlanWidget";
import NoPermission from "../../Components/NoPermission";
import { Row } from "react-simple-flex-grid";
import { Doughnut } from "react-chartjs-2";
import {} from "./style";
import { ViewContainer } from "../../global-components";
import { getActiveUserPlans } from "../../store/actions/plans";
import { getCustomerSubscriptions, getCustomerTransactions } from "../../store/actions/account";
import { getStripeExpandedCustomer } from "../../store/actions/stripe";
import { updateCurrentMembership } from "../../store/actions/membership";
import { closeTour, generateSteps } from "../../store/actions/tour";
import Joyride from "react-joyride";
import { showBannerNotification } from "../../store/actions/notification";

const AsyncUpcomingServiceRequests = lazy(() => import("../../Components/UpcomingServiceRequests"));
const AsyncMoneyRequests = lazy(() => import("../../Components/MoneyRequests"));
const AsyncDocumentsListing = lazy(() => import("../../Components/DocumentsListing"));
const AsyncAssetsGraph = lazy(() => import("../../Components/AssetsGraph"));
const AsyncBeneficiaryAssetsGraph = lazy(() => import("../../Components/BeneficiaryAssetsGraph"));
const AsyncIncomeGraph = lazy(() => import("../../Components/IncomeGraph"));
const AsyncBudgetGraph = lazy(() => import("../../Components/BudgetGraph"));
const AsyncMYTOGraph = lazy(() => import("../../Components/MYTOGraph"));
const AsyncMessagesList = lazy(() => import("../../Components/MessagesList"));

class Dashboard extends Component {
  static propTypes = {
    getUserNotificationPreferences: PropTypes.func.isRequired,
    getSecurityQuestions: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    document.title = "Dashboard";
    const account = accounts.find((account) => account.account_id === session.account_id);

    this.state = {
      permissions: account.permissions,
      account
    };
  }

  goTo = (view, path) => {
    const { setActiveFinanceTab, navigateTo } = this.props;
    setActiveFinanceTab(view);
    navigateTo(path);
  };

  async componentDidMount() {
    const {
      showBannerNotification,
      getActiveUserPlans,
      getStripeExpandedCustomer,
      getCustomerSubscriptions,
      getCustomerTransactions,
      getUserNotificationPreferences,
      getSecurityQuestions,
      getUserSecurityQuestionResponses,
      getEvents,
      getProviders,
      getMedications,
      settings,
      security,
      schedule,
      provider,
      medication,
      account,
      session,
      plans,
      notification,
      accounts,
      user,
      relationship
    } = this.props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const creator = relationship.list.find((u) => u.customer_id && !u.linked_account);
    if (!plans.requestedActiveUserPlans && !plans.isFetchingActiveUserPlans) await getActiveUserPlans();
    if (!account.requestedCustomer && !account.isFetchingCustomer && creator) await getStripeExpandedCustomer(false, creator ? creator.customer_id : null);
    if (!account.requestedSubscriptions && !account.isFetchingSubscriptions && creator) await getCustomerSubscriptions(false, creator ? creator.customer_id : null);
    if (!account.requestedTransactions && !account.isFetchingTansactions && creator) await getCustomerTransactions(false, creator ? creator.customer_id : null);
    if (!settings.requested && !settings.isFetching) await getUserNotificationPreferences();
    if (!security.requested && !security.isFetching) await getSecurityQuestions();
    if (!security.requestedResponses && !security.isFetchingResponses) await getUserSecurityQuestionResponses();
    if (!schedule.requested && !schedule.isFetching) await getEvents();
    if (!provider.requested && !provider.isFetching) await getProviders();
    if (!medication.requested && !medication.isFetching) await getMedications();
    if (user && current_account.user_plan && !current_account.user_plan.monthly && current_account.permissions.includes("account-admin-edit") && !notification.show) {
      showBannerNotification({
        message: "You are currently on a Free plan. Upgrade now to enjoy premium features.",
        type: "info",
        action: "UPGRADE_PLAN",
        button_text: "Upgrade",
        timeout: null,
        hide_close: true
      });
    }
  }

  handleJoyrideCallback = (data) => {
    const { closeTour, updateCurrentMembership } = this.props;
    const { action } = data;
    if (["close", "reset"].includes(action)) {
      closeTour();
      updateCurrentMembership({ onboarded: true });
    }
  };
  
  render() {
    const { navigateTo, tour, login, generateSteps } = this.props;
    const { permissions, account } = this.state;

    const can_view_finances = permissions.includes("finance-view");
    const can_view_budgets = permissions.includes("budget-view");
    const can_view_account = permissions.includes("account-admin-view");
    const can_make_requests = permissions.includes("request-hcc-edit");

    return (
      <ViewContainer>
        {can_make_requests
          ? (
            <Row id="request-buttons-dashboard">
              {account.features && account.features.care_coordination
                ? (
                  <Container title="Requests" viewall={{ title: "View All", func: () => navigateTo("/activity-feed") }} xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Row justify="space-between">
                      <RequestButton icon="usd-circle" title="Request Money" type="money" permissions={["basic-user", "request-hcc-edit"]} />
                      <RequestButton icon="hospital-alt" title="Request Medical" type="medical" permissions={["basic-user", "request-hcc-edit"]} />
                      <RequestButton icon="utensils" title="Request Food" type="food" permissions={["basic-user", "request-hcc-edit"]} />
                      <RequestButton icon="car-bus" title="Request Transportation" type="transportation" permissions={["basic-user", "request-hcc-edit"]} />
                      <RequestButton icon="user-headset" title="Request Other" type="other_request_type" permissions={["basic-user", "request-hcc-edit"]} />
                    </Row>
                  </Container>
                )
                : (
                  <Container title="Requests" span={12} height={225}>
                    <NoPermission message="This feature is not enabled on your account." icon="clipboard-list-check" />
                  </Container>
                )
              }
            </Row>
          )
          : null
        }
        {["grantor-assets-view", "finance-view", "budget-view", "myto-view"].some((permission) => permissions.includes(permission))
          ? (
            <>
              {account.features && account.features.finances
                ? (
                  <Row id="finance-graphs-dashboard">
                    {permissions.includes("grantor-assets-view")
                      ? (
                        <Container id="grantor_assets_graph" bottom={15} title="Current Assets" viewall={permissions.includes("grantor-assets-view") ? { title: "View All", func: () => this.goTo("assets", "/finances") } : null} xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <Suspense fallback={<WidgetLoader />}>
                            <AsyncAssetsGraph Component={Doughnut} type="assets" span={12} />
                          </Suspense>
                        </Container>
                      )
                      : null
                    }
                    {!permissions.includes("grantor-assets-view") && permissions.includes("finance-view")
                      ? (
                        <Container id="beneficiary_assets_graph" bottom={15} title="Current Assets" viewall={permissions.includes("finance-view") ? { title: "View All", func: () => this.goTo("assets", "/finances") } : null} xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <Suspense fallback={<WidgetLoader />}>
                            <AsyncBeneficiaryAssetsGraph Component={Doughnut} type="assets" span={12} />
                          </Suspense>
                        </Container>
                      )
                      : null
                    }
                    {!permissions.includes("grantor-assets-view") && !permissions.includes("finance-view")
                      ? (
                        <Container bottom={15} title="Current Assets" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <NoPermission message="You do not have permission to view Assets" icon="chart-pie-alt" />
                        </Container>
                      )
                      : null
                    }
                    {can_view_finances
                      ? (
                        <Container id="income_graph" bottom={15} title="Current Income" viewall={can_view_finances ? { title: "View All", func: () => this.goTo("income", "/finances") } : null} xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <Suspense fallback={<WidgetLoader />}>
                            <AsyncIncomeGraph Component={Doughnut} type="income" span={12} />
                          </Suspense>
                        </Container>
                      )
                      : (
                        <Container bottom={15} title="Current Income" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <NoPermission message="You do not have permission to view Income" icon="chart-pie-alt" />
                        </Container>
                      )
                    }
                    {can_view_budgets
                      ? (
                        <Container id="budget_graph" bottom={15} title="Current Budget" viewall={can_view_budgets ? { title: "View All", func: () => this.goTo("budgets", "/finances") } : null} xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <Suspense fallback={<WidgetLoader />}>
                            <AsyncBudgetGraph Component={Doughnut} type="budgets" span={12} />
                          </Suspense>
                        </Container>
                      )
                      : (
                        <Container bottom={15} title="Current Budget" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <NoPermission message="You do not have permission to view Budgets" icon="chart-pie-alt" />
                        </Container>
                      )
                    }
                    {permissions.includes("myto-view")
                      ? (
                        <Container id="myto_graph" bottom={15} title="Trust Objectives" viewall={permissions.includes("myto-view") ? { title: "View All", func: () => this.goTo("myto", "/finances") } : null} xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <AsyncMYTOGraph Component={Doughnut} type="myto" span={12} />
                        </Container>
                      )
                      : (
                        <Container bottom={15} title="Trust Objectives" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                          <NoPermission message="You do not have permission to view MYTO" icon="chart-pie-alt" />
                        </Container>
                      )
                    }
                  </Row>
                )
                : (
                  <Row>
                    <Container title="Finances" span={12} height={280}>
                      <NoPermission message="This feature is not enabled on your account." icon="chart-pie-alt" />
                    </Container>
                  </Row>
                )
              }
            </>
          )
          : null
        }
        <Row>
          {permissions.includes("health-and-life-view") || permissions.includes("finance-view")
            ? <HopeCarePlanWidget id="hope-care-plan-dashboard"/>
            : (
              <Container title="Hope Care Plan" xs={12} sm={12} md={12} lg={6} xl={6} height={320}>
                <NoPermission message="You do not have permission to view Care Plan Surveys" icon="hand-holding-heart" />
              </Container>
            )
          }
          <ContactWidget id="contact-widget-dashboard" />
        </Row>

        <Row>
          {can_view_account
            ? (
              <>
                {account.features && account.features.relationships
                  ? <UsersWidget title="Emergency Contacts" height={255} span={6} id="users-list-dashboard" />
                  : (
                    <Container title="Emergency Contacts" xs={12} sm={12} md={12} lg={6} xl={6} height={255}>
                      <NoPermission message="This feature is not enabled on your account." icon="users" />
                    </Container>
                  )
                }
              </>
            )
            : (
              <Container title="Emergency Contacts" xs={12} sm={12} md={12} lg={6} xl={6} height={255}>
                <NoPermission message="You do not have permissions to view Account Users" icon="users" />
              </Container>
            )
          }
          {permissions.includes("health-and-life-view") || permissions.includes("finance-view")
            ? <GenerationWidget title="Generate Documents" span={6} height={255} id="generation-widget-dashboard" />
            : (
              <Container title="Generate Documents" xs={12} sm={12} md={12} lg={6} xl={6} height={255}>
                <NoPermission message="You do not have permission to generate account documents" icon="folder-download" />
              </Container>
            )
          }
        </Row>

        {!permissions.includes("request-hcc-view") && !permissions.includes("request-hcc-edit")
          ? null
          : (
            <Row id="request-feeds-dashboard">
              {account.features && account.features.care_coordination
                ? (
                  <Suspense fallback={<WidgetLoader />}>
                      {permissions.includes("request-hcc-view")
                        ? <AsyncUpcomingServiceRequests height={255} type="Upcoming Service Requests" span={6} shadow="true" />
                        : (
                          <Container title="Service Requests" xs={12} sm={12} md={12} lg={6} xl={6} height={255}>
                            <NoPermission message="You do not have permissions to view Service Requests" icon="clipboard-list-check" />
                          </Container>
                        )
                      }
                      {permissions.includes("request-hcc-view")
                        ? <AsyncMoneyRequests height={255} type="Money Requests" span={6} shadow="true" />
                        : (
                          <Container title="Money Requests" xs={12} sm={12} md={12} lg={6} xl={6} height={255}>
                            <NoPermission message="You do not have permissions to view Money Requests" icon="usd-circle" />
                          </Container>
                        )
                      }
                    </Suspense>
                )
                : (
                  <Container title="Recent Requests" span={12} height={255}>
                    <NoPermission message="This feature is not enabled on your account." icon="clipboard-list-check" />
                  </Container>
                )
              }
            </Row>
          )
        }
        <Row id="documents-list-dashboard">
          {account.features && account.features.documents
            ? (
              <Suspense fallback={<WidgetLoader />}>
                <AsyncDocumentsListing height={290} type="Recent Documents" span={6} shadow="true" />
              </Suspense>
            )
            : (
              <Container title="Recent Documents" span={6} height={290}>
                <NoPermission message="This feature is not enabled on your account." icon="folder-tree" />
              </Container>
            )
          }
          {account.features && account.features.messaging
            ? (
              <Suspense fallback={<WidgetLoader />}>
                <AsyncMessagesList height={290} type="Messages" span={6} shadow="true" />
              </Suspense>
            )
            : (
              <Container title="Messages" span={6} height={290}>
                <NoPermission message="This feature is not enabled on your account." icon="mail-bulk" />
              </Container>
            )
          }
        </Row>
        {!login.is_logging_in
          ? <Joyride
              steps={generateSteps()}
              run={tour.show}
              callback={this.handleJoyrideCallback}
              continuous={true}
              showProgress={true}
              showSkipButton={true}
              debug={!process.env.REACT_APP_STAGE}
              styles={{
                options: {
                  arrowColor: "#136B9D",
                  backgroundColor: "#FFFFFF",
                  overlayColor: "rgba(0,0,0,0.7)",
                  primaryColor: "#136B9D",
                  textColor: "#136B9D",
                  width: 300,
                  zIndex: 1000
                }
              }}
            />
          : null
        }
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  accounts: state.accounts,
  relationship: state.relationship,
  login: state.login,
  session: state.session,
  settings: state.settings,
  security: state.security,
  documents: state.documents,
  provider: state.provider,
  request: state.request,
  tour: state.tour,
  schedule: state.schedule,
  medication: state.medication,
  account: state.account,
  plans: state.plans,
  notification: state.notification
});
const dispatchToProps = (dispatch) => ({
  getUserNotificationPreferences: () => dispatch(getUserNotificationPreferences()),
  getSecurityQuestions: () => dispatch(getSecurityQuestions()),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  getUserSecurityQuestionResponses: () => dispatch(getUserSecurityQuestionResponses()),
  getEvents: () => dispatch(getEvents()),
  getMedications: () => dispatch(getMedications()),
  getProviders: () => dispatch(getProviders()),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view)),
  closeTour: () => dispatch(closeTour()),
  updateCurrentMembership: (updates) => dispatch(updateCurrentMembership(updates)),
  generateSteps: () => dispatch(generateSteps()),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  getCustomerSubscriptions: (override, customer_id) => dispatch(getCustomerSubscriptions(override, customer_id)),
  getCustomerTransactions: (override, customer_id) => dispatch(getCustomerTransactions(override, customer_id)),
  showBannerNotification: (config) => dispatch(showBannerNotification(config))
});
export default connect(mapStateToProps, dispatchToProps)(Dashboard);
