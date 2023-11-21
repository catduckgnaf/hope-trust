import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { Button, HeavyFont, HorizontalRule } from "../../global-components";
import { closeCertificateModal } from "../../store/actions/partners";
import { generateWord } from "../../store/actions/pdf";
import { getReadableUserAddress } from "../../utilities";
import {
  ModalTitle,
  CertificateBodyItem,
  ButtonContainer,
  CertificateBody,
  CertificateSignatureImg,
  CertificateSignatureItem,
  CertificateSignatureBlank,
  CertificateNotice
} from "./style";
import moment from "moment";
import { isString } from "lodash";

class CertificateModal extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  generate = () => {
    const { closeCertificateModal, generateWord } = this.props;
    generateWord("certificate_body", "Certificate of Completion");
    closeCertificateModal();
  };

  render() {
    const { user, is_viewing_certificate, config, closeCertificateModal } = this.props;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_viewing_certificate} onClose={() => closeCertificateModal()} center>
        <ModalTitle>Certificate Preview</ModalTitle>
        <Row>
          <CertificateBody span={12} id="certificate_body">
            <CertificateBodyItem id="cert_title" size={20} bold>Certificate of Completion</CertificateBodyItem>
            <CertificateBodyItem id="cert_subtitle">Continuing Education for Life Insurance</CertificateBodyItem>
            <CertificateBodyItem break id="cert_item">Name of Student: <HeavyFont>{user.first_name} {user.last_name}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="cert_item">National Producer Number (NPN): <HeavyFont>{user.partner_data.npn ? user.partner_data.npn : "N/A"}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="cert_item">Resident State Producer License Number: <HeavyFont>{user.partner_data.resident_state_license_number ? user.partner_data.resident_state_license_number : "N/A"}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="cert_item">Residence Address: <HeavyFont>{getReadableUserAddress(user)}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="cert_item">CE Provider Number: <HeavyFont>#{config.state.provider_number}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="cert_item">CE Course Number: <HeavyFont>#{config.state.course_number}</HeavyFont></CertificateBodyItem>
            <CertificateBodyItem id="signature_block_blank" break bold has_sub>
              <CertificateSignatureBlank/>
              <HorizontalRule height={3}/>
              <CertificateSignatureItem id="signature_item">{user.first_name} {user.last_name}</CertificateSignatureItem>
              <CertificateSignatureItem id="signature_item">Student</CertificateSignatureItem>
            </CertificateBodyItem>
            <CertificateBodyItem id="text_block" break line_space>
              I, {config.state.instructor_name}, {config.state.instructor_info}, certify that {user.first_name} {user.last_name} has completed in its entirety the self-study course, {config.state.course_name}, earning {config.state.credits_value} credit hours of {config.state.course_product} on {moment(config.response.updated_at).format("dddd, MMMM D, YYYY")}.
            </CertificateBodyItem>
            <CertificateBodyItem id="signature_block" break bold has_sub>
              <CertificateSignatureImg src={config.state.instructor_signature} alt="Instructor Signature" />
              <HorizontalRule height={3}/>
              <CertificateSignatureItem id="signature_item">{config.state.instructor_name}</CertificateSignatureItem>
              <CertificateSignatureItem id="signature_item">Course Instructor</CertificateSignatureItem>
              {config.state.instructor_number
              ? <CertificateSignatureItem id="signature_item">{user.state} Instructor Number: #{config.state.instructor_number}</CertificateSignatureItem>
              : null
            }
            </CertificateBodyItem>
            {config.state.coordinator_number
              ? (
                <>
                  <CertificateBodyItem id="text_block" break line_space>
                    I, {config.state.coordinator_name}, {config.state.coordinator_info}, certify that {user.first_name} {user.last_name} has completed in its entirety the self-study course, {config.state.course_name}, earning {config.state.credits_value} credit hours of {config.state.course_product} on {moment(config.response.updated_at).format("dddd, MMMM D, YYYY")}.
                  </CertificateBodyItem>
                  <CertificateBodyItem id="signature_block" break bold has_sub>
                    <CertificateSignatureImg src={config.state.coordinator_signature} alt="Coordinator Signature" />
                    <HorizontalRule height={3}/>
                    <CertificateSignatureItem id="signature_item">{config.state.coordinator_name}</CertificateSignatureItem>
                    <CertificateSignatureItem id="signature_item">Course Coordinator</CertificateSignatureItem>
                    {config.state.coordinator_number && isString(config.state.coordinator_number)
                      ? <CertificateSignatureItem id="signature_item">{user.state} Instructor Number: #{config.state.coordinator_number}</CertificateSignatureItem>
                      : null
                    }
                  </CertificateBodyItem>
                </>
              )
              : null
            }
            <CertificateNotice id="cert_notice">Submitting a false or fraudulent certificate of completion to the Department may result in denial of a license application and revocation of a license. Student should retain a copy of this certificate for five (5) years.</CertificateNotice>
          </CertificateBody>
          <Col span={12}>
            <Row>
              <ButtonContainer span={12}>
                <Button type="button" onClick={() => this.generate()} blue>Download</Button>
                <Button type="button" onClick={() => closeCertificateModal()} danger>Close</Button>
              </ButtonContainer>
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
  closeCertificateModal: () => dispatch(closeCertificateModal()),
  generateWord: (id, title) => dispatch(generateWord(id, title))
});
export default connect(mapStateToProps, dispatchToProps)(CertificateModal);
