import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withPolling } from "../../HOC/withPolling";
import { getCoreSettings } from "../../store/actions/customer-support";
import {
  MaintenanceModeMain,
  MaintenanceModeMainPadding,
  MaintenanceModeMainInner,
  MaintenanceModeMainInnerSection,
  MaintenanceModeHeader,
  MaintenanceModeMessage,
  MaintenanceModeHeaderIcon
} from "./style";

class MaintenanceMode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  }

  close = () => {
    this.setState({ open: false });
  }

  render() {
    const { user, customer_support } = this.props;
    const { open } = this.state;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "auto", zIndex: 2147483646 }, overlay: { zIndex: 2147483646, background: "rgba(0,0,0,0.93)" } }} open={open} closeOnOverlayClick={false} blockScroll={true} showCloseIcon={!!user.is_customer_support} onClose={() => this.close()} center>
        <MaintenanceModeMain>
          <MaintenanceModeMainPadding>
            <MaintenanceModeMainInner>
              <MaintenanceModeHeaderIcon>
                <FontAwesomeIcon icon={["fad", "tools"]} />
              </MaintenanceModeHeaderIcon>
              <MaintenanceModeMainInnerSection span={12}>
                <MaintenanceModeHeader>{customer_support.core_settings.support_maintenance_mode_title}</MaintenanceModeHeader>
              </MaintenanceModeMainInnerSection>
              <MaintenanceModeMainInnerSection span={12}>
                <MaintenanceModeMessage>{customer_support.core_settings.support_maintenance_mode_message}</MaintenanceModeMessage>
              </MaintenanceModeMainInnerSection>
            </MaintenanceModeMainInner>
          </MaintenanceModeMainPadding>
        </MaintenanceModeMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  user: state.user
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(withPolling(getCoreSettings, 30000, [true])(MaintenanceMode));