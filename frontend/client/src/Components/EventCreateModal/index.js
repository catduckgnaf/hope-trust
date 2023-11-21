import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import { createEvent, createBulkEvents, updateEvent, updateBulkEvents, closeCreateEventModal, event_titles, event_types, event_frequency, event_durations, times } from "../../store/actions/schedule";
import { openCreateProviderModal } from "../../store/actions/provider";
import { openCreateRelationshipModal } from "../../store/actions/relationship";
import { toastr } from "react-redux-toastr";
import {
  EventMainContent,
  ViewEventModalInner,
  ViewEventModalInnerLogo,
  ViewEventModalInnerLogoImg,
  ViewEventModalInnerHeader,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  InputHint,
  CheckBoxInput,
  TextArea,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import CreatableSelect from "react-select/creatable";
import Select, { components } from "react-select";
import LoaderOverlay from "../LoaderOverlay";
import { uniqBy } from "lodash";
import ReactAvatar from "react-avatar";
import "react-datepicker/dist/react-datepicker.css";

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar size={25} src={props.data.avatar} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

const titles = event_titles.map((name) => {
  return { value: name, label: name };
});

const days_of_the_week_defaults = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday"}
];

class EventCreateModal extends Component {
  constructor(props) {
    super(props);
    const { defaults = {} } = props;
    const days_of_the_week = (defaults.days_of_the_week ? defaults.days_of_the_week.split(",") : []);
    this.state = {
      start_time: defaults.start_time || "",
      end_time: defaults.end_time || "",
      day_of_the_week: defaults.day_of_the_week || "",
      days_of_the_week: days_of_the_week || [],
      title: defaults.title || "",
      assistance: defaults.assistance || false,
      location: defaults.location || "",
      assistant: defaults.assistant || "",
      note: defaults.note || "",
      series_id: defaults.series_id || "",
      type: defaults.type || "weekly",
      frequency: defaults.frequency || "",
      duration: defaults.duration || "",
      has_set_date: defaults.has_set_date || false,
      ignore_conflicts: false
    };
  }

  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    createEvent: PropTypes.func.isRequired,
    updateEvent: PropTypes.func.isRequired
  };

  static defaultProps = {};

  createEvent = async () => {
    const { createEvent, createBulkEvents, showNotification, closeCreateEventModal } = this.props;
    const {
      start_time,
      end_time,
      days_of_the_week,
      title,
      assistance,
      location,
      assistant,
      note,
      type,
      ignore_conflicts
    } = this.state;
    
    if (this.isComplete({ type, title, start_time, days_of_the_week })) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      if (days_of_the_week.length === 1) {
        if (ignore_conflicts || !this.isConflicting(days_of_the_week[0], start_time, end_time, null, "create-single")) {
          const created = await createEvent({
            type,
            start_time,
            end_time,
            day_of_the_week: days_of_the_week[0],
            title,
            assistance,
            location,
            assistant: assistance ? assistant : null,
            note: note ? note.replace("'", "’") : ""
          });
          if (created.success) {
            showNotification("success", "New event created", created.message);
            closeCreateEventModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        }
      } else if (days_of_the_week.length > 1) {
        if (ignore_conflicts || !this.isConflicting(days_of_the_week, start_time, end_time, null, "create-multiple")) {
          const created = await createBulkEvents({
            type,
            start_time,
            end_time,
            days_of_the_week,
            title,
            assistance,
            location,
            assistant: assistance ? assistant : null,
            note: note ? note.replace("'", "’") : ""
          });
          if (created.success) {
            showNotification("success", `${days_of_the_week.length === 1 ? `${days_of_the_week.length} event` : `${days_of_the_week.length} events`} created.`, created.message);
            closeCreateEventModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        }
      }
      this.setState({ loaderShow: false, loaderMessage: "", ignore_conflicts: false });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }
  };

  createNonWeeklyEvent = async () => {
    const { createEvent, showNotification, closeCreateEventModal } = this.props;
    const {
      title,
      assistance,
      location,
      assistant,
      note,
      type,
      frequency,
      duration,
      days_of_the_week,
      has_set_date,
      start_time,
      end_time
    } = this.state;
    
    if (this.isComplete({ type, title, frequency, days_of_the_week })) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createEvent({
        type,
        title,
        assistance,
        location,
        assistant: assistance ? assistant : null,
        note: note ? note.replace("'", "’") : "",
        frequency,
        duration,
        has_set_date,
        days_of_the_week: days_of_the_week.join(","),
        start_time,
        end_time
      });
      if (created.success) {
        showNotification("success", "New event created", created.message);
        closeCreateEventModal();
      } else {
        showNotification("error", "Creation failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "", ignore_conflicts: false });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }
  };

  updateEvent = async (series_id) => {
    const { updateEvent, updateBulkEvents, showNotification, closeCreateEventModal, defaults } = this.props;
    const {
      start_time,
      end_time,
      title,
      assistance,
      location,
      assistant,
      day_of_the_week,
      note,
      ignore_conflicts
    } = this.state;
    if (ignore_conflicts || !this.isConflicting(day_of_the_week, start_time, end_time, defaults.id, "update", series_id)) {
      if (title && start_time) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        if (!series_id) {
          const updated = await updateEvent(defaults.id, {
            start_time,
            end_time,
            title,
            assistance,
            location,
            assistant: assistance ? assistant : null,
            day_of_the_week,
            note: note ? note.replace("'", "’") : ""
          });
          if (updated.success) {
            showNotification("success", "Event updated", updated.message);
            closeCreateEventModal();
          } else {
            showNotification("error", "Update failed", updated.message);
          }
        } else {
          const updated = await updateBulkEvents(series_id, {
            start_time,
            end_time,
            title,
            assistance,
            location,
            assistant: assistance ? assistant : null,
            note
          });
          if (updated.success) {
            showNotification("success", "Events updated", updated.message);
            closeCreateEventModal();
          } else {
            showNotification("error", "Updates failed", updated.message);
          }
        }
        this.setState({ loaderShow: false, loaderMessage: "", ignore_conflicts: false });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateNonWeeklyEvent = async () => {
    const { updateEvent, showNotification, closeCreateEventModal, defaults } = this.props;
    const {
      title,
      assistance,
      location,
      assistant,
      note,
      type,
      frequency,
      duration,
      days_of_the_week,
      has_set_date,
      start_time,
      end_time
    } = this.state;
    if (this.isComplete({ type, title, frequency, days_of_the_week })) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateEvent(defaults.id, {
        title,
        assistance,
        location,
        assistant: assistance ? assistant : null,
        note: note ? note.replace("'", "’") : "",
        frequency,
        duration,
        has_set_date,
        days_of_the_week: days_of_the_week.join(","),
        start_time,
        end_time
      });
      if (updated.success) {
        showNotification("success", "Event updated", updated.message);
        closeCreateEventModal();
      } else {
        showNotification("error", "Update failed", updated.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "", ignore_conflicts: false });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }
  };

  isComplete = ({ type, title, start_time, day_of_the_week, days_of_the_week, frequency }) => {
    if (type === "weekly") {
      return title && start_time && (days_of_the_week.length || day_of_the_week);
    } else if (type === "non-weekly") {
      return title && frequency;
    } else {
      return false;
    }
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name]: difference });
        break;
      case "select-option":
        this.setState({ [actionOptions.name]: Array.isArray(value) ? value.map((e) => e.value) : value.value });
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.setState({ [actionOptions.name]: [...this.state[actionOptions.name], new_option.value] });
        break;
      case "clear":
        this.setState({ [actionOptions.name]: [] });
        break;
      default:
        break;
    }
  };

  capitalize = (str, lower = false) =>
    ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());
  ;

  createNewProvider = (value) => {
    const { openCreateProviderModal } = this.props;
    this.setState({ location: value });
    openCreateProviderModal({ name: value }, false, false);
  };

  createNewRelationship = (value) => {
    const { openCreateRelationshipModal } = this.props;
    let new_relationship;
    const name = value.split(" ");
    if (name.length > 1) {
      new_relationship = { first_name: name[0], last_name: name[1] };
    } else {
      new_relationship = { first_name: name[0] };
    }
    this.setState({ assistant: value });
    openCreateRelationshipModal(new_relationship, false, false);
  };

  createNewPrompt = (type, value, message, action, series_id) => {
    let createOptions;
    switch(type) {
      case "provider":
        createOptions = {
          onOk: () => this.createNewProvider(value),
          onCancel: () => {
            toastr.removeByType("confirms");
            this.setState({ location: "" });
          },
          okText: "Create Provider",
          cancelText: "No Thanks"
        };
        toastr.confirm(`Do you want to create a new ${type}?`, createOptions);
        break;
      case "relationship":
        createOptions = {
          onOk: () => this.createNewRelationship(value),
          onCancel: () => {
            toastr.removeByType("confirms");
            this.setState({ assistant: "" });
          },
          okText: "Create Relatonship",
          cancelText: "No Thanks"
        };
        toastr.confirm(`Do you want to create a new ${type}?`, createOptions);
        break;
      case "conflict":
        createOptions = {
          onOk: () => {
            this.setState({ ignore_conflicts: true }, () => {
              if (action === "create-single") {
                this.createEvent();
              } else if (action === "create-multiple") {
                this.createEvent();
              } else if (action === "update") {
                if (!series_id) this.updateEvent();
                if (series_id) this.updateEvent(series_id);
              }
              toastr.removeByType("confirms");
            });
          },
          onCancel: () => {
            this.setState({ ignore_conflicts: false });
          },
          okText: "Proceed",
          cancelText: "Stop"
        };
        toastr.confirm(message, createOptions);
        break;
      default:
        break;
    }
  };

  isConflicting = (day, start, end, id, action, series_id) => {
    const { schedule } = this.props;
    let conflicting_events = [];
    schedule.list.filter((e) => (e.id !== id) && (e.type === "weekly")).forEach((event) => {
      const day_of_the_week = event.day_of_the_week;
      const days_of_the_week = event.days_of_the_week ? event.days_of_the_week.split(",") : [];
      const multi_check = Array.isArray(day) ? day.some((d) => days_of_the_week.includes(d) || d === day_of_the_week) : false;
      if (day === day_of_the_week || multi_check) {
        const start_time = event.start_time;
        const end_time = event.end_time;
        if (start === start_time && end === end_time) {
          conflicting_events.push(event);
        }
      }
    });
    if (conflicting_events.length) {
      this.createNewPrompt("conflict", null, `There are conflicting events for ${uniqBy(conflicting_events, "day_of_the_week").map((d) => this.capitalize(d.day_of_the_week)).join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")} from ${start} to ${end}`, action, series_id);
    }
    return conflicting_events.length;
  };

  close = () => {
    const { closeCreateEventModal } = this.props;
    this.setState({ ignore_conflicts: true }, () => closeCreateEventModal());
  }

  render() {
    const { creatingEvent, updating, viewing, provider, relationship, schedule } = this.props;
    const { loaderShow, loaderMessage, start_time, end_time, day_of_the_week, days_of_the_week, title, assistance, location, assistant, note, series_id, type, frequency, has_set_date, duration } = this.state;
    const locations = [{ name: "Home", specialty: "General" }, ...provider.list].map((prov) => {
      return {
        value: (prov.contact_first && prov.contact_last) ? `${prov.contact_first} ${prov.contact_last} | ${prov.name} | ${prov.specialty}` : `${prov.name} | ${prov.specialty}`,
        label: (prov.contact_first && prov.contact_last) ? `${prov.contact_first} ${prov.contact_last} | ${prov.name} | ${prov.specialty}` : `${prov.name} | ${prov.specialty}`
      };
    });
    const relationships = relationship.list.filter((r) => r.type !== "beneficiary").map((user) => {
      return {
        value: `${user.first_name} ${user.last_name}`,
        label: `${user.first_name} ${user.last_name}`,
        avatar: user.avatar
      };
    });
    let start_index = 0;
    times.forEach((t, i) => {
      if (t.value === start_time) start_index = i + 1;
    });
    const sliced = times.slice(start_index);
    
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "875px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingEvent} onClose={() => this.close()} center>
        <ViewEventModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewEventModalInnerLogo span={12}>
              <ViewEventModalInnerLogoImg alt="HopeTrust Event Logo" src={icons.colorLogoOnly} />
            </ViewEventModalInnerLogo>
          </Col>
          <EventMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewEventModalInnerHeader span={12}>New Event</ViewEventModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewEventModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Event</ViewEventModalInnerHeader>
                : null
              }

              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Row>
                  {!updating
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Event Type</InputLabel>
                          <Select
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 1000
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isSearchable
                            name="type"
                            placeholder="Choose an event type..."
                            onChange={(t) => this.setState({ type: t.value })}
                            defaultValue={type ? { value: type, label: this.capitalize(type) } : null}
                            options={event_types}
                            isDisabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Title</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 999
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 1000
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 1000
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "13px",
                            lineHeight: "13px"
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          })
                        }}
                        isSearchable
                        name="specialties"
                        placeholder="What type of event is this? Choose one from the list or type a new one..."
                        onChange={(t) => this.setState({ title: t.value})}
                        defaultValue={title ? { value: title, label: this.capitalize(title) } : null}
                        options={titles}
                        formatCreateLabel={(value) => `Click or press Enter to create new event title "${value}"`}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  {type === "non-weekly"
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Frequency</InputLabel>
                          <Select
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 998
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isSearchable
                            name="frequency"
                            placeholder="How often does this event take place?"
                            onChange={(t) => this.setState({ frequency: t.value })}
                            defaultValue={frequency ? { value: frequency, label: this.capitalize(frequency) } : null}
                            options={event_frequency}
                            isDisabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {type === "non-weekly"
                    ? (
                      <Col span={12}>
                        <InputWrapper marginbottom={15}>
                          <InputLabel marginbottom={10}>Does this event occur on specific days or time?</InputLabel>
                          <CheckBoxInput
                            defaultChecked={has_set_date}
                            onChange={(event) => this.setState({ has_set_date: event.target.checked })}
                            type="checkbox"
                            id="has_set_date"
                            disabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {((type === "weekly") || (type === "non-weekly" && has_set_date))
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}>{type === "weekly" ? <RequiredStar>*</RequiredStar> : null} {days_of_the_week.length > 1 ? "Days of the week" : "Day of the week"}</InputLabel>
                          <Select
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 997
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isClearable
                            isSearchable
                            isMulti={day_of_the_week ? false : true}
                            name={day_of_the_week ? "day_of_the_week" : "days_of_the_week"}
                            placeholder="What day of the week does this event take place? (please select all that apply)"
                            backspaceRemovesValue={true}
                            onChange={this.updateSelectInput}
                            value={day_of_the_week.length ? { value: day_of_the_week, label: this.capitalize(day_of_the_week) } : days_of_the_week.filter((e) => e)
                            .map((s) => {
                              return { value: s, label: this.capitalize(s) };
                            })
                            }
                            options={days_of_the_week_defaults}
                            isDisabled={viewing}
                          />
                          {!updating && !viewing
                            ? (
                              <InputHint>
                                <Button small blue nomargin onClick={() => this.setState({ day_of_the_week: "", days_of_the_week: days_of_the_week_defaults.map((d) => d.value)})}>Select All</Button>
                              </InputHint>
                            )
                            : null
                          }
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {type === "non-weekly" && has_set_date
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}>Event Duration</InputLabel>
                          <Select
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 996
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isSearchable
                            name="duration"
                            placeholder="How long does this event take?"
                            onChange={(t) => this.setState({ duration: t.value })}
                            defaultValue={duration ? { value: duration, label: duration } : null}
                            options={event_durations}
                            isDisabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {type === "weekly" || (type === "non-weekly" && has_set_date)
                    ? (
                      <>
                        <Col span={6}>
                          <InputWrapper>
                            <InputLabel marginbottom={10}>{type === "weekly" ? <RequiredStar>*</RequiredStar> : null} Start Time</InputLabel>
                            <Select
                              styles={{
                                container: (base, state) => ({
                                  ...base,
                                  opacity: state.isDisabled ? ".5" : "1",
                                  backgroundColor: "transparent",
                                  zIndex: 995
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  borderRadius: "15px",
                                  padding: "2px 10px"
                                }),
                                menu: (base) => ({
                                  ...base,
                                  zIndex: 1000
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 1000
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  fontWeight: 300,
                                  fontSize: "13px",
                                  lineHeight: "13px"
                                }),
                                control: (base) => ({
                                  ...base,
                                  ...SelectStyles
                                }),
                                valueContainer: (base) => ({
                                  ...base,
                                  fontSize: "13px",
                                  paddingLeft: 0
                                })
                              }}
                              isSearchable
                              name="start_time"
                              placeholder="Choose a start time..."
                              onChange={(t) => this.setState({ start_time: t.value })}
                              defaultValue={start_time ? { value: start_time, label: start_time } : null}
                              options={times}
                              isDisabled={viewing}
                            />
                          </InputWrapper>
                        </Col>

                        <Col span={6}>
                          <InputWrapper>
                            <InputLabel marginbottom={10}>End Time</InputLabel>
                            <Select
                              styles={{
                                container: (base, state) => ({
                                  ...base,
                                  opacity: state.isDisabled ? ".5" : "1",
                                  backgroundColor: "transparent",
                                  zIndex: 994
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  borderRadius: "15px",
                                  padding: "2px 10px"
                                }),
                                menu: (base) => ({
                                  ...base,
                                  zIndex: 1000
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 1000
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  fontWeight: 300,
                                  fontSize: "13px",
                                  lineHeight: "13px"
                                }),
                                control: (base) => ({
                                  ...base,
                                  ...SelectStyles
                                }),
                                valueContainer: (base) => ({
                                  ...base,
                                  fontSize: "13px",
                                  paddingLeft: 0
                                })
                              }}
                              isSearchable
                              name="end_time"
                              placeholder="Choose an end time..."
                              onChange={(t) => this.setState({ end_time: t.value })}
                              defaultValue={end_time ? { value: end_time, label: end_time } : null}
                              options={sliced}
                              isDisabled={viewing}
                            />
                          </InputWrapper>
                        </Col>
                      </>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Location</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 993
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 1000
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 1000
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "13px",
                            lineHeight: "13px"
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          })
                        }}
                        isSearchable
                        name="location"
                        placeholder="Where does this event take place? Choose one from the list or type a new one..."
                        onChange={(l) => this.setState({ location: l.value })}
                        onCreateOption={(value) => this.createNewPrompt("provider", value)}
                        value={location ? { value: location, label: location } : null}
                        options={locations}
                        formatCreateLabel={(value) => `Click or press Enter to create new Provider for "${value}"`}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Assistance Required?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={assistance}
                        onChange={(event) => this.setState({ assistance: event.target.checked })}
                        type="checkbox"
                        id="assistance"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  {assistance
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}>Assistant</InputLabel>
                          <CreatableSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 992
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 1000
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            components={{ Option }}
                            isSearchable
                            name="assistant"
                            placeholder="Who assists with this task? Choose from the list or type a new one..."
                            onChange={(l) => this.setState({ assistant: l.value })}
                            onCreateOption={(value) => this.createNewPrompt("relationship", value)}
                            value={assistant ? { value: assistant, label: assistant } : null}
                            options={relationships}
                            formatCreateLabel={(value) => `Click or press Enter to create new Relationship for "${value}"`}
                            isDisabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Note ({255 - note.length} characters remaining)</InputLabel>
                      <TextArea readOnly={viewing} maxLength={255} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} paddingtop={10} placeholder="Add any specific notes about this event..." onChange={(event) => this.setState({ note: event.target.value })} value={note}></TextArea>
                    </InputWrapper>
                  </Col>

                  {!viewing
                    ? (
                      <Col span={12}>
                        {!updating
                          ? (
                            <>
                              {type === "weekly"
                                ? <Button type="button" onClick={() => this.createEvent()} green nomargin>Create Event</Button>
                                : <Button type="button" onClick={() => this.createNonWeeklyEvent()} green nomargin>Create Event</Button>
                              }
                            </>
                          )
                          : (
                            <>
                              {type === "weekly"
                                ? (
                                  <>
                                    <Button type="button" onClick={() => this.updateEvent()} green nomargin>Update Single Event</Button>
                                    {series_id && schedule.list.filter((s) => s.series_id === series_id).length > 1
                                      ? <Button type="button" onClick={() => this.updateEvent(series_id)} green>Update All Events</Button>
                                      : null
                                    }
                                  </>
                                )
                                : <Button type="button" onClick={() => this.updateNonWeeklyEvent()} green nomargin>Update Event</Button>
                              }
                            </>
                          )
                        }
                      </Col>
                    )
                    : null
                  }
                </Row>
              </Col>
              </Row>
          </EventMainContent>
        </ViewEventModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
user: state.user,
  session: state.session,
  provider: state.provider,
  relationship: state.relationship,
  schedule: state.schedule
});
const dispatchToProps = (dispatch) => ({
  closeCreateEventModal: () => dispatch(closeCreateEventModal()),
  createEvent: (record) => dispatch(createEvent(record)),
  createBulkEvents: (record) => dispatch(createBulkEvents(record)),
  updateBulkEvents: (series_id, record) => dispatch(updateBulkEvents(series_id, record)),
  updateEvent: (id, updates) => dispatch(updateEvent(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  openCreateProviderModal: (defaults, updating, viewing) => dispatch(openCreateProviderModal(defaults, updating, viewing)),
  openCreateRelationshipModal: (defaults, updating, viewing) => dispatch(openCreateRelationshipModal(defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(EventCreateModal);
