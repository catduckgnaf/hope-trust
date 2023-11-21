import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import RelationshipCard from "../../Components/RelationshipCard";
import Pagination from "../../Components/Pagination";
import { throttle } from "throttle-debounce";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import { getRelationships, openCreateRelationshipModal } from "../../store/actions/relationship";
import { orderBy } from "lodash";
import { isMobile, isTablet } from "react-device-detect";
import { search } from "../../utilities";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button,
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage,
  CardContainer
} from "../../global-components";
import {
  RelationshipsOptionsRow,
  RelationshipsOptionsContainer,
  RelationshipsOptions,
  RelationshipsOptionSection,
  RelationshipsSearchInputWrapper,
  RelationshipsSearchInput,
  RelationshipsSearchButtonWrapper,
  RelationshipsTable,
  RelationshipsTablePadding,
  RelationshipsColumnHeaders,
  RelationshipsColumnHeader,
  RelationshipsColumnHeaderIcon,
  RelationshipsSearchMessage,
  RelationshipsSearchText,
  RelationshipsSearchAction
} from "./style";
const page_size = 10;

class Relationships extends Component {
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
    const { user, session, relationship } = props;
    document.title = "Relationships";
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    const users = relationship.list.filter((account_user) => account_user.cognito_id !== user.cognito_id) || [];
    const current_user = relationship.list.find((account_user) => account_user.cognito_id === user.cognito_id) || {};

    this.state = {
      filter: {
        type: ""
      },
      term: "",
      isLoading: false,
      users,
      accountUsers: users,
      permissions: account.permissions,
      current_user,
      is_searching: false,
      page: relationship.current_page || 1,
      sort_order: "desc",
      sort_key: ""
    };
    this.autocompleteSearchThrottled = throttle(100, this.onTermSelect);
  }

  componentDidMount() {
    const { getRelationships, relationship } = this.props;
    if (!relationship.list.length) getRelationships();
    localStorage.removeItem("react-avatar/failing");
  }

  changeQuery = (event) => {
    this.setState({ term: event.target.value, isLoading: true }, () => this.autocompleteSearchThrottled(event));
  };

  onRelationshipTypeSelect = (event) => this.updateFilter("type", event.target.value);

  onTermSelect = () => {
    const { users, accountUsers, term } = this.state;
    setTimeout(() => {
      if (term.length) {
        const searched = search(["first_name", "last_name", "gender", "email", "home_phone", "type"], (users || accountUsers), term);
        setTimeout(() => {
          this.setState({
            term,
            users: searched,
            isLoading: false,
            is_searching: true,
            page: 1,
            sort_order: "desc",
            sort_key: ""
          });
        }, 1000);
      } else {
        this.setState({
          term: "",
          users: accountUsers,
          isLoading: false,
          is_searching: false,
          page: 1,
          sort_order: "desc",
          sort_key: ""
        });
      }
    }, 500);
  };

  clearFilters = () => {
    const { accountUsers } = this.state;
    this.setState({
      users: accountUsers,
      filter: {},
      term: "",
      isLoading: false,
      is_searching: false,
      page: 1,
      sort_order: "desc",
      sort_key: ""
    });
    this.termSelect.value = "";
    if (this.RelationshipTypeSelect) this.RelationshipTypeSelect.value = "";
  };

  updateFilter = (id, value) => {
    let { filter, term, accountUsers } = this.state;
    let updated = [];
    let searchable = accountUsers;
    if (value) filter[id] = value;
    if (term) searchable = search(["first_name", "last_name", "gender", "email", "home_phone", "type", "partner_data.partner_type", "partner_data.name"], accountUsers, term);
    if (Object.keys(filter).length) {
      updated = searchable.filter((item) => {
        for (let key in filter) {
          filter[key] = filter[key].toLowerCase();
          item[key] = item[key] ? item[key].toLowerCase() : "";
          if (item[key] === "undefined" || item[key] !== filter[key]) return false;
        }
        return true;
      });
    } else {
      updated = searchable;
    }
    this.setState({ users: updated.filter((e) => e), is_searching: true, page: 1, sort_key: "", sort_order: "desc" });
  };

  paginate = (new_page) => this.setState({ page: Math.ceil(new_page) });

  sort = (key) => {
    const { sort_order } = this.state;
    this.setState({ sort_key: key, sort_order: (sort_order === "desc" ? "asc" : "desc") });
  };

  render() {
    const { openCreateRelationshipModal } = this.props;
    const { users, isLoading, term, filter, permissions, page, sort_key, sort_order } = this.state;
    let active = users.map((s) => {
      return { ...s, emergency: !!s.emergency, primary_contact: !!s.primary_contact, secondary_contact: !!s.secondary_contact };
    });
    active = orderBy(active, ["created_at"], ["desc"]);
    if (sort_key) active = orderBy(active, [sort_key], [sort_order]);
    const starting_index = ((page * page_size) - page_size);
    const ending_index = starting_index + page_size;
    let page_items = active.slice(starting_index, ending_index);

    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Account Users</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            {permissions.some((p) => ["wholesale", "retail", "group", "team"].includes(p))
              ? <Button secondary outline blue rounded onClick={() => openCreateRelationshipModal({}, null, null, page)}>Add User</Button>
              : null
            }
          </PageAction>
        </Page>
        <RelationshipsOptionsRow>
          <RelationshipsOptionsContainer span={12}>
            <RelationshipsOptions>
              <RelationshipsOptionSection align="left" xs={12} sm={12} md={10} lg={10} xl={10}>
                <RelationshipsSearchInputWrapper>
                  <RelationshipsSearchInput ref={(input) => this.termSelect = input} type="text" placeholder="Search users..." onChange={this.changeQuery} />
                </RelationshipsSearchInputWrapper>
              </RelationshipsOptionSection>
              <RelationshipsOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                <RelationshipsSearchButtonWrapper>
                  <Button secondary blue outline rounded onClick={() => this.clearFilters()}>Clear</Button>
                </RelationshipsSearchButtonWrapper>
              </RelationshipsOptionSection>
            </RelationshipsOptions>
          </RelationshipsOptionsContainer>
        </RelationshipsOptionsRow>
        {active.length
          ? <Pagination page={page} page_size={page_size} items={active} paginate={this.paginate} padding="15px 25px 5px 25px" />
          : null
        }
        <RelationshipsTable>
          <RelationshipsTablePadding>
            <RelationshipsColumnHeaders>
              <RelationshipsColumnHeader xs={12} sm={12} md={3} lg={3} xl={3} onClick={() => this.sort("first_name")} sortable={1}>
                <RelationshipsColumnHeaderIcon>
                  <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                </RelationshipsColumnHeaderIcon> Name
              </RelationshipsColumnHeader>
              <RelationshipsColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("home_phone")} sortable={1}>
                <RelationshipsColumnHeaderIcon>
                  <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                </RelationshipsColumnHeaderIcon> Phone
              </RelationshipsColumnHeader>
              <RelationshipsColumnHeader xs={12} sm={12} md={3} lg={3} xl={3} onClick={() => this.sort("email")} sortable={1}>
                <RelationshipsColumnHeaderIcon>
                  <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                </RelationshipsColumnHeaderIcon> Email
              </RelationshipsColumnHeader>
              <RelationshipsColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>
                Administrator
              </RelationshipsColumnHeader>
              <RelationshipsColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Actions</RelationshipsColumnHeader>
            </RelationshipsColumnHeaders>
            <Row>
              <CardContainer span={12}>
                {page_items.length
                  ? (
                    <>
                      {page_items.length && !isLoading
                        ? (
                          <Row>
                            <Col span={12}>
                              {page_items.map((account_user) => {
                                return (
                                  <RelationshipCard permissions={permissions} key={`index_${account_user.cognito_id}`} user={account_user} current_page={page} />
                                );
                              })}
                            </Col>
                          </Row>
                        )
                        : (
                          <>
                            {isLoading
                              ? (
                                <RelationshipsSearchMessage>
                                  <RelationshipsSearchText span={12}><FontAwesomeIcon icon={["fad", "spinner"]} spin/> {`Searching for "${term}"`}</RelationshipsSearchText>
                                  <RelationshipsSearchAction span={12}>
                                    <Button onClick={() => this.clearFilters()} outline primary blue>Cancel</Button>
                                  </RelationshipsSearchAction>
                                </RelationshipsSearchMessage>
                              )
                              : (
                                <RelationshipsSearchMessage>
                                  <RelationshipsSearchText span={12}>{`Found ${page_items.length} ${filter.type ? `"${filter.type}"` : ""} users ${term ? ` for "${term}"` : ""}`}</RelationshipsSearchText>
                                  <RelationshipsSearchAction span={12}>
                                    <Button onClick={() => this.clearFilters()} outline primary blue>Reset Filters</Button>
                                  </RelationshipsSearchAction>
                                </RelationshipsSearchMessage>
                              )
                            }
                          </>
                        )
                      }
                    </>
                  )
                  : (
                    <Error span={12}>
                      <ErrorPadding>
                        <ErrorInner span={12}>
                          <ErrorInnerRow>
                            <ErrorIcon span={12}>
                              <FontAwesomeIcon icon={["fad", "users"]} />
                            </ErrorIcon>
                            <ErrorMessage span={12}>You do not have any other account users.</ErrorMessage>
                          </ErrorInnerRow>
                        </ErrorInner>
                      </ErrorPadding>
                    </Error>
                  )
                }
              </CardContainer>
            </Row>
          </RelationshipsTablePadding>
        </RelationshipsTable>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  getRelationships: () => dispatch(getRelationships()),
  openCreateRelationshipModal: (defaults, account_id, target_hubspot_deal_id, current_page) => dispatch(openCreateRelationshipModal(defaults, account_id, target_hubspot_deal_id, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(Relationships);
