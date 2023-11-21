import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeUserPassword } from "../../store/actions/user";
import { checkPasswordConditions } from "../../utilities";
import { showNotification } from "../../store/actions/notification";
import PasswordStrengthBar from "react-password-strength-bar";
import {
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  RequiredStar,
  RevealPassword
} from "../../global-components";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer
} from "../../Pages/Settings/style";
import { ChangePasswordButton } from "./style";

class ChangePassword extends Component {
  static propTypes = {
    changeUserPassword: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      new_password: "",
      confirm_password: "",
      old_password: "",
      is_loading: false,
      revealed: false
    };
  }

  updatePassword = async (oldPassword, newPassword, confirmPassword) => {
    const { changeUserPassword, showNotification } = this.props;
    this.setState({ is_loading: true });
    const updated = await changeUserPassword(oldPassword, newPassword);
    if (updated.success) {
      this.setState({
        new_password: "",
        old_password: "",
        confirm_password: "",
        revealed: false
      }, () => showNotification("success", "Updated", updated.message));
    } else {
      showNotification("error", "Update Error", updated.message);
    }
    this.setState({ is_loading: false });
    this.oldPasswordInput.value = "";
    this.newPasswordInput.value = "";
    this.confirmPasswordInput.value = "";
  };

  render() {
    const { new_password, old_password, confirm_password, is_loading, revealed } = this.state;
    const passwordCheck = checkPasswordConditions(8, new_password, confirm_password, old_password);
    return (
      <RowBody>
        <RowHeader>
          <Row>
            <Col>Change Password</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
        </RowContentSection>
        <RowContentSection span={12}>
          <RowBodyPadding paddingbottom={1}>
            <RowContentSection xs={12} sm={12} md={12} lg={12} xl={12}>
              <InputWrapper>
                <InputLabel> <RequiredStar>*</RequiredStar> Old Password</InputLabel>
                <Input ref={(input) => this.oldPasswordInput = input} id="old_password" type={revealed ? "text" : "password"} placeholder="********" onChange={(event) => this.setState({[event.target.id]: event.target.value}) }/>
              </InputWrapper>
              <InputWrapper>
                <InputLabel> <RequiredStar>*</RequiredStar> New Password (at least 8 characters, 1 number, 1 uppercase)</InputLabel>
                <Input ref={(input) => this.newPasswordInput = input} id="new_password" type={revealed ? "text" : "password"} placeholder="********" onChange={(event) => this.setState({[event.target.id]: event.target.value}) }/>
                <RevealPassword onClick={() => this.setState({ revealed: !revealed })}><FontAwesomeIcon icon={["fad", revealed ? "eye-slash" : "eye"]} /></RevealPassword>
                <PasswordStrengthBar password={new_password} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
              </InputWrapper>
              <InputWrapper>
                <InputLabel> <RequiredStar>*</RequiredStar> Confirm New Password</InputLabel>
                <Input ref={(input) => this.confirmPasswordInput = input} id="confirm_password" type={revealed ? "text" : "password"} placeholder="********" onChange={(event) => this.setState({[event.target.id]: event.target.value}) }/>
                {(old_password && new_password && confirm_password)
                  ? <InputHint error={passwordCheck.pass ? 0 : 1} success={passwordCheck.pass ? 1 : 0}>{passwordCheck.message}</InputHint>
                  : null
                }
              </InputWrapper>
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection span={12}>
          <SettingsButtonContainer span={12}>
            <ChangePasswordButton disabled={!(old_password && passwordCheck.pass)} onClick={() => this.updatePassword(old_password, new_password, confirm_password)} small nomargin green>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Change Password"}</ChangePasswordButton>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  changeUserPassword: (oldPassword, newPassword) => dispatch(changeUserPassword(oldPassword, newPassword))
});
export default connect(mapStateToProps, dispatchToProps)(ChangePassword);
