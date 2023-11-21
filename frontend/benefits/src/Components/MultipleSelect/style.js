
--boundary_.oOo._SDKY3AU6/g5fNhIxl/XpFEqtyLTwOoXB
Content-Length: 4549
Content-Type: application/octet-stream
X-File-MD5: 949a9c0cc861c6d0e3992ac36c07600f
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/MessageSettingCard/index.js

import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import { openMessage } from "../../store/actions/message";
import moment from "moment";
import {
  MessageSettingCardMain,
  MessageSettingCardPadding,
  MessageSettingCardInner,
  MessageSettingCardSection,
  MessageSettingCardSectionText,
  MobileLabel,
  ListItemSectionTextItem,
  Icon
} from "./style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class MessageSettingCard extends Component {

  static propTypes = {}
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { openMessage, message, updateFilter, current_page, user } = this.props;
    return (
      <MessageSettingCardMain>
        <MessageSettingCardPadding>
          <MessageSettingCardInner>
            {message.attachments.length
              ? <Icon><FontAwesomeIcon icon={["fad", "paperclip"]} /></Icon>
              : null
            }
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Sent By: </MobileLabel><MessageSettingCardSectionText paddingleft={15} onClick={() => updateFilter(message.cognito_id ? "cognito_id" : "from_email", message.cognito_id ? message.cognito_id : message.from_email)} transform={message.cognito_id ? "capitalize" : "none"}><ListItemSectionTextItem clickable={1}>{message.cognito_id ? `${message.sender_first} ${message.sender_last}` : message.from_email}</ListItemSectionTextItem></MessageSettingCardSectionText>
            </MessageSettingCardSection>
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Recipient: </MobileLabel><MessageSettingCardSectionText onClick={() => updateFilter(message.to_cognito ? "to_cognito" : "to_email", message.to_cognito ? message.to_cognito : message.to_email)} transform={(message.to_cognito || (message.to_email && message.recipient_user_first && message.recipient_user_last)) ? "capitalize" : "none"}><ListItemSectionTextItem clickable={1}>{(message.to_cognito || (message.to_email && message.recipient_user_first && message.recipient_user_last)) ? `${message.recipient_user_first} ${message.recipient_user_last}` : message.to_email}</ListItemSectionTextItem></MessageSettingCardSectionText>
            </MessageSettingCardSection>
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Read Status: </MobileLabel><MessageSettingCardSectionText onClick={() => updateFilter("read", message.read)}><ListItemSectionTextItem clickable={1}>{message.read ? `Read on ${moment(message.updated_at).format("MM/DD/YYYY [at] h:mm a")}` : "Unread"}{}</ListItemSectionTextItem></MessageSettingCardSectionText>
            </MessageSettingCardSection>
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Type: </MobileLabel><MessageSettingCardSectionText>{message.to_cognito && message.to_cognito === message.cognito_id ? "Incoming" : (message.cognito_id === user.cognito_id) ? "Outgoing" : "Incoming"}</MessageSettingCardSectionText>
            </MessageSettingCardSection>
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Created: </MobileLabel><MessageSettingCardSectionText onClick={() => updateFilter("created_at", message.created_at)}><ListItemSectionTextItem clickable={1}>{moment(message.created_at).format("MM/DD/YYYY [at] h:mm a")}</ListItemSectionTextItem></MessageSettingCardSectionText>
            </MessageSettingCardSection>
            <MessageSettingCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>
              <MessageSettingCardSectionText paddingtop={3} paddingbottom={3}>
                <Button marginright={5} nomargin outline blue small rounded onClick={() => openMessage(message, false, true, current_page)}>View</Button>
              </MessageSettingCardSectionText>
            </MessageSettingCardSection>
          </MessageSettingCardInner>
        </MessageSettingCardPadding>
      </MessageSettingCardMain>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  openMessage: (defaults, updating, viewing, current_page) => dispatch(openMessage(defaults, updating, viewing, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(MessageSettingCard);

--boundary_.oOo._SDKY3AU6/g5fNhIxl/XpFEqtyLTwOoXB
Content-Length: 15026
Content-Type: application/octet-stream
X-File-MD5: 4f244ca0a6c7cc7f6696362a3ee494a4
X-File-Mtime: 1672955762
X-File-Path: /Coding/HOPETRUST/HOPETRUST/full codebase/HopePortalServices-master/frontend/benefits/src/Components/MessageCreateModal/index.js

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
    t