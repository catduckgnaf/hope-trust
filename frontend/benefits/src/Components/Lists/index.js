import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListItems from "../../Components/ListItems";
import {
  ListContainer,
  ListContainerPadding,
  ListContainerInner,
  Lists,
  ListPadding,
  ListInner,
  ListBody,
  ListHeader,
  HeaderInner,
  HeaderSection,
  ListItem,
  ListItemPadding,
  ListItemKey,
  ListItemSections,
  ListItemSection,
  SearchContainer,
  SearchSelectWrapper,
  SearchSelect,
  LoadingIcon
} from "./style";
import { Button, SelectLabel } from "../../global-components";
class List extends Component {

  constructor(props) {
    super(props);
    this.state = {
      extended: false,
      filter: {},
      is_searching_clients: false,
      search_on: ""
    };
  }

  refreshData = (list) => {
    list.action(true);
    this.clearFilter(list.title);
  };

  filterList = (event) => {
    this.setState({ is_searching_clients: (event.target.title === "Clients"), [`search_query_${event.target.title}`]: (isNaN(event.target.value) ? event.target.value : Number(event.target.value) ), search_on: event.target.options[event.target.options.selectedIndex].getAttribute("search_on") });
  };

  filterBy = (key, value, title) => {
    this.setState({ is_searching_clients: (title === "Clients"), filter: { key, value, [`is_filtering_${title}`]: true } });
  };

  clearFilter = (title) => {
    this.setState({ is_searching_clients: false, [`search_query_${title}`]: "", search_on: "", filter: { key: "", value: "", [`is_filtering_${title}`]: false } });
    if (this[`filterInput${title}`]) this[`filterInput${title}`].value = "";
  };

  render() {
    const { active_lists } = this.props;
    const { filter, search_on, is_searching_clients } = this.state;
    return (
      <ListContainer span={12}>
        <ListContainerPadding>
          <ListContainerInner gutter={20}>
            {active_lists.filter((l) => l.render).map((list, index) => {
              const path = list.redux_key;
              const data = this.props[path[0]];
              let list_columns = list.columns;
              let searchable = data.list;
              let search_query = this.state[`search_query_${list.title}`];
              if (list.transform_results) searchable = list.transform_results(data.list);
              if (search_query) searchable = data.list.filter((d) => d[search_on] === search_query);
              if (filter[`is_filtering_${list.title}`]) searchable = searchable.filter((item) => item[filter.key] === filter.value);

              return (
                <Lists key={index} onDoubleClick={() => this.setState({ [`${list.title}_extended`]: !this.state[`${list.title}_extended`] })} xs={12} sm={12} md={this.state[`${list.title}_extended`] ? 12 : list.span} lg={this.state[`${list.title}_extended`] ? 12 : list.span} xl={this.state[`${list.title}_extended`] ? 12 : list.span}>
                  <ListPadding>
                    <ListInner>
                      <ListBody>
                        <ListHeader span={12}>
                          <HeaderInner>
                            <HeaderSection span={6} align="left">{list.title}{data.isFetching ? <LoadingIcon><FontAwesomeIcon icon={["fad", "spinner"]} spin /></LoadingIcon> : ` (${searchable.length})`}</HeaderSection>
                            <HeaderSection span={6} align="right">
                              {list.buttons && list.buttons.length
                                ? (
                                  <>
                                    {list.buttons.map((button, index) => {
                                      if (button.show && !button.wrapper) return <Button key={index} marginright={10} small blue={button.type === "blue" ? 1 : 0} green={button.type === "green" ? 1 : 0} danger={button.type === "danger" ? 1 : 0} outline nomargin nohover type="button" onClick={() => button.action()}>{button.loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : button.text}</Button>
                                      if (button.show && button.wrapper) {
                                        return (
                                          <button.wrapper.Component {...button.wrapper.props} key={index} data={searchable}>
                                            <Button key={index} marginright={10} small blue={button.type === "blue" ? 1 : 0} green={button.type === "green" ? 1 : 0} danger={button.type === "danger" ? 1 : 0} outline nomargin nohover type="button" onClick={() => button.action()}>{button.loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : button.text}</Button>
                                          </button.wrapper.Component>
                                        );
                                      }
                                      return null;
                                    })}
                                  </>
                                )
                                : null
                              }
                              <Button small blue marginright={10} outline nomargin nohover type="button" onClick={() => this.refreshData(list)}>{data.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
                              {search_query || filter[`is_filtering_${list.title}`]
                                ? <Button small blue outline nomargin nohover type="button" onClick={() => this.clearFilter(list.title)}>Clear Filter</Button>
                                : null
                              }
                            </HeaderSection>
                          </HeaderInner>
                        </ListHeader>
                        {list.filterable.length
                          ? (
                            <SearchContainer>
                              <SearchSelectWrapper>
                              <SelectLabel>
                                <SearchSelect ref={(input) => this[`filterInput${list.title}`] = input} title={list.title} defaultValue="" onChange={this.filterList}>
                                  <option disabled value="">Filter by {list.filterable.map((filter) => filter.label).join(", ")}:</option>
                                  {list.filterable.length === 1
                                    ? (
                                      <>
                                        {list.filterable.map((filter) => {
                                          const items = [...this.props[filter.key].list, ...(filter.static ? filter.static : [])];
                                          return items.map((a, index) => {
                                            return (
                                              <option key={index} value={a[filter.on]} search_on={filter.on}>{a.name ? a.name : a.account_name}</option>
                                            );
                                          });
                                        })}
                                      </>
                                    )
                                    : null
                                  }
                                  {list.filterable.length > 1
                                    ? (
                                      <>
                                        {list.filterable.map((filter, opt_index) => {
                                          const items = [...this.props[filter.key].list, ...(filter.static ? filter.static : [])];
                                          if (items.length) {
                                            return (
                                              <optgroup key={opt_index} label={filter.label}>
                                                {items.map((a, index) => {
                                                  return (
                                                    <option key={index} value={a[filter.on]} search_on={filter.on}>{a.name ? a.name : a.account_name}</option>
                                                  );
                                                })}
                                              </optgroup>
                                            );
                                          }
                                          return null;
                                        })}
                                      </>
                                    )
                                    : null
                                  }
                                </SearchSelect>
                              </SelectLabel>
                            </SearchSelectWrapper>
                            </SearchContainer>
                          )
                          : null
                        }
                        <ListItem sticky={1}>
                          <ListItemPadding>
                            <ListItemKey>
                              <ListItemSections>
                                {list_columns.map((column_title, index) => {
                                  return <ListItemSection key={index} bold={1}>{column_title}</ListItemSection>;
                                })}
                              </ListItemSections>
                            </ListItemKey>
                          </ListItemPadding>
                        </ListItem>
                        <ListItems filter={filter} filterBy={this.filterBy} list={list} search_query={search_query} search_on={search_on} is_searching_clients={is_searching_clients} />
                      </ListBody>
                    </ListInner>
                  </ListPadding>
                </Lists>
              );
            })}
          </ListContainerInner>
        </ListContainerPadding>
      </ListContainer>
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
  session: state.session
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(List);
