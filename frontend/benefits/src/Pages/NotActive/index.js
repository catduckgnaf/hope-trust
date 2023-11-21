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
    const { user, logOut } = this.props;
    return (
      <NotActiveMain>
        <NotActivePadding>
          <NotActiveInner gutter={20}>
            <NotActiveInnerSection span={12}>
              <NotActiveInnerSectionHeader>Hi {user.first_name}, looks like your account has been deactivated.</NotActiveInnerSectionHeader>
              <NotActiveHint>Please contact support for further assistance.</NotActiveHint>
            </NotActiveInnerSection>
            <NotActiveInnerSection span={12}>
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
  logOut: () => dispatch(authenticated.logOut())
});
export default connect(mapStateToProps, dispatchToProps)(NotActive);