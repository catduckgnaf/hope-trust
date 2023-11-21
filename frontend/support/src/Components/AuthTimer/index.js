import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import moment from "moment";
import {
  TimerText,
  TimerTime
} from "./style";

class AuthTimer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      seconds: 180
    };
  }

  componentDidMount() {
    const { cancel } = this.props;
    this.myInterval = setInterval(() => {
      const { seconds } = this.state;
      if (seconds > 0) {
        this.setState(({ seconds }) => ({
          seconds: seconds - 1
        }));
      } else if (seconds === 0) {
        cancel();
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  render() {
    const { seconds } = this.state;
    const duration = moment.utc(seconds * 1000).format("m:ss");
    return (
      <TimerText urgent={seconds < 10 ? 1 : 0}>This verification will expire in <TimerTime urgent={seconds < 10 ? 1 : 0}>{duration}</TimerTime></TimerText>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(AuthTimer);
