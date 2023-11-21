import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Container from "../../Components/Container";
import { orderBy } from "lodash";
import { isMobile } from "react-device-detect";
import { navigateTo } from "../../store/actions/navigation";
import { getMessages, openMessage } from "../../store/actions/message";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import {
  MessageListMain,
  MessagesListPadding,
  MessagesListInner,
  MessagesListCardMain,
  MessagesListCardPadding,
  MessagesListCardInner,
  MessagesListCardInnerSection
} from "./style";
import { withPolling } from "../..//HOC/withPolling";

class MessagesList extends Component {
  static propTypes = {
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { message, user } = props;
    const unreadMessages = message ? message?.list?.filter((message) => !message.read && (message.to_cognito === user.cognito_id || message.to_email === user.email)) : [];
    this.state = {
      messages: unreadMessages || []
    };
  }

  openMessage = async (message) => {
    const { openMessage } = this.props;
    this.setState({ [`is_loading_${message.id}`]: true });
    setTimeout(() => {
      openMessage(message, false, true, 0);
      this.setState({ [`is_loading_${message.id}`]: false });
    }, 2000);
  };

  componentDidMount() {
    const { getMessages, message } = this.props;
    if (!message.requested && !message.isFetching) getMessages();
  }

  render() {
    const { navigateTo, type, height, openMessage } = this.props;
    const { messages } = this.state;
    return (
      <Container title={`${type}${messages.length ? ` (${messages.length})` : ""}`} action={{ title: "New Message", func: () => openMessage({}, false, false, 0) }} viewall={{ title: "View All", func: () => navigateTo("/messages") }} xs={12} sm={12} md={12} lg={6} xl={6} height={height} overflow="auto">
        {messages.length
          ? (
            <MessageListMain>
              <MessagesListPadding span={12}>
                <MessagesListInner gutter={isMobile ? 20 : 0}>
                  {
                    orderBy(messages, "created_at", "desc").map((message, index) => {
                      return (
                        <MessagesListCardMain xs={12} sm={6} md={6} lg={12} xl={12} key={index}>
                          <MessagesListCardPadding>
                            <MessagesListCardInner onClick={() => this.openMessage(message)}>
                              <MessagesListCardInnerSection icon={1} span={1} text_align="center">{this.state[`is_loading_${message.id}`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fal", message.attachments.length ? "paperclip" : "envelope"]} />}</MessagesListCardInnerSection>
                              <MessagesListCardInnerSection span={isMobile ? 7 : 3} text_align="left" overflow={1}>{message.subject}</MessagesListCardInnerSection>
                              {!isMobile
                                ? <MessagesListCardInnerSection span={4} text_align="left" transform={message.cognito_id ? "capitalize" : "none"} overflow={1}>Sent by {message.cognito_id ? `${message.sender_first} ${message.sender_last}` : message.from_email}</MessagesListCardInnerSection>
                                : null
                              }
                              <MessagesListCardInnerSection span={4} text_align="right" paddingright={10} overflow={1}>{moment(message.created_at).format("MM/DD/YYYY [at] h:mm A")}</MessagesListCardInnerSection>
                            </MessagesListCardInner>
                          </MessagesListCardPadding>
                        </MessagesListCardMain>
                      );
                    })
                  }
                </MessagesListInner>
              </MessagesListPadding>
            </MessageListMain>
          )
          : (
            <Error span={12}>
              <ErrorPadding>
                <ErrorInner span={12}>
                  <ErrorInnerRow>
                    <ErrorIcon span={12}>
                      <FontAwesomeIcon icon={["fad", "mail-bulk"]} />
                    </ErrorIcon>
                    <ErrorMessage span={12}>You do not have any new messages.</ErrorMessage>
                  </ErrorInnerRow>
                </ErrorInner>
              </ErrorPadding>
            </Error>
          )
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  message: state.message,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  openMessage: (defaults, updating, viewing, current_page) => dispatch(openMessage(defaults, updating, viewing, current_page)),
  getMessages: (override) => dispatch(getMessages(override)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(withPolling(getMessages, 120000, [true, "widget"])(MessagesList));
