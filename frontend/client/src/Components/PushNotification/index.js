import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Bounce } from "@gfazioli/react-animatecss";
import { runCustomAction } from "../../store/actions/notification";
import moment from "moment";
import {
  PushNotifications,
  PushNotificationsList,
  PushMain,
  PushPadding,
  PushInner,
  PushSection,
  PushIcon,
  PushTitle,
  PushBody,
  PushMetaRow,
  PushActions,
  PushTime,
  ButtonLink
} from "./style";
import firebase from "../../firebase";
import { getDatabase, ref, remove, onValue, query, orderByChild, limitToFirst, equalTo } from "firebase/database";
import { orderBy } from "lodash";
const db = getDatabase(firebase);

class PushNotification extends Component {

  constructor(props) {
    super(props);
    this.state = {
      locations: {
        top_left: [],
        top_right: [],
        bottom_left: [],
        bottom_right: []
      },
      unsubscribe: null
    };
  }

  componentDidMount() {
    const { user } = this.props;
    let push_ref = query(ref(db, `push/${process.env.REACT_APP_STAGE || "development"}/${user.cognito_id}`), orderByChild("read"), equalTo(false), limitToFirst(16));

    const unsubscribe = onValue(push_ref, (snapshot) => {
      if (snapshot) {
        const locations = {
          top_left: [],
          top_right: [],
          bottom_left: [],
          bottom_right: []
        };
        snapshot.forEach((notification) => {
          const childKey = notification.key;
          const childData = notification.val();
          const is_same_day = (moment(childData.created_at)).isSame(moment(), "day");
          if (childData.sticky || is_same_day) locations[childData.location].push({ key: childKey, ...childData });
          if (!is_same_day && !childData.sticky && moment(childData.created_at).isBefore(moment(), "day")) this.view(childKey);
        });
        this.setState({ locations });
      }
    });
    this.setState({ unsubscribe });
  }

  componentWillUnmount() {
    const { unsubscribe } = this.state;
    if (unsubscribe) unsubscribe();
  }

  view = (id) => {
    const { user } = this.props;
    const push_ref = ref(db, `push/${process.env.REACT_APP_STAGE || "development"}/${user.cognito_id}/${id}`);
    remove(push_ref);
  };

  getIcon = (type) => {
    switch(type) {
      case "error":
        return "exclamation-circle";
      case "info":
        return "info-circle";
      case "success":
        return "check-circle";
      default:
        return "check";
    }
  };

  getButton = (type) => {
    switch (type) {
      case "error":
        return "danger";
      case "info":
        return "warning";
      case "success":
        return "green";
      default:
        return "blue";
    }
  };

  getMessage = (message, user) => {
    return message.replace(/{{([^}]+)}}/g, function (match, string) {
      var fallback = "";
      var stringArr = string.split("|");
      var value = stringArr[0].trim();

      if (stringArr[1]) {
        const matches = stringArr[1].match(/(?!fallback:\s?)(["'].*?["'])/);
        if (matches && matches.length) fallback = matches[0].replace(/["']/g, "").trim();
      }
      return user[value] ? user[value] : fallback;
    });
  };

  runFunction = (key, href) => {
    const { runCustomAction } = this.props;
    runCustomAction(href.split("function: ")[1]);
    this.view(key);
  }

  render() {
    const { navigateTo, user } = this.props;
    let { locations } = this.state;

    return (
      <>
        {Object.keys(locations).map((key, index) => {
          const notifications = orderBy(locations[key], "created_at", key.includes("bottom") ? "asc" : "desc");
          let delay = 0;
          if (notifications.length) {
            return (
              <PushNotifications key={index} location={key}>
                <PushNotificationsList>
                  {notifications.slice(0, 4).map((notification, index) => {
                    delay = delay + 0.1;
                    const button_type = this.getButton(notification.type);
                    const is_in_app_link = (notification.href && notification.href_text) && !notification.href.includes("http") && !notification.href.includes("function:");
                    const is_external_link = (notification.href && notification.href_text) && notification.href.includes("http");
                    const is_function = (notification.href && notification.href_text) && notification.href.includes("function:");
                    return (
                      <Bounce key={index} as="li" animate={true} direction={notification.location.includes("top") ? notification.location.split("_")[1] : "up"} mode="in" delay={`${delay}s`}>
                        <PushMain>
                          <PushPadding>
                            <PushInner type={notification.type}>
                              <PushSection span={3}>
                                <PushIcon>
                                  <FontAwesomeIcon icon={["fad", this.getIcon(notification.type)]} />
                                </PushIcon>
                              </PushSection>
                              <PushSection span={9}>
                                {notification.title
                                  ? <PushTitle>{notification.title}</PushTitle>
                                  : null
                                }
                                <PushBody has_title={notification.title ? 1 : 0}>{this.getMessage(notification.message.replaceAll("\\n", "\n"), user)}</PushBody>
                              </PushSection>
                              <PushSection span={12}>
                                <PushMetaRow>
                                  <PushTime hide_buttons={notification.hide_buttons ? 1 : 0} span={12}>Sent on {moment(notification.created_at).format("MM/DD/YYYY [at] h:mm a")}{notification.by ? ` by ${notification.by}` : null}</PushTime>
                                </PushMetaRow>
                              </PushSection>
                            {!notification.hide_buttons
                              ? (
                                  <PushSection span={12}>
                                    <PushActions gutter={20}>
                                      <PushSection span={6}>
                                      {is_in_app_link
                                        ? <Button widthPercent={100} nohover nomargin small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0} onClick={() => {
                                          navigateTo(notification.href);
                                          this.view(notification.key);
                                        }}>{notification.href_text}</Button>
                                        : null
                                      }
                                      {is_external_link
                                        ? <ButtonLink rel="noreferrer" href={notification.href} target="_blank"><Button widthPercent={100} nohover nomargin small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0}>{notification.href_text}</Button></ButtonLink>
                                        : null
                                      }
                                      {is_function
                                        ? <Button onClick={() => this.runFunction(notification.key, notification.href)} widthPercent={100} nohover nomargin small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0}>{notification.href_text}</Button>
                                        : null
                                      }
                                      </PushSection>
                                      <PushSection span={(is_external_link || is_in_app_link || is_function) ? 6 : 12}>
                                        <Button widthPercent={100} nohover nomargin small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0} onClick={() => this.view(notification.key)}>Close</Button>
                                      </PushSection>
                                    </PushActions>
                                  </PushSection>
                              )
                              : null
                            }
                            </PushInner>
                          </PushPadding>
                        </PushMain>
                      </Bounce>
                    );
                  })}
                </PushNotificationsList>
              </PushNotifications>
            );
          }
          return null;
        })}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  runCustomAction: (action) => dispatch(runCustomAction(action))
});
export default connect(mapStateToProps, dispatchToProps)(PushNotification);
