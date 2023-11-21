import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { Button } from "../../global-components";
import authenticated from "../../store/actions/authentication";
import {
  IdleMainModalTitle,
  IdleMainModalBody,
  IdleMainButtonContainer
} from "./style";
import { refreshUser, updateUserStatus } from "../../store/actions/user";

class IdleModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      seconds: props.seconds,
      open: true
    };
  }

  componentDidMount() {
    const { logOut } = this.props;
    this.myInterval = setInterval(() => {
      const { seconds } = this.state;
      if (seconds > 0) {
        this.setState(({ seconds }) => ({
          seconds: seconds - 1
        }));
      } else if (seconds === 0) {
        logOut();
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  stayLoggedIn = () => {
    const { user, refreshUser, updateUserStatus } = this.props;
    this.setState({ open: false }, () => {
      updateUserStatus(user.cognito_id, true, false);
      refreshUser();
    });
  };

  render() {
    const { logOut, idle_message } = this.props;
    const { seconds, open } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={open} onClose={() => this.stayLoggedIn()} center>
        <IdleMainModalTitle>Your Session is About to Expire</IdleMainModalTitle>
        <Row>
          <Col span={12}>
            {!idle_message
              ? <IdleMainModalBody>We have detected that you have been idle for more than 60 minutes. In an effort to keep your account secure, we will log you out in <strong>{seconds} seconds</strong>.</IdleMainModalBody>
              : <IdleMainModalBody>{`${idle_message}\n\n`}To keep your account secure, we will log you out in <strong>{seconds} seconds</strong>.</IdleMainModalBody>
            }
          </Col>
          <Col span={12}>
            <Row>
              <IdleMainButtonContainer span={12}>
                <Button type="button" onClick={() => this.stayLoggedIn()} green>Stay Logged In</Button>
                <Button type="button" onClick={() => logOut()} danger>Logout</Button>
              </IdleMainButtonContainer>
            </Row>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  refreshUser: () => dispatch(refreshUser()),
  updateUserStatus: (cognito, status, idle) => dispatch(updateUserStatus(cognito, status, idle)),
  logOut: () => dispatch(authenticated.logOut())
});
export default connect(mapStateToProps, dispatchToProps)(IdleModal);
