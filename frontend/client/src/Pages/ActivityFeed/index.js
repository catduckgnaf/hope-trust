import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showLoader, hideLoader } from "../../store/actions/loader";
import { throttle, debounce } from "throttle-debounce";
import { getRequests } from "../../store/actions/request";
import { isMobile, isTablet } from "react-device-detect";
import { search } from "../../utilities";
import _ from "lodash";
import {
  ViewContainer,
  Button,
  Page,
  PageHeader,
  PageAction,
  HiddenMobile
} from "../../global-components";
import {
  ActivityFeedContainer,
  ActivityFeedCards,
  ActivityFeedTabs,
  ActivityFeedInner,
  ActivityFeedIcon,
  ActivityFeedTitle,
  ActivityFeedTab,
  ActivityFeedOptions,
  ActivityFeedOptionSection,
  ActivityFeedSearchInputWrapper,
  ActivityFeedSearchInput,
  ActivityFeedSearchSelectWrapper,
  ActivityFeedSearchSelect,
  ActivityFeedSearchMessage,
  ActivityFeedSearchText,
  ActivityFeedSearchAction,
  ActivityFeedSearchButtonWrapper,
  ActivityFeedSearchMain
} from "./style";
import ActivityFeedCard from "../../Components/ActivityFeedCard";
import Pagination from "../../Components/Pagination";
const page_size = 20;

const ticket_tabs = [
  { name: "medical", title: "Medical", icon: "hospital-alt" },
  { name: "money", title: "Money", icon: "usd-circle" },
  { name: "food", title: "Food", icon: "utensils" },
  { name: "other_request_type", title: "Other", icon: "user-headset" },
  { name: "transportation", title: "Transportation", icon: "car-bus" },
  { name: "permission", title: "Permissions", icon: "user-lock" }
];

class ActivityFeed extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, request, session } = props;
    document.title = "Activity Feed";
    const account = accounts.find((account) => account.account_id === session.account_id);

    this.state = {
      tickets: request.tickets,
      filter: {},
      term: "",
      isLoading: false,
      focus: false,
      isRefreshing: false,
      permissions: account.permissions,
      page: request.current_page || 1
    };
    this.autocompleteSearchDebounced = debounce(1500, this.onTermSelect);
    this.autocompleteSearchThrottled = throttle(1500, this.onTermSelect);
  }

  changeQuery = (event) => {
    this.setState({ term: event.target.value, isLoading: true }, () => {
      const term = this.state.term;
      if (term.length < 5) {
        this.autocompleteSearchThrottled(event);
      } else {
        this.autocompleteSearchDebounced(event);
      }
    });
  };

  onPrioritySelect = (event) => this.updateFilter("priority", event.target.value);
  onPermissionStatusSelect = (event) => this.updateFilter("permission_status", event.target.value);
  onStatusSelect = (event) => this.updateFilter("status", event.target.value);
  isOdd = (x) => { return x & 1; };

  onTypeSelect = (value) => {
    const { filter } = this.state;
    delete filter.permission_status;
    this.setState({ filter });
    this.updateFilter("request_type", value);
  };

  onTermSelect = () => {
    const { request } = this.props;
    const { tickets, term } = this.state;
    setTimeout(() => {
      if (term.length) {
        this.setState({
          term,
          tickets: search(["request_type", "permission", "permission_status", "status", "account_id", "first_name", "last_name", "email", "cognito_id", "tags", "title", "hubspot_ticket_id", "priority", "request_subcategory", "provider", "items", "store", "destination", "domain", "organization"], (tickets || request.tickets), term),
          isLoading: false,
          page: 1
        });
      } else {
        this.setState({
          term: "",
          tickets: request.tickets,
          isLoading: false,
          page: 1
        });
      }
    }, 500);
  };

  clearFilters = () => {
    const { request } = this.props;
    this.setState({
      tickets: request.tickets,
      filter: {},
      term: "",
      page: 1
    });
    this.termSelect.value = "";
    this.statusSelect.value = "";
    if (this.prioritySelect) this.prioritySelect.value = "";
    if (this.permissionStatusSelect) this.permissionStatusSelect.value = "";
  };

  updateFilter = (id, value) => {
    let { filter, term } = this.state;
    const { request } = this.props;
    let updated = [];
    let searchable = request.tickets;
    if (value) filter[id] = value;
    if (term) searchable = search(["request_type", "permission", "permission_status", "status", "account_id", "first_name", "last_name", "email", "cognito_id", "tags", "title", "hubspot_ticket_id", "priority", "request_subcategory", "provider", "items", "store", "destination", "domain", "organization"], request.tickets, term);
    if (Object.keys(filter).length) {
      updated = searchable.filter((item) => {
        for (let key in filter) {
          if (item[key] === "undefined" || item[key] !== filter[key]) return false;
        }
        return true;
      });
    } else {
      updated = searchable;
    }
    this.setState({ tickets: updated, page: 1 });
  };

  reloadFeed = async () => {
    const { getRequests } = this.props;
    this.setState({ isRefreshing: true });
    await getRequests(true);
    this.setState({ isRefreshing: false });
  };

  paginate = (new_page) => this.setState({ page: Math.ceil(new_page) });

  render() {
    let { tickets, filter, isLoading, term, isRefreshing, page } = this.state;
    tickets = _.orderBy(tickets, ["updated_at"], ["desc"]);
    const starting_index = ((page * page_size) - page_size);
    const ending_index = starting_index + page_size;
    let page_items = tickets.slice(starting_index, ending_index);
    return (
      <ViewContainer>
        <Page paddingbottom={isMobile ? 10 : 40}>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Activity Feed</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button secondary blue onClick={() => this.reloadFeed()}>{isRefreshing ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Refresh Feed"}</Button>
          </PageAction>
        </Page>
        <ActivityFeedContainer padding="0 10px 0px 10">
          <ActivityFeedTabs gutter={20}>
            <ActivityFeedSearchMain span={12}>
              <ActivityFeedOptions>
                <ActivityFeedOptionSection align="left" xs={12} sm={12} md={6} lg={6} xl={6}>
                  <ActivityFeedSearchInputWrapper>
                    <ActivityFeedSearchInput ref={(input) => this.termSelect = input} type="text" placeholder="Search tickets and service requests..." onChange={this.changeQuery} />
                  </ActivityFeedSearchInputWrapper>
                </ActivityFeedOptionSection>
                {filter.request_type === "permission"
                  ? (
                      <ActivityFeedOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                        <ActivityFeedSearchSelectWrapper>
                          <ActivityFeedSearchSelect ref={(input) => this.permissionStatusSelect = input} defaultValue="" onChange={this.onPermissionStatusSelect}>
                            <option disabled value="">Permission Status</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                            <option value="pending">Pending</option>
                          </ActivityFeedSearchSelect>
                        </ActivityFeedSearchSelectWrapper>
                      </ActivityFeedOptionSection>
                  )
                  : (
                      <ActivityFeedOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                        <ActivityFeedSearchSelectWrapper>
                          <ActivityFeedSearchSelect ref={(input) => this.prioritySelect = input} defaultValue="" onChange={this.onPrioritySelect}>
                            <option disabled value="">Ticket Priority</option>
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </ActivityFeedSearchSelect>
                        </ActivityFeedSearchSelectWrapper>
                      </ActivityFeedOptionSection>
                  )
                }
                <ActivityFeedOptionSection align="left" xs={12} sm={12} md={2} lg={2} xl={2}>
                  <ActivityFeedSearchSelectWrapper>
                    <ActivityFeedSearchSelect ref={(input) => this.statusSelect = input} defaultValue="" onChange={this.onStatusSelect}>
                      <option disabled value="">Ticket Status</option>
                      <option value="new">New</option>
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="solved">Solved</option>
                      <option value="closed">Closed</option>
                    </ActivityFeedSearchSelect>
                  </ActivityFeedSearchSelectWrapper>
                </ActivityFeedOptionSection>
                <ActivityFeedOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                  <ActivityFeedSearchButtonWrapper>
                    <Button secondary blue onClick={() => this.clearFilters()}>Clear</Button>
                  </ActivityFeedSearchButtonWrapper>
                </ActivityFeedOptionSection>
              </ActivityFeedOptions>
            </ActivityFeedSearchMain>
            <ActivityFeedSearchMain span={12}>
              {tickets.length
                ? <Pagination page={page} page_size={page_size} items={tickets} paginate={this.paginate} padding="5px 0px 0 0px" />
                : null
              }
            </ActivityFeedSearchMain>
            {ticket_tabs.map((tab, index) => {
              return (
                <ActivityFeedTab key={index} span={2}>
                  <ActivityFeedInner type={tab.name} active={`${filter.request_type === tab.name ? "true" : "false"}`} onClick={() => this.onTypeSelect(tab.name)}>
                    <ActivityFeedIcon xs={12} sm={12} md={4} lg={4} xl={4} type={tab.name}><FontAwesomeIcon icon={["fad", tab.icon]} /></ActivityFeedIcon>
                    <ActivityFeedTitle xs={12} sm={12} md={8} lg={8} xl={8}><HiddenMobile ellipsis>{tab.title}</HiddenMobile></ActivityFeedTitle>
                  </ActivityFeedInner>
                </ActivityFeedTab>
              );
            })}
          </ActivityFeedTabs>
          {page_items.length && !isLoading
            ? (
              <ActivityFeedCards>
                {page_items.map((ticket, index) => {
                  let icon = "info-circle";
                  if (ticket.permission_status === "-") {
                    ticket.permission_status = "pending";
                  }
                  if (ticket.status === "-") {
                    ticket.status = "pending";
                  }
                  let status = ticket.permission_status || ticket.status;
                  switch (ticket.request_type) {
                    case "permission":
                      icon = "lock-alt";
                      if (status === "approved") {
                        icon = "lock-open-alt";
                      }
                      return (
                        <ActivityFeedCard
                          ticket={{...ticket, status}}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "money":
                      icon = "usd-circle";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={false}
                          current_page={page}
                        />
                      );
                    case "food":
                      icon = "utensils";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "medical":
                      icon = "hospital-alt";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={false}
                          current_page={page}
                        />
                      );
                    case "transportation":
                      icon = "car-bus";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "other_request_type":
                      icon = "user-headset";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "account_update":
                      icon = "user-check";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "new_relationship":
                      icon = "users";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "professional_portal_assistance":
                      icon = "user-headset";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    case "new_partner":
                      icon = "user-tie";
                      return (
                        <ActivityFeedCard
                          ticket={{ ...ticket, status }}
                          span={12}
                          key={index}
                          icon={icon}
                          active={this.state[ticket.id]}
                          swap={true}
                          current_page={page}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </ActivityFeedCards>
            )
            : (
              <>
                {isLoading
                  ? (
                    <ActivityFeedSearchMessage>
                      <ActivityFeedSearchText span={12}>{`Searching for "${term}"`}</ActivityFeedSearchText>
                      <ActivityFeedSearchAction span={12}>
                        <Button onClick={() => this.clearFilters()} primary blue>Cancel</Button>
                      </ActivityFeedSearchAction>
                    </ActivityFeedSearchMessage>
                  )
                  : (
                    <ActivityFeedSearchMessage>
                      <ActivityFeedSearchText span={12}>{`Found ${page_items.length} ${filter.status ? ` ${filter.status} ` : ""}${filter.priority ? ` ${filter.priority} priority` : ""} tickets ${term ? ` for "${term}"` : ""}${filter.request_type ? ` in "${filter.request_type}"` : ""}`}</ActivityFeedSearchText>
                      <ActivityFeedSearchAction span={12}>
                        <Button onClick={() => this.clearFilters()} primary blue>Reset Filters</Button>
                      </ActivityFeedSearchAction>
                    </ActivityFeedSearchMessage>
                  )
                }
              </>
            )
          }
        </ActivityFeedContainer>
      </ViewContainer>

    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  request: state.request
});
const dispatchToProps = (dispatch) => ({
  showLoader: (message) => dispatch(showLoader(message)),
  hideLoader: () => dispatch(hideLoader()),
  getRequests: (override) => dispatch(getRequests(override))
});
export default connect(mapStateToProps, dispatchToProps)(ActivityFeed);
