import React, { Component, Suspense } from "react";
import { connect } from "beautiful-react-redux";
import Metric from "./Components/Metric";
import { orderBy } from "lodash";
import { isMobile, isTablet } from "react-device-detect";
import { Col } from "react-simple-flex-grid";
import ReactSelect from "react-select";
import { lighten } from "polished";
import {
  accounts_widget_columns,
  partners_widget_columns,
  users_widget_columns,
  transaction_widget_columns,
  tickets_widget_columns,
  message_widget_columns,
  ce_config_widget_columns,
  ce_credits_widget_columns
} from "../../column-definitions";
import {
  Button,
  Page,
  PageHeader,
  PageAction,
  InputLabel,
  InputWrapper,
  SelectStyles
} from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Main,
  MainPadding,
  MainInner,
  MainInnerSection,
  Metrics,
  Lists,
  MobileContent,
  MobileHeader,
  MobileWrapper,
  MobileFooter,
  FilterContainerInner,
  FilterContainerPadding,
  FilterContainer,
  OnlineNow,
  OnlineText,
  OnlineIndicator,
  WidgetHeader,
  WidgetHeaderText
} from "./style";
import GenericTable from "../../Components/GenericTable";
import { LoaderContainer } from "../../global-components";
import { navigateTo } from "../../store/actions/navigation";
import { getReferrals } from "../../store/actions/referral";
import { getTickets, updateTicket } from "../../store/actions/tickets";
import { getMessages } from "../../store/actions/message";
import moment from "moment";
import { getDailyLogins, updateRefreshState, customerServiceGetAllPartners, customerServiceGetAllAccounts, customerServiceGetAllUsers, customerServiceGetCSUsers, getAllTransactions } from "../../store/actions/customer-support";
import firebase_app from "../../firebase";
import { getDatabase, ref, query, update, onValue, orderByChild, equalTo } from "firebase/database";
import LoaderOverlay from "../../Components/LoaderOverlay";
import { theme } from "../../global-styles";
import { getCEConfigs, getCECredits, updateCEConfig, updateCEQuiz } from "../../store/actions/ce-management";
const db = getDatabase(firebase_app);

const filters = [
  { value: 1, label: "Last 1 Day" },
  { value: 7, label: "Last 7 Days" },
  { value: 14, label: "Last 14 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 60, label: "Last 60 Days" },
  { value: 90, label: "Last 90 Days" },
  { value: 120, label: "Last 120 Days" }
];

class Overview extends Component {
  constructor(props) {
    super(props);
    document.title = "Overview";

    this.state = {
      refreshing: false,
      logins: 0,
      unsubscribe: null,
      unsubscribe_users: null,
      day_filter: filters[1],
      online: {}
    };
  }

  async componentDidMount() {
    const {
      getReferrals,
      referral,
      customer_support,
      getDailyLogins
    } = this.props;
    const { day_filter } = this.state;
    
    if (!referral.requested && !referral.isFetching) getReferrals();
    if ((!customer_support.isFetchingDailyLogins && !customer_support.requestedDailyLogins)) getDailyLogins(false, day_filter.value)
    const daily_logins_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/daily_logins/${moment().format("YYYY")}/${moment().format("MM")}/${moment().format("DD")}`);
    const users_ref = query(ref(db, `online/${process.env.REACT_APP_STAGE || "development"}`), orderByChild("online"), equalTo(true));
    const unsubscribe_users = onValue(users_ref, (snapshot) => {
      const online = snapshot.val();
      Object.keys(online || {}).forEach((id) => {
        if (online[id].last_activity && moment(online[id].last_activity).isBefore(moment(Date.now()).subtract(10, "hour"))) {
          const user_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/${id}`);
          update(user_ref, { online: false, idle: false });
          delete online[id];
        };
      });
      const actual = Object.keys(online || {});
      this.setState({ online: actual });
    });
    const unsubscribe = onValue(daily_logins_ref, (snapshot) => {
      const data = snapshot.val();
      if (data) this.setState({ logins: data.online });
    });
    this.setState({ unsubscribe, unsubscribe_users });
  }

  componentWillUnmount() {
    const { unsubscribe, unsubscribe_users } = this.state;
    if (unsubscribe) unsubscribe();
    if (unsubscribe_users) unsubscribe_users();
  }

  refreshAll = async () => {
    const { day_filter, unsubscribe_users, unsubscribe } = this.state;
    const { updateRefreshState } = this.props;
    unsubscribe();
    unsubscribe_users();
    updateRefreshState(true);
    const {
      getReferrals,
      getTickets,
      customerServiceGetAllPartners,
      customerServiceGetAllAccounts,
      customerServiceGetAllUsers,
      customerServiceGetCSUsers,
      getMessages,
      getAllTransactions,
      getDailyLogins,
      getCEConfigs,
      getCECredits
    } = this.props;
    let requests = [
      getDailyLogins(true, day_filter.value),
      getTickets(true),
      customerServiceGetCSUsers(true),
      customerServiceGetAllUsers(true),
      getReferrals(true),
      customerServiceGetAllAccounts(true),
      customerServiceGetAllPartners(true),
      getMessages(true),
      getAllTransactions(true),
      getCEConfigs(true),
      getCECredits(true)
    ];
    await Promise.all(requests);
    updateRefreshState(false);
  };

  getDataPoints = (data, config, day_filter) => {
    const date_map = {};
    for (let i = 1; i <= day_filter.value; i++) {
      let target_date = moment().subtract(i, "day");
      let target_formatted = target_date.format("MM/DD/YYYY");
      date_map[target_formatted] = 0;
    }
    for (let d = 0; d < data.length; d++) {
      const item = data[d];
      const dateFormatted = moment(item.created_at).format("MM/DD/YYYY")
      if (date_map.hasOwnProperty(dateFormatted)) {
        if (config.type === "sum") date_map[dateFormatted] += item[config.key];
        else date_map[dateFormatted]++;
      }
    }
    if (config.format) return Object.values(date_map).map((d) => config.format(d)).reverse();
    else return Object.values(date_map).reverse();
  };

  getLoginDataPoints = (logins_map, day_filter) => {
    const date_map = {};
    let main_target_date = moment().subtract(day_filter.value, "day");
    for (let i = 1; i <= day_filter.value; i++) {
      let target_date = moment().subtract(i, "day");
      let target_formatted = target_date.format("MM/DD/YYYY");
      date_map[target_formatted] = 0;
    }
    for (let m = moment(main_target_date); m.diff(moment(), "days") < 0; m.add(1, "days")) {
      const month = m.format("MM");
      const day = m.format("DD");
      if ((logins_map[month] && logins_map[month][day])) {
        date_map[m.format("MM/DD/YYYY")] += logins_map[month][day].online;
      }
    }
    return Object.values(date_map).reverse();
  };

  render() {
    const { logins, day_filter, online } = this.state
    const {
      user,
      navigateTo,
      customer_support,
      referral,
      tickets,
      message,
      ce_management
    } = this.props;
    
    return (
      <Main>
        <MainPadding>
          <MobileWrapper>
            <MobileHeader>
              <Page paddingleft={1}>
                <PageHeader paddingleft={10} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
                  Application Overview
                </PageHeader>
                <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
                  <Button blue outline rounded nomargin nohover onClick={() => this.refreshAll()}>{customer_support.is_refreshing ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
                </PageAction>
              </Page>
            </MobileHeader>
            <MobileContent>
              <MainInner>
                <MainInnerSection span={12}>
                  <FilterContainer>
                    <FilterContainerPadding>
                      <FilterContainerInner>
                        <InputWrapper marginbottom={1}>
                          <InputLabel>Date Filter:</InputLabel>
                          <ReactSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent"
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isSearchable
                            name="day_filter"
                            placeholder="Choose a time span..."
                            onChange={(filter) => {
                              this.setState({ day_filter: filter });
                            }}
                            value={day_filter}
                            options={filters}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                        </InputWrapper>
                      </FilterContainerInner>
                    </FilterContainerPadding>
                  </FilterContainer>
                </MainInnerSection>
                <MainInnerSection span={12}>
                  <Suspense fallback={<LoaderOverlay message="Loading..." />}>
                    <Metrics gutter={20}>
                      <Metric
                        type="number"
                        loading={customer_support.isFetching}
                        day_filter={day_filter}
                        span={4}
                        title="Clients"
                        value={customer_support.accounts.length}
                        onClick={() => navigateTo("/client-management")}
                        dataPoints={
                          this.getDataPoints(
                            customer_support.accounts,
                            {},
                            day_filter
                          )
                        }
                        days_increase={() => {
                          const increase = customer_support.accounts.filter((i) => moment(i.created_at).isBetween(moment().subtract(day_filter.value, "day"), moment(), "day") || moment(i.created_at).isSame(moment(), "day"));
                          return increase.length;
                        }}
                      />
                      <Metric
                        type="currency"
                        loading={customer_support.isFetchingAllTransactions}
                        span={4}
                        title="Revenue"
                        day_filter={day_filter}
                        value={`$${customer_support.transactions.filter((t) => t.type === "charge" && t.status === "succeeded").reduce((accumulator, item) => accumulator + (item.amount / 100), 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        onClick={() => navigateTo("/commerce", "?tab=transactions-config")}
                        dataPoints={
                          this.getDataPoints(
                            customer_support.transactions,
                            {
                              type: "sum",
                              key: "amount",
                              format: (d) => (d / 100)
                            },
                            day_filter
                          )
                        }
                        days_increase={() => {
                          const charges = customer_support.transactions.filter((t) => t.type === "charge" && t.status === "succeeded").filter((t) => moment(t.created_at).isBetween(moment().subtract(day_filter.value, "day"), moment(), "day") || moment(t.created_at).isSame(moment(), "day"));
                          const total = charges.reduce((accumulator, item) => accumulator + (item.amount / 100), 0);
                          const formatted = total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                          return `$${formatted}`;
                        }}
                      />
                      <Metric
                        type="number"
                        loading={customer_support.isFetchingAllUsers}
                        day_filter={day_filter}
                        span={4}
                        title="Active Users"
                        additional_count={(
                          <OnlineNow onClick={() => navigateTo("/user-management", `?cognito_ids=${online.join(", ")}`)}>
                            <OnlineIndicator span={12}>
                              <OnlineText>{online.length || 0} Online</OnlineText>
                            </OnlineIndicator>
                          </OnlineNow>
                        )}
                        value={customer_support.users.filter((i) => i.status === "active").length}
                        onClick={() => navigateTo("/user-management")}
                        dataPoints={
                          this.getDataPoints(
                            customer_support.users,
                            {},
                            day_filter
                          )
                        }
                        days_increase={() => {
                          const increase = customer_support.users.filter((i) => i.status === "active").filter((i) => moment(i.created_at).isBetween(moment().subtract(day_filter.value, "day"), moment(), "day") || moment(i.created_at).isSame(moment(), "day"));
                          return increase.length;
                        }}
                      />
                      <Metric
                        type="number"
                        loading={customer_support.isFetchingDailyLogins}
                        day_filter={day_filter}
                        span={4}
                        title="Unique Logins"
                        value={logins || 0}
                        onClick={() => navigateTo("/user-management")}
                        dataPoints={this.getLoginDataPoints(customer_support.previous_logins, day_filter)}
                        days_increase={() => {
                          let total = 0;
                          const year_map = customer_support.previous_logins;
                          const target_date = moment().subtract(day_filter.value, "day");
                          for (let m = moment(target_date); m.diff(moment(), "days") <= 0; m.add(1, "days")) {
                            const month = m.format("MM");
                            const day = m.format("DD");
                            if ((year_map[month] && year_map[month][day])) total += year_map[month][day].online;
                          }
                          return total;
                        }}
                      />
                      <Metric
                        type="number"
                        loading={customer_support.isFetchingPartners}
                        day_filter={day_filter}
                        span={4}
                        title="Partners"
                        value={customer_support.partners.length}
                        onClick={() => navigateTo("/partner-management")}
                        dataPoints={
                          this.getDataPoints(
                            customer_support.partners,
                            {},
                            day_filter
                          )
                        }
                        additional_count={(
                          <div onClick={() => navigateTo("/partner-management", "?domain_approved=false&referral_code=null")}>{`${customer_support.partners.filter((p) => !p.domain_approved && !p.referral_code).length} Pending`}</div>
                        )}
                        days_increase={() => {
                          const increase = customer_support.partners.filter((i) => moment(i.created_at).isBetween(moment().subtract(day_filter.value, "day"), moment(), "day") || moment(i.created_at).isSame(moment(), "day"));
                          return increase.length;
                        }}
                      />
                      <Metric
                        type="number"
                        loading={referral.isFetching}
                        day_filter={day_filter}
                        span={4}
                        title="Organizations"
                        value={referral.list.filter((r) => r.count > 0).length}
                        onClick={() => navigateTo("/partner-organizations")}
                        dataPoints={
                          this.getDataPoints(
                            referral.list.filter((r) => r.count > 0),
                            {},
                            day_filter
                          )
                        }
                        additional_count={(
                          <div onClick={() => navigateTo("/partner-organizations", "?status=inactive")}>{`${referral.list.filter((r) => r.status === "inactive").length} Pending`}</div>
                        )}
                        days_increase={() => {
                          const increase = referral.list.filter((i) => moment(i.created_at).isBetween(moment().subtract(day_filter.value, "day"), moment(), "day") || moment(i.created_at).isSame(moment(), "day"));
                          return increase.length;
                        }}
                      />
                    </Metrics>
                  </Suspense>
                </MainInnerSection>
                <MainInnerSection span={12}>
                  <Lists gutter={20}>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!customer_support.isFetching
                        ? (
                          <GenericTable
                            permissions={["hopetrust-accounts-edit"]}
                            getData={customerServiceGetAllAccounts}
                            columns={accounts_widget_columns}
                            page_size={10}
                            data_path={["customer_support", "accounts"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data, "created_at", "desc").slice(0, 9);
                            }}
                            loading={customer_support.isFetching}
                            requested={customer_support.requested}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/client-management")}><WidgetHeaderText>Latest Clients</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!customer_support.isFetchingPartners
                        ? (
                          <GenericTable
                            permissions={["hopetrust-partners-edit"]}
                            getData={customerServiceGetAllPartners}
                            columns={partners_widget_columns}
                            page_size={10}
                            data_path={["customer_support", "partners"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data, "created_at", "desc").slice(0, 9);
                            }}
                            dataRowAttributes={(rowData) => {
                              return {
                                style: {
                                  backgroundColor: (!rowData.domain_approved && !rowData.referral_code) ? lighten(0.55, theme.buttonGreen) : "rgba(255, 255, 255, 1)"
                                }
                              }
                            }}
                            loading={customer_support.isFetchingPartners}
                            requested={customer_support.requestedPartners}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/partner-management")}><WidgetHeaderText>Latest Partners</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                  </Lists>
                </MainInnerSection>
                <MainInnerSection span={12}>
                  <Lists gutter={20}>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!customer_support.isFetchingAllUsers
                        ? (
                          <GenericTable
                            permissions={["hopetrust-users-edit"]}
                            getData={customerServiceGetAllUsers}
                            columns={users_widget_columns}
                            page_size={10}
                            data_path={["customer_support", "users"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data.filter((u) => u.status === "active"), "created_at", "desc").slice(0, 9);
                            }}
                            loading={customer_support.isFetchingAllUsers}
                            requested={customer_support.requestedAllUsers}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/user-management")}><WidgetHeaderText>Latest Users</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!customer_support.isFetchingAllTransactions
                        ? (
                          <GenericTable
                            permissions={["hopetrust-commerce-view"]}
                            getData={getAllTransactions}
                            columns={transaction_widget_columns}
                            page_size={10}
                            data_path={["customer_support", "transactions"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data.filter((t) => t.type === "charge"), "created_at", "desc").slice(0, 9);
                            }}
                            loading={customer_support.isFetchingAllTransactions}
                            requested={customer_support.requestedAllTransactions}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/commerce", "?tab=transactions-config")}><WidgetHeaderText>Latest Transactions</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                  </Lists>
                </MainInnerSection>
                <MainInnerSection span={12}>
                  <Lists gutter={20}>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!ce_management.isFetching
                        ? (
                          <GenericTable
                            cellUpdateFunction={updateCEConfig}
                            permissions={["hopetrust-ce-edit"]}
                            getData={getCEConfigs}
                            columns={ce_config_widget_columns}
                            page_size={10}
                            data_path={["ce_management", "list"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data.filter((ce) => {
                                const is_course_renewal_soon = moment(ce.course_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.course_renewal).isSameOrBefore(moment());
                                const is_provider_renewal_soon = moment(ce.provider_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.provider_renewal).isSameOrBefore(moment());
                                return is_course_renewal_soon || is_provider_renewal_soon;
                              }), ["course_renewal", "provider_renewal"], ["desc", "desc"]).slice(0, 9);
                            }}
                            dataRowAttributes={(rowData) => {
                              const is_course_renewal_soon = moment(rowData.course_renewal).isBetween(moment(), moment().add(30, "day")) || moment(rowData.course_renewal).isSameOrBefore(moment());
                              const is_provider_renewal_soon = moment(rowData.provider_renewal).isBetween(moment(), moment().add(30, "day")) || moment(rowData.provider_renewal).isSameOrBefore(moment());
                              return {
                                style: {
                                  backgroundColor: (is_course_renewal_soon || is_provider_renewal_soon) ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                                }
                              }
                            }}
                            loading={ce_management.isFetching}
                            requested={ce_management.requested}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/ce-management", "?tab=ce-states")}><WidgetHeaderText>Upcoming CE Renewals</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!ce_management.isFetchingCredits
                        ? (
                          <GenericTable
                            cellUpdateFunction={updateCEQuiz}
                            permissions={["hopetrust-ce-edit"]}
                            getData={getCECredits}
                            columns={ce_credits_widget_columns}
                            page_size={10}
                            data_path={["ce_management", "credits_list"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              const credits = data.filter((d) => d.credits_value && d.requires_confirmation)
                              return orderBy(credits, "created_at", "desc").slice(0, 9);
                            }}
                            loading={ce_management.isFetchingCredits}
                            requested={ce_management.requestedCredits}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/ce-management", "?tab=ce-credits")}><WidgetHeaderText>Latest CE Credits</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                  </Lists>
                </MainInnerSection>
                <MainInnerSection span={12}>
                  <Lists gutter={20}>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!tickets.isFetching
                        ? (
                          <GenericTable
                            cellUpdateFunction={updateTicket}
                            permissions={["hopetrust-tickets-edit"]}
                            getData={getTickets}
                            columns={tickets_widget_columns}
                            page_size={10}
                            data_path={["tickets", "list"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data.filter((t) => ["new", "pending", "open"].includes(t.status)), "created_at", "desc").slice(0, 9);
                            }}
                            loading={tickets.isFetching}
                            requested={tickets.requested}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/ticket-management")}><WidgetHeaderText>Open Tickets</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                      {!message.isFetching
                        ? (
                          <GenericTable
                            permissions={["hopetrust-messages-view"]}
                            getData={getMessages}
                            columns={message_widget_columns}
                            page_size={10}
                            data_path={["message", "list"]}
                            initial_data={[]}
                            transform_data={(data) => {
                              return orderBy(data.filter((m) => (m.to_cognito === user.cognito_id || m.to_email === user.email) && !m.read), "created_at", "desc").slice(0, 9);
                            }}
                            loading={message.isFetching}
                            requested={message.requested}
                            paging={false}
                            search={false}
                            columnResizing={true}
                            header={<WidgetHeader onClick={() => navigateTo("/message-management")}><WidgetHeaderText>{`Unread Messages for ${user.first_name} ${user.last_name}`}</WidgetHeaderText> <FontAwesomeIcon className="header-icon" icon={["fad", "arrow-circle-right"]} /></WidgetHeader>}
                            widget={true}
                            columnReordering={false}
                          />
                        )
                        : (
                          <LoaderContainer>
                            <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                          </LoaderContainer>
                        )
                      }
                    </Col>
                  </Lists>
                </MainInnerSection>
              </MainInner>
            </MobileContent>
            <MobileFooter></MobileFooter>
          </MobileWrapper>
        </MainPadding>
      </Main>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  customer_support: state.customer_support,
  ce_management: state.ce_management,
  referral: state.referral,
  tickets: state.tickets,
  message: state.message
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  customerServiceGetAllPartners: (override) => dispatch(customerServiceGetAllPartners(override)),
  getTickets: (override) => dispatch(getTickets(override)),
  getCEConfigs: (override) => dispatch(getCEConfigs(override)),
  getCECredits: (override) => dispatch(getCECredits(override)),
  customerServiceGetAllUsers: (override) => dispatch(customerServiceGetAllUsers(override)),
  customerServiceGetCSUsers: (override) => dispatch(customerServiceGetCSUsers(override)),
  customerServiceGetAllAccounts: (override) => dispatch(customerServiceGetAllAccounts(override)),
  getReferrals: (override) => dispatch(getReferrals(override)),
  getMessages: (override) => dispatch(getMessages(override)),
  getAllTransactions: (override) => dispatch(getAllTransactions(override)),
  updateRefreshState: (state) => dispatch(updateRefreshState(state)),
  getDailyLogins: (override, day_filter) => dispatch(getDailyLogins(override, day_filter)),
});
export default connect(mapStateToProps, dispatchToProps)(Overview);