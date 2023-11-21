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
  getTicketById,
  getRequests
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

class UpcomingServiceRequests extends Component {
  static propTypes = {
    getTicketById: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { request } = props;
    const upcomingTickets = request.tickets.filter((ticket) => ticket.request_type !== "money" && ticket.request_type !== "permission");
    this.state = {
      tickets: upcomingTickets,
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

  async componentDidMount() {
    const { getRequests, request } = this.props;
    if (!request.requested && !request.isFetching) await getRequests();
  }

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
                      let icon = "file";
                      if (ticket.request_type === "food") icon = "utensils";
                      if (ticket.request_type === "medical") icon = "hospital-alt";
                      if (ticket.request_type === "transportation") icon = "car-bus";
                      if (ticket.request_type === "other_request_type") icon = "user-headset";
                      if (ticket.request_type === "account update") icon = "user-check";
                      if (ticket.request_type === "new_relationship") icon = "users";
                      if (ticket.request_type === "professional_portal_assistance") icon = "user-headset";
                      if (ticket.request_type === "new_partner") icon = "user-tie";
                      return (
                        <TicketsListCardMain xs={12} sm={6} md={6} lg={12} xl={12} key={index}>
                          <TicketsListCardPadding>
                            <TicketsListCardInner onClick={() => this.getTicketById(ticket.id)}>
                              <TicketsListCardInnerSection type={ticket.request_type} span={1} text_align="center">{this.state[`is_loading_${ticket.id}`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fad", icon]} />}</TicketsListCardInnerSection>
                              <TicketsListCardInnerSection span={isMobile ? 7 : 3} text_align="left" transform="capitalize" overflow={1}>{ticket.request_type.replace(/_/g, " ")}</TicketsListCardInnerSection>
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
                      <FontAwesomeIcon icon={["fad", "clipboard-list-check"]} />
                    </ErrorIcon>
                    <ErrorMessage span={12}>You do not have any upcoming service requests.</ErrorMessage>
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
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  getRequests: (override) => dispatch(getRequests(override))
});
export default connect(mapStateToProps, dispatchToProps)(UpcomingServiceRequests);
