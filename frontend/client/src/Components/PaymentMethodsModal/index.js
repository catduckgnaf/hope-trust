import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import BillingContainer from "../BillingContainer";
import {
  PaymentMethodsMain,
  PaymentMethodsMainPadding,
  PaymentMethodsMainInner,
  PaymentMethodsMainInnerSection,
  PaymentMethodHeader,
  PaymentMethodMessage,
  PaymentMethodHint
} from "./style";
import { closePaymentMethodsModal } from "../../store/actions/stripe";

class PaymentMethodsModal extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { payment_methods_show, standalone = false, show_payment_method_messaging = false, user } = this.props;

    return (
      <Modal animationDuration={0} styles={{ modal: { maxWidth: "650px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={payment_methods_show} closeOnOverlayClick={false} blockScroll={true} showCloseIcon={false} center>
        <PaymentMethodsMain>
          <PaymentMethodsMainPadding>
            <PaymentMethodsMainInner>
              <PaymentMethodsMainInnerSection span={12}>
                <PaymentMethodHeader show_payment_method_messaging={show_payment_method_messaging ? 1 : 0}>Add Payment Method</PaymentMethodHeader>
              </PaymentMethodsMainInnerSection>
              {show_payment_method_messaging
                ? (
                  <PaymentMethodsMainInnerSection span={12}>
                    <PaymentMethodMessage>Looks like you do not have a payment method on file. Please add one before moving forward.</PaymentMethodMessage>
                  </PaymentMethodsMainInnerSection>
                )
                : null
              }
              <BillingContainer standalone={standalone}/>
              {show_payment_method_messaging && user.is_partner
                ? <PaymentMethodHint>You will not be charged until you have signed your service agreements.</PaymentMethodHint>
                : null
              }
            </PaymentMethodsMainInner>
          </PaymentMethodsMainPadding>
        </PaymentMethodsMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  closePaymentMethodsModal: () => dispatch(closePaymentMethodsModal())
});
export default connect(mapStateToProps, dispatchToProps)(PaymentMethodsModal);
