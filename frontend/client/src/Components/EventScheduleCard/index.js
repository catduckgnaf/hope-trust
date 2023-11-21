import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { toastr } from "react-redux-toastr";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import { openCreateEventModal, deleteEvent, deleteBulkEvents, week_day_colors } from "../../store/actions/schedule";
import {
  EventScheduleCardMain,
  EventScheduleCardPadding,
  EventScheduleCardInner,
  EventScheduleCardSection,
  EventScheduleCardSectionText,
  MobileLabel
} from "./style";

class EventScheduleCard extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      permissions: account.permissions
    };
  }

  deleteEvent = (id, series_id) => {
    const { deleteEvent, deleteBulkEvents, event, schedule } = this.props;
    const deleteOptions = {
      onOk: () => deleteEvent(id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete Single",
      cancelText: "Cancel"
    };
    if (event.type === "weekly" && (event.series_id && schedule.list.filter((s) => s.series_id === event.series_id).length > 1)) {
      deleteOptions["buttons"] = [
        { text: "Delete All", handler: () => deleteBulkEvents(series_id) },
        { cancel: true }
      ];
    }
    toastr.confirm("Are you sure you want to delete this event?", deleteOptions);
  };

  render() {
    const { event, openCreateEventModal } = this.props;
    const { permissions } = this.state;
    return (
      <EventScheduleCardMain>
        <EventScheduleCardPadding>
          <EventScheduleCardInner color={week_day_colors[event.day_of_the_week] ? week_day_colors[event.day_of_the_week].color : "grey"}>
            <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Title: </MobileLabel><EventScheduleCardSectionText transform="capitalize">{event.title}</EventScheduleCardSectionText>
            </EventScheduleCardSection>
            <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Location: </MobileLabel><EventScheduleCardSectionText transform="capitalize">{event.location || "N/A"}</EventScheduleCardSectionText>
            </EventScheduleCardSection>
            <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Assistant: </MobileLabel><EventScheduleCardSectionText transform="capitalize">{(event.assistance && event.assistant) ? event.assistant : (event.assistance) ? "Anyone" : "N/A"}</EventScheduleCardSectionText>
            </EventScheduleCardSection>
            {event.type === "weekly"
              ? (
                <>
                  <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                    <MobileLabel>Start Time: </MobileLabel><EventScheduleCardSectionText>{event.start_time}</EventScheduleCardSectionText>
                  </EventScheduleCardSection>
                  <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                    <MobileLabel>End Time: </MobileLabel><EventScheduleCardSectionText>{event.end_time ? event.end_time : "N/A"}</EventScheduleCardSectionText>
                  </EventScheduleCardSection>
                </>
              )
              : null
            }
            {event.type === "non-weekly"
              ? (
                <>
                  <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                    <MobileLabel>Frequency: </MobileLabel><EventScheduleCardSectionText transform="capitalize">{event.frequency || "N/A"}</EventScheduleCardSectionText>
                  </EventScheduleCardSection>
                  <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                    <MobileLabel>Duration: </MobileLabel><EventScheduleCardSectionText>{event.duration || "N/A"}</EventScheduleCardSectionText>
                  </EventScheduleCardSection>
                </>
              )
              : null
            }
            <EventScheduleCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>

              {permissions.includes("health-and-life-edit")
                ? (
                  <EventScheduleCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateEventModal(event, true, false)}>Edit</Button>
                    <Button nomargin danger small onClick={() => this.deleteEvent(event.id, event.series_id)}>Delete</Button>
                  </EventScheduleCardSectionText>
                )
                : (
                  <EventScheduleCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateEventModal(event, false, true)}>View</Button>
                  </EventScheduleCardSectionText>
                )
              }
            </EventScheduleCardSection>
          </EventScheduleCardInner>
        </EventScheduleCardPadding>
      </EventScheduleCardMain>
    );
  }
}
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  schedule: state.schedule
});
const dispatchToProps = (dispatch) => ({
  deleteEvent: (id) => dispatch(deleteEvent(id)),
  deleteBulkEvents: (id) => dispatch(deleteBulkEvents(id)),
  openCreateEventModal: (defaults, updating, viewing) => dispatch(openCreateEventModal(defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(EventScheduleCard);
