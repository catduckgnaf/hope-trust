import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { ViewContainer, Button } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Transactions from "../../Components/Transactions";
import PaymentMethods from "../../Components/PaymentMethods";
import PartnerBillingMetrics from "../../Components/PartnerBillingMetrics";
import { getCustomerSubscriptions, getCustomerTransactions } from "../../store/actions/account";
import { openPaymentMethodsModal, getStripeExpandedCustomer } from "../../store/actions/stripe";
import { getActivePartnerPlans } from "../../store/actions/plans";
import { BillingSections, AddPaymentMethodContainer } from "./style";
import Container from "../../Components/Container";
import NoPermission from "../../Components/NoPermission";

class PartnerBilling extends Component {
  constructor(props) {
    super(props);
    const { session, accounts, relationship } = props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const creator = relationship.list.find((u) => u.customer_id && !u.linked_account);
    const current_plan = current_account.partner_plan;
    this.state = {
      current_plan,
      current_account,
      creator
    };
  }

  componentDidMount() {
    const { getStripeExpandedCustomer, getCustomerSubscriptions, getActivePartnerPlans, account, user, plans } = this.props;
    const { creator } = this.state;
    if ((!account.requestedCustomer && !account.isFetchingCustomer)) getStripeExpandedCustomer(false, creator.customer_id);
    if ((!account.requestedSubscriptions && !account.isFetchingSubscriptions)) getCustomerSubscriptions(false, user.customer_id);
    if ((!account.requestedTransactions && !account.isFetchingTransactions)) getCustomerTransactions(false, creator.customer_id);
    if ((!plans.isFetchingActivePartnerPlans && !plans.requestedActivePartnerPlans)) getActivePartnerPlans(user.partner_data.partner_type);
  }

  render() {
    const { current_plan, creator, current_account } = this.state;
    const { openPaymentMethodsModal, getCustomerTransactions, account } = this.props;
    return (
      <ViewContainer paddingtop={20}>
        {current_account.features.billing
          ? (
            <BillingSections>
              {current_plan && !account.isFetchingCustomer
                ? <PartnerBillingMetrics />
                : null
              }
              <AddPaymentMethodContainer span={6} align="left">
                <Button blue nomargin onClick={() => openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: false })}>Add Payment Method</Button>
              </AddPaymentMethodContainer>
              <AddPaymentMethodContainer span={6} align="right">
                <Button blue nomargin onClick={() => getCustomerTransactions(true, creator.customer_id)} disabled={account.isFetchingTransactions}>{account.isFetchingTransactions ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh Transactions"}</Button>
              </AddPaymentMethodContainer>
              <PaymentMethods />
              <Transactions />
            </BillingSections>
          )
          : (
            <Container title="Billing" span={12} height={255}>
              <NoPermission message="This feature is not enabled on your account." icon="credit-card" />
            </Container>
          )
        }
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  session: state.session,
  account: state.account,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  getCustomerSubscriptions: (override, customer_id) => dispatch(getCustomerSubscriptions(override, customer_id)),
  getActivePartnerPlans: (type, override) => dispatch(getActivePartnerPlans(type, override)),
  openPaymentMethodsModal: (config) => dispatch(openPaymentMethodsModal(config)),
  getCustomerTransactions: (override, customer_id) => dispatch(getCustomerTransactions(override, customer_id))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerBilling);
