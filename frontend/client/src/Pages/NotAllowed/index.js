import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import {
  NotAllowedMain,
  NotAllowedPadding,
  NotAllowedInner,
  NotAllowedInnerSection,
  NotAllowedInnerSectionHeader
} from "./style";
import authenticated from "../../store/actions/authentication";
import { navigateTo } from "../../store/actions/navigation";
import { Button } from "../../global-components";

class NotAllowed extends Component {

  render() {
    const { history, user, navigateTo, logOut } = this.props;
    return (
      <NotAllowedMain>
        <NotAllowedPadding>
          <NotAllowedInner gutter={20}>
            <NotAllowedInnerSection span={12}>
              <NotAllowedInnerSectionHeader>Not Allowed</NotAllowedInnerSectionHeader>
            </NotAllowedInnerSection>
            <NotAllowedInnerSection span={12}>
              {user
                ? <Button nomargin green onClick={user.is_partner ? () => navigateTo("/accounts") : () => navigateTo("/")}>Go Back</Button>
                : <Button nomargin green onClick={() => history.goBack()}>Go Back</Button>
              }
              <Button blue onClick={() => logOut()}>Logout</Button>
            </NotAllowedInnerSection>
          </NotAllowedInner>
        </NotAllowedPadding>
      </NotAllowedMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  logOut: () => dispatch(authenticated.logOut())
});
export default connect(mapStateToProps, dispatchToProps)(NotAllowed);