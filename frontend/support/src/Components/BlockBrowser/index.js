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
            <BlockBrowserMainModalBody>We apologize for any inconvenience. We currently do not support Microsoft Edge or Internet Explorer. We are compatible with over 90% of browsers including, Chrome, Safari and Firefox. Please utilize one of these alternatives when using the Hope Trust application</BlockBrowserMainModalBody>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BlockBrowserModal);
