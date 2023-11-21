import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import Lists from "../Lists";
import Metrics from "../Metrics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getClients } from "../../store/actions/clients";
import { getGroups } from "../../store/actions/groups";
import { getAgents } from "../../store/actions/agents";
import {
  runPromisesInSequence,
  hasFetchedAll,
  countOrganizations,
  countActiveClients,
  sumRevenue
} from "../../store/actions/utilities";
import { isMobile, isTablet } from "react-device-detect";
import { openCreateAccountModal } from "../../store/actions/account";
import {
  Main,
  Wrapper,
  Header,
  Content,
  Footer,
  MetricsContainer,
  MetricsLoader,
  MetricsLoaderPadding,
  MetricsLoaderInner
} from "./style";
import {
  Button,
  Page,
  PageHeader,
  PageHeaderSecondary,
  PageAction,
  HeavyFont
} from "../../global-components";
import moment from "moment";
import { CSVLink } from "react-csv";

class TeamDashboard extends Component {
  constructor(props) {
    super(props);
    const { user, session, openCreateAccountModal, groups, getClients, getAgents, getGroups } = props;
    this.state = {
      active_metrics: [
        {
          title: "Organizations",
          action: countOrganizations,
          redux_key: [["groups", "list"]]
        },
        {
          title: "Active Clients",
          action: countActiveClients,
          redux_key: [["clients", "list"]]
        },
        {
          title: "Total Monthly Revenue",
          action: sumRevenue,
          redux_key: [["clients", "list"]]
        }
      ],
      active_lists: [
        {
          title: "Clients",
          columns: [
            "Name",
            "Plan",
            "Value",
            "Onboarded By",
            "Group",
            "Created"
          ],
          span: 12,
          allowed_keys: ["account_name", "plan_name", "account_value", "name", "group_name", "created_at"],
          action: getClients,
          redux_key: ["clients", "list"],
          order: 3,
          filterable: [
            { label: "Agent", key: "agents", on: "name" },
            { label: "Group", key: "groups", on: "group_name" },
            { label: "Team", key: "teams", on: "name", static: [user.benefits_data] }
          ],
          filter_on: [
            "account_name",
            "plan_name",
            "owner_id",
            "name",
            "group_name"
          ],
          render: true,
          buttons: [
            {
              text: "New Client",
              type: "blue",
              action: () => openCreateAccountModal({}),
              loading: session.is_creating_client,
              show: !!groups.list.length
            },
            {
              text: "Export CSV",
              type: "blue",
              action: () => console.log("export"),
              loading: false,
              show: true,
              wrapper: {
                props: {
                  filename: `Clients-${moment().format("MM-DD-YYYY-hh-mm-ss")}.csv`,
                  headers: [
                    { label: "Account Name", key: "account_name" },
                    { label: "Group", key: "group_name" },
                    { label: "Plan", key: "plan_name" },
                    { label: "Value", key: "account_value" },
                    { label: "Wholesaler", key: "wholesaler_name" },
                    { label: "Retailer", key: "retailer_name" },
                    { label: "Owner", key: "name" },
                    { label: "Signup Date", key: "created_at" }
                  ]
                },
                Component: CSVLink
              }
            }
          ]
        },
        {
          title: "Groups",
          columns: [
            "Clients",
            "First Name",
            "Last Name",
            "Organization",
            "Monthly Revenue",
            "Created"
          ],
          span: 12,
          allowed_keys: ["count", "first_name", "last_name", "name", "revenue", "created_at"],
          action: getGroups,
          redux_key: ["groups", "list"],
          order: 1,
          filterable: [],
          filter_on: [
            "name"
          ],
          render: true
        },
        {
          title: "Agents",
          columns: [
            "Clients",
            "First Name",
            "Last Name",
            "Monthly Revenue",
            "Created"
          ],
          span: 12,
          allowed_keys: ["count", "first_name", "last_name", "revenue", "created_at"],
          action: getAgents,
          redux_key: ["agents", "list"],
          order: 2,
          filterable: [],
          filter_on: [
            "first_name",
            "last_name"
          ],
          render: true
        }
      ]
    };
  }

  async componentDidMount() {
    const { session } = this.props;
    const { active_lists } = this.state;
    if (!session.has_fetched_all && !session.is_fetching_all) await this.runPromisesInSequence(active_lists, true);
  }

  runPromisesInSequence = async (active_lists, override, type) => {
    const { hasFetchedAll, runPromisesInSequence } = this.props;
    await runPromisesInSequence(active_lists, override, type);
    hasFetchedAll();
  };

  render() {
    const { active_lists, active_metrics } = this.state;
    const { session, user } = this.props;
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    return (
      <Main>
        <Wrapper>
          <Header>
            <Page>
              <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Dashboard
                <PageHeaderSecondary paddingleft={5}><HeavyFont>{account.account_name}</HeavyFont> | Onboarding Team</PageHeaderSecondary>
              </PageHeader>
              <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
                <Button secondary outline blue rounded onClick={() => this.runPromisesInSequence(active_lists, true)}>{session.is_fetching_all ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh All"}</Button>
              </PageAction>
            </Page>
            <MetricsContainer>
              {session.has_fetched_all
                ? <Metrics active_metrics={active_metrics} />
                : (
                  <MetricsLoader>
                    <MetricsLoaderPadding>
                      <MetricsLoaderInner>
                        <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                      </MetricsLoaderInner>
                    </MetricsLoaderPadding>
                  </MetricsLoader>
                )
              }
            </MetricsContainer>
          </Header>
          <Content>
            <MetricsContainer>
              <Lists active_lists={active_lists} runPromisesInSequence={runPromisesInSequence} />
            </MetricsContainer>
          </Content>
          <Footer></Footer>
        </Wrapper>
      </Main>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  groups: state.groups,
  agents: state.agents,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  runPromisesInSequence: (lists, override) => dispatch(runPromisesInSequence(lists, override)),
  openCreateAccountModal: (config) => dispatch(openCreateAccountModal(config)),
  hasFetchedAll: () => dispatch(hasFetchedAll()),
  getClients: (override) => dispatch(getClients(override)),
  getGroups: (override) => dispatch(getGroups(override)),
  getAgents: (override) => dispatch(getAgents(override))
});
export default connect(mapStateToProps, dispatchToProps)(TeamDashboard);