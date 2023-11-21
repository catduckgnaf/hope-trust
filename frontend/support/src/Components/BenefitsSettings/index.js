import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeBenefitsTab, changeBenefitsApprovalTab, customerServiceGetAllUsers, openAddMembershipModal, customerServiceGetAllAccounts } from "../../store/actions/customer-support";
import { getWholesalers } from "../../store/actions/wholesale";
import { getRetailers } from "../../store/actions/retail";
import { getAgents } from "../../store/actions/agents";
import { getGroups } from "../../store/actions/groups";
import { getGroupApprovals, getWholesaleApprovals } from "../../store/actions/account";
import { getTeams } from "../../store/actions/teams";
import WholesaleAccounts from "../WholesaleAccounts";
import RetailAccounts from "../RetailAccounts";
import AgentAccounts from "../AgentAccounts";
import GroupAccounts from "../GroupAccounts";
import TeamAccounts from "../TeamAccounts";
import GroupApprovals from "../GroupApprovals";
import WholesaleApprovals from "../WholesaleApprovals";
import BenefitClients from "../BenefitClients";
import { isMobile, isTablet } from "react-device-detect";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import {
  BenefitsSettingsMain,
  BenefitsSettingsMainPadding,
  BenefitsSettingsMainInner,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  SettingsTabStatusBar
} from "./style";
import { getActiveUserPlans } from "../../store/actions/plans";

let tabs_config = [
  {
    slug: "approval-config",
    icon: "user-plus",
    title: "Connections",
    span: 2
  },
  {
    slug: "wholesale-config",
    icon: "store",
    title: "Wholesale",
    span: 2
  },
  {
    slug: "retail-config",
    icon: "user-tag",
    title: "Retail",
    span: 2
  },
  {
    slug: "agents-config",
    icon: "user-tie",
    title: "Agents",
    span: 2
  },
  {
    slug: "groups-config",
    icon: "user-check",
    title: "Groups",
    span: 2
  },
  {
    slug: "teams-config",
    icon: "users",
    title: "Teams",
    span: 2
  }
];

let approval_tabs_config = [
  {
    slug: "wholesale-approval",
    icon: "chart-network",
    title: "Wholesale Connections",
    span: 3,
    count: (cs) => {
      return (cs.wholesale_approvals || []).filter((p) => p.status === "pending").length;
    }
  },
  {
    slug: "group-approval",
    icon: "users-class",
    title: "Group Connections",
    span: 3,
    count: (cs) => {
      return (cs.group_approvals || []).filter((p) => p.status === "pending").length;
    }
  },
  {
    slug: "benefit-clients",
    icon: "users",
    title: "Employees",
    span: 3,
    count: (cs) => {
      return (cs.accounts || []).filter((p) => p.group_id).length;
    }
  }
];

class BenefitsSettings extends Component {

  constructor(props) {
    super(props);
    document.title = "Benefits Settings";
    this.runBenefits();
  }

  changeTab = (tab) => {
    const { changeBenefitsTab } = this.props;
    changeBenefitsTab(tab.slug);
    document.title = tab.title;
  };

  changeApprovalTab = (tab) => {
    const { changeBenefitsApprovalTab } = this.props;
    changeBenefitsApprovalTab(tab.slug);
    document.title = tab.title;
  };

  runBenefits = () => {
    const {
      getWholesalers,
      getRetailers,
      getAgents,
      getGroups,
      getTeams,
      customerServiceGetAllUsers,
      getActiveUserPlans,
      getWholesaleApprovals,
      getGroupApprovals,
      customer_support,
      wholesale,
      retail_state,
      agent_state,
      group_state,
      team_state,
      plans
    } = this.props;
    if (!wholesale.requested && !wholesale.isFetching) getWholesalers();
    if (!retail_state.requested && !retail_state.isFetching) getRetailers();
    if (!agent_state.requested && !agent_state.isFetching) getAgents();
    if (!group_state.requested && !group_state.isFetching) getGroups();
    if (!team_state.requested && !team_state.isFetching) getTeams();
    if (!customer_support.requestedAllUsers && !customer_support.isFetchingAllUsers) customerServiceGetAllUsers();
    if (!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans) getActiveUserPlans(true);
    if (!customer_support.requestedWholesaleApprovals && !customer_support.isFetchingWholesaleApprovals) getWholesaleApprovals();
    if (!customer_support.requestedGroupApprovals && !customer_support.isFetchingGroupApprovals) getGroupApprovals();
  };

  refreshBenefits = async () => {
    const {
      customerServiceGetAllAccounts,
      customerServiceGetAllUsers,
      getActiveUserPlans,
      getWholesaleApprovals,
      getGroupApprovals,
      getWholesalers,
      getRetailers,
      getAgents,
      getGroups,
      getTeams
    } = this.props;
    const requests = [
      customerServiceGetAllAccounts(true),
      getActiveUserPlans(true),
      customerServiceGetAllUsers(true),
      getWholesaleApprovals(true),
      getGroupApprovals(true),
      getWholesalers(true),
      getRetailers(true),
      getAgents(true),
      getGroups(true),
      getTeams(true)
    ];
    await Promise.allSettled(requests);
  };

  render() {
    const { customer_support, wholesale, retail_state, agent_state, group_state, team_state } = this.props;
    const is_loading = [
      customer_support.isFetchingPendingApprovals,
      customer_support.isFetchingGroupApprovals,
      wholesale.isFetching,
      retail_state.isFetching,
      agent_state.isFetching,
      group_state.isFetching,
      team_state.isFetching
    ];
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Benefits Management</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button type="button" outline blue rounded onClick={() => this.refreshBenefits()}>{is_loading.some((loading) => loading) ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        <BenefitsSettingsMain>
          <BenefitsSettingsMainPadding>
            <BenefitsSettingsMainInner>
              <SettingsTabs>
                <SettingsTabsPadding span={12}>
                  <SettingsTabsInner>

                    {tabs_config.map((tab, index) => {
                      return (
                        <SettingsTab key={index} span={tab.span} onClick={() => this.changeTab(tab)}>
                          <SettingsTabPadding>
                            <SettingsTabInner active={customer_support.active_benefits_tab === tab.slug ? 1 : 0}>
                              <SettingsTabIcon>
                                <FontAwesomeIcon icon={["fad", tab.icon]} />
                              </SettingsTabIcon> {tab.title}
                            </SettingsTabInner>
                            <SettingsTabStatusBar active={customer_support.active_benefits_tab === tab.slug ? 1 : 0} />
                          </SettingsTabPadding>
                        </SettingsTab>
                      );
                    })}

                  </SettingsTabsInner>
                </SettingsTabsPadding>
              </SettingsTabs>
              <TabContent>
                {customer_support.active_benefits_tab === "approval-config"
                  ? (
                    <>
                      <SettingsTabs>
                        <SettingsTabsPadding span={12}>
                          <SettingsTabsInner>

                            {approval_tabs_config.map((tab, index) => {
                              const count = tab.count(customer_support) || 0;
                              return (
                                <SettingsTab key={index} span={tab.span} onClick={() => this.changeApprovalTab(tab)}>
                                  <SettingsTabPadding>
                                    <SettingsTabInner active={customer_support.active_benefits_approval_tab === tab.slug ? 1 : 0}>
                                      <SettingsTabIcon>
                                        <FontAwesomeIcon icon={["fad", tab.icon]} />
                                      </SettingsTabIcon> {tab.title}{count ? ` (${count})` : null}
                                    </SettingsTabInner>
                                    <SettingsTabStatusBar active={customer_support.active_benefits_approval_tab === tab.slug ? 1 : 0} />
                                  </SettingsTabPadding>
                                </SettingsTab>
                              );
                            })}

                          </SettingsTabsInner>
                        </SettingsTabsPadding>
                      </SettingsTabs>
                      <TabContent>
                        {customer_support.active_benefits_approval_tab === "wholesale-approval"
                          ? <WholesaleApprovals />
                          : null
                        }
                        {customer_support.active_benefits_approval_tab === "group-approval"
                          ? <GroupApprovals />
                          : null
                        }
                        {customer_support.active_benefits_approval_tab === "benefit-clients"
                          ? <BenefitClients />
                          : null
                        }
                      </TabContent>
                    </>
                  )
                  : null
                }
                {customer_support.active_benefits_tab === "wholesale-config"
                  ? <WholesaleAccounts />
                  : null
                }
                {customer_support.active_benefits_tab === "retail-config"
                  ? <RetailAccounts />
                  : null
                }
                {customer_support.active_benefits_tab === "agents-config"
                  ? <AgentAccounts />
                  : null
                }
                {customer_support.active_benefits_tab === "groups-config"
                  ? <GroupAccounts />
                  : null
                }
                {customer_support.active_benefits_tab === "teams-config"
                  ? <TeamAccounts />
                  : null
                }
              </TabContent>
            </BenefitsSettingsMainInner>
          </BenefitsSettingsMainPadding>
        </BenefitsSettingsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  wholesale: state.wholesale,
  retail_state: state.retail,
  agent_state: state.agents,
  group_state: state.groups,
  team_state: state.teams,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  customerServiceGetAllAccounts: (override) => dispatch(customerServiceGetAllAccounts(override)),
  getGroupApprovals: (override) => dispatch(getGroupApprovals(override)),
  getWholesaleApprovals: (override) => dispatch(getWholesaleApprovals(override)),
  changeBenefitsApprovalTab: (tab) => dispatch(changeBenefitsApprovalTab(tab)),
  changeBenefitsTab: (tab) => dispatch(changeBenefitsTab(tab)),
  customerServiceGetAllUsers: (override) => dispatch(customerServiceGetAllUsers(override)),
  openAddMembershipModal: (type) => dispatch(openAddMembershipModal(type)),
  getWholesalers: (override) => dispatch(getWholesalers(override)),
  getRetailers: (override) => dispatch(getRetailers(override)),
  getAgents: (override) => dispatch(getAgents(override)),
  getGroups: (override) => dispatch(getGroups(override)),
  getTeams: (override) => dispatch(getTeams(override)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override))
});
export default connect(mapStateToProps, dispatchToProps)(BenefitsSettings);
