import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import modals from "./Requests";
import { closeRequestModal } from "../../store/actions/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ModalMain,
  ModalPadding,
  ModalInner,
  ModalInnerTitle,
  ModalInnerTitlePadding,
  ModalInnerTitleInner,
  ModalInnerTitleInnerText,
  ModalInnerTitleInnerClose
} from "./style";

class Modal extends Component {
  static propTypes = {
    closeRequestModal: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {};

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  buildModal = (type, callback) => {
    switch (type) {
      case "money":
        return <modals.MoneyRequest callback={callback} />;
      case "medical":
        return <modals.MedicalRequest callback={callback} />;
      case "transportation":
        return <modals.TransportationRequest callback={callback} />;
      case "food":
        return <modals.FoodRequest callback={callback} />;
      case "other_request_type":
        return <modals.OtherRequest callback={callback} />;
      default:
        return false;
    }
  };

  setWrapperRef = (node) => this.wrapperRef = node;

  handleClickOutside(event) {
    const { closeRequestModal, provider } = this.props;
    if (!provider.creatingProvider && this.wrapperRef && !this.wrapperRef.contains(event.target)) closeRequestModal();
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  render() {
    const { show, type, title, callback, closeRequestModal } = this.props;
    const ModalView = () => this.buildModal(type, callback);

    if (show) {
      return (
        <ModalMain>
          <ModalPadding>
            <ModalInner ref={this.setWrapperRef}>
              <ModalInnerTitle>
                <ModalInnerTitlePadding>
                  <ModalInnerTitleInner>
                    <ModalInnerTitleInnerText span={12}>
                    {title}
                      <ModalInnerTitleInnerClose onClick={() => closeRequestModal()}>
                        <FontAwesomeIcon icon={["fal", "times"]} />
                      </ModalInnerTitleInnerClose>
                    </ModalInnerTitleInnerText>
                  </ModalInnerTitleInner>
                </ModalInnerTitlePadding>
              </ModalInnerTitle>
              <ModalView />
            </ModalInner>
          </ModalPadding>
        </ModalMain>
      );
    }
    return null;
  }
}

const mapStateToProps = (state) => ({
  provider: state.provider
});
const dispatchToProps = (dispatch) => ({
  closeRequestModal: () => dispatch(closeRequestModal())
});
export default connect(mapStateToProps, dispatchToProps)(Modal);
