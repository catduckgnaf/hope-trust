import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { isIE, isEdge } from "react-device-detect";
import {
  BlockBrowserMainModalTitle,
  BlockBrowserMainModalBody
} from "./style";

class BlockBrowserModal extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={[isIE, isEdge].some((e) => e)} focusTrapped={true} showCloseIcon={false} blockScroll={true} closeOnOverlayClick={false} center>
        <BlockBrowserMainModalTitle>Unsupported Browser</BlockBrowserMainModalTitle>
        <Row>
          <Col span={12}>
            <BlockBrowserMainModalBody>We apologize for any inconvenience. Hope Trust is built with modern technology which requires a modern browser. We currently do not support Microsoft Edge or Internet Explorer. Please switch to Google Chrome or any modern browser to ensure a streamlined experience.</BlockBrowserMainModalBody>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BlockBrowserModal);
