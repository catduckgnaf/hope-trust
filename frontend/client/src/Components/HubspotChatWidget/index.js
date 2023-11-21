import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateZendeskState } from "../../store/actions/session";
import { loadHubspotDefaults, loadHubspotGenericDefaults } from "../../hubspot-config";
import {
  WidgetMain,
  WidgetClose
} from "./style";

class HubspotChatWidget extends Component {

  closeChat = async () => {
    const { updateZendeskState, session, user } = this.props;
    const { hubspot_visitor_token } = session.zendesk;
    if (user) await loadHubspotDefaults(hubspot_visitor_token);
    else loadHubspotGenericDefaults();
    updateZendeskState("chat_open", false);
  };

  render() {
    const { id } = this.props;
    return (
      <WidgetMain id={id}>
        <WidgetClose onClick={() => this.closeChat()}>
          <FontAwesomeIcon icon={["fas", "times"]} />
        </WidgetClose>
      </WidgetMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  updateZendeskState: (id, value) => dispatch(updateZendeskState(id, value))
});
export default connect(mapStateToProps, dispatchToProps)(HubspotChatWidget);
