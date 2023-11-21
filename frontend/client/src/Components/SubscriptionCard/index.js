import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import moment from "moment";
import { toastr } from "react-redux-toastr";
import { Button } from "../../global-components";
import { capitalize } from "../../utilities";
import { deleteMembership } from "../../store/actions/membership";
import { cancelSubscription } from "../../store/actions/account";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SubscriptionCardMain,
  SubscriptionCardPadding,
  SubscriptionCardInner,
  SubscriptionCardSection,
  SubscriptionCardSectionText,
  MobileLabel
} from "./style";

class SubscriptionCard extends Component {

  constructor(props) {
    super(props);
    const { account } = props;
    const current_partner_subscription = account.subscriptions.active.find((s) => s.type === "partner") || {};
    const cancelled_subscriptions = account.subscriptions.cancelled.filter((s) => s.type === "user");
    const can_cancel = cancelled_subscriptions.length < (current_partner_subscription.max_cancellations || 0);
    this.state = {
      is_cancelling: false,
      is_deleting: false,
      can_cancel,
      remaining_cancellations: can_cancel ? (current_partner_subscription.max_cancellations - cancelled_subscriptions.length) : 0
    };
  }

  cancelSubscription = async (subscription) => {
    const { cancelSubscription, plans } = this.props;
    const { remaining_cancellations } = this.state;
    const free_plan = plans.active_user_plans.find((p) => p.name === "Free");
    const current_plan = plans.active_user_plans.find((p) => p.price_id === subscription.price_id);
    const cancelOptions = {
      onOk: async () => {
        this.setState({ is_cancelling: true });
        await cancelSubscription(subscription.id, subscription.subscription_id, subscription.transfer_customer_id, subscription.transfer_cognito_id, free_plan, current_plan);
        this.setState({ is_cancelling: false });
        this.unlinkSubscription(subscription.subscription_id);
      },
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Understood",
      cancelText: "Close"
    };
    toastr.confirm(`Are you sure you want to cancel this subscription? It will no longer be managed by you. The monthly subscription will be cancelled and the account will be downgraded to a Free account.\n\nYou have ${remaining_cancellations} remaining ${remaining_cancellations === 1 ? "cancellation" : "cancellations"}. If you use all of your allotted cancellations, you will need to contact support to be considered for a cancellation increase.`, cancelOptions);
  };

  unlinkSubscription = async (subscription_id) => {
    const { deleteMembership, accounts } = this.props;
    const subscription_account = accounts.find((account) => account.subscription_id === subscription_id);
    const unlinkOptions = {
      onOk: async () => {
        this.setState({ is_deleting: true });
        await deleteMembership(subscription_account.id);
        this.setState({ is_deleting: false });
      },
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Yes",
      cancelText: "No"
    };
    toastr.confirm("Would you like to unlink this account? You will no longer have access to this account.\n\nIf you have added any payment methods on this account, please be sure to remove or replace all credit card information prior to unlinking.", unlinkOptions);
  };


  render() {
    const { subscription, plans } = this.props;
    const { is_cancelling, is_deleting, can_cancel } = this.state;
    const account_plans = plans.active_user_plans.filter((up) => up.price_id === subscription.price_id);
    return (
      <SubscriptionCardMain>
        <SubscriptionCardPadding>
          <SubscriptionCardInner>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Name: </MobileLabel><SubscriptionCardSectionText transform="capitalize">{subscription.first_name} {subscription.last_name}</SubscriptionCardSectionText>
            </SubscriptionCardSection>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Status: </MobileLabel><SubscriptionCardSectionText status={subscription.in_transfer ? "in_transfer" : subscription.status}>{subscription.in_transfer ? "In Transfer" : capitalize(subscription.status)}</SubscriptionCardSectionText>
            </SubscriptionCardSection>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Tier: </MobileLabel><SubscriptionCardSectionText>{account_plans.length ? account_plans[0].name : "N/A"}</SubscriptionCardSectionText>
            </SubscriptionCardSection>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Covered Cost: </MobileLabel><SubscriptionCardSectionText transform="capitalize">${(subscription.additional_seat_cost || subscription.account_value || 0).toLocaleString()} per month</SubscriptionCardSectionText>
            </SubscriptionCardSection>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Created: </MobileLabel><SubscriptionCardSectionText transform="capitalize">{moment(subscription.created_at).format("MMMM DD, YYYY")}</SubscriptionCardSectionText>
            </SubscriptionCardSection>
            <SubscriptionCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>
              <SubscriptionCardSectionText paddingtop={3} paddingbottom={3}>
                {can_cancel && (subscription.transfer_customer_id && subscription.transfer_cognito_id) && !subscription.in_transfer
                  ? <Button disabled={is_cancelling || is_deleting} danger small nomargin onClick={() => this.cancelSubscription(subscription)}>{is_cancelling ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Cancel"}</Button>
                  : <Button disabled danger small nomargin>Cancel</Button>
                }
              </SubscriptionCardSectionText>
            </SubscriptionCardSection>
          </SubscriptionCardInner>
        </SubscriptionCardPadding>
      </SubscriptionCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  plans: state.plans,
  account: state.account
});
const dispatchToProps = (dispatch) => ({
  cancelSubscription: (id, subscription_id, transfer_customer_id, transfer_cognito_id, free_plan, current_plan) => dispatch(cancelSubscription(id, subscription_id, transfer_customer_id, transfer_cognito_id, free_plan, current_plan)),
  deleteMembership: (id) => dispatch(deleteMembership(id))
});
export default connect(mapStateToProps, dispatchToProps)(SubscriptionCard);