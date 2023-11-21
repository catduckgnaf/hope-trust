import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { orderBy } from "lodash";
import moment from "moment";
import Invoice from "../../Components/Invoice";
import { getReadableUserAddress, uniqueID } from "../../utilities";
import { verifyDiscount } from "../../store/actions/stripe";
import { showNotification } from "../../store/actions/notification";
import {
  CancelSubscriptionMain
} from "./style";
const session_id = uniqueID(4);

class CancelSubscription extends Component {
  constructor(props) {
    super(props);
    const { account, accounts, relationship, user, session, plans } = props;
    document.title = "Cancel Subscription";
    const { subscriptions = false, discount } = account.customer;
    let invoice_items = [];
    let cancelled_items = [];
    const prepaid_months = 1;
    const default_source = account.customer.default_source;
    const current_balance = account.customer.balance ? (Math.abs(account.customer.balance)/100) : 0;
    const default_payment_method = account?.customer?.sources?.data.find((c) => (c.id === default_source));
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const account_customer = relationship.list.find((u) => u.customer_id && !u.linked_account);
    const active_subscription = current_account.subscription;
    const current_plan = (user.is_partner && !session.is_switching) ? current_account.partner_plan : current_account.user_plan;
    const current_stripe_subscription = (subscriptions.data && subscriptions.data.length) ? (subscriptions.data.find((sub) => sub.plan.id === current_plan.price_id) || {}) : {};
    const subscription_discount = current_stripe_subscription.discount ? current_stripe_subscription.discount : {};
    const current_plan_config = [...plans.active_user_plans, ...plans.active_partner_plans].find((p) => p.price_id === current_plan.price_id);
    const free_plan_config = (user.is_partner && !session.is_switching) ? plans.active_partner_plans.find((p) => p.name === "Free") : plans.active_user_plans.find((p) => p.name === "Free");
    const cancellation_fee_on = current_plan.cancellation_fee_on;
    const cancellation_fee = current_plan.cancellation_fee;
    const bill_remainder = current_plan.bill_remainder;
    const contract_length_months = current_plan.contract_length_months - prepaid_months;
    const max_cancellations = active_subscription?.max_cancellations || 0;
    const created_at = active_subscription?.created_at;
    const account_value = active_subscription?.account_value;
    const initial_subscriptions_count = current_plan.seats_included;
    const elapsed_contract_months = moment().diff(moment(created_at), "months");
    const remaining_contract_months = (contract_length_months - elapsed_contract_months);
    const remaining_cost = (remaining_contract_months > 0) ? (remaining_contract_months * account_value) : 0;
    let universal_discount = current_plan_config; // plan multiplier discount default
    if (subscription_discount) universal_discount = subscription_discount; // subscription level discount takes priority
    if (discount && discount.coupon) universal_discount = discount; // customer level discount takes priority++
    let remaining_cancellations = 0;
    let should_apply_discount = (universal_discount.duration === "forever");
    let months_to_discount = should_apply_discount;
    const valid_discount = universal_discount.start < moment().unix();
    const start = moment.unix(universal_discount.start);
    const end = moment.unix(universal_discount.end);
    const diff = Math.abs(Math.ceil(moment.duration(start.diff(end)).asMonths()));
    universal_discount = universal_discount && universal_discount.coupon;
    if (universal_discount && universal_discount.duration === "repeating") should_apply_discount = valid_discount || (elapsed_contract_months < universal_discount.duration_in_months);
    if (should_apply_discount) {
      const remain = valid_discount ? diff : ((universal_discount.duration_in_months - elapsed_contract_months) - prepaid_months);
      months_to_discount = (remain >= 1) ? remain : 0;
    }


    if (active_subscription?.type === "partner") {
      const cancelled_client_subscriptions = account.subscriptions.cancelled.filter((s) => (s.type === "user") && (s.customer_id === user.customer_id));
      const active_client_subscriptions = account.subscriptions.active.filter((s) => (s.type === "user") && (s.customer_id === user.customer_id));
      const sorted_subscriptions = orderBy(active_client_subscriptions, ["created_at"], ["asc"]);
      remaining_cancellations = max_cancellations - cancelled_client_subscriptions.length;
      let partner_monthly_cost = (bill_remainder && cancellation_fee_on) ? (remaining_cost * 100) : (cancellation_fee_on ? cancellation_fee : 0);
      if (partner_monthly_cost) {
        if (universal_discount && months_to_discount) {
          if (universal_discount.percent_off) partner_monthly_cost = partner_monthly_cost - (universal_discount.percent_off * (partner_monthly_cost/100));
          if (universal_discount.amount_off) partner_monthly_cost = partner_monthly_cost - universal_discount.amount_off;
        }
      }
      const amount = (partner_monthly_cost / 100);
      let partner_item = {
        description: `${current_plan.name} - Partner Subscription`,
        amount,
        quantity: `${remaining_contract_months} x $${account_value}`,
        waived: !bill_remainder && !amount
      };
      if (universal_discount && months_to_discount) partner_item.originalAmount = remaining_cost;
      invoice_items.push(partner_item);
      if (sorted_subscriptions.length && bill_remainder) {
        sorted_subscriptions.forEach((subscription, index) => {
          const subscription_client_plan = plans.active_user_plans.find((p) => p.price_id === subscription.price_id);
          const subscription_contract_length_months = subscription_client_plan.contract_length_months;
          const subscription_created_at = subscription.created_at;
          const subscription_account_value = subscription.additional_seat_cost;
          const subscription_elapsed_contract_months = moment().diff(moment(subscription_created_at), "months");
          const subscription_remaining_contract_months = subscription_contract_length_months - subscription_elapsed_contract_months;
          const subscription_remaining_cost = (subscription_remaining_contract_months > 0) ? (subscription_remaining_contract_months * subscription.account_value) : 0;
          let item = {
            description: `${subscription_client_plan.name} - ${subscription.account_name}`,
            amount: subscription_remaining_contract_months * subscription_account_value,
            quantity: `${subscription_remaining_contract_months} x $${subscription_account_value}`,
            paid: index < initial_subscriptions_count,
            waived: (initial_subscriptions_count <= index) && ((remaining_cancellations + initial_subscriptions_count) > index),
            transfer_customer_id: subscription.transfer_customer_id,
            transfer_cognito_id: subscription.transfer_cognito_id,
            transfer_amount: subscription_remaining_cost,
            transfer_subscription_id: subscription.id,
            transfer_stripe_subscription_id: subscription.subscription_id,
            transfer_account_value: subscription.account_value,
            transfer_price_id: subscription.price_id,
            is_managed: true
          };
          if (universal_discount && months_to_discount) item.originalAmount = subscription_remaining_cost;
          invoice_items.push(item);
        });
      }
      if (cancelled_client_subscriptions.length) {
        cancelled_client_subscriptions.forEach((cancellation, index) => {
          const subscription_client_plan = plans.active_user_plans.find((p) => p.price_id === cancellation.price_id);
          cancelled_items.push({
            description: `${subscription_client_plan.name} - ${cancellation.account_name}`,
            amount: 0
          });
        });
      }
    } else {
      let client_monthly_cost = (bill_remainder && cancellation_fee_on) ? (remaining_cost * 100) : (cancellation_fee_on ? cancellation_fee : 0);
      if (client_monthly_cost) {
        if (universal_discount && months_to_discount) {
          if (universal_discount.percent_off) client_monthly_cost = client_monthly_cost - (universal_discount.percent_off * (client_monthly_cost / 100));
          if (universal_discount.amount_off) client_monthly_cost = client_monthly_cost - universal_discount.amount_off;
        }
      }
      const amount = (client_monthly_cost / 100);
      let client_item = {
        description: `${current_plan.name} - Client Subscription`,
        amount,
        quantity: `${remaining_contract_months} x $${account_value}`,
        waived: !bill_remainder && !amount
      };
      if (universal_discount && months_to_discount) client_item.originalAmount = remaining_cost;
      invoice_items.push(client_item);
    }
    this.state = {
      default_payment_method,
      invoice_items,
      cancelled_items,
      discount: months_to_discount && universal_discount,
      max_cancellations,
      remaining_cancellations,
      initial_subscriptions_count,
      discount_code_input: "",
      discountCode: null,
      is_verifying_discount: false,
      type: active_subscription?.type,
      current_plan: current_plan_config,
      free_plan: free_plan_config,
      active_subscription,
      account_customer,
      current_balance,
      months_to_discount
    };
  }

  set = (id, value) => this.setState({ [id]: value });

  verifyDiscountCode = async (code) => {
    const { verifyDiscount, showNotification } = this.props;
    if (code) code = code.replace(/\s+/g, "");
    this.setState({ is_verifying_discount: true });
    const coupon = await verifyDiscount(code);
    this.setState({ is_verifying_discount: false });
    if (coupon) {
      if (coupon.metadata.isReferral === "true") {
        showNotification("error", "Invalid Discount", "This code is not valid as a discount.");
      } else if (coupon.duration !== "once") {
        showNotification("error", "Invalid Discount", "This code is not valid for one time discounts.");
      } else {
        this.setState({ discountCode: coupon });
      }
    }
  };

  render() {
    const { user, session } = this.props;
    const {
      discount_code_input,
      is_verifying_discount,
      discountCode,
      default_payment_method,
      invoice_items,
      cancelled_items,
      discount,
      max_cancellations,
      remaining_cancellations,
      initial_subscriptions_count,
      type,
      current_plan,
      free_plan,
      active_subscription,
      account_customer,
      current_balance,
      months_to_discount
    } = this.state;

    let totalAmount = invoice_items.filter((i) => !i.waived && !i.paid).reduce((sum, item) => sum + item.amount, 0);
    let totalOriginalAmount = invoice_items.filter((i) => !i.paid).reduce((sum, item) => sum + item.originalAmount, 0) || 0;
    const discount_amount = discountCode ? (((discountCode.percent_off ? (discountCode.percent_off * totalAmount) : discountCode.amount_off)) / 100) : 0;
    let description = (user.is_partner && !session.is_switching) ? `Hope Trust Account Cancellation for ${user.first_name} ${user.last_name}. Your initial subscription included ${initial_subscriptions_count} client subscriptions of which you have used ${invoice_items.filter((item) => item.paid).length}, these line items will not be included in your cancellation fee.${max_cancellations ? `\n\nYour plan also allows up to ${max_cancellations} waived cancellations of which you have ${(remaining_cancellations < 0) ? 0 : remaining_cancellations} remaining, applicable items and associated fees will be waived.` : ""}${(user.is_partner && invoice_items.length > 1) ? " Your clients will be credited for the remaining time on their subscriptions, their plans will remain uninterrupted until their contract ends." : ""}` : `Hope Trust Account Cancellation for ${user.first_name} ${user.last_name}.`;
    if (discount && months_to_discount) description += ` Since you had a previous discount applied to your account, a ${discount.percent_off ? `${discount.percent_off}% ` : (discount.amount_off ? `$${discount.amount_off/100} ` : " ")}discount has been applied to your cancellation. This amount has been removed from your cancellation fee.`;
    const invoice = {
      name: "Invoice",
      createdDate: moment().format("YYYY-MM-DD"),
      dueDate: moment().format("YYYY-MM-DD"),
      paymentMethod: `Card ending in ${default_payment_method?.card?.last4 || default_payment_method?.last4}`,
      id: `#HOPE${session_id}`,
      description,
      items: invoice_items, 
      cancelled_items,
      discount,
      totalAmount,
      totalOriginalAmount
    };

    const customer = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      address: [getReadableUserAddress(user) || ""]
    };

    const company = {
      name: "Hope Portal Services, Inc.",
      address: ["101 Crawfords Corner Road", "Holmdel, New Jersey 07735"],
      email: "info@hopetrust.com"
    };
    
    return (
      <CancelSubscriptionMain id="invoice">
        <Invoice
          set={this.set}
          type={type}
          current_plan={current_plan}
          free_plan={free_plan}
          active_subscription={active_subscription}
          is_verifying_discount={is_verifying_discount}
          account_customer={account_customer}
          discount_code_input={discount_code_input}
          discountCode={discountCode}
          verifyDiscountCode={this.verifyDiscountCode}
          invoice={invoice}
          customer={customer}
          company={company}
          discount={discount_amount}
          current_balance={current_balance}
        />
      </CancelSubscriptionMain>
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
  verifyDiscount: (code) => dispatch(verifyDiscount(code)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(CancelSubscription);