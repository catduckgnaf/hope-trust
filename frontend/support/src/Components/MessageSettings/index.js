import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { deleteMessages, getMessages, openMessage } from "../../store/actions/message";
import { message_table_columns } from "../../column-definitions";
import GenericTable from "../GenericTable";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { copyToClipboard } from "../../store/actions/utilities";
import {
  ViewContainer,
  Button
} from "../../global-components";
import {
  MessagesMain,
  MessagesPadding,
  MessagesInner,
  EmailContainer,
  EmailLabel,
  EmailText,
  EmailAppendage
} from "./style";

class MessageSettings extends Component {

  constructor(props) {
    super(props);
    document.title = "Message Settings";
    this.state = {};
  }

  render() {
    const { message, user, navigateTo, copyToClipboard } = this.props;
    const email = `@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`;
    return (
      <ViewContainer>
        <MessagesMain>
          <MessagesPadding>
            <EmailContainer>
              <EmailLabel><FontAwesomeIcon icon={["fad", "at"]} /></EmailLabel> <EmailText><EmailAppendage onClick={() => navigateTo("/settings", "?tab=profile")}>{user.username || user.cognito_id}</EmailAppendage>{email}</EmailText>
              <Button noshadow nomargin marginleft={5} marginright={user.username ? 1 : 5} outline blue small rounded onClick={() => copyToClipboard(`${user.username || user.cognito_id}${email}`, "Email Address")}>Copy</Button>
              {!user.username
                ? <Button noshadow nomargin small outline green rounded onClick={() => navigateTo("/settings", "?tab=profile")}>Set Username</Button>
                : null
              }
            </EmailContainer>
            <MessagesInner>
              <GenericTable
                deleteMultiple={deleteMessages}
                isSelectable={true}
                permissions={["hopetrust-messages-edit"]}
                getData={getMessages}
                columns={message_table_columns}
                page_size={25}
                data_path={["message", "list"]}
                initial_data={[]}
                loading={message.isFetching}
                requested={message.requested}
                header="Messages"
                newRow={{
                  onClick: openMessage,
                  arguments: [{}, false, false]
                }}
                paging={true}
                search={true}
                columnResizing={true}
                fields={[
                  {
                    caption: "Account Name",
                    name: "account_name",
                    type: "string"
                  },
                  {
                    caption: "Message Body",
                    name: "body",
                    type: "string"
                  },
                  {
                    caption: "To Email",
                    name: "to_email",
                    type: "string"
                  },
                  {
                    caption: "From Email",
                    name: "from_email",
                    type: "string"
                  },
                  {
                    caption: "Recipient Name",
                    name: "recipient_name",
                    type: "string"
                  },
                  {
                    caption: "Sender Name",
                    name: "sender_name",
                    type: "string"
                  },
                  {
                    caption: "Subject",
                    name: "subject",
                    type: "string"
                  },
                  {
                    caption: "Read Status",
                    name: "read",
                    type: "select",
                    options: [
                      { caption: "Read", value: "true" },
                      { caption: "Unread", value: "false" }
                    ]
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  },
                  {
                    caption: "Read On",
                    name: "updated_at",
                    type: "date"
                  }
                ]}
              />
            </MessagesInner>
          </MessagesPadding>
        </MessagesMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  message: state.message
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  copyToClipboard: (text, type) => dispatch(copyToClipboard(text, type))
});
export default connect(mapStateToProps, dispatchToProps)(MessageSettings);
