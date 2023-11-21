import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCustomerSubscriptions, getCustomerTransactions } from "../../store/actions/account";
import { openPaymentMethodsModal, updateAccount } from "../../store/actions/stripe";
import { getActiveUserPlans, getActivePartnerPlans } from "../../store/actions/plans";
import { getStripeExpandedCustomer, verifyDiscount } from "../../store/actions/stripe"; 
import { showNotification } from "../../store/actions/notification";
import { isMobile, isTablet } from "react-device-detect";
import { getEmbeddableHelloSignURLResignContracts } from "../../store/actions/hello-sign";
import { orderBy, isString } from "lodash";
import moment from "moment";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  PageHeaderSecondary,
  Button,
  Input,
  FormSuccess
} from "../../global-components";
import {
  UpgradeContainerMain,
  UpgradeContainerPadding,
  UpgradeContainerInner,
  UpgradeContainerPlans,
  PaymentFooterInputContainer,
  PaymentFooterInput,
  PaymentFooterInputButtonContainer,
  PaymentFooterInputButton
} from "./style";
import { navigateTo } from "../../store/actions/navigation";
import { ActivePlansChooser } from "../../Components/ActivePlansChooser";

class Upgrade extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.instanceOf(Object).isRequired,
    updateAccount: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { user, session, accounts, relationship } = props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const initialPlan = (user.is_partner && !session.is_switching) ? current_account.partner_plan : current_account.user_plan;
    const payer = relationship.list.find((u) => (u.customer_id === current_account.subscription?.customer_id));
    this.state = {
      initial_plan: initialPlan,
      plan_choice: initialPlan,
      partner_plans: (user.is_partner && !session.is_switching),
      is_verifying_discount: false,
      discount_unnapplied: false,
      discountCode: null,
      current_account,
      is_benefits: current_account.benefits_config ? true : false,
      payer
    };
  }

  async componentDidMount() {
    const { getCustomerSubscriptions, getActiveUserPlans, getActivePartnerPlans, getStripeExpandedCustomer, getCustomerTransactions, account, plans, relationship } = this.props;
    const customer = relationship.list.find((u) => u.is_customer && !u.linked_account);
    if ((!plans.isFetchingActivePartnerPlans && !plans.requestedActivePartnerPlans)) await getActivePartnerPlans();
    if ((!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans)) await getActiveUserPlans();
    if ((!account.requestedSubscriptions && !account.isFetchingSubscriptions)) await getCustomerSubscriptions(false, customer ? customer.customer_id : null);
    if (!account.requestedCustomer && !account.isFetchingCustomer && customer) await getStripeExpandedCustomer(false, customer ? customer.customer_id : null);
    if (!account.requestedTransactions && !account.isFetchingTansactions && customer) await getCustomerTransactions(false, customer ? customer.customer_id : null);
  }

  setNewState = (id, value) => {
    let updates = { [id]: value };
    if (id === "plan_choice") updates.discountCode = null;
    this.setState({ ...updates });
  };

  upgradePlan = async (new_plan) => {
    const { initial_plan, partner_plans, discountCode, current_account } = this.state;
    const { user, session, account, showNotification, updateAccount, openPaymentMethodsModal, getEmbeddableHelloSignURLResignContracts } = this.props;
    let templates = [];
    const has_payment_methods = !!(account.customer && account.customer.sources && account.customer.sources.data && account.customer.sources.data.length);
    const discount_valid = discountCode && !isString(discountCode) && discountCode.valid && !new_plan.coupon;
    let monthly_cost = (new_plan && new_plan.monthly) ? new_plan.monthly : 0;
    if (new_plan && new_plan.coupon) monthly_cost = (monthly_cost - (new_plan.coupon.percent_off ? (new_plan.coupon.percent_off * (monthly_cost/100)) : ((new_plan.coupon.amount_off) || 0)));
    if (!discount_valid
      || (discount_valid && ["repeating", "forever"].includes(discountCode.duration))
      || has_payment_methods) {
      if (user.is_partner && !session.is_switching) {
        if (has_payment_methods) {
          showNotification("confirm", `Attention: You are about to generate binding contracts. If you are not sure that you want to upgrade your account, DO NOT move forward.
          ${new_plan.monthly
            ? `
            The default payment method on this account will be charged $${new_plan.one_time_fee ? (new_plan.one_time_fee / 100) : (monthly_cost / 100)} immediately after signing. Your new subscription cost will be $${(monthly_cost / 100)} per month.
            `
        : ""}
        Are you sure you want to update your subscription to ${new_plan.name}?`, "", {
            action: async () => {
              let monthly_cost = (new_plan.monthly / 100);
              let additional_plan_cost = current_account.subscription.additional_seat_cost || new_plan.additional_plan_credits;
              const additional_contracts = JSON.parse(new_plan.additional_contracts || "{}");
              if (new_plan && new_plan.coupon) {
                monthly_cost = (monthly_cost - (new_plan.coupon.percent_off ? (monthly_cost * new_plan.coupon.percent_off) : new_plan.coupon.amount_off) / 100);
                if (!current_account.subscription.additional_seat_cost) additional_plan_cost = (additional_plan_cost - (new_plan.coupon.percent_off ? (additional_plan_cost * new_plan.coupon.percent_off) : new_plan.coupon.amount_off) / 100);
              }
              if (additional_contracts[user.partner_data.name] || additional_contracts[user.partner_data.primary_network]) {
                templates.push(additional_contracts[user.partner_data.name] ? additional_contracts[user.partner_data.name] : additional_contracts[user.partner_data.primary_network]);
              } else {
                templates.push(new_plan.default_template);
              }
              if (monthly_cost) templates.push(new_plan.plan_cost_agreement);
              const signers = [
                {
                  email_address: user.email,
                  name: `${user.first_name} ${user.last_name}`,
                  role: "Referral Partner"
                }
              ];
              await getEmbeddableHelloSignURLResignContracts(
                null,
                "Partner Agreement",
                "Before moving forward, please sign our partner agreement.",
                signers,
                templates,
                {
                  plan_type: new_plan.name,
                  plan: new_plan,
                  name: user.partner_data.name,
                  is_entity: user.partner_data.is_entity
                },
                false,
                monthly_cost,
                new_plan.seats_included,
                additional_plan_cost,
                initial_plan
              );
            }
          });
        } else {
          openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: false });
        }
      } else {
        let monthly_discount = ((discount_valid && discountCode.percent_off) ? ((monthly_cost * discountCode.percent_off) / 100) : ((discount_valid && discountCode.amount_off) ? discountCode.amount_off : 0));
        let monthly = ((monthly_cost / 100) - (monthly_discount / 100)).toFixed(2);
        const discounted_total = monthly_cost - monthly_discount;
        let one_time = new_plan.one_time_fee / 100;
        const is_once = discount_valid && discountCode.duration === "once";
        const is_repeating = discount_valid && discountCode.duration === "repeating";
        const is_forever = discount_valid && discountCode.duration === "forever";
        if (((discounted_total === 0) && (is_repeating || is_forever)) || (discounted_total && has_payment_methods) || has_payment_methods) {
          let message = `Are you sure you want to update your account to the "${new_plan.name}" tier?`;
          if (discounted_total > 0 && (monthly || one_time) && !is_forever) message += `\n\nThe default payment method on this account will be charged $${(monthly || one_time)} immediately.`;
          if ((monthly_cost || monthly_discount) && (is_once || is_repeating)) {
            message += `\n\nYour subscription cost will be $${monthly > 0 ? monthly : 0}`;
          } else if (!is_forever) {
            message += `\n\nYour subscription cost will be $${(monthly_cost / 100) > 0 ? (monthly_cost / 100) : 0} per month`;
          }
          if (is_once) message += ` for the first month and then $${monthly_cost / 100} per month.`;
          if (is_repeating) message += ` for ${discountCode.duration_in_months} months and then $${monthly_cost / 100} per month.`;
          if (is_forever && (discountCode.percent_off && discountCode.percent_off < 100)) message += ` Based on your discount, this subscription will be ${discountCode.percent_off}% off forever.\n\nYou will be charged $${monthly} immediately, and then $${monthly} every month after.`;
          if (!has_payment_methods && is_repeating) message += `\n\nTo avoid billing interruption and cancellation of your account, please remember to add a payment method on or before ${moment().add(discountCode.duration_in_months, "month").format("MM/DD/YYYY")}`;
          if (is_forever && (discountCode.percent_off && discountCode.percent_off === 100)) message += " Based on your discount, this subscription will be free forever, you will not be charged for this subscription.";

          showNotification("confirm", message, "", {
            action: () => updateAccount(new_plan, initial_plan, partner_plans ? "partner" : "user", (discount_valid && discountCode.duration !== "once" ? discountCode.id : false), !!discounted_total, discounted_total)
          });
        } else {
          openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: false });
        }
      }
    } else {
      openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: false });
    }
  };

  cancelPlan = (current_plan) => {
    const { showNotification, navigateTo, account, openPaymentMethodsModal } = this.props;
    const has_payment_methods = (account.customer && account.customer.sources && account.customer.sources.data && account.customer.sources.data.length);
    if (current_plan) {
      if (has_payment_methods) {
        showNotification("confirm",
          "Are you sure you want to cancel your subscription?\n\nYou will be redirected to a new page to review your cancellation.", "", {
          action: () => navigateTo("/cancel-subscription")
        });
      } else {
        openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: false });
      }
    }
  };

  verifyDiscountCode = async (code) => {
    const { verifyDiscount, showNotification } = this.props;
    if (code) code = code.replace(/\s+/g, "");
    this.setState({ is_verifying_discount: true });
    const coupon = await verifyDiscount(code);
    this.setState({ is_verifying_discount: false });
    if (coupon) {
      if (coupon.metadata.isReferral === "true") {
        showNotification("error", "Invalid Discount", "This code is not valid as a discount.");
      } else {
        this.setState({ discountCode: coupon, discount_unnapplied: false });
      }
    }
  };

  checkForUnappliedDiscount = (event) => {
    const { showNotification } = this.props;
    const { discountCode } = this.state;
    if (discountCode && isString(discountCode)) {
      if ((event && event.relatedTarget && event.relatedTarget.id !== "apply_discount_button") || !event.relatedTarget) {
        showNotification("error", "Unapplied Discount", "Did you forget to apply your discount? Make sure to click the 'Apply' button or clear the field.");
        this.setState({ discount_unnapplied: true });
        return true;
      }
      this.setState({ discount_unnapplied: false });
      return false;
    }
    this.setState({ discount_unnapplied: false });
    return false;
  };

  render() {
    const { plan_choice, initial_plan, partner_plans, is_verifying_discount, discount_unnapplied, discountCode, current_account, payer } = this.state;
    const { plans, user, session } = this.props;
    let active_plans = (partner_plans ? plans.active_partner_plans : plans.active_user_plans) || [];
    let sorted_plans = orderBy(active_plans, [(plan) => plan.name === "Free", "monthly"], ["desc", "asc"]).map((p, index) => {
      return { ...p, index };
    });
    let sorted_plan_choice = sorted_plans.find((p) => p.id === plan_choice.id) || false;
    let current_sorted_plan = sorted_plans.find((p) => p.id === initial_plan.id);
    const is_current_plan = (current_sorted_plan && (sorted_plan_choice.index === current_sorted_plan.index));
    let can_cancel = false;
    if ((is_current_plan && !payer)) { // if current plan is selected and there is no payer
      can_cancel = true;
    } else if ((is_current_plan && payer && (payer.cognito_id === user.cognito_id) && !session.is_switching)) { // if current plan is selected and there is a payer, and the payer is the current user and they are not switching
      can_cancel = true;
    } else if ((is_current_plan && payer && (payer.cognito_id !== user.cognito_id) && session.is_switching)) { // if current plan is selected and there is a payer, and the payer is NOT the current user and they are switching
      can_cancel = true;
    } else if ((is_current_plan && payer && !user.is_partner)) { // if current plan is selected and there is a payer and the current user is not a prtner
      can_cancel = true;
    }
      
    
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Update Plan
            {sorted_plan_choice && ((sorted_plan_choice.monthly >= current_sorted_plan.monthly) && !sorted_plan_choice.coupon) && (sorted_plan_choice.id !== current_sorted_plan.id)
              ? (
                <PageHeaderSecondary>
                  <PaymentFooterInputContainer paddingtop={1} gutter={20}>
                    <PaymentFooterInput xs={8} sm={8} md={8} lg={10} xl={10}>
                      <Input
                        type="text"
                        id="discountCode"
                        value={discountCode ? discountCode.id : ""}
                        placeholder="Enter a discount code..."
                        onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                        onBlur={(e) => this.checkForUnappliedDiscount(e)}
                        missing={discount_unnapplied ? 1 : 0}
                        autoComplete="off"
                      />
                      {discountCode && !isString(discountCode) && discountCode.valid
                        ? <FormSuccess paddingbottom={1}>{discountCode.percent_off ? `${discountCode.percent_off}% discount applied! ${discountCode && (discountCode.percent_off || discountCode.amount_off) ? `(${(discountCode.percent_off ? `${discountCode.percent_off}%` : `$${discountCode.amount_off / 100}`)} off ${discountCode.duration === "repeating" ? ` for ${discountCode.duration_in_months} months` : ` ${discountCode.duration}`})` : ""}` : `$${(discountCode.amount_off / 100)} discount applied!`}</FormSuccess>
                        : null
                      }
                    </PaymentFooterInput>
                    <PaymentFooterInputButtonContainer xs={4} sm={4} md={4} lg={2} xl={2}>
                      <PaymentFooterInputButton
                        disabled={!discountCode}
                        id="apply_discount_button"
                        type="button"
                        role="button"
                        onClick={() => this.verifyDiscountCode(discountCode)}
                        widthPercent={100}
                        secondary
                        blue>
                        {is_verifying_discount ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                      </PaymentFooterInputButton>
                    </PaymentFooterInputButtonContainer>
                  </PaymentFooterInputContainer>
                </PageHeaderSecondary>
              )
              : null
            }
          </PageHeader>
          {current_account.permissions.includes("account-admin-view") && sorted_plan_choice.name !== "Free"
            ? (
              <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
                {(sorted_plan_choice && ((sorted_plan_choice.index !== current_sorted_plan.index) && (sorted_plan_choice.index > current_sorted_plan.index))) && current_account.permissions.includes("account-admin-edit")
                  ? <Button secondary blue onClick={() => this.upgradePlan(sorted_plan_choice)}>Upgrade Subscription</Button>
                  : null
                }
                {/* {(sorted_plan_choice && ((sorted_plan_choice.index !== current_sorted_plan.index) && (sorted_plan_choice.index < current_sorted_plan.index)))
                  ? <Button secondary blue onClick={() => this.downgradePlan(sorted_plan_choice)}>Downgrade Subscription</Button>
                  : null
                } */}
                
                {can_cancel
                  ? <Button secondary blue onClick={() => this.cancelPlan(initial_plan)}>Cancel Subscription</Button>
                  : null
                }
              </PageAction>
            )
            : <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
          }
        </Page>
        <UpgradeContainerMain>
          <UpgradeContainerPadding>
            <UpgradeContainerInner>
              <UpgradeContainerPlans span={12}>
                <ActivePlansChooser page="upgrade" type={user.is_partner && !session.is_switching ? "partner" : "user"} stateRetriever={(item) => this.state[item]} stateConsumer={(key, value) => this.setState({ [key]: value })}/>
              </UpgradeContainerPlans>
            </UpgradeContainerInner>
          </UpgradeContainerPadding>
        </UpgradeContainerMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  relationship: state.relationship,
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  account: state.account,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  verifyDiscount: (code) => dispatch(verifyDiscount(code)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  updateAccount: (new_plan, initial_plan, type, external_coupon, should_charge, discounted_total) => dispatch(updateAccount(new_plan, initial_plan, type, external_coupon, should_charge, discounted_total)),
  openPaymentMethodsModal: (config) => dispatch(openPaymentMethodsModal(config)),
  getEmbeddableHelloSignURLResignContracts: (partner_signature_id, subject, message, signers, templates, partner_config, allowCancel, cost, full_cost, additional_plan_credits, additional_plan_cost, initial_plan) => dispatch(getEmbeddableHelloSignURLResignContracts(partner_signature_id, subject, message, signers, templates, partner_config, allowCancel, cost, full_cost, additional_plan_credits, additional_plan_cost, initial_plan)),
  getCustomerSubscriptions: (override, customer_id) => dispatch(getCustomerSubscriptions(override, customer_id)),
  getActiveUserPlans: (override, get_all) => dispatch(getActiveUserPlans(override, get_all)),
  getActivePartnerPlans: (override) => dispatch(getActivePartnerPlans(override)),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  getCustomerTransactions: (override, customer_id) => dispatch(getCustomerTransactions(override, customer_id))
});
export default connect(mapStateToProps, dispatchToProps)(Upgrade);
