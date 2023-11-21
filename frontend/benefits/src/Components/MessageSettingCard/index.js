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
