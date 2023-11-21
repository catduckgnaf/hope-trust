import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closePushNotificationModal, createPush } from "../../store/actions/notification";
import ReactSelect, { createFilter, components } from "react-select";
import PushNotification from "../../Components/PushNotification";
import {
  BenefitsModuleMainContent,
  PushModuleModalInner,
  PushModuleModalInnerLogo,
  PushModuleModalInnerLogoImg,
  PushModuleModalInnerHeader,
  Heading,
  Message
} from "./style";
import {
  Button,
  Input,
  TextArea,
  InputWrapper,
  InputLabel,
  InputHint,
  RequiredStar,
  SelectStyles,
  Select,
  CheckBoxInput
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class PushNotificationModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closePushNotificationModal: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { customer_support, online } = props;
    const users = customer_support.users.filter((u) => u.status === "active").map((user) => {
      return { value: user.cognito_id, label: `${user.first_name} ${user.last_name}`, user };
    });
    const selected_users = online.map((o) => users.find((u) => u.value === o));
    this.state = {
      has_custom_button: false,
      omit_name: false,
      location: "",
      loaderShow: false,
      loaderMessage: "",
      selected_users,
      users,
      hide_buttons: false,
      sticky: false,
      title: "",
      href: "",
      href_text: "",
      type: "",
      message: ""
    };
  }

  update = (key, value) => {
    this.setState({ [key]: value });
  };

  createPush = async () => {
    const { selected_users, location, hide_buttons, sticky, title, href, href_text, type, message, omit_name } = this.state;
    const { createPush, closePushNotificationModal } = this.props;
    this.setState({ loaderShow: true, loaderMessage: `Pushing to ${selected_users.length} ${selected_users.length === 1 ? "user" : "users"}...` });
    const created = await createPush({ location, hide_buttons, sticky, title, href, href_text, type, message }, selected_users, omit_name);
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      closePushNotificationModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
    }
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((item) => item.value !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name]: difference });
        break;
      case "select-option":
        this.setState({ [actionOptions.name]: value });
        break;
      case "clear":
        this.setState({ [actionOptions.name]: [] });
        break;
      default:
        break;
    }
  };

  render() {
    const {
      is_open,
      closePushNotificationModal
    } = this.props;
    const {
      loaderShow,
      loaderMessage,
      users,
      selected_users,
      title,
      href,
      href_text,
      type,
      message,
      sticky,
      hide_buttons,
      has_custom_button,
      omit_name,
      location
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closePushNotificationModal()} center>
        <PushModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <PushModuleModalInnerLogo span={12}>
              <PushModuleModalInnerLogoImg alt="HopeTrust Logo" src={icons.colorLogoOnly} />
            </PushModuleModalInnerLogo>
          </Col>
          <BenefitsModuleMainContent span={12}>
            <Row>
              <PushModuleModalInnerHeader span={12}>New Push Notification</PushModuleModalInnerHeader>
              {type
                ? (
                  <Col span={12}>
                    <Heading>Preview:</Heading>
                    <PushNotification omit_name={omit_name} selected_users={selected_users} notification={{ hide_buttons, title, href, href_text, type, message }} />
                  </Col>
                )
                : null
              }
              <Col span={6}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Notification Type</InputLabel>
                  <Select
                    id="type"
                    value={type || ""}
                    onChange={(event) => this.update(event.target.id, event.target.value)}>
                    <option disabled value="">Choose a notification type</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                    <option value="info">Info</option>
                  </Select>
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Notification Location</InputLabel>
                  <Select
                    id="location"
                    value={location || ""}
                    onChange={(event) => this.update(event.target.id, event.target.value)}>
                    <option disabled value="">Choose a notification location</option>
                    <option value="top_left">Top Left</option>
                    <option value="top_right">Top Right</option>
                    <option value="bottom_left">Bottom Left</option>
                    <option value="bottom_right">Bottom Right</option>
                  </Select>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Who will receive this push notification?</InputLabel>
                  {selected_users.length < users.length
                    ? (
                      <ReactSelect
                        components={{ Option }}
                        filterOption={createFilter({ ignoreAccents: false })}
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent"
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 999
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999
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
                        isMulti
                        name="selected_users"
                        placeholder="Choose one or many users..."
                        onChange={this.updateSelectInput}
                        value={selected_users}
                        options={users}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    )
                    : <Message>{selected_users.length} users selected.</Message>
                  }
                  {!(selected_users.length === users.length)
                    ? (
                      <InputHint>
                        <Button small rounded blue outline nomargin onClick={() => this.setState({ selected_users: users })}>Select All</Button>
                      </InputHint>
                    )
                    : (
                      <InputHint>
                        <Button small rounded blue outline nomargin onClick={() => this.setState({ selected_users: [] })}>Remove All</Button>
                      </InputHint>
                    )
                  }
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Sticky Notification?</InputLabel>
                  <CheckBoxInput
                    checked={sticky}
                    onChange={(event) => this.update("sticky", event.target.checked)}
                    type="checkbox"
                    id="sticky"
                  />
                  <InputHint>This notification will be shown to the user until they dismiss it, leaving this box unchecked will only show this notification for the duration of the day.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Omit support name from notification?</InputLabel>
                  <CheckBoxInput
                    checked={omit_name}
                    onChange={(event) => this.setState({ omit_name: event.target.checked })}
                    type="checkbox"
                    id="omit_name"
                  />
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Does this notification have a custom navigation button?</InputLabel>
                  <CheckBoxInput
                    checked={has_custom_button}
                    onChange={(event) => this.setState({ has_custom_button: event.target.checked })}
                    type="checkbox"
                    id="has_custom_button"
                  />
                </InputWrapper>
              </Col>
              {has_custom_button
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Button Link:</InputLabel>
                        <Input onChange={(event) => this.update("href", event.target.value)} type="url" value={href} placeholder="Add a link for a custom button..." />
                        <InputHint>For internal urls, use the page path, ie: "/settings"</InputHint>
                        <InputHint>For custom actions, try <code>function: ACTION</code> (Available actions: (UPGRADE_PLAN, OPEN_LIVE_CHAT)</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Button Text:</InputLabel>
                        <Input onChange={(event) => this.update("href_text", event.target.value)} type="text" value={href_text} placeholder="Add button text for a custom button..." />
                      </InputWrapper>
                    </Col>
                  </>
                )
                : null
              }
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Hide Notification Buttons?</InputLabel>
                  <CheckBoxInput
                    checked={hide_buttons}
                    onChange={(event) => this.update("hide_buttons", event.target.checked)}
                    type="checkbox"
                    id="hide_buttons"
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Title</InputLabel>
                  <Input onChange={(event) => this.update("title", event.target.value)} type="text" value={title} placeholder="Add a notification title..." />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Message: ({140 - (message || "").length} characters remaining)</InputLabel>
                  <TextArea value={message} maxLength={140} onChange={(event) => this.update("message", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 140)} rows={10} placeholder="Enter a notification message..."/>
                  <InputHint>{`You may use available merge codes in this text. {{first_name}}, {{last_name}}, {{username}}, {{address}}, {{city}}, {{state}}, {{zip}}, {{gender}}, {{pronouns}}, {{birthday}} - You may add a fallback by using syntax {{ first_name | fallback: "Joe" }}`}</InputHint>
                </InputWrapper>
              </Col>

              <Col span={12}>
                <Button disabled={!(type && message && location && selected_users.length)} type="button" onClick={() => this.createPush()} outline green rounded nomargin>Push to {selected_users.length || 0} {selected_users.length === 1 ? "user" : "users"}</Button>
                <Button type="button" onClick={() => closePushNotificationModal()} outline danger rounded>Cancel</Button>
              </Col>
            </Row>
          </BenefitsModuleMainContent>
        </PushModuleModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  customer_support: state.customer_support,
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  closePushNotificationModal: () => dispatch(closePushNotificationModal()),
  createPush: (push, users, omit_name) => dispatch(createPush(push, users, omit_name))
});
export default connect(mapStateToProps, dispatchToProps)(PushNotificationModal);
