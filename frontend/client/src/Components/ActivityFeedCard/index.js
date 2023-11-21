import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../global-components";
import { isMobileOnly } from "react-device-detect";
import { openTicketModal } from "../../store/actions/request";
import {
  ActivityFeedCardMain,
  ActivityFeedCardPadding,
  ActivityFeedCardInner,
  ActivityFeedCardIcon,
  ActivityFeedCardIconRow,
  ActivityFeedCardIconCol,
  ActivityFeedCardIconImageLabel,
  ActivityFeedCardBody,
  ActivityFeedCardItem,
  ActivityFeedCardItemInner,
  ItemStrong,
  ActivityFeedCardActions,
  ActivityFeedCardActionsInner,
  ActivityFeedCardAction,
  ActivityFeedCardActionInner
} from "./style";

class ActivityFeedCard extends Component {
  static propTypes = {
    active: PropTypes.bool,
    ticket: PropTypes.instanceOf(Object).isRequired,
    span: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    openTicketModal: PropTypes.func.isRequired,
    swap: PropTypes.bool,
  };
  static defaultProps = {
    active: false,
    swap: true
  };

  render() {
    const { active, ticket, span, icon, openTicketModal, swap, current_page } = this.props;
    return (
      <ActivityFeedCardMain span={span}>
        <ActivityFeedCardPadding>
          <ActivityFeedCardInner status={ticket.status} type={ticket.request_type}>
            {!isMobileOnly
              ? (
                <ActivityFeedCardIcon xs={3} sm={3} md={2} lg={2} xl={1}>
                  <ActivityFeedCardIconRow>
                    <ActivityFeedCardIconCol span={12}>
                      <FontAwesomeIcon icon={["fad", icon]} swapOpacity={swap} />
                    </ActivityFeedCardIconCol>
                    <ActivityFeedCardIconCol span={12}>
                      <ActivityFeedCardIconImageLabel>{ticket.request_type === "other_request_type" ? "Other" : ticket.request_type.replace(/_/g, " ")}</ActivityFeedCardIconImageLabel>
                    </ActivityFeedCardIconCol>
                  </ActivityFeedCardIconRow>
                </ActivityFeedCardIcon>
              )
              : null 
            }
            <ActivityFeedCardBody paddingleft={isMobileOnly ? 10 : 0} xs={isMobileOnly ? 10 : 7} sm={isMobileOnly ? 10 : 7} md={9} lg={9} xl={10}>
              <ActivityFeedCardItem>
                <ActivityFeedCardItemInner span={12} transform="capitalize">
                  <ItemStrong>Coordinator:</ItemStrong> {ticket.assignee ? `${ticket.assignee_first} ${ticket.assignee_last}` : "Pending assignment"}
                </ActivityFeedCardItemInner>
                <ActivityFeedCardItemInner span={12} transform="capitalize">
                  <ItemStrong>Priority:</ItemStrong> {ticket.priority}
                </ActivityFeedCardItemInner>
                <ActivityFeedCardItemInner span={12} transform="capitalize">
                  {ticket.request_type === "permission"
                    ? (
                      <>
                        <ItemStrong>Status:</ItemStrong> {ticket.permission_status || ticket.status}
                      </>
                    )
                    : (
                      <>
                        <ItemStrong>Status:</ItemStrong> {ticket.status}
                      </>
                    )
                  }
                </ActivityFeedCardItemInner>
                <ActivityFeedCardItemInner span={12} transform="capitalize">
                  <ItemStrong>Description:</ItemStrong> {ticket.permission ? `${ticket.permission.split("-").join(" ")} permission requested` : `${ticket.title}`}
                </ActivityFeedCardItemInner>
                <ActivityFeedCardItemInner span={12}>
                  <ItemStrong>Created:</ItemStrong> {moment(ticket.created_at).format("MMMM DD, YYYY [at] h:mm A")} by {ticket.creator_first} {ticket.creator_last}
                </ActivityFeedCardItemInner>
                <ActivityFeedCardItemInner span={12}>
                  <ItemStrong>Comments:</ItemStrong> {ticket.comments ? ticket.comments.length : 0}
                </ActivityFeedCardItemInner>
              </ActivityFeedCardItem>
            </ActivityFeedCardBody>
            <ActivityFeedCardActions xs={2} sm={2} md={1} lg={1} xl={1}>
              <ActivityFeedCardActionsInner>
                <ActivityFeedCardAction span={12}>
                  <ActivityFeedCardActionInner type="view">
                    <Button nomargin blue small onClick={() => openTicketModal(ticket, current_page)}>{active ? <FontAwesomeIcon icon={["fad", "spinner"]} spin swapOpacity /> : "View"}</Button>
                  </ActivityFeedCardActionInner>
                </ActivityFeedCardAction>
              </ActivityFeedCardActionsInner>
            </ActivityFeedCardActions>
          </ActivityFeedCardInner>
        </ActivityFeedCardPadding>
      </ActivityFeedCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  openTicketModal: (ticket, current_page) => dispatch(openTicketModal(ticket, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(ActivityFeedCard);
