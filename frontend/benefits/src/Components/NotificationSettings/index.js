import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import ToggleSwitch from "../ToggleSwitch";
import { updateUserNotificationPreferences } from "../../store/actions/settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SwitchGroup,
  SwitchLabel,
  SwitchLabelText,
  RowSectionLegend
} from "../../Pages/Settings/style";
import { SaveNotificationSettingsButton } from "./style";

class NotificationSettings extends Component {

  static propTypes = {
    updateUserNotificationPreferences: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { settings } = props;
    this.state = {
      notificationInfo: settings.notifications,
      is_loading: false
    };
  }

  setNotificationSetting = (event) => {
    let { notificationInfo } = this.state;
    notificationInfo[event.target.id] = event.target.checked;
    this.setState({ notificationInfo });
  };

  saveNotificationSettings = async () => {
    const { notificationInfo } = this.state;
    const { updateUserNotificationPreferences, showNotification } = this.props;
    this.setState({ is_loading: true });
    await updateUserNotificationPreferences(notificationInfo);
    this.setState({ is_loading: false });
    showNotification("success", "", "Notification settings updated.");
  };

  render() {
    const { notificationInfo, is_loading } = this.state;
    return (
      <RowBody>
        <RowHeader>
          <Row>
            <Col>Administration</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
        </RowContentSection>
        <RowContentSection span={12}>
          <RowBodyPadding>
            <RowContentSection xs={12} sm={6} md={6} lg={6} xl={6}>
              <SwitchGroup>
                <RowSectionLegend span={12} marginbottom={20}>SMS Notifications</RowSectionLegend>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when a money distribution is complete</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="money_distribution_sms"
                  float="right"
                  checked={!!notificationInfo.money_distribution_sms}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>
              <SwitchGroup>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when a service is scheduled</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="service_scheduled_sms"
                  float="right"
                  checked={!!notificationInfo.service_scheduled_sms}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>
              <SwitchGroup>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when an appointment is upcoming</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="appointment_upcoming_sms"
                  float="right"
                  checked={!!notificationInfo.appointment_upcoming_sms}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>

              <SwitchGroup>
                <RowSectionLegend span={12} margintop={20} marginbottom={20}>Email Notifications</RowSectionLegend>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when a money distribution is complete</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="money_distribution_email"
                  float="right"
                  checked={!!notificationInfo.money_distribution_email}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>
              <SwitchGroup>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when a service is scheduled</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="service_scheduled_email"
                  float="right"
                  checked={!!notificationInfo.service_scheduled_email}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>
              <SwitchGroup>
                <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                  <SwitchLabelText>Notify me when an appointment is upcoming</SwitchLabelText>
                </SwitchLabel>
                <ToggleSwitch
                  label="Off"
                  label2="On"
                  id="appointment_upcoming_email"
                  float="right"
                  checked={!!notificationInfo.appointment_upcoming_email}
                  onChange={this.setNotificationSetting}
                />
              </SwitchGroup>
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection span={12}>
          <SaveNotificationSettingsButton onClick={() => this.saveNotificationSettings()} green outline>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Notification Preferences"}</SaveNotificationSettingsButton>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  settings: state.settings
});
const dispatchToProps = (dispatch) => ({
  updateUserNotificationPreferences: (updates) => dispatch(updateUserNotificationPreferences(updates)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
});
export default connect(mapStateToProps, dispatchToProps)(NotificationSettings);
