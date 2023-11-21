import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import { isMobile } from "react-device-detect";
import { updatePartner } from "../../store/actions/partners";
import { Button, ViewContainer, HeavyFont } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { theme } from "../../global-styles";
import {
  PartnerLogoModalMain,
  PartnerLogoModalMainPadding,
  PartnerLogoModalMainInner,
  PartnerLogoModalMainInnerSection,
  PartnerLogoModalHeader,
  PartnerLogoModalMessage,
  LogoButtonContainer,
  FileTypesMessage
} from "./style";
import { closePartnerLogoModal } from "../../store/actions/partners";

class PartnerLogoModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageSrc: "",
      logo_error: "",
      editing_logo: false,
      saving: false
    };
  }

  onFileChange = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      event.type === "image/png" ? "PNG" : "JPEG",
      100,
      0,
      (uri) => {
        this.setState({ imageSrc: uri, logo_error: "", editing_logo: false }, () => this.saveAvatar(uri));
      },
      "base64"
    );
  };

  throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        this.setState({ logo_error: "This file type is not supported." });
        break;
      case "maxsize":
        this.setState({ logo_error: "Avatar must be less than 2MB" });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setState({ logo_error: "" });
    }, 5000);
  };

  saveAvatar = async (logo) => {
    const { updatePartner } = this.props;
    this.setState({ saving: true });
    await updatePartner({ logo });
    this.setState({ editing_logo: false, imageSrc: "", saving: false });
  };

  render() {
    const { is_uploading_logo, user, closePartnerLogoModal } = this.props;
    const { logo_error, editing_logo, imageSrc, saving } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "auto", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_uploading_logo} closeOnOverlayClick={false} blockScroll={true} onClose={() => closePartnerLogoModal()} center>
        <PartnerLogoModalMain>
          <PartnerLogoModalMainPadding>
            <PartnerLogoModalMainInner>
              <PartnerLogoModalMainInnerSection span={12}>
                <PartnerLogoModalHeader>Upload Entity Logo</PartnerLogoModalHeader>
              </PartnerLogoModalMainInnerSection>
              <PartnerLogoModalMainInnerSection span={12}>
                <PartnerLogoModalMessage>As an organization entity, it is your responsibility to set up your organization for co-branding. To get this started, please upload a logo for {user.partner_data.name}. This logo will be co-branded across any paid client accounts managed by your organization.<br /><br /><HeavyFont>For best results, choose a square image of at least 512x512 pixels.</HeavyFont></PartnerLogoModalMessage>
              </PartnerLogoModalMainInnerSection>
              <PartnerLogoModalMainInnerSection align="center" span={12}>
                {editing_logo
                  ? (
                    <ViewContainer style={{ position: "relative", margin: "auto", width: "250px", height: "250px", border: `2px dashed ${logo_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                      <AvatarImageCr
                        cancel={() => this.setState({ imageSrc: "", editing_logo: false, logo_error: "" })}
                        apply={(e) => this.onFileChange(e)}
                        isBack={false}
                        text={logo_error ? logo_error : "Drag a File or Click to Browse"}
                        errorHandler={(type) => this.throwAvatarError(type)}
                        iconStyle={{ marginBottom: "20px", width: "50px", height: "32px" }}
                        sliderConStyle={{ position: "relative", top: "30px", background: "#FFFFFF", height: "60px" }}
                        textStyle={{ fontSize: "12px" }}
                        maxsize={1024 * 1024 * 5}
                        actions={[
                          <Button key={0} style={{ display: "none" }}></Button>,
                          <Button key={1} small green nomargin marginbottom={5} widthPercent={100}>Apply</Button>
                        ]}
                      />
                      <FileTypesMessage>Files must be of type .png, .jpg or .jpeg.</FileTypesMessage>
                    </ViewContainer>
                  )
                  : <ReactAvatar src={user.partner_data.logo || imageSrc} size={250} name={user.partner_data.name} round />
                }
                <LogoButtonContainer>
                  <Button blue nomargin onClick={() => this.setState({ editing_logo: true })}>Browse</Button>
                  {imageSrc || user.partner_data.logo
                    ? <Button disabled={saving} marginleft={10} green nomargin onClick={() => closePartnerLogoModal()}>{saving ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Finish"}</Button>
                    : null
                  }
                </LogoButtonContainer>
              </PartnerLogoModalMainInnerSection>
            </PartnerLogoModalMainInner>
          </PartnerLogoModalMainPadding>
        </PartnerLogoModalMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  closePartnerLogoModal: () => dispatch(closePartnerLogoModal()),
  updatePartner: (updates) => dispatch(updatePartner(updates))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerLogoModal);
