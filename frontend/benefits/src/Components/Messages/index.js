import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getMessages, openMessage } from "../../store/actions/message";
import { navigateTo } from "../../store/actions/navigation";
import MessageSettingCard from "../MessageSettingCard";
import Pagination from "../Pagination";
import { throttle } from "throttle-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { copyToClipboard } from "../../store/actions/utilities";
import { isMobile, isTablet } from "react-device-detect";
import { orderBy } from "lodash";
import { Row, Col } from "react-simple-flex-grid";
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
  MessagesOptionsRow,
  MessagesOptionsContainer,
  MessagesOptions,
  MessagesOptionSection,
  MessagesSearchInputWrapper,
  MessagesSearchInput,
  MessagesSearchButtonWrapper,
  MessagesTable,
  MessagesTablePadding,
  MessagesColumnHeaders,
  MessagesColumnHeader,
  MessagesColumnHeaderIcon,
  MessagesSearchMessage,
  MessagesSearchText,
  MessagesSearchAction,
  MessagesMain,
  MessagesPadding,
  MessagesInner,
  EmailContainer,
  EmailLabel,
  EmailText,
  EmailAppendage
} from "./style";
const page_size = 10;

class MessageSettings extends Component {

  constructor(props) {
    super(props);
    const { message } = props;
    document.title = "Message Settings";
    this.state = {
      filter: {},
      term: "",
      isLoading: false,
      is_searching: false,
      list: message.list,
      page: message.current_page || 1,
      sort_order: "desc",
      sort_key: ""
    };
    this.autocompleteSearchThrottled = throttle(100, this.onTermSelect);
  }

  componentDidMount() {
    const { getMessages, message } = this.props;
    if (!message.requested && !message.isFetching) getMessages();
  }

  changeQuery = (event) => {
    this.setState({ term: event.target.value, isLoading: true }, () => this.autocompleteSearchThrottled(event));
  };

  clearFilters = () => {
    const { message } = this.props;
    this.setState({
      list: message.list,
      filter: {},
      term: "",
      is_searching: false,
      page: 1,
      sort_order: "desc",
      sort_key: ""
    });
    if (this.termSelect) this.termSelect.value = "";
  };

  updateFilter = (id, value) => {
    let { filter, term } = this.state;
    const { message } = this.props;
    let updated = [];
    let searchable = message.list;
    if (value) filter[id] = value;
    if (term) searchable = search(["read", "to_first", "to_last", "body", "from_email", "to_email", "cognito_id", "account_id", "to_cognito"], message.list, term);
    if (Object.keys(filter).length) {
      updated = searchable.filter((item) => {
        for (let key in filter) {
          filter[key] = filter[key].toLowerCase();
          if (item[key]) {
            item[key] = item[key].toLowerCase();
            if (item[key] === "undefined" || item[key] !== filter[key]) {
              return false;
            }
          }
        }
        if (item[id]) return true;
        return false;
      });
    } else {
      updated = searchable;
    }
    this.setState({ list: updated, is_searching: true, page: 1, sort_order: "desc", sort_key: "" });
  };

  onTermSelect = () => {
    const { message } = this.props;
    const { list, term } = this.state;
    setTimeout(() => {
      if (term.length) {
        this.setState({
          term,
          list: search(["read", "to_first", "to_last", "body", "from_email", "to_email", "cognito_id", "account_id", "to_cognito"], (list || message.list), term),
          isLoading: false,
          is_searching: true,
          page: 1,
          sort_order: "desc",
          sort_key: ""
        });
      } else {
        this.setState({
          term: "",
          list: message.list,
          isLoading: false,
          is_searching: false,
          page: 1,
          sort_order: "desc",
          sort_key: ""
        });
      }
    }, 500);
  };

  paginate = (new_page) => this.setState({ page: Math.ceil(new_page) });

  sort = (key) => {
    const { sort_order } = this.state;
    this.setState({ sort_key: key, sort_order: (sort_order === "desc" ? "asc" : "desc") });
  };

  refreshMessages = async () => {
    const { getMessages } = this.props;
    await getMessages(true);
    this.clearFilters();
  };

  render() {
    const { openMessage, message, user, copyToClipboard, navigateTo } = this.props;
    let { list, isLoading, term, page, sort_key, sort_order } = this.state;
    list = orderBy(list, "created_at", "desc");
    if (sort_key) list = orderBy(list, [sort_key], [sort_order]);
    const starting_index = ((page * page_size) - page_size);
    const ending_index = starting_index + page_size;
    let page_items = list.slice(starting_index, ending_index);
    const email = `@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`;
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Messages{list ? ` (${list.length})` : null}
          </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button onClick={() => openMessage({}, false, false)} secondary outline blue rounded>New Message</Button>
            <Button onClick={() => this.refreshMessages()} secondary outline blue rounded>{message.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        <MessagesMain>
          <MessagesPadding>
            <EmailContainer>
              <EmailLabel><FontAwesomeIcon icon={["fad", "at"]} /></EmailLabel> <EmailText><EmailAppendage onClick={() => navigateTo("/settings", "?tab=profile")}>{user.username || user.cognito_id}</EmailAppendage>{email}</EmailText>
              <Button noshadow nomargin marginleft={5} marginright={user.username ? 1 : 5} outline blue small rounded onClick={() => copyToClipboard(`${user.username || user.cognito_id}${email}`, "Email Address")}>Copy</Button>
              {!user.username
                ? <Button noshadow nomargin small outline green rounded onClick={() => navigateTo("/settings", "?tab=profile")}>Set Username</Button>
                : null
              }
            </EmailContainer>
            <MessagesInner>
              <MessagesOptionsRow>
                <MessagesOptionsContainer span={12}>
                  <MessagesOptions>
                    <MessagesOptionSection align="left" xs={12} sm={12} md={10} lg={10} xl={10}>
                      <MessagesSearchInputWrapper>
                        <MessagesSearchInput ref={(input) => this.termSelect = input} type="text" placeholder="Search messages..." onChange={this.changeQuery} />
                      </MessagesSearchInputWrapper>
                    </MessagesOptionSection>
                    <MessagesOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                      <MessagesSearchButtonWrapper>
                        <Button secondary blue outline rounded onClick={() => this.clearFilters()}>Clear</Button>
                      </MessagesSearchButtonWrapper>
                    </MessagesOptionSection>
                  </MessagesOptions>
                </MessagesOptionsContainer>
              </MessagesOptionsRow>
              {list.length
                ? <Pagination page={page} page_size={page_size} items={list} paginate={this.paginate} padding="15px 30px 15px 30px"/>
                : null
              }
              <MessagesTable>
                <MessagesTablePadding>
                  <MessagesColumnHeaders>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("cognito_id")} sortable={1}>
                      <MessagesColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </MessagesColumnHeaderIcon> Sent By
                    </MessagesColumnHeader>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("to_cognito")} sortable={1}>
                      <MessagesColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </MessagesColumnHeaderIcon> Recipient
                    </MessagesColumnHeader>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("read")} sortable={1}>
                      <MessagesColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </MessagesColumnHeaderIcon> Read Status
                    </MessagesColumnHeader>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>
                       Type
                    </MessagesColumnHeader>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("created_at")} sortable={1}>
                      <MessagesColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </MessagesColumnHeaderIcon> Created
                    </MessagesColumnHeader>
                    <MessagesColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Actions</MessagesColumnHeader>
                  </MessagesColumnHeaders>
                  <Row>
                    <CardContainer span={12}>
                      {message?.list?.length
                        ? (
                          <>
                            {page_items.length && !isLoading
                              ? (
                                <Row>
                                  <Col span={12}>
                                    {page_items.map((message, index) => {
                                      return (
                                        <MessageSettingCard key={index} message={message} updateFilter={this.updateFilter} current_page={page} />
                                      );
                                    })}
                                  </Col>
                                </Row>
                              )
                              : (
                                <>
                                  {isLoading
                                    ? (
                                      <MessagesSearchMessage>
                                        <MessagesSearchText span={12}>{`Searching for "${term}"`}</MessagesSearchText>
                                        <MessagesSearchAction span={12}>
                                          <Button onClick={() => this.clearFilters()} outline primary blue>Cancel</Button>
                                        </MessagesSearchAction>
                                      </MessagesSearchMessage>
                                    )
                                    : (
                                      <MessagesSearchMessage>
                                        <MessagesSearchText span={12}>{`Found ${page_items.length} messages ${term ? ` for "${term}"` : ""}`}</MessagesSearchText>
                                        <MessagesSearchAction span={12}>
                                          <Button onClick={() => this.clearFilters()} outline primary blue>Reset Filters</Button>
                                        </MessagesSearchAction>
                                      </MessagesSearchMessage>
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
                                  <ErrorMessage span={12}>You do not have any messages.</ErrorMessage>
                                </ErrorInnerRow>
                              </ErrorInner>
                            </ErrorPadding>
                          </Error>
                        )
                      }
                    </CardContainer>
                  </Row>
                </MessagesTablePadding>
              </MessagesTable>
            </MessagesInner>
          </MessagesPadding>
        </MessagesMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  message: state.message
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  copyToClipboard: (text, type) => dispatch(copyToClipboard(text, type)),
  getMessages: (override) => dispatch(getMessages(override)),
  openMessage: (defaults, updating, viewing) => dispatch(openMessage(defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(MessageSettings);
