import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
  ListItemMain,
  ListItemPadding,
  ListItemInner,
  ListItemSections,
  ListItemSection,
  ListItemSectionText,
  ListItemSectionTextItem,
  LoadingContainer,
  ListItemMessage,
  ListItemMessagePadding,
  ListItemMessageInner,
  ListItemMessageText
} from "./style";

class ListItems extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  isValidDate = (date) => {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
  };

  render() {
    const { list, search_query, filter, filterBy, search_on, is_searching_clients } = this.props;
    const path = list.redux_key;
    const data = this.props[path[0]];
    let searchable = data.list;
    if (list.transform_results) searchable = list.transform_results(data.list);
    if (search_query) searchable = data.list.filter((d) => d[search_on] === search_query);
    if (filter[`is_filtering_${list.title}`]) searchable = searchable.filter((item) => item[filter.key] === filter.value);
    return (
      <>
        {searchable.length && !this.props[path[0]].isFetching
          ? (
            <>
              {searchable.length && is_searching_clients && list.title === "Clients"
                ? (
                  <ListItemMessage>
                    <ListItemMessagePadding>
                      <ListItemMessageInner>
                        <ListItemMessageText>{searchable.length ? `${searchable.length} ${searchable.length === 1 ? "account" : "accounts"} - Monthly Revenue: $${searchable.reduce((total, { account_value }) => total + account_value, 0)}` : ""}</ListItemMessageText>
                      </ListItemMessageInner>
                    </ListItemMessagePadding>
                  </ListItemMessage>
                )
                : null
              }
              {searchable.map((list_item, index) => {
                let item = [];
                list.allowed_keys.forEach((key) => list_item.hasOwnProperty(key) && item.push({ value: list_item[key], key }));
                return (
                  <ListItemMain key={index}>
                    <ListItemPadding>
                      <ListItemInner>
                        <ListItemSections>
                          {item.map((column_values, index) => {
                            const is_filterable = list.filter_on.includes(column_values.key);
                            let value = column_values.value;
                            if (column_values.key === "created_at" && this.isValidDate(value)) value = moment(value).format("MM/DD/YYYY");
                            if (column_values.key === "account_value") value = `$${value}`;
                            if (column_values.key === "revenue") value = `$${(value/100).toFixed(2)}`;
                            return (
                              <ListItemSection key={index}>
                                <ListItemSectionText>
                                  <ListItemSectionTextItem clickable={is_filterable ? 1 : 0} onClick={is_filterable ? () => filterBy(column_values.key, column_values.value, list.title) : null}>{value}</ListItemSectionTextItem>
                                </ListItemSectionText>
                              </ListItemSection>
                            );
                          })}
                        </ListItemSections>
                      </ListItemInner>
                    </ListItemPadding>
                  </ListItemMain>
                );
              })}
            </>
          )
          : (
            <>
              {data.isFetching
                ? (
                  <LoadingContainer>
                    <FontAwesomeIcon icon={["fad", "spinner"]} spin size="5x" />
                  </LoadingContainer>
                )
                : (
                  <ListItemMain>
                    <ListItemPadding>
                      <ListItemInner>
                        <ListItemSections>
                          <ListItemSection bold={1} span={12} align={"center"}><FontAwesomeIcon icon={["fad", "users"]} /> &nbsp;&nbsp;{`No ${list.title} Found.`}</ListItemSection>
                        </ListItemSections>
                      </ListItemInner>
                    </ListItemPadding>
                  </ListItemMain>
                )
              }
            </>
          )
        }
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams,
  clients: state.clients,
  user: state.user
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ListItems);
