import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { openCreateEventModal } from "../../store/actions/schedule";
import { showNotification } from "../../store/actions/notification";
import { getEvents } from "../../store/actions/schedule";
import EventScheduleCard from "../../Components/EventScheduleCard";
import moment from "moment";
import { isMobile, isTablet } from "react-device-detect";
import { exportSchedule } from "../../store/actions/pdf";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import {
  ScheduleTable,
  ScheduleTablePadding,
  ScheduleColumnHeaders,
  ScheduleColumnHeader,
  NoEventsFound,
  ScheduleDayOfTheWeek,
  ScheduleSection
} from "./style";

const days_of_the_week = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

class Schedule extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    document.title = "Schedule";
    this.state = {
      permissions: account.permissions
    };
  }

  componentDidMount() {
    const { getEvents, schedule } = this.props;
    if (!schedule.list.length) getEvents();
  }

  capitalize = (str, lower = false) =>
    ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());
  ;

  render() {
    const { openCreateEventModal, schedule, exportSchedule } = this.props;
    const { permissions } = this.state;
    const categories = {};
    days_of_the_week.forEach((day) => {
      categories[day] = schedule.list.filter((event) => (event.day_of_the_week === day && event.type === "weekly"));
    });

    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Weekly Schedule</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            {permissions.includes("health-and-life-edit")
              ? <Button secondary blue onClick={() => openCreateEventModal({}, false, false)}>Add Event</Button>
              : null
            }
            {permissions.includes("health-and-life-view") && schedule.list.length
              ? <Button secondary blue onClick={() => exportSchedule()}>Export</Button>
              : null
            }
          </PageAction>
        </Page>
        <ScheduleTable>
          <ScheduleTablePadding>
            <Row>
              {
                days_of_the_week.map((day, day_index) => {
                  const day_events = categories[day];
                  day_events.sort((d1, d2) => moment(d1.start_time, ["h:mm A"]) - moment(d2.start_time, ["h:mm A"]));
                  return (
                    <ScheduleSection key={day_index} span={12}>
                      <ScheduleDayOfTheWeek>{this.capitalize(day)}</ScheduleDayOfTheWeek>
                      {day_events.length
                        ? (
                          <Col span={12}>
                            <ScheduleColumnHeaders>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Title</ScheduleColumnHeader>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Location</ScheduleColumnHeader>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Assistant</ScheduleColumnHeader>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Start Time</ScheduleColumnHeader>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>End Time</ScheduleColumnHeader>
                              <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Actions</ScheduleColumnHeader>
                            </ScheduleColumnHeaders>
                          </Col>
                        )
                        : null
                      }
                      {!day_events.length
                        ? <NoEventsFound span={12}>{`No events for ${this.capitalize(day)}`}</NoEventsFound>
                        : (
                          <Col span={12}>
                            {
                              day_events.map((day_event, index) => {
                                return <EventScheduleCard key={index} event={day_event} />;
                              })
                            }
                          </Col>
                        )
                      }
                    </ScheduleSection>
                  );
                })
              }
            </Row>
          </ScheduleTablePadding>
        </ScheduleTable>
        <Page>
          <PageHeader span={12} align="left">Non-Weekly Events</PageHeader>
        </Page>
        <ScheduleTable>
          <ScheduleTablePadding>
            <Row>
              {schedule.list.filter((event) => event.type === "non-weekly").length
                ? (
                  <Col span={12}>
                    <ScheduleColumnHeaders>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Title</ScheduleColumnHeader>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Location</ScheduleColumnHeader>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Assistant</ScheduleColumnHeader>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Frequency</ScheduleColumnHeader>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Duration</ScheduleColumnHeader>
                      <ScheduleColumnHeader xs={12} sm={12} md={2} lg={2} xl={2}>Actions</ScheduleColumnHeader>
                    </ScheduleColumnHeaders>
                  </Col>
                )
                : null
              }
              {!schedule.list.filter((event) => event.type === "non-weekly").length
                ? <NoEventsFound span={12}>No Non-Weekly events</NoEventsFound>
                : (
                  <Col span={12}>
                    {
                      schedule.list.filter((event) => event.type === "non-weekly").map((day_event, index) => {
                        return <EventScheduleCard key={index} event={day_event} />;
                      })
                    }
                  </Col>
                )
              }
            </Row>
          </ScheduleTablePadding>
        </ScheduleTable>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  schedule: state.schedule
});
const dispatchToProps = (dispatch) => ({
  openCreateEventModal: (defaults, updating, viewing) => dispatch(openCreateEventModal(defaults, updating, viewing)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  getEvents: () => dispatch(getEvents()),
  exportSchedule: () => dispatch(exportSchedule())
});
export default connect(mapStateToProps, dispatchToProps)(Schedule);
