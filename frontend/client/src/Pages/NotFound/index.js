import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import {
  NotFoundMain,
  NotFoundPadding,
  NotFoundInner,
  NotFoundInnerSection,
  NotFoundInnerSectionHeader
} from "./style";
import authenticated from "../../store/actions/authentication";
import { navigateTo } from "../../store/actions/navigation";
import { Button } from "../../global-components";

class NotFound extends Component {

  render() {
    const { history, user, navigateTo, logOut } = this.props;
    return (
      <NotFoundMain>
        <NotFoundPadding>
          <NotFoundInner gutter={20}>
            <NotFoundInnerSection span={12}>
              <NotFoundInnerSectionHeader>Page Not Found</NotFoundInnerSectionHeader>
            </NotFoundInnerSection>
            <NotFoundInnerSection span={12}>
              {user
                ? <Button nomargin green onClick={user.is_partner ? () => navigateTo("/accounts") : () => navigateTo("/")}>Go Back</Button>
                : <Button nomargin green onClick={() => history.goBack()}>Go Back</Button>
              }
              <Button blue onClick={() => logOut()}>Logout</Button>
            </NotFoundInnerSection>
          </NotFoundInner>
        </NotFoundPadding>
      </NotFoundMain>
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
export default connect(mapStateToProps, dispatchToProps)(NotFound);
