import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import BlankSpace from "../../Components/BlankSpace";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "../../Components/Container";
import { showTour } from "../../store/actions/tour";
import { openProfessionalPortalServicesModal } from "../../store/actions/stripe";
import { isMobile, osName } from "react-device-detect";
import NoPermission from "../../Components/NoPermission";
import {
  ContactButtons,
  ContactButtonMain,
  ContactButtonPadding,
  ContactButtonInner,
  ContactIconContainer,
  ContactTextContainer,
  Link
} from "./style";

class ContactWidget extends Component {

  static propTypes = {
    session: PropTypes.instanceOf(Object).isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = { account };
  }

  render() {
    const { id, showTour, openProfessionalPortalServicesModal } = this.props;
    const { account } = this.state;
    const can_purchase = account.features && account.features.in_app_purchases;

    return (
      <Container id={id} title="Contact Us" xs={12} sm={12} md={12} lg={5} xl={5} height={320} overflow="auto">
        {account.features && account.features.contact_options
          ? (
            <ContactButtons gutter={5}>
              <BlankSpace top={10} />
              <ContactButtonMain xs={12} sm={6} md={6} lg={6} xl={6}>
                <ContactButtonPadding>
                  <Link href="mailto:info@hopetrust.com">
                    <ContactButtonInner>
                      <ContactIconContainer xs={2} sm={2} md={2} lg={4} xl={4}>
                        <FontAwesomeIcon icon={["fad", "envelope"]} />
                      </ContactIconContainer>
                      <ContactTextContainer xs={10} sm={10} md={10} lg={8} xl={8}>Email</ContactTextContainer>
                    </ContactButtonInner>
                  </Link>
                </ContactButtonPadding>
              </ContactButtonMain>
              <ContactButtonMain xs={12} sm={6} md={6} lg={6} xl={6}>
                <ContactButtonPadding>
                  <Link href="tel:18334673878">
                    <ContactButtonInner>
                      <ContactIconContainer xs={2} sm={2} md={2} lg={4} xl={4}>
                        <FontAwesomeIcon icon={["fad", "phone"]} />
                      </ContactIconContainer>
                      <ContactTextContainer xs={10} sm={10} md={10} lg={8} xl={8}>Call</ContactTextContainer>
                    </ContactButtonInner>
                  </Link>
                </ContactButtonPadding>
              </ContactButtonMain>
              {isMobile || osName === "Mac OS"
                ? (
                  <ContactButtonMain xs={12} sm={6} md={6} lg={6} xl={6}>
                    <ContactButtonPadding>
                      <Link href="sms:+12016465094">
                        <ContactButtonInner>
                          <ContactIconContainer xs={2} sm={2} md={2} lg={4} xl={4}>
                            <FontAwesomeIcon icon={["fad", "comment"]} />
                          </ContactIconContainer>
                          <ContactTextContainer xs={10} sm={10} md={10} lg={8} xl={8}>Text</ContactTextContainer>
                        </ContactButtonInner>
                      </Link>
                    </ContactButtonPadding>
                  </ContactButtonMain>
                )
                : null
              }
              <ContactButtonMain xs={12} sm={6} md={6} lg={6} xl={6}>
                <ContactButtonPadding onClick={() => showTour()}>
                  <ContactButtonInner>
                    <ContactIconContainer xs={2} sm={2} md={2} lg={4} xl={4}>
                      <FontAwesomeIcon icon={["fad", "rocket"]} />
                    </ContactIconContainer>
                    <ContactTextContainer xs={10} sm={10} md={10} lg={8} xl={8}>Run Tour</ContactTextContainer>
                  </ContactButtonInner>
                </ContactButtonPadding>
              </ContactButtonMain>
              <ContactButtonMain xs={12} sm={12} md={12} lg={12} xl={12}>
                <ContactButtonPadding onClick={can_purchase ? () => openProfessionalPortalServicesModal() : null}>
                  <ContactButtonInner purple={1} disabled={!can_purchase}>
                    <ContactIconContainer span={2}>
                      <FontAwesomeIcon icon={["fad", "cart-plus"]} />
                    </ContactIconContainer>
                    <ContactTextContainer span={10}>Additional Services{!can_purchase ? " (Disabled)" : ""}</ContactTextContainer>
                  </ContactButtonInner>
                </ContactButtonPadding>
              </ContactButtonMain>
            </ContactButtons>
          )
          : <NoPermission message="This feature is not enabled on your account." icon="headset" />
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  showTour: () => dispatch(showTour()),
  openProfessionalPortalServicesModal: () => dispatch(openProfessionalPortalServicesModal())
});
export default connect(mapStateToProps, dispatchToProps)(ContactWidget);
