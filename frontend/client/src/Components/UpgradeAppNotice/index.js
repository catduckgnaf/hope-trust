import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import { updateAppVersion } from "../../store/actions/session";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalize } from "../../utilities";
import {
  UpgradeAppNoticeMain,
  UpgradeAppNoticePadding,
  UpgradeAppNoticeInner,
  UpgradeAppNoticeInnerSection,
  UpgradeAppNoticeInnerSectionIcon,
  UpgradeAppSectionHeader,
  UpgradeAppSectionMessage,
  UpgradeAppSectionButtonContainer
} from "./style";

class UpgradeAppNotice extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      do_not_show_routes: ["/client-registration", "/partner-registration", "/account-registration", "/accounts"]
    };
  }

  updateAppVersion = () => {
    const { updateAppVersion } = this.props;
    this.setState({ show: false }, () => updateAppVersion());
  };

  render() {
    const { user, customer_support, location } = this.props;
    const { show, do_not_show_routes } = this.state;

    return (
      <UpgradeAppNoticeMain show={show && !do_not_show_routes.includes(location.pathname) ? 1 : 0}>
        <UpgradeAppNoticePadding>
          <UpgradeAppNoticeInner>
            <UpgradeAppNoticeInnerSection span={12} className="fa-layers fa-fw">
              <UpgradeAppNoticeInnerSectionIcon>
                <FontAwesomeIcon icon={["fad", "arrow-alt-circle-up"]} />
              </UpgradeAppNoticeInnerSectionIcon>
            </UpgradeAppNoticeInnerSection>
            <UpgradeAppNoticeInnerSection span={12}>
              <UpgradeAppSectionHeader>New Release!{customer_support.core_settings.incoming_client_app_version ? ` (v${customer_support.core_settings.incoming_client_app_version})` : null}</UpgradeAppSectionHeader>
            </UpgradeAppNoticeInnerSection>
            <UpgradeAppNoticeInnerSection span={12}>
              <UpgradeAppSectionMessage>
                Hello{user.first_name ? ` ${capitalize(user.first_name)}` : null}, we have released a new version of Hope Trust. Please update to the latest version by clicking the Update button below. This will only take a moment.
              </UpgradeAppSectionMessage>
            </UpgradeAppNoticeInnerSection>
            <UpgradeAppNoticeInnerSection span={12}>
              <UpgradeAppSectionButtonContainer>
                <Button widthPercent={80} blue onClick={() => this.updateAppVersion()}>Update</Button>
              </UpgradeAppSectionButtonContainer>
            </UpgradeAppNoticeInnerSection>
          </UpgradeAppNoticeInner>
        </UpgradeAppNoticePadding>
      </UpgradeAppNoticeMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  customer_support: state.customer_support,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  updateAppVersion: () => dispatch(updateAppVersion())
});
export default connect(mapStateToProps, dispatchToProps)(UpgradeAppNotice);
