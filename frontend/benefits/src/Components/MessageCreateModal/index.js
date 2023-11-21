import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { closeMessage, sendMessage, updateMessage } from "../../store/actions/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import { Button, RequiredStar, InputLabel, InputWrapper, Input, TextArea, SelectStyles } from "../../global-components";
import { capitalize } from "../../utilities";
import ReactSelect, { createFilter, components } from "react-select";
import { getDocument } from "../../store/actions/document";
import {
  MessageModalMain,
  MessageModalContent,
  MessageModalContentSection,
  MessageModalFooter,
  MessageModalHeader,
  Group,
  Icon,
  Attachments,
  AttachmentsHeader,
  AttachmentContainer,
  AttachmentContainerPadding,
  AttachmentContainerInner,
  AttachmentContainerInnerRow,
  AttachmentSection
} from "./style";

const LazyOption = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

const handleHeaderClick = (id) => {
  const node = document.querySelector(`#${id}`).parentElement
    .nextElementSibling;
  const classes = node.classList;
  if (classes.contains("collapsed")) {
    node.classList.remove("collapsed");
  } else {
    node.classList.add("collapsed");
  }
};

const CustomGroupHeading = (props) => {
  return (
    <Group className="group-heading-wrapper" onClick={() => handleHeaderClick(props.id)}>
      <components.GroupHeading {...props}>
        {props.children} ({props.data.options.length})
          <Icon>
            <FontAwesomeIcon icon={["fas", "chevron-down"]} />
          </Icon>
      </components.GroupHeading>
    </Group>
  );
};

class MessageCreateModal extends Component {

  constructor(props) {
    super(props);
    const { defaults = {}, user } = props;
    const target_users = user.accounts.map((account) => {
      const option_items = account.users.map((u) => {
        if (u.cognito_id !== user.cognito_id) return { value: u, label: `${u.first_name} ${u.last_name}${u.is_partner ? ` - (${u.partner_data.name})` : (u.type) ? ` - (${capitalize(u.type)})` : ""}`, first_name: u.first_name, last_name: u.last_name, email: u.email };
        return null;
      }).filter((e) => e);
      if (option_items.length) return { options: option_items, label: account.account_name };
      return false;
    }).filter((e) => e);
    let current_user = false;
    target_users.forEach((group) => {
      if (group) {
        for (let i = 0; i < group.options.length; i++) {
          if (group.options[i].value.cognito_id === defaults.to_cognito) current_user = group.options[i];
        }
      }
    });
    this.state = {
      from_email: defaults.from_email || user.email || "",
      to_email: defaults.to_email || "",
      to_first: defaults.to_first || "",
      to_last: defaults.to_last || "",
      subject: defaults.subject || "",
      body: defaults.body || "",
      current_user,
      to_cognito: current_user ? current_user.value.cognito_id : null,
      target_users,
      sending_message: false
    };
  }

  setField = (event) => {
    this.setState({ [event.target.id]: event.target.value });
  };

  sendMessage = async () => {
    const { user, sendMessage, showNotification, defaults } = this.props;
    const { from_email, to_email, to_first, to_last, subject, body, to_cognito } = this.state;
    if (from_email && to_email && to_first && to_last && subject && body) {
      this.setState({ sending_message: true });
      await sendMessage({ from_email, to_email, to_first, to_last, subject, body, to_cognito }, user, defaults.url_parameters, defaults.type);
      this.setState({ sending_message: false });
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  getSignedURL = async (name, account_id) => {
    const { getDocument, showNotification } = this.props;
    this.setState({ [`${name}_isloading`]: true });
    const URL = await getDocument(name, account_id);
    if (URL.success) {
      this.setState({ [name]: URL.payload }, () => document.getElementById(`link_edit_${name}`).click());
    } else {
      showNotification("error", "", "Could not download this document.");
    }
    this.setState({ [`${name}_isloading`]: false });
  };

  async componentDidMount() {
    const { defaults, updateMessage, user } = this.props;
    if (defaults.id && !defaults.read && ((defaults.to_cognito === user.cognito_id) || (defaults.to_email === user.email))) await updateMessage(defaults.id, { read: true });
  }

  render() {
    const { show, defaults = {}, closeMessage, updating, viewing } = this.props;
    const { from_email, to_email, to_first, to_last, subject, body, sending_message, target_users, current_user } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={show} onClose={() => closeMessage()} center>
        <MessageModalMain>
          <MessageModalContent>
            <MessageModalHeader span={12}>{defaults.subject ? defaults.subject : "New Message"}</MessageModalHeader>
            <MessageModalContentSection span={12}>
              <InputWrapper>
                <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> From:</InputLabel>
                <Input
                  readOnly
                  type="email"
                  placeholder="Enter an email..."
                  value={from_email}
                />
              </InputWrapper>
            </MessageModalContentSection>
           {(current_user && viewing) || (!viewing && target_users.length)
              ? (
                <MessageModalContentSection span={12}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> User</InputLabel>
                    <ReactSelect
                      components={{ Option: LazyOption, GroupHeading: CustomGroupHeading }}
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
                          zIndex: 9999
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
                      isClearable
                      name="current_user"
                      placeholder="Choose a user from the list..."
                      clearValue={() => this.setState({ current_user: null })}
                      onChange={(aa) => {
                        if (aa) {
                          this.setState({
                            current_user: aa,
                            to_email: aa.email,
                            to_first: aa.first_name,
                            to_last: aa.last_name,
                            to_cognito: aa.value.cognito_id
                          });
                        }
                      }}
                      value={current_user || null}
                      options={target_users}
                      className="select-menu"
                      classNamePrefix="ht"
                      isDisabled={viewing}
                    />
                  </InputWrapper>
                </MessageModalContentSection>
              )
              : null
            }
            {!current_user
              ? (
                <>
                  <MessageModalContentSection span={6}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Recipient First Name:</InputLabel>
                      <Input
                        id="to_first"
                        type="text"
                        placeholder="Enter a first_name..."
                        value={to_first || current_user?.first_name}
                        onChange={this.setField}
                        readOnly={viewing}
                      />
                    </InputWrapper>
                  </MessageModalContentSection>
                  <MessageModalContentSection span={6}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Recipient Last Name:</InputLabel>
                      <Input
                        id="to_last"
                        type="text"
                        placeholder="Enter a last name..."
                        value={to_last || current_user?.last_name}
                        onChange={this.setField}
                        readOnly={viewing}
                      />
                    </InputWrapper>
                  </MessageModalContentSection>
                  <MessageModalContentSection span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Recipient Email:</InputLabel>
                      <Input
                        id="to_email"
                        type="email"
                        placeholder="Enter an email to send to..."
                        value={to_email || current_user?.email}
                        onChange={this.setField}
                        readOnly={viewing}
                      />
                    </InputWrapper>
                  </MessageModalContentSection>
                </>
              )
              : null
            }
            <MessageModalContentSection span={12}>
              <InputWrapper>
                <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Subject:</InputLabel>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter an subject..."
                  value={subject}
                  onChange={this.setField}
                  readOnly={viewing}
                />
              </InputWrapper>
            </MessageModalContentSection>
            <MessageModalContentSection span={12}>
              <InputWrapper>
                <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Message:</InputLabel>
                <TextArea
                  id="body"
                  rows={25}
                  placeholder="Enter an email..."
                  onChange={this.setField}
                  readOnly={viewing} defaultValue={body} />
              </InputWrapper>
            </MessageModalContentSection>
            {defaults.attachments && defaults.attachments.length
              ? (
                <MessageModalContentSection span={12}>
                  <Attachments>
                    <AttachmentsHeader>Attachments ({defaults.attachments.length})</AttachmentsHeader>
                      {defaults.attachments.map((attachment, index) => {
                        return (
                          <AttachmentContainer key={index}>
                            <a rel="noopener noreferrer" target="_blank" id={`link_edit_${attachment}`} href={this.state[attachment] || ""} download={attachment.split("Uploads/")[1]}>{null}</a>
                            <AttachmentContainerPadding>
                              <AttachmentContainerInner onClick={() => this.getSignedURL(attachment, defaults.account_id)}>
                                <AttachmentContainerInnerRow>
                                  <AttachmentSection aligntext="center" span={1}>
                                    {this.state[`${attachment}_isloading`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fad", "paperclip"]} />}
                                  </AttachmentSection>
                                  <AttachmentSection span={11}>{attachment}</AttachmentSection>
                                </AttachmentContainerInnerRow>
                              </AttachmentContainerInner>
                            </AttachmentContainerPadding>
                          </AttachmentContainer>
                        );
                      })}
                  </Attachments>
                </MessageModalContentSection>
              )
              : null
            }
            <MessageModalFooter span={12}>
              {updating || !viewing
                ? (
                  <>
                    <Button disabled={sending_message} green rounded outline onClick={() => this.sendMessage()}>{sending_message ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Send"}</Button>
                    <Button danger rounded outline onClick={() => closeMessage()}>Cancel</Button>
                  </>
                )
                : <Button danger rounded outline onClick={() => closeMessage()}>Close</Button>
              }
            </MessageModalFooter>
          </MessageModalContent>
        </MessageModalMain>
      </Modal>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  updateMessage: (id, updates) => dispatch(updateMessage(id, updates)),
  sendMessage: (config, user, url_parameters, type) => dispatch(sendMessage(config, user, url_parameters, type)),
  closeMessage: () => dispatch(closeMessage()),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  getDocument: (key, associated_account_id) => dispatch(getDocument(key, associated_account_id)),
});
export default connect(mapStateToProps, dispatchToProps)(MessageCreateModal);
