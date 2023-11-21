import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { checkPasswordConditions } from "../../utilities";
import authentication from "../../store/actions/authentication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import PropTypes from "prop-types";
import PasswordStrengthBar from "react-password-strength-bar";
import {
  ForcePasswordChangeFormMain,
  ForcePasswordChangeFormFields,
  ForcePasswordChangeButton
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  FormContainer,
  Button,
  RequiredStar,
  RevealPassword
} from "../../global-components";

class ForceChangePasswordForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      revealed: false
    };
  }

  static propTypes = {
    completeNewPassword: PropTypes.func.isRequired,
  };
  static defaultProps = {};

  handleSubmit = async (event) => {
    const { completeNewPassword, user, newPassword, showNotification } = this.props;
    event.preventDefault();
    this.setState({ isLoading: true });
    const complete = await completeNewPassword(user, newPassword);
    if (complete.success) {
      this.setState({
        new_password: "",
        old_password: "",
        confirm_password: "",
        revealed: false
      }, () => showNotification("success", "Updated", complete.message));
    } else {
      showNotification("error", "Update Error", complete.error.message);
    }
    this.setState({ isLoading: false });
  };

  render() {
    const { history, set, email, newPassword, confirmNewPassword } = this.props;
    const { isLoading, revealed } = this.state;
    const passwordCheck = checkPasswordConditions(16, newPassword, confirmNewPassword);

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <ForcePasswordChangeFormMain>
          <ForcePasswordChangeFormFields>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
              <Input
                type="email"
                id="email"
                autoComplete="new-password"
                value={email}
                readOnly
              />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> New Password (at least 8 characters, 1 number, 1 uppercase)</InputLabel>
              <Input
                type={revealed ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => set(event.target.id, event.target.value)}
              />
              <RevealPassword onClick={() => this.setState({ revealed: !revealed })}><FontAwesomeIcon icon={["fad", revealed ? "eye-slash" : "eye"]} /></RevealPassword>
              <PasswordStrengthBar password={newPassword} scoreWords={["very weak", "weak", "okay", "good", "strong"]} shortScoreWord="Password too short" minLength={8} />
            </InputWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Confirm Password</InputLabel>
              <Input
                type={revealed ? "text" : "password"}
                id="confirmNewPassword"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(event) => set(event.target.id, event.target.value)}
              />
              {(newPassword && confirmNewPassword)
                ? <InputHint error={passwordCheck.pass ? 0 : 1} success={passwordCheck.pass ? 1 : 0}>{passwordCheck.message}</InputHint>
                : null
              }
            </InputWrapper>
          </ForcePasswordChangeFormFields>
          <ForcePasswordChangeButton nomargin disabled={!passwordCheck.pass || isLoading} type="submit" secondary green outline>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Submit"}</ForcePasswordChangeButton>
          <Button type="button" outline danger onClick={() => history.goBack()}>Cancel</Button>
        </ForcePasswordChangeFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  completeNewPassword: (email, newPassword) => dispatch(authentication.completeNewPassword(email, newPassword)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(ForceChangePasswordForm);
