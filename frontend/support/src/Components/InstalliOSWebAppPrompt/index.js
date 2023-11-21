import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { closeInstalliOSWebAppModal } from "../../store/actions/session";
import { showNotification } from "../../store/actions/notification";
import { Button } from "../../global-components";
import add_to_home_screen_button from "./add_to_home_screen_button.png";
import safari_buttons from "./safari_buttons.png";
import ipad_share from "./ipad_share.png";
import ipad_add_to_homescreen from "./ipad_add_to_homescreen.png";
import {
  InstalliOSWebAppOverlay,
  InstalliOSWebAppInnerModal,
  InstalliOSWebAppArrow,
  InstalliOSWebAppInner,
  InstalliOSWebAppTitle,
  InstalliOSWebAppBody,
  InstalliOSWebAppButtons,
  AddToHomeScreenButtonImage
} from "./style";

class InstalliOSWebAppPrompt extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    const { isIPad, isIPhone, closeInstalliOSWebAppModal } = this.props;

    if (isIPhone) {
      return (
        <>
          <InstalliOSWebAppOverlay />
          <InstalliOSWebAppInnerModal iphone align="middle" justify="center">
            <InstalliOSWebAppInner>
              <InstalliOSWebAppTitle span={12}>Install Web Application</InstalliOSWebAppTitle>
              <InstalliOSWebAppBody span={12}>We noticed that you're using an iPhone.<br /><br />To make your experience as seamless as possible, we recommend installing our web application.<br /><br />Below this message you will see an arrow pointing to a share button.<br /><br /><AddToHomeScreenButtonImage src={safari_buttons} alt="safari_share_buttons" /><br /><br />Just click this button and scroll down until you see "Add to Home Screen", it looks like this.<br /><br /><AddToHomeScreenButtonImage src={add_to_home_screen_button} alt="add to home screen button" /><br /><br />Click this button, follow the prompts, and our app will be on your phone's home screen.<br /><br />Easy!</InstalliOSWebAppBody>
              <InstalliOSWebAppButtons span={12}>
                <Button type="button" onClick={() => closeInstalliOSWebAppModal()} green no margin outline rounded>Close</Button>
              </InstalliOSWebAppButtons>
            </InstalliOSWebAppInner>
            <InstalliOSWebAppArrow />
          </InstalliOSWebAppInnerModal>
        </>
      );
    } else if (isIPad) {
      return (
        <>
          <InstalliOSWebAppOverlay />
          <InstalliOSWebAppInnerModal ipad align="middle" justify="center">
            <InstalliOSWebAppInner>
              <InstalliOSWebAppTitle span={12}>Install Web Application</InstalliOSWebAppTitle>
              <InstalliOSWebAppBody span={12}>We noticed that you're using an iPad.<br /><br />To make your experience as seamless as possible, we recommend installing our web application.<br /><br />Above this message you will see an arrow pointing to a share button.<br /><br /><AddToHomeScreenButtonImage style={{ width: "100px" }} src={ipad_share} alt="safari_share_buttons" /><br /><br />Just click this button and scroll until you see "Add to Home Screen", it looks like this.<br /><br /><AddToHomeScreenButtonImage src={ipad_add_to_homescreen} alt="add to home screen button" /><br /><br />Click this button, follow the prompts, and our app will be on your tablet's home screen.<br /><br />Easy!</InstalliOSWebAppBody>
              <InstalliOSWebAppButtons span={12}>
                <Button type="button" onClick={() => closeInstalliOSWebAppModal()} green no margin outline rounded>Close</Button>
              </InstalliOSWebAppButtons>
            </InstalliOSWebAppInner>
            <InstalliOSWebAppArrow />
          </InstalliOSWebAppInnerModal>
        </>
      );
    }
    return null;
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  closeInstalliOSWebAppModal: () => dispatch(closeInstalliOSWebAppModal()),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(InstalliOSWebAppPrompt);
