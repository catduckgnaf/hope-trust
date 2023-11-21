import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Tooltip from "react-simple-tooltip";
import { theme } from "../../global-styles";
import { lighten } from "polished";
import { isMobileOnly } from "react-device-detect";
import { orderBy } from "lodash";
import {
  MetricsContainer,
  MetricsContainerPadding,
  MetricsContainerInner,
  Metric,
  MetricPadding,
  MetricInner,
  MetricBody,
  MetricHeader,
  MetricValue,
  MetricIcon,
  CreditsUsedContainer,
  CreditsUsed
} from "./style";
import { changeAccountsTab } from "../../store/actions/account";
import { navigateTo } from "../../store/actions/navigation";

const getNextPayment = (current_discount, period_end) => {
  switch(current_discount.duration) {
    case "once":
      return moment.unix(period_end).format("MM/DD/YYYY");
    case "forever":
      if (current_discount.percent_off === 100) return "Never";
      return moment.unix(period_end).format("MM/DD/YYYY");
    case "repeating":
      if (current_discount.percent_off === 100) return moment.unix(period_end).add(current_discount.duration_in_months, "month").format("MM/DD/YYYY");
      return moment.unix(period_end).format("MM/DD/YYYY");
    default:
      return moment.unix(period_end).format("MM/DD/YYYY");
  }
};

class PartnerBillingMetrics extends Component {

  constructor(props) {
    super(props);
    const { account, accounts, session } = props;
    const { subscriptions = false, discount, balance } = account.customer;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const current_plan = current_account.partner_plan;
    const current_stripe_subscription = (subscriptions.data && subscriptions.data.length) ? (subscriptions.data.find((sub) => sub.plan.id === current_plan.price_id) || {}) : {};
    const paid_accounts = orderBy((account.subscriptions.active && account.subscriptions.active.length) ? account.subscriptions.active.filter((s) => s.type === "user") : [], "created_at");
    let current_discount = (current_plan && current_plan.coupon) ? current_plan.coupon : false;;
    if (current_stripe_subscription.discount) current_discount = current_stripe_subscription.discount.coupon;
    let monthly = (current_plan.monthly/100);
    if (paid_accounts.length > current_plan.seats_included) {
      const additional_accounts = (current_plan.seats_included - paid_accounts.length);
      let target_accounts = [];
      if (additional_accounts) target_accounts = paid_accounts.slice(additional_accounts);
      monthly = target_accounts.reduce((a, b) => a + b.additional_seat_cost, 0) + monthly;
    }
    const amount = !current_plan.monthly ? 0 : monthly;
    const status = current_stripe_subscription.status;
    const trial_end = current_stripe_subscription.trial_end;
    const period_end = current_stripe_subscription.current_period_end;
    const customer_discount = discount ? discount.coupon : false;
    if (customer_discount) current_discount = customer_discount;
    const next_payment = getNextPayment(current_discount, period_end);
    let discounted = 0;
    if (current_discount && ["repeating", "forever"].includes(current_discount.duration)) {
      if (current_discount.percent_off) discounted = (current_discount.percent_off * amount);
      if (current_discount.amount_off) discounted = current_discount.amount_off;
    }
    const totalWithDiscount = (amount - (discounted/100));

    this.state = {
      metrics: [
        {
          title: "Tier",
          value: current_plan ? current_plan.name : "N/A",
          show: !Math.abs(balance)
        },
        {
          title: "Monthly Cost",
          value: discounted ? `$${(totalWithDiscount > 0 ? totalWithDiscount : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `$${(amount > 0 ? amount : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          show: true,
          tooltip: <Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>This is the amount you will owe for your next monthly subscription charge.{(current_discount.valid && current_discount.duration !== "forever") ? ` You currently have a ${current_discount.duration === "repeating" ? ` ${current_discount.percent_off ? `${current_discount.percent_off}% off discount for ` : `$${current_discount.amount_off/100} discount for `}${current_discount.duration_in_months} ${current_discount.duration_in_months === 1 ? "month." : "months."}` : ""}` : null}</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip>
        },
        {
          title: "First Payment",
          value: `${moment.unix(trial_end).format("MM/DD/YYYY")}`,
          show: status === "trialing",
          tooltip: <Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>Your first month of Hope Trust is covered in your first payment. Your subscription will start in {moment(trial_end).fromNow(true)}</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip>
        },
        {
          title: "Next Payment",
          value: next_payment,
          show: (status === "active" || account.isFetchingCustomer) && (totalWithDiscount || amount),
          tooltip: <Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>{next_payment !== "Never" ? `Your next monthly payment will be charged in ${moment(next_payment).fromNow(true)}` : "You will not be charged on your next billing cycle"}.</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip>
        },
        {
          title: "Current Usage",
          value: <CreditsUsedContainer><CreditsUsed onClick={() => this.goToSubscriptions()}>{paid_accounts.length}</CreditsUsed>{`/${current_plan.seats_included} seats`}</CreditsUsedContainer>,
          show: current_plan.seats_included,
          tooltip: <Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>{`Your current usage in credits. You currently manage ${paid_accounts.length} ${paid_accounts.length === 1 ? "account" : "accounts"}.`}</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip>
        },
        {
          title: "Credit Balance",
          value: `$${(Math.abs(balance) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          show: Math.abs(balance),
          tooltip: <Tooltip placement={isMobileOnly ? "left" : "top"} background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "15px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>You currently have a credit balance. We will charge this balance until it hits $0. Your payment method on file will be charged once this balance is empty.</div>}><FontAwesomeIcon size="sm" icon={["fad", "question-circle"]} /></Tooltip>
        }
      ]
    };
  }

  goToSubscriptions = () => {
    const { changeAccountsTab, navigateTo } = this.props;
    changeAccountsTab("subscriptions");
    document.title = "subscriptions";
    navigateTo("/accounts");
  };

  render() {
    const { account } = this.props;
    const { metrics } = this.state;
    const active_metrics = metrics.filter((m) => m.show);
    return (
      <MetricsContainer span={12}>
        <MetricsContainerPadding>
          <MetricsContainerInner gutter={20}>
            {metrics.map((metric, index) => {
              if (metric.show) {
                return (
                  <Metric key={index} xs={12} sm={12} md={12/active_metrics.length} lg={12/active_metrics.length} xl={12/active_metrics.length}>
                    <MetricPadding>
                      <MetricInner>
                        <MetricBody>
                          <MetricHeader span={12}>{metric.title}&nbsp;&nbsp;{metric.tooltip}</MetricHeader>
                          {account.isFetchingCustomer
                            ? (
                              <MetricIcon span={12}>
                                <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                              </MetricIcon>
                            )
                            : <MetricValue span={12}>{metric.value}</MetricValue>
                          }
                        </MetricBody>
                      </MetricInner>
                    </MetricPadding>
                  </Metric>
                );
              }
              return null;
            })}
          </MetricsContainerInner>
        </MetricsContainerPadding>
      </MetricsContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.account,
  accounts: state.accounts,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  changeAccountsTab: (tab) => dispatch(changeAccountsTab(tab)),
  navigateTo: (location) => dispatch(navigateTo(location))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerBillingMetrics);
