import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
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

class PushNotification extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  getIcon = (type) => {
    switch(type) {
      case "error":
        return "exclamation-circle";
      case "info":
        return "exclamation";
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

      if (stringArr[1] && string.includes("fallback")) { 
        const matches = stringArr[1].match(/(?!fallback:\s?)(["'].*?["'])/);
        if (matches && matches.length) fallback = matches[0].replace(/["']/g, "").trim();
      }
      return user[value] ? user[value] : fallback;
    });
  };

  render() {
    const { user, navigateTo, notification, selected_users, omit_name } = this.props;
    const button_type = this.getButton(notification.type);
    const is_in_app_link = (notification.href && notification.href_text) && !notification.href.includes("http") && !notification.href.includes("function:");
    const is_external_link = (notification.href && notification.href_text) && notification.href.includes("http");
    const is_function = (notification.href && notification.href_text) && notification.href.includes("function:");
    return (
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
              <PushBody has_title={notification.title ? 1 : 0}>{this.getMessage(notification.message, selected_users.length ? selected_users[0].user : user)}</PushBody>
            </PushSection>
            <PushSection span={12}>
              <PushMetaRow>
                <PushTime hide_buttons={notification.hide_buttons ? 1 : 0} span={12}>Sent on {moment(notification.created_at || Date.now()).format("MM/DD/YYYY [at] h:mm a")}{omit_name ? null : ` by ${user.first_name} ${user.last_name}`}</PushTime>
              </PushMetaRow>
            </PushSection>
            {!notification.hide_buttons
              ? (
                <PushSection span={12}>
                  <PushActions gutter={20}>
                    <PushSection span={6}>
                      {is_in_app_link
                        ? <Button widthPercent={100} nohover nomargin outline rounded small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0} onClick={() => navigateTo(notification.href)}>{notification.href_text}</Button>
                        : null
                      }
                      {is_external_link
                        ? <ButtonLink rel="noreferrer" href={notification.href} target="_blank"><Button widthPercent={100} nohover nomargin outline rounded small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0}>{notification.href_text}</Button></ButtonLink>
                        : null
                      }
                      {is_function
                        ? <Button role="button "widthPercent={100} nohover nomargin outline rounded small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0}>{notification.href_text}</Button>
                        : null
                      }
                    </PushSection>
                    <PushSection span={(is_external_link || is_in_app_link || is_function) ? 6 : 12}>
                      <Button widthPercent={100} nohover nomargin outline rounded small danger={button_type === "danger" ? 1 : 0} green={button_type === "green" ? 1 : 0} warning={button_type === "warning" ? 1 : 0}>Close</Button>
                    </PushSection>
                  </PushActions>
                </PushSection>
              )
              : null
            }
          </PushInner>
        </PushPadding>
      </PushMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(PushNotification);
