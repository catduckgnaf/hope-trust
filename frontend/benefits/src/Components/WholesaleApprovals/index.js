import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getWholesaleApprovals } from "../../store/actions/wholesale";
import WholesaleApprovalCard from "../../Components/WholesaleApprovalCard";
import Pagination from "../Pagination";
import { throttle } from "throttle-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isMobile, isTablet } from "react-device-detect";
import { orderBy } from "lodash";
import { Row, Col } from "react-simple-flex-grid";
import { search, search_letters } from "../../utilities";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button,
  Error,
  SelectLabel,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage,
  CardContainer
} from "../../global-components";
import {
  UsersOptionsRow,
  UsersOptionsContainer,
  UsersOptions,
  UsersOptionSection,
  UsersSearchInputWrapper,
  UsersSearchInput,
  UsersSearchButtonWrapper,
  UsersTable,
  UsersTablePadding,
  UsersColumnHeaders,
  UsersColumnHeader,
  UsersColumnHeaderIcon,
  UsersSearchMessage,
  UsersSearchText,
  UsersSearchAction,
  UserSearchSelectWrapper,
  UserSearchSelect,
  UsersAlphabeticalSearchContainer,
  UsersAlphabeticalSearchContainerPadding,
  UsersAlphabeticalSearchContainerInner,
  LetterLinks,
  LetterLink,
  UsersMain,
  UsersPadding,
  UsersInner
} from "./style";

const page_size = 25;

class WholesaleApprovals extends Component {

  constructor(props) {
    super(props);
    const { wholesale } = props;
    document.title = "Wholesale Approvals";
    this.state = {
      filter: {
        status: "pending"
      },
      term: "",
      isLoading: false,
      is_searching: false,
      approvals: wholesale.wholesale_approvals,
      letter: "",
      page: wholesale.current_page || 1,
      sort_order: "desc",
      sort_key: ""
    };
    this.autocompleteSearchThrottled = throttle(100, this.onTermSelect);
  }

  componentDidMount() {
    const { getWholesaleApprovals, wholesale } = this.props;
    if (!wholesale.requestedWholesaleApprovals && !wholesale.isFetchingWholesaleApprovals) getWholesaleApprovals();
    this.updateFilter("status", "pending");
  }

  changeQuery = (event) => {
    this.setState({ term: event.target.value, isLoading: true }, () => this.autocompleteSearchThrottled(event));
  };

  onRequestSelect = (event) => this.updateFilter("status", event.target.value);

  onTermSelect = () => {
    const { wholesale } = this.props;
    const { approvals, term } = this.state;
    if (term.length) {
      setTimeout(() => {
        this.setState({
          term,
          approvals: search(["first_name", "last_name", "email", "cognito_id", "status"], (approvals || wholesale.wholesale_approvals), term),
          isLoading: false,
          is_searching: true,
          active_letter: "",
          page: 1,
          sort_order: "desc",
          sort_key: ""
        });
      }, 1000);
    } else {
      this.setState({
        filter: {
          status: "pending"
        },
        term: "",
        approvals: wholesale.wholesale_approvals,
        isLoading: false,
        is_searching: false,
        active_letter: "",
        page: 1,
        sort_order: "desc",
        sort_key: ""
      });
    }
};

  clearFilters = () => {
    const { wholesale } = this.props;
    this.setState({
      approvals: wholesale.wholesale_approvals,
      filter: {
        status: "pending"
      },
      term: "",
      is_searching: false,
      active_letter: "",
      page: 1,
      sort_order: "desc",
      sort_key: ""
    });
    if (this.termSelect) this.termSelect.value = "";
    if (this.requestTypeSelect) this.requestTypeSelect.value = "pending";
    this.updateFilter("status", "pending");
  };

  updateFilter = (id, value) => {
    let { filter, term } = this.state;
    const { wholesale } = this.props;
    let updated = [];
    let searchable = wholesale.wholesale_approvals || [];
    if (value || typeof value === "boolean") filter[id] = value;
    if (term) searchable = search(["first_name", "last_name", "email", "cognito_id", "status"], (wholesale.wholesale_approvals || []), term);
    if (Object.keys(filter).length) {
      updated = searchable.filter((item) => {
        for (let key in filter) {
          let filter_key = filter[key];
          let item_key = item[key];
          if (typeof filter_key !== "boolean") filter_key = filter_key.toLowerCase();
          if (item_key || typeof item_key === "boolean") {
            if (typeof item_key !== "boolean") item_key = item_key.toLowerCase();
            if (item_key === "undefined" || item_key !== filter_key) return false;
          }
        }
        if (item[id] || typeof item[id] === "boolean") return true;
        return false;
      });
    } else {
      updated = searchable;
    }
    this.setState({ approvals: updated, is_searching: true, active_letter: "", page: 1, sort_order: "desc", sort_key: "" });
  };

  searchByFirstLetter = (new_letter) => {
    const { wholesale } = this.props;
    const { is_searching, approvals, active_letter } = this.state;
    let results = [];
    if (is_searching && !active_letter && approvals.length) {
      results = approvals.filter((ref) => ref.name.charAt(0) === new_letter);
    } else {
      results = wholesale.wholesale_approvals.filter((ref) => ref.name.charAt(0) === new_letter);
    }
    this.setState({ approvals: results, is_searching: true, active_letter: new_letter, page: 1, sort_order: "desc", sort_key: "" });
  };

  refreshApprovals = async () => {
    const { getWholesaleApprovals } = this.props;
    await getWholesaleApprovals(true);
    this.clearFilters();
  };

  paginate = (new_page) => this.setState({ page: Math.ceil(new_page) });

  sort = (key) => {
    const { sort_order } = this.state;
    this.setState({ sort_key: key, sort_order: (sort_order === "desc" ? "asc" : "desc") });
  };

  render() {
    const { wholesale } = this.props;
    const { isLoading, term, active_letter, is_searching, page, sort_key, sort_order, filter } = this.state;
    let { approvals = [] } = this.state;
    if (!approvals.length && !is_searching) approvals = wholesale.wholesale_approvals.filter((a) => a.status === "pending") || [];
    approvals = orderBy(approvals, ["created_at"], ["desc"]);
    if (sort_key) approvals = orderBy(approvals, [sort_key], [sort_order]);
    const starting_index = ((page * page_size) - page_size);
    const ending_index = starting_index + page_size;
    let page_items = approvals.slice(starting_index, ending_index);
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Wholesale Connections{approvals.length ? ` (${approvals.length.toLocaleString()})` : null}
          </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button outline blue rounded onClick={() => this.refreshApprovals()}>{wholesale.isFetchingWholesaleApprovals ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        <UsersMain>
          <UsersPadding>
            <UsersInner>
              <UsersOptionsRow>
                <UsersOptionsContainer span={12}>
                  <UsersOptions>
                    <UsersOptionSection align="left" xs={12} sm={12} md={6} lg={6} xl={6}>
                      <UsersSearchInputWrapper>
                        <UsersSearchInput ref={(input) => this.termSelect = input} type="text" placeholder="Search approvals..." onChange={this.changeQuery} />
                      </UsersSearchInputWrapper>
                    </UsersOptionSection>
                    <UsersOptionSection align="right" xs={12} sm={12} md={4} lg={4} xl={4}>
                      <UserSearchSelectWrapper>
                        <SelectLabel>
                          <UserSearchSelect ref={(input) => this.requestTypeSelect = input} defaultValue={filter.status || "pending"} onChange={this.onRequestSelect}>
                            <option disabled value="">Choose a status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Approved</option>
                            <option value="declined">Declined</option>
                          </UserSearchSelect>
                        </SelectLabel>
                      </UserSearchSelectWrapper>
                    </UsersOptionSection>
                    <UsersOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                      <UsersSearchButtonWrapper>
                        <Button secondary blue outline rounded onClick={() => this.clearFilters()}>Clear</Button>
                      </UsersSearchButtonWrapper>
                    </UsersOptionSection>
                  </UsersOptions>
                </UsersOptionsContainer>
              </UsersOptionsRow>
              <UsersAlphabeticalSearchContainer>
                <UsersAlphabeticalSearchContainerPadding>
                  <UsersAlphabeticalSearchContainerInner span={12}>
                    <LetterLinks>
                      {search_letters.map((letter, index) => {
                        return (
                          <LetterLink active={letter === active_letter ? 1 : 0} key={index} onClick={() => this.searchByFirstLetter(letter)}>{letter}</LetterLink>
                        );
                      })}
                    </LetterLinks>
                  </UsersAlphabeticalSearchContainerInner>
                </UsersAlphabeticalSearchContainerPadding>
              </UsersAlphabeticalSearchContainer>
              {approvals.length
                ? <Pagination page={page} page_size={page_size} items={approvals} paginate={this.paginate} padding="15px 35px 10px 35px" />
                : null
              }
              <UsersTable>
                <UsersTablePadding>
                  <UsersColumnHeaders>
                    <UsersColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("last_name")} sortable={1}>
                      <UsersColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </UsersColumnHeaderIcon> Name
                    </UsersColumnHeader>
                    <UsersColumnHeader xs={12} sm={12} md={3} lg={3} xl={3} onClick={() => this.sort("cognito_id")} sortable={1}>
                      <UsersColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </UsersColumnHeaderIcon> Retailer
                    </UsersColumnHeader>
                    <UsersColumnHeader xs={12} sm={12} md={3} lg={3} xl={3} onClick={() => this.sort("config_id")} sortable={1}>
                      <UsersColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </UsersColumnHeaderIcon> Wholesaler
                    </UsersColumnHeader>
                    <UsersColumnHeader xs={12} sm={12} md={2} lg={2} xl={2} onClick={() => this.sort("created_at")} sortable={1}>
                      <UsersColumnHeaderIcon>
                        <FontAwesomeIcon icon={["fad", (sort_order === "desc" ? "sort-down" : "sort-up")]} />
                      </UsersColumnHeaderIcon> Created
                    </UsersColumnHeader>
                    <UsersColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Actions</UsersColumnHeader>
                  </UsersColumnHeaders>
                  <Row>
                    <CardContainer span={12}>
                      {page_items.length
                        ? (
                          <>
                            {page_items.length && !isLoading
                              ? (
                                <Row>
                                  <Col span={12}>
                                    {page_items.map((request, index) => {
                                      return (
                                        <WholesaleApprovalCard key={`index_${index}`} request={request} updateFilter={this.updateFilter} current_page={page} />
                                      );
                                    })}
                                  </Col>
                                </Row>
                              )
                              : (
                                <>
                                  {isLoading
                                    ? (
                                      <UsersSearchMessage>
                                        <UsersSearchText span={12}>{`Searching for "${term}"`}</UsersSearchText>
                                        <UsersSearchAction span={12}>
                                          <Button onClick={() => this.clearFilters()} outline primary blue>Cancel</Button>
                                        </UsersSearchAction>
                                      </UsersSearchMessage>
                                    )
                                    : (
                                      <UsersSearchMessage>
                                        <UsersSearchText span={12}>{`Found ${page_items ? page_items.length : 0}${(filter && filter.status ? ` ${filter.status} ` : " ")}approvals ${term ? ` for "${term}"` : ""}`}</UsersSearchText>
                                        <UsersSearchAction span={12}>
                                          <Button onClick={() => this.clearFilters()} outline primary blue>Reset Filters</Button>
                                        </UsersSearchAction>
                                      </UsersSearchMessage>
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
                                    <FontAwesomeIcon icon={["fad", "user-friends"]} />
                                  </ErrorIcon>
                                  <ErrorMessage span={12}>You do not have any{(filter && filter.status ? ` ${filter.status} ` : " ")}approvals matching this criteria.</ErrorMessage>
                                </ErrorInnerRow>
                              </ErrorInner>
                            </ErrorPadding>
                          </Error>
                        )
                      }
                    </CardContainer>
                  </Row>
                </UsersTablePadding>
              </UsersTable>
            </UsersInner>
          </UsersPadding>
        </UsersMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  wholesale: state.wholesale,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  getWholesaleApprovals: (override) => dispatch(getWholesaleApprovals(override))
});
export default connect(mapStateToProps, dispatchToProps)(WholesaleApprovals);
