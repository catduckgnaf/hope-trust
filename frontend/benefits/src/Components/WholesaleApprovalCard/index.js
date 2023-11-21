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
import { approveWholesaleRequest, declineWholesaleRequest } from "../../store/actions/wholesale";

class WholesaleApprovalCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      approving: false,
      declining: false
    };
  }

  approve = async (config_id, cognito_id, request_id) => {
    const { approveWholesaleRequest } = this.props;
    this.setState({ approving: true });
    await approveWholesaleRequest(config_id, cognito_id, request_id);
    this.setState({ approving: false });
  };

  decline = async (config_id, cognito_id, request_id) => {
    const { declineWholesaleRequest } = this.props;
    this.setState({ declining: true });
    await declineWholesaleRequest(config_id, cognito_id, request_id);
    this.setState({ declining: false });
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
            <UserCardSection xs={12} sm={12} md={3} lg={3} xl={3} too_long={1}>
              <MobileLabel>Retailer: </MobileLabel><UserCardSectionText bump={1} transform="capitalize" onClick={() => updateFilter("cognito_id", request.cognito_id)}><ListItemSectionTextItem clickable={1}>{request.retailer_name}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={3} lg={3} xl={3} too_long={1}>
              <MobileLabel>Wholesaler: </MobileLabel><UserCardSectionText transform="capitalize" onClick={() => updateFilter("config_id", request.config_id)}><ListItemSectionTextItem clickable={1}>{request.name}</ListItemSectionTextItem></UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Created: </MobileLabel><UserCardSectionText>{moment(request.created_at).format("MMMM DD, YYYY")}</UserCardSectionText>
            </UserCardSection>
            <UserCardSection xs={12} sm={12} md={2} lg={2} xl={2} nooverflow={1}>
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
  approveWholesaleRequest: (config_id, cognito_id, request_id) => dispatch(approveWholesaleRequest(config_id, cognito_id, request_id)),
  declineWholesaleRequest: (config_id, cognito_id, request_id) => dispatch(declineWholesaleRequest(config_id, cognito_id, request_id))
});
export default connect(mapStateToProps, dispatchToProps)(WholesaleApprovalCard);