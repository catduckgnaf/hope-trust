import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
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
    const { showCloseIcon, title, message, open } = this.props;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={open} focusTrapped={true} showCloseIcon={showCloseIcon} blockScroll={true} closeOnOverlayClick={false} center>
        <BlockBrowserMainModalTitle>{title}</BlockBrowserMainModalTitle>
        <Row>
          <Col span={12}>
            <BlockBrowserMainModalBody>{message}</BlockBrowserMainModalBody>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BlockBrowserModal);
