import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { navigateTo } from "../../store/actions/navigation";
import Container from "../../Components/Container";
import { orderBy } from "lodash";
import { isMobile } from "react-device-detect";
import {
  getTicketById
} from "../../store/actions/request";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import {
  TicketListMain,
  TicketsListPadding,
  TicketsListInner,
  TicketsListCardMain,
  TicketsListCardPadding,
  TicketsListCardInner,
  TicketsListCardInnerSection
} from "./style";

class MoneyRequests extends Component {
  static propTypes = {
    getTicketById: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { request } = props;
    const moneyTickets = request.tickets.filter((ticket) => ticket.request_type === "money");
    this.state = {
      tickets: moneyTickets,
      isLoading: false
    };
  }

  getTicketById = async (ticket_id) => {
    const { getTicketById } = this.props;
    this.setState({ [`is_loading_${ticket_id}`]: true });
    await getTicketById(ticket_id);
    this.setState({ [`is_loading_${ticket_id}`]: false });
  };

  getCommenter = (cognito_id) => {
    const { relationship } = this.props;
    const owner = relationship.list.find((u) => u.cognito_id === cognito_id);
    if (owner) return { ...owner, avatar: owner.avatar, isOperator: false };
    return false;
  };

  render() {
    const { navigateTo, type, span, height } = this.props;
    const { tickets } = this.state;
    return (
      <Container title={type} viewall={{ title: "View All", func: () => navigateTo("/activity-feed") }} xs={12} sm={12} md={12} lg={span} xl={span} height={height} overflow="auto">
        {tickets.length
          ? (
            <TicketListMain>
              <TicketsListPadding span={12}>
                <TicketsListInner gutter={isMobile ? 20 : 0}>
                  {
                    orderBy(tickets, "created_at", "desc").slice(0, 10).map((ticket, index) => {
                      const owner = this.getCommenter(ticket.cognito_id);
                      return (
                        <TicketsListCardMain xs={12} sm={6} md={6} lg={12} xl={12} key={index}>
                          <TicketsListCardPadding>
                            <TicketsListCardInner onClick={() => this.getTicketById(ticket.id)}>
                              <TicketsListCardInnerSection type={ticket.request_type} span={1} text_align="center">{this.state[`is_loading_${ticket.id}`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fad", "usd-circle"]} />}</TicketsListCardInnerSection>
                              <TicketsListCardInnerSection span={isMobile ? 7 : 3} text_align="left" overflow={1}>${ticket.request_amount}</TicketsListCardInnerSection>
                              {!isMobile
                                ? <TicketsListCardInnerSection span={4} text_align="left" transform="capitalize" overflow={1}>{`Created by ${owner.first_name} ${owner.last_name}`}</TicketsListCardInnerSection>
                                : null
                              }
                              <TicketsListCardInnerSection span={4} text_align="right" paddingright={10} overflow={1}>{moment(ticket.updated_at || ticket.created_at).format("MM/DD/YYYY [at] h:mm A")}</TicketsListCardInnerSection>
                            </TicketsListCardInner>
                          </TicketsListCardPadding>
                        </TicketsListCardMain>
                      );
                    })
                  }
                </TicketsListInner>
              </TicketsListPadding>
            </TicketListMain>
          )
          : (
            <Error span={12}>
              <ErrorPadding>
                <ErrorInner span={12}>
                  <ErrorInnerRow>
                    <ErrorIcon span={12}>
                      <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                    </ErrorIcon>
                    <ErrorMessage span={12}>You do not have any money requests.</ErrorMessage>
                  </ErrorInnerRow>
                </ErrorInner>
              </ErrorPadding>
            </Error>
          )
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  relationship: state.relationship,
  request: state.request
});
const dispatchToProps = (dispatch) => ({
  getTicketById: (id) => dispatch(getTicketById(id)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(MoneyRequests);
