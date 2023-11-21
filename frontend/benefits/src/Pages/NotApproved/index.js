import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import {
  NotActiveMain,
  NotActivePadding,
  NotActiveInner,
  NotActiveInnerSection,
  NotActiveInnerSectionHeader,
  NotActiveHint
} from "./style";
import authenticated from "../../store/actions/authentication";
import { Button } from "../../global-components";

class NotActive extends Component {
  constructor(props) {
    super(props);
    document.title = "Not Active";
  }

  render() {
    const { user, logOut, cancelJoinRequest } = this.props;
    return (
      <NotActiveMain>
        <NotActivePadding>
          <NotActiveInner gutter={20}>
            <NotActiveInnerSection span={12}>
              <NotActiveInnerSectionHeader>{`Hi ${user.first_name}, looks like your membership is awaiting approval.\n\nThe creator of the account you are attempting to join has not yet approved your membership.`}</NotActiveInnerSectionHeader>
              <NotActiveHint>We will notify you by email when your request has been approved. Please contact support for further assistance, or click below to remove your request to join this account.</NotActiveHint>
            </NotActiveInnerSection>
            <NotActiveInnerSection span={12}>
              <Button outline danger onClick={() => cancelJoinRequest(user.cognito_id, user.accounts[0].account_id)}>Cancel Request</Button>
              <Button outline blue onClick={() => logOut()}>Logout</Button>
            </NotActiveInnerSection>
          </NotActiveInner>
        </NotActivePadding>
      </NotActiveMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  logOut: () => dispatch(authenticated.logOut()),
  cancelJoinRequest: (cognito_id, account_id) => dispatch(authenticated.cancelJoinRequest(cognito_id, account_id))
});
export default connect(mapStateToProps, dispatchToProps)(NotActive);