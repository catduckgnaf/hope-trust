import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { runCustomAction, hideBannerNotification } from "../../store/actions/notification";
import {
  Button
} from "../../global-components";
import {
  AlertMain,
  AlertMainPadding,
  AlertMainInner,
  AlertInnerContainer,
  AlertInnerContainerSection,
  AlertActionContainer,
  AlertProgress
} from "./style";

class Alert extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hide: true,
      percent: 100
    };
    this.intervalId = null;
  }

  componentDidMount() {
    const { config, hideBannerNotification } = this.props;
    if (config.timeout) {
      const distance = 100 / (config.timeout / 10);
      this.intervalId = setInterval(() => {
        const percent = this.state.percent - distance;

        if (percent > 0) {
          this.setState({ percent });
        } else {
          setTimeout(() => {
            this.setState({ percent: 0 }, () => hideBannerNotification());
          }, 1000);
        }
      }, 10);
    }
  }

  componentDidUpdate() {
    const { config } = this.props;
    if (config.timeout && (this.state.percent <= 0 && this.intervalId)) clearTimeout(this.intervalId);
  }

  componentWillUnmount() {
    const { config } = this.props;
    if (config.timeout && this.intervalId) clearTimeout(this.intervalId);
  }

  render() {
    const { config, runCustomAction, hideBannerNotification, path } = this.props;
    const { pages = [], message, action, type, button_text, hide_close } = config;
    const { hide, percent } = this.state;
    if (pages.includes(path) || !pages.length) {
      return (
        <AlertMain>
          <AlertMainPadding>
            <AlertProgress style={{ width: `${percent}%` }} type={type} />
            <AlertMainInner hide={hide ? 1 : 0} type={type}>
              <AlertInnerContainer>
                <AlertInnerContainerSection span={12}>
                  {message}
                </AlertInnerContainerSection>
              </AlertInnerContainer>
              {action
                ? (
                  <AlertActionContainer>
                    <Button
                      small
                      danger={type === "error" ? 1 : 0}
                      green={type === "success" ? 1 : 0}
                      blue={type === "info" ? 1 : 0}
                      warning={type === "warning" ? 1 : 0}
                      onClick={() => runCustomAction(action)}>
                      {button_text}
                    </Button>
                    {!hide_close
                      ? (
                        <Button
                          small
                          green
                          onClick={() => hideBannerNotification()}>
                          Close
                      </Button>
                      )
                      : null
                    }
                  </AlertActionContainer>
                )
                : null
              }
            </AlertMainInner>
          </AlertMainPadding>
        </AlertMain>
      );
    }
    return null;
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  runCustomAction: (action) => dispatch(runCustomAction(action)),
  hideBannerNotification: () => dispatch(hideBannerNotification())
});
export default connect(mapStateToProps, dispatchToProps)(Alert);
