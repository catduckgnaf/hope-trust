import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import {
  UserCardMain,
  UserCardPadding,
  UserCardInner,
  UserCardSection,
  UserCardSectionText,
  MobileLabel,
  ListItemSectionTextItem
} from "./style";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { approveGroupRequest, declineGroupRequest } from "../../store/actions/groups";

class GroupApprovalCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      approving: false,
      declining: false
    };
  }

  approve = async (config_id, cognito_id, request_id) => {
    const { approveGroupRequest } = this.props;
    this.setState({ approving: true });
    await approveGroupRequest(config_id, cognito_id, request_id);
  };

  decline = async (config_id, cognito_id, request_id) => {
    const { declineGroupRequest } = this.props;
    this.setState({ declining: true });
    await declineGroupRequest(config_id, cognito_id, request_id);
  };

  render() {
    const { updateFilter, request } = this.props;
    let { approving, declining } = this.state;
    return (
      <UserCardMain>
        <UserCardPadding>
          <UserCardInner>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2} too_long={1}>
              <MobileLabel>Name: </MobileLabel><UserCardSectionText bump={1} transform="capitalize" onClick={() => updateFilter("last_name", request.last_name)}><ListItemSectionTextItem clickable={1}>{`${request.first_name} ${request.last_name}` || "N/A"}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2} too_long={1}>
              <MobileLabel>Organization: </MobileLabel><UserCardSectionText bump={1} transform="capitalize" onClick={() => updateFilter("cognito_id", request.cognito_id)}><ListItemSectionTextItem clickable={1}>{request[`${request.type}_name`] || request.team_name || request.agent_name || "N/A"}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2} too_long={1}>
              <MobileLabel>Group: </MobileLabel><UserCardSectionText transform="capitalize" onClick={() => updateFilter("group_name", request.group_name)}><ListItemSectionTextItem clickable={1}>{request.group_name}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={1} lg={1} xl={1} too_long={1}>
              <MobileLabel>Type: </MobileLabel><UserCardSectionText transform="capitalize" onClick={() => updateFilter("type", request.type)}><ListItemSectionTextItem clickable={1}>{request.type || "N/A"}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Created: </MobileLabel><UserCardSectionText>{moment(request.created_at).format("MMMM DD, YYYY")}</UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={3} lg={3} xl={3} nooverflow={1}>
              <MobileLabel>Actions: </MobileLabel><UserCardSectionText nooverflow={1}>
                {["pending"].includes(request.status)
                  ? (
                  <>
                    <Button marginright={5} nomargin green outline small rounded onClick={() => this.approve(request.config_id, request.cognito_id, request.id)}>{approving ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Approve"}</Button>
                    <Button marginright={5} nomargin danger outline small rounded onClick={() => this.decline(request.config_id, request.cognito_id, request.id)}>{declining ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Decline"}</Button>
                  </>
                  )
                  : null
                }
              </UserCardSectionText>
            </UserCardSection>
          </UserCardInner>
        </UserCardPadding>
      </UserCardMain>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  approveGroupRequest: (config_id, cognito_id, request_id) => dispatch(approveGroupRequest(config_id, cognito_id, request_id)),
  declineGroupRequest: (config_id, cognito_id, request_id) => dispatch(declineGroupRequest(config_id, cognito_id, request_id))
});
export default connect(mapStateToProps, dispatchToProps)(GroupApprovalCard);