import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import ReactAvatar from "react-avatar";
import { closeTicketModal, updateTicketById, getTicketById } from "../../store/actions/request";
import { showNotification } from "../../store/actions/notification";
import moment from "moment";
import { isMobile } from "react-device-detect";
import { ticketPolling } from "../../HOC/ticketPolling";
import {
  TicketMainContent,
  ViewTicketModalInner,
  ViewTicketModalInnerLogo,
  ViewTicketModalInnerLogoImg,
  ViewTicketModalInnerHeader,
  ModalHeader,
  ModalHeaderSection,
  ViewTicketModalInnerBody,
  ViewTicketModalInfo,
  ViewTicketModalInfoItem,
  ViewTicketModalComments,
  ViewModalCommentsInner,
  ViewTicketModalInnerFooter,
  ViewTicketModalInnerFooterInput,
  ActivityFeedOptionSection,
  ActivityFeedSearchSelectWrapper,
  ActivityFeedSearchSelect,
  Comment,
  CommentPadding,
  CommentInner,
  CommentInnerIcon,
  CommentInfoItem,
  CommentInfoHeader,
  CommentInfoData,
  CommentMeta,
  ViewTicketModalCommentSendButton,
  ViewTicketModalCommentError,
  Tag
} from "./style";
import { sortBy, filter, last } from "lodash";
import { Button, SelectLabel } from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import hover from "./hover.mp3";
import { capitalize } from "../../utilities";
const audio = new Audio(hover);

class TicketViewModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeTicketModal: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { ticket } = props;
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      error: "",
      ticket,
      comments: sortBy(ticket.comments, ["createdAt"]).reverse()
    };
  }

  componentWillUnmount() {
    this.commentInput.value = "";
  }

  componentDidUpdate(prevProps) {
    const { request, showNotification, user } = this.props;
    if (request.focus.comments.length > prevProps.request.focus.comments.length) {
      const new_comments = request.focus.comments.length - prevProps.request.focus.comments.length;
      if (last(request.focus.comments).cognito_id !== user.cognito_id) {
        this.setState({ ticket: request.focus, comments: sortBy(request.focus.comments, ["createdAt"]).reverse() }, () => {
          audio.play();
          showNotification("info", (new_comments === 1) ? "New Comment" : "New Comments", (new_comments === 1) ? `New comment on ticket #${request.focus.id}` : `${new_comments} new comments on ticket #${request.focus.id}`);
        });
      }
    }
  }

  setTicketBody = async (event) => {
    if (event.target.value && event.keyCode === 13) this.addComment(event.target.id, event.target.value);
    this.setState({ error: "" });
  };

  addComment = async (ID, comment) => {
    const { ticket, comments } = this.state;
    const { updateTicketById } = this.props;
    if (comment) {
      this.setState({ loaderShow: true, loaderMessage: "Updating ticket..." });
      const updated = await updateTicketById(ID, { "comment": { "body": comment } });
      this.setState({ loaderShow: false, loaderMessage: "", ticket: updated.success ? updated.payload : ticket, comments: updated.success ? sortBy(updated.payload.comments, ["createdAt"]).reverse() : sortBy(comments, ["createdAt"]).reverse() }, () => this.commentInput.value = "");
    } else {
      this.setState({ error: "You must enter a comment to send." });
    }
  };

  filterUserComments = (event) => {
    const { comments, ticket } = this.state;
    let filtered = [];
    if (event.target.value === "all") {
      filtered = ticket.comments;
    } else if (!comments.length) {
      filtered = filter(ticket.comments, ["cognito_id", event.target.value]);
    } else {
      filtered = filter(comments, ["cognito_id", event.target.value]);
    }
    this.setState({ comments: filtered });
  };

  onSortComments = (event) => {
    const { comments, ticket } = this.state;
    let sorted = [];
    let sortable = [];
    if (!comments.length) {
      sortable = comments;
    } else {
      sortable = ticket.comments;
    }
    if (event.target.value === "asc") {
      sorted = sortBy(sortable, ["created_at"]);
    } else if (event.target.value === "desc") {
      sorted = sortBy(sortable, ["created_at"]).reverse();
    }
    this.setState({ comments: sorted });
  };

  render() {
    const { viewingTicket, closeTicketModal, session, accounts, relationship } = this.props;
    const { loaderShow, loaderMessage, error, comments, ticket } = this.state;
    const account = accounts.find((account) => account.account_id === session.account_id);
    return (
      <Modal styles={{ modal: { borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewingTicket} onClose={() => closeTicketModal()} center>
        <ViewTicketModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewTicketModalInnerLogo span={12}>
              <ViewTicketModalInnerLogoImg alt="HopeTrust Requests Logo" src={icons.colorLogoOnly} />
            </ViewTicketModalInnerLogo>
          </Col>
          <TicketMainContent span={12}>
            <ViewTicketModalInnerHeader span={12}>{ticket.request_type === "other_request_type" ? "Other" : ticket.request_type.replace(/_/g, " ")} Request</ViewTicketModalInnerHeader>

            <ViewTicketModalInnerBody xs={12} sm={12} md={6} lg={6} xl={6}>
              <ViewTicketModalInfo>
                {ticket.title
                  ? <ViewTicketModalInfoItem span={12}>
                    <CommentInfoItem>
                      <CommentInfoHeader span={12}>Title:</CommentInfoHeader>
                      <CommentInfoData span={12}>{ticket.title}</CommentInfoData>
                    </CommentInfoItem>
                  </ViewTicketModalInfoItem>
                  : null
                }

                <ViewTicketModalInfoItem span={12}>
                  <CommentInfoItem>
                    <CommentInfoHeader span={12}>Priority:</CommentInfoHeader>
                    <CommentInfoData transform="capitalize" span={12}>{ticket.priority}</CommentInfoData>
                  </CommentInfoItem>
                </ViewTicketModalInfoItem>

                <ViewTicketModalInfoItem span={12}>
                  <CommentInfoItem>
                    <CommentInfoHeader span={12}>Coordinator:</CommentInfoHeader>
                    <CommentInfoData span={12}>{ticket.assignee ? `${ticket.assignee_first} ${ticket.assignee_last}` : "Pending assignment"}</CommentInfoData>
                  </CommentInfoItem>
                </ViewTicketModalInfoItem>

                <ViewTicketModalInfoItem span={12}>
                  <CommentInfoItem>
                    <CommentInfoHeader span={12}>Last Updated:</CommentInfoHeader>
                    <CommentInfoData span={12}>{moment(ticket.updated_at).format("MMMM DD, YYYY h:mm A")}</CommentInfoData>
                  </CommentInfoItem>
                </ViewTicketModalInfoItem>

                <ViewTicketModalInfoItem span={12}>
                  <CommentInfoItem>
                    <CommentInfoHeader span={12}>Created:</CommentInfoHeader>
                    <CommentInfoData span={12}>{moment(ticket.created_at).format("MMMM DD, YYYY h:mm A")} by {ticket.creator_first} {ticket.creator_last}</CommentInfoData>
                  </CommentInfoItem>
                </ViewTicketModalInfoItem>

              </ViewTicketModalInfo>
            </ViewTicketModalInnerBody>

            <ViewTicketModalInnerBody xs={12} sm={12} md={6} lg={6} xl={6}>
              <ViewTicketModalInfo>

                <ViewTicketModalInfoItem span={12}>
                  <CommentInfoItem>
                    <CommentInfoHeader span={12}>Ticket Status:</CommentInfoHeader>
                    <CommentInfoData span={12}>{capitalize(ticket.status) || "New"}</CommentInfoData>
                  </CommentInfoItem>
                </ViewTicketModalInfoItem>

                {ticket.request_type === "money"
                  ? (
                    <ViewTicketModalInfoItem span={12}>
                      <CommentInfoItem>
                        <CommentInfoHeader span={12}>Amount:</CommentInfoHeader>
                        <CommentInfoData span={12}>${ticket.request_amount.toLocaleString()}</CommentInfoData>
                      </CommentInfoItem>
                    </ViewTicketModalInfoItem>
                  )
                  : null
                }

                {ticket.request_type === "permission"
                  ? (
                    <>
                      <ViewTicketModalInfoItem span={12}>
                        <CommentInfoItem>
                          <CommentInfoHeader span={12}>Requested Permission:</CommentInfoHeader>
                          <CommentInfoData span={12}>{ticket.permission}</CommentInfoData>
                        </CommentInfoItem>
                      </ViewTicketModalInfoItem>
                      <ViewTicketModalInfoItem span={12}>
                        <CommentInfoItem>
                          <CommentInfoHeader span={12}>Request Status:</CommentInfoHeader>
                          <CommentInfoData span={12}>{ticket.permission_status}</CommentInfoData>
                        </CommentInfoItem>
                      </ViewTicketModalInfoItem>
                    </>
                  )
                  : null
                }

                {ticket.city && ticket.state
                  ? (
                    <ViewTicketModalInfoItem span={12}>
                      <CommentInfoItem>
                        <CommentInfoHeader span={12}>Location:</CommentInfoHeader>
                        <CommentInfoData span={12}>{ticket.address}, {ticket.address2}</CommentInfoData>
                        <CommentInfoData span={12}>{ticket.city}, {ticket.state} {ticket.zip}</CommentInfoData>
                      </CommentInfoItem>
                    </ViewTicketModalInfoItem>
                  )
                  : null
                }

                {ticket.tags
                  ? (
                    <ViewTicketModalInfoItem span={12}>
                      <CommentInfoItem>
                        <CommentInfoHeader span={12}>Tags:</CommentInfoHeader>
                        <CommentInfoData span={12}>{ticket.tags.map((tag, index) => {
                          return (
                            <Tag key={index}>{tag === "other_request_type" ? "other" : tag}</Tag>
                          );
                        })}</CommentInfoData>
                      </CommentInfoItem>
                    </ViewTicketModalInfoItem>
                  )
                  : null
                }

              </ViewTicketModalInfo>
            </ViewTicketModalInnerBody>

            <ViewTicketModalInnerBody span={12}>
              <ViewTicketModalInnerFooter span={12}>
                <Row>
                  <Col xs={12} sm={12} md={10} lg={10} xl={10}>
                    <ViewTicketModalInnerFooterInput ref={(input) => this.commentInput = input} id={ticket.id} type="text" placeholder="Add a comment..." onKeyDown={this.setTicketBody} disabled={!account.permissions.includes("request-hcc-edit")}/>
                  </Col>
                  <ViewTicketModalCommentSendButton xs={12} sm={12} md={2} lg={2} xl={2}>
                    <Button onClick={() => this.addComment(ticket.id, this.commentInput.value)} secondary blue widthPercent={isMobile ? 100 : 0} width={!isMobile ? 100 : 0} nomargin margintop={isMobile ? 10 : 0} disabled={!account.permissions.includes("request-hcc-edit")}>Send</Button>
                  </ViewTicketModalCommentSendButton>
                  <Col span={12}>
                    <ViewTicketModalCommentError align="left">{error}</ViewTicketModalCommentError>
                  </Col>
                </Row>
              </ViewTicketModalInnerFooter>
              <ViewTicketModalComments>
                <ModalHeader>
                  <ModalHeaderSection xs={12} sm={12} md={4} lg={4} xl={4} align="left">Comments ({comments.length})</ModalHeaderSection>
                  <ModalHeaderSection xs={12} sm={12} md={4} lg={4} xl={4} align="right">
                    <Row>
                      <ActivityFeedOptionSection align="right" span={12}>
                        <ActivityFeedSearchSelectWrapper>
                          <SelectLabel>
                            <ActivityFeedSearchSelect ref={(input) => this.sortOrderSelect = input} defaultValue="desc" onChange={this.onSortComments}>
                              <option disabled value="">Sort order</option>
                              <option value="asc">Ascending</option>
                              <option value="desc">Descending</option>
                            </ActivityFeedSearchSelect>
                          </SelectLabel>
                        </ActivityFeedSearchSelectWrapper>
                      </ActivityFeedOptionSection>
                    </Row>
                  </ModalHeaderSection>
                  <ModalHeaderSection xs={12} sm={12} md={4} lg={4} xl={4} align="right">
                    <Row>
                      <ActivityFeedOptionSection align="right" span={12}>
                        <ActivityFeedSearchSelectWrapper>
                          <SelectLabel>
                            <ActivityFeedSearchSelect ref={(input) => this.sortUserSelect = input} defaultValue="all" onChange={this.filterUserComments}>
                              <option disabled value="">Sort by user</option>
                              <option value="all">All users</option>
                              {relationship.list.map((accountUser, index) => {
                                return (
                                  <option key={index} value={accountUser.cognito_id}>{`${accountUser.first_name} ${accountUser.last_name}`}</option>
                                );
                              })}
                            </ActivityFeedSearchSelect>
                          </SelectLabel>
                        </ActivityFeedSearchSelectWrapper>
                      </ActivityFeedOptionSection>
                    </Row>
                  </ModalHeaderSection>
                </ModalHeader>
                {comments && comments.length
                  ? (
                    <ViewModalCommentsInner>
                      {comments.map((comment, index) => {
                        return (
                          <Comment key={index} span={12}>
                            <CommentPadding agent={comment.is_admin ? 1 : 0}>
                              <CommentInnerIcon span={1} align={comment.is_admin ? 1 : 0}>
                                <ReactAvatar size={50} src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${comment.cognito_id}`} name={comment.name} alt={`${comment.name}'s avatar`} round />
                              </CommentInnerIcon>
                              <CommentInner span={11}>{comment.body}</CommentInner>
                              <CommentMeta right={comment.is_admin ? 0 : 1} span={12}>Sent by {comment.name} on {moment(comment.created_at).format("MMMM DD, YYYY [at] h:mm A")}</CommentMeta>
                            </CommentPadding>
                          </Comment>
                        );
                    })}
                    </ViewModalCommentsInner>
                  )
                  : "No comments found"
                }
              </ViewTicketModalComments>
            </ViewTicketModalInnerBody>
          </TicketMainContent>
        </ViewTicketModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  relationship: state.relationship,
  accounts: state.accounts,
  session: state.session,
  request: state.request
});
const dispatchToProps = (dispatch) => ({
  closeTicketModal: () => dispatch(closeTicketModal()),
  updateTicketById: (ticket_id, updates) => dispatch(updateTicketById(ticket_id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(ticketPolling(getTicketById, 20000)(TicketViewModal));
