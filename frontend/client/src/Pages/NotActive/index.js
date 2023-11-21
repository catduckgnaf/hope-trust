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
    const { location } = props;
    this.state = {
      no_accounts: location.query.no_accounts || false,
      partner: location.query.partner || false
    };
  }

  render() {
    const { user, logOut } = this.props;
    const { partner } = this.state;
    return (
      <NotActiveMain>
        <NotActivePadding>
          <NotActiveInner gutter={20}>
            <NotActiveInnerSection span={12}>
              <NotActiveInnerSectionHeader>Hi {user.first_name}, looks like your{partner ? " partner " : " "}account has been deactivated.</NotActiveInnerSectionHeader>
              <NotActiveHint>Please contact support for further assistance.</NotActiveHint>
            </NotActiveInnerSection>
            <NotActiveInnerSection span={12}>
              <Button blue onClick={() => logOut()}>Logout</Button>
            </NotActiveInnerSection>
          </NotActiveInner>
        </NotActivePadding>
      </NotActiveMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  logOut: () => dispatch(authenticated.logOut())
});
export default connect(mapStateToProps, dispatchToProps)(NotActive);