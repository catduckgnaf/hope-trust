import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import UserAccounts from "../../Components/UserAccounts";
import UserSubscriptions from "../../Components/UserSubscriptions";
import { changeAccountsTab, getCustomerSubscriptions, getCustomerTransactions } from "../../store/actions/account";
import { getStripeExpandedCustomer } from "../../store/actions/stripe";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isMobile, isTablet } from "react-device-detect";
import { copyToClipboard } from "../../store/actions/utilities";
import { getMessages } from "../../store/actions/message";
import { getActiveUserPlans, getActivePartnerPlans } from "../../store/actions/plans";
import { newMessage } from "../../store/actions/message";
import {
  Page,
  PageHeader,
  PageAction,
  PageHeaderSecondary,
  PageHeaderSecondaryNotice,
  PageHeaderSecondaryNoticeIcon,
  Button
} from "../../global-components";
import {
  ViewContainer,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  SettingsTabStatusBar,
  ReferralCodeLabel,
  ReferralCodeText,
  ReferralCodeContainer
} from "./style";
const required_before_referral = ["insurance"];

let tabs_config = [
  {
    slug: "accounts",
    icon: "users",
    title: "Accounts",
    type: ["user", "partner"],
    permissions: ["basic-user", "account-admin-view", "account-admin-edit"]
  },
  {
    slug: "subscriptions",
    icon: "users-cog",
    title: "Subscriptions",
    type: ["partner"],
    permissions: ["basic-user", "account-admin-view", "account-admin-edit"]
  }
];

class AccountView extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.instanceOf(Object).isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { relationship, user } = props;
    const current_user = relationship.list.find((u) => u.cognito_id === user.cognito_id);
    document.title = "Account View";

    this.state = {
      current_user,
      active_tabs: [],
    };
  }

  changeTab = (tab) => {
    const { changeAccountsTab } = this.props;
    changeAccountsTab(tab.slug);
    document.title = tab.title;
  };

  getUserTabs = () => {
    const { user, session } = this.props;
    const { current_user } = this.state;
    let tabs = tabs_config.filter((t) => t.type.includes("user") && t.permissions.every((s) => current_user.permissions.includes(s)));
    if (user.is_partner && session.is_switching) tabs = tabs_config.filter((t) => t.type.includes("user") && t.permissions.every((s) => current_user.permissions.includes(s)));
    if (user.is_partner && !session.is_switching) tabs = tabs_config.filter((t) => t.type.includes("partner") && t.permissions.every((s) => current_user.permissions.includes(s)));
    return tabs;
  };

  async componentDidMount() {
    const { getMessages, getCustomerSubscriptions, getActiveUserPlans, getActivePartnerPlans, getStripeExpandedCustomer, getCustomerTransactions, message, account, plans, user, session, relationship } = this.props;
    const active_tabs = this.getUserTabs();
    const customer = relationship.list.find((u) => u.is_customer && !u.linked_account);
    this.setState({ active_tabs });
    if ((!plans.isFetchingActivePartnerPlans && !plans.requestedActivePartnerPlans)) await getActivePartnerPlans();
    if ((!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans)) await getActiveUserPlans(true, (user.is_partner && !session.is_switching));
    if ((!account.requestedSubscriptions && !account.isFetchingSubscriptions)) await getCustomerSubscriptions(false, customer ? customer.customer_id : null);
    if (!account.requestedCustomer && !account.isFetchingCustomer && customer) await getStripeExpandedCustomer(false, customer ? customer.customer_id : null);
    if (!account.requestedTransactions && !account.isFetchingTansactions && customer) await getCustomerTransactions(false, customer ? customer.customer_id : null);
    if (!message.requested && !message.isFetching) getMessages();
  }

  shareReferralCode = (referral_code) => {
    const { user, newMessage } = this.props;
    newMessage({
      type: "registration",
      url_parameters: { referral_code },
      from_email: user.email,
      to_email: "",
      to_first: "",
      to_last: "",
      subject: "Hope Trust Referral Code",
      body: `Below please find my referral code for Hope Trust. If you are a new user, please use this code during sign up to link our accounts. For existing Hope Trust users, please use this code to add me to your account by going to your accounts tab, pressing "Add Relationship" and then "Add a professional using a Referral Code".\n\nReferral Code: ${referral_code}.\n\nDon't forget to grant me permission to see appropriate sections of your account by going to Account Users and using the sliding permission settings.\n\nI look forward to working with you through the Hope Trust platform.\n\nBest,\n${user.first_name} ${user.last_name}`
    }, false, false);
  };

  render() {
    const { active_tabs } = this.state;
    const { account, accounts, user, session, copyToClipboard } = this.props;
    const current_account = accounts.find((account) => account.is_current);

    return (
      <ViewContainer>
        {active_tabs.length > 1
          ? (
            <Page paddingleft={1}>
              <PageHeader paddingleftmobile={15} span={12} align="left">
                Account Management
                  {user.is_partner && !session.is_switching
                  ? (
                    <>
                      {user.partner_data.approved
                        ? (
                          <>
                            {current_account.referral_code && user.partner_data.domain_approved
                              ? (
                                <PageHeaderSecondary>
                                  <ReferralCodeContainer>
                                    <ReferralCodeLabel>Referral Code</ReferralCodeLabel> <ReferralCodeText>{current_account.referral_code}</ReferralCodeText>
                                    <Button noshadow nomargin marginleft={5} marginright={5} blue small onClick={() => copyToClipboard(current_account.referral_code, "Referral code")}>Copy</Button>
                                    <Button noshadow nomargin small green onClick={() => this.shareReferralCode(current_account.referral_code)}>Share</Button>
                                  </ReferralCodeContainer>
                                </PageHeaderSecondary>
                              )
                              : (
                                <PageHeaderSecondary>
                                  <PageHeaderSecondaryNotice>
                                    <PageHeaderSecondaryNoticeIcon><FontAwesomeIcon icon={["fad", "info-circle"]} /></PageHeaderSecondaryNoticeIcon> {`Referral Code Pending ${!user.partner_data.domain_approved ? "Domain " : ""}Approval`}
                                  </PageHeaderSecondaryNotice>
                                </PageHeaderSecondary>
                              )
                            }
                          </>
                        )
                        : (
                          <PageHeaderSecondary>
                            <PageHeaderSecondaryNotice>
                              <PageHeaderSecondaryNoticeIcon><FontAwesomeIcon icon={["fad", "info-circle"]} /></PageHeaderSecondaryNoticeIcon> {`Referral Code Pending ${required_before_referral.includes(user.partner_data.partner_type) ? "Training " : ""}Approval`}
                            </PageHeaderSecondaryNotice>
                          </PageHeaderSecondary>
                        )
                      }
                    </>
                  )
                  : null
                }
              </PageHeader>
              <PageAction span={1} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
            </Page>
          )
          : null
        }
        <Row>
          <Col span={12}>
            {active_tabs.length > 1
              ? (
                <SettingsTabs>
                  <SettingsTabsPadding span={12}>
                    <SettingsTabsInner>

                      {active_tabs.map((tab, index) => {
                        return (
                          <SettingsTab key={index} span={12 / active_tabs.length} onClick={() => this.changeTab(tab)}>
                            <SettingsTabPadding>
                              <SettingsTabInner>
                                <SettingsTabIcon>
                                  <FontAwesomeIcon icon={["fad", tab.icon]} />
                                </SettingsTabIcon> {tab.title}
                              </SettingsTabInner>
                              <SettingsTabStatusBar active={account.active_accounts_tab === tab.slug ? 1 : 0} />
                            </SettingsTabPadding>
                          </SettingsTab>
                        );
                      })}

                    </SettingsTabsInner>
                  </SettingsTabsPadding>
                </SettingsTabs>
              )
              : null
            }
            <TabContent>
              {account.active_accounts_tab === "accounts"
                ? <UserAccounts />
                : null
              }

              {account.active_accounts_tab === "subscriptions"
                ? <UserSubscriptions />
                : null
              }
            </TabContent>

          </Col>
        </Row>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  session: state.session,
  hello_sign: state.hello_sign,
  account: state.account,
  plans: state.plans,
  message: state.message
});
const dispatchToProps = (dispatch) => ({
  changeAccountsTab: (tab) => dispatch(changeAccountsTab(tab)),
  copyToClipboard: (text, type) => dispatch(copyToClipboard(text, type)),
  getCustomerSubscriptions: (override, customer_id) => dispatch(getCustomerSubscriptions(override, customer_id)),
  getActiveUserPlans: (override, all_plans) => dispatch(getActiveUserPlans(override, all_plans)),
  getActivePartnerPlans: (override) => dispatch(getActivePartnerPlans(override)),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  getCustomerTransactions: (override, customer_id) => dispatch(getCustomerTransactions(override, customer_id)),
  newMessage: (defaults, updating, viewing) => dispatch(newMessage(defaults, updating, viewing)),
  getMessages: (override) => dispatch(getMessages(override))
});
export default connect(mapStateToProps, dispatchToProps)(AccountView);
