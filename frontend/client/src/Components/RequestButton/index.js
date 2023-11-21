import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { dispatchRequest } from "../../store/actions/request";
import { openRequestModal, closeRequestModal } from "../../store/actions/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showNotification } from "../../store/actions/notification";
import {
  RequestButtonMain,
  RequestButtonPadding,
  RequestButtonInner,
  RequestButtonIcon,
  RequestButtonText
} from "./style";
import { showLoader, hideLoader } from "../../store/actions/loader";

class RequestButton extends Component {
  static propTypes = {
    dispatchRequest: PropTypes.func.isRequired,
    openRequestModal: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      user_permissions: account.permissions
    };
  }

  handleRequest = async (requestInfo) => {
    const { showNotification, dispatchRequest, closeRequestModal, showLoader, hideLoader } = this.props;
    showLoader("Creating request...");
    const request = await dispatchRequest(requestInfo);
    if (request.success) {
      closeRequestModal();
      showNotification("success", "Request dispatched", "Your request was sent to HopeTrust for review.");
    } else {
      showNotification("error", "Request not created", request.error.message);
    }
    hideLoader();
  };

  render() {
    const { icon, title, type, openRequestModal, permissions } = this.props;
    const { user_permissions } = this.state;
    return (
      <RequestButtonMain>
        <RequestButtonPadding>
          {permissions.every((permission) => user_permissions.includes(permission))
            ? (
              <RequestButtonInner type={type} onClick={() => openRequestModal(type, this.handleRequest, title)}>
                <RequestButtonIcon> <FontAwesomeIcon icon={["fad", icon]} /></RequestButtonIcon> <RequestButtonText>{title}</RequestButtonText>
              </RequestButtonInner>
            )
            : (
              <RequestButtonInner type={type} disabled>
                <RequestButtonIcon> <FontAwesomeIcon icon={["fad", icon]} /></RequestButtonIcon> <RequestButtonText>{title}</RequestButtonText>
              </RequestButtonInner>
            )
          }
        </RequestButtonPadding>
      </RequestButtonMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  dispatchRequest: (requestInfo) => dispatch(dispatchRequest(requestInfo)),
  openRequestModal: (type, callback, title) => dispatch(openRequestModal(type, callback, title)),
  closeRequestModal: () => dispatch(closeRequestModal()),
  showLoader: (message) => dispatch(showLoader(message)),
  hideLoader: () => dispatch(hideLoader()),
  showNotification: (type, title, message, meta) => dispatch(showNotification(type, title, message, meta))
});
export default connect(mapStateToProps, dispatchToProps)(RequestButton);
