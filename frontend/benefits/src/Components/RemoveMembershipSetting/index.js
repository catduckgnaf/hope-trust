import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import authenticated from "../../store/actions/authentication";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer
} from "../../Pages/Settings/style";
import { Button } from "../../global-components";
import { toastr } from "react-redux-toastr";
import { ConvertMessage } from "./style";

class RemoveMembershipSetting extends Component {
  static propTypes = {
    cancelJoinRequest: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  removeAccount = () => {
    const { cancelJoinRequest, user, session } = this.props;
    const removeOptions = {
      onOk: () => cancelJoinRequest(user.cognito_id, session.account_id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Understood",
      cancelText: "Cancel"
    };
    toastr.confirm(`Are you sure you want to remove your membership to ${user.benefits_data.name}? This option should not be chosen unless advised by Hope Trust. You will no longer have access to ${user.benefits_data.name}'s account or data.`, removeOptions);
  };

  render() {
    const { user } = this.props;
    return (
      <RowBody paddingbottom={20}>
        <RowHeader>
          <Row>
            <Col>Remove Membership</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
        </RowContentSection>
        <RowContentSection span={12}>
          <RowBodyPadding padding={20}>
            <RowContentSection xs={12} sm={12} md={12} lg={12} xl={12}>
              <ConvertMessage>
                This module will remove your membership to {user.benefits_data.name}. You will no longer have access to this account or it's data.
              </ConvertMessage>
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection span={12}>
          <SettingsButtonContainer span={12}>
            <Button onClick={() => this.removeAccount()} primary danger outline>Remove</Button>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session:state.session
});
const dispatchToProps = (dispatch) => ({
  cancelJoinRequest: (cognito_id, account_id) => dispatch(authenticated.cancelJoinRequest(cognito_id, account_id))
});
export default connect(mapStateToProps, dispatchToProps)(RemoveMembershipSetting);
