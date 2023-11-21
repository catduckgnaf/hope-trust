import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ticketPolling } from "../../HOC/ticketPolling";
import { getTicket } from "../../store/actions/tickets";
import moment from "moment";
import { Button } from "../../global-components";
import ReactAvatar from "react-avatar";
import {
  CommentsModuleMain,
  CommentsModulePadding,
  CommentsModuleInner,
  CommentsModuleFeed,
  CommentsModuleFeedItem,
  CommentsModuleFeedItemPadding,
  CommentsModuleFeedItemInner,
  CommentsModuleInputContainer,
  CommentsModuleInputContainerInner,
  CommentsModuleInput,
  CommentModuleFeedItemInfo,
  CommentModuleFeedItemBody,
  CommentModuleFeedItemMeta,
  CommentsModuleFeedEmpty,
  FeedItemSection,
  CommentAvatarContainer
} from "./style";
import config from "../../config";
const Gateway = config.apiGateway.find((gateway) => gateway.name === "support");

class TicketComments extends Component {

  constructor(props) {
    super(props);
    const { customer_support } = props;
    this.state = {
      all_users: [...customer_support.users, ...customer_support.cs_users],
      input_comment: ""
    };
  }

  addNewComment = async (input_comment) => {
    const { addComment } = this.props;
    await addComment(input_comment);
    this.commentInput.value = "";
  }

  render() {
    const { comments = [], updating_comments } = this.props;
    const { all_users, input_comment } = this.state;
    return (
      <CommentsModuleMain>
        <CommentsModulePadding>
          <CommentsModuleInner>
            {comments.length
              ? (
                <CommentsModuleFeed id="comment_feed">
                  {comments.map((comment, index) => {
                    const comment_user = all_users.find((u) => u.cognito_id === comment.cognito_id);
                    return (
                      <CommentsModuleFeedItem key={index} span={12}>
                        <CommentsModuleFeedItemPadding gutter={20}>
                          {!comment.is_admin
                            ? (
                              <FeedItemSection span={2}>
                                <CommentAvatarContainer>
                                  <ReactAvatar size={40} src={`${Gateway.endpoint}/users/get-user-avatar/${comment.cognito_id}`} name={comment.name ? comment.name : (`${comment_user.first_name} ${comment_user.last_name}` || "Unknown")} round />
                                </CommentAvatarContainer>
                              </FeedItemSection>
                            )
                            : null
                          }
                          <FeedItemSection span={10}>
                            <CommentsModuleFeedItemInner>
                              <CommentModuleFeedItemInfo>
                                <CommentModuleFeedItemBody>{comment.body}</CommentModuleFeedItemBody>
                              </CommentModuleFeedItemInfo>
                            </CommentsModuleFeedItemInner>
                            <CommentModuleFeedItemInfo>
                              <CommentModuleFeedItemMeta align={comment.is_admin ? "right" : "left"}>{moment(comment.created_at).format("MM/DD/YYYY [at] h:mm A")} by {comment.name ? comment.name : (`${comment_user.first_name} ${comment_user.last_name}` || "Unknown")}</CommentModuleFeedItemMeta>
                            </CommentModuleFeedItemInfo>
                          </FeedItemSection>
                          {comment.is_admin
                            ? (
                              <FeedItemSection span={2}>
                                <CommentAvatarContainer>
                                  <ReactAvatar size={40} src={`${Gateway.endpoint}/users/get-user-avatar/${comment.cognito_id}`} name={comment.name ? comment.name : (`${comment_user.first_name} ${comment_user.last_name}` || "Unknown")} round />
                                </CommentAvatarContainer>
                              </FeedItemSection>
                            )
                            : null
                          }
                          
                        </CommentsModuleFeedItemPadding>
                      </CommentsModuleFeedItem>
                    )
                  })}
                </CommentsModuleFeed>
              )
              : (
                <CommentsModuleFeed id="comment_feed">
                  <CommentsModuleFeedEmpty>No Comments</CommentsModuleFeedEmpty>
                </CommentsModuleFeed>
              )
            }
          </CommentsModuleInner>
        </CommentsModulePadding>
        <CommentsModuleInputContainer>
          <CommentsModuleInputContainerInner span={9}>
            <CommentsModuleInput placeholder="Start typing a message..." ref={(input) => this.commentInput = input} value={input_comment} onChange={(event) => this.setState({ input_comment: event.target.value })} rows={2} />
          </CommentsModuleInputContainerInner>
          <CommentsModuleInputContainerInner span={3}>
            <Button disabled={!input_comment} type="button" onClick={() => this.addNewComment(input_comment)} outline blue rounded marginleft={10} marginbottom={-5}>{updating_comments ? <FontAwesomeIcon icon={["fas", "spinner"]} spin /> : "Send"}</Button>
          </CommentsModuleInputContainerInner>
        </CommentsModuleInputContainer>
      </CommentsModuleMain>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  tickets: state.tickets
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ticketPolling(getTicket, 20000)(TicketComments));
