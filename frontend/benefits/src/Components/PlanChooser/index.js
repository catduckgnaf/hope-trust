import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCustomerSubscriptions } from "../../store/actions/account";
import { getActiveUserPlans, getActivePartnerPlans } from "../../store/actions/plans";
import {
  PlanTiles,
  PlanTileSection,
  PlanTileRow,
  PlanInfoRow,
  PlanTileTitleItems,
  PlanTileTitleItemMain,
  PlanTileTitleItemSecondary,
  PlanInfoBody,
  PlanInfoBodyList,
  PlanInfoBodyListItemIcon,
  PlanInfoBodyListItem,
  PlanInfoBodyListItemPadding,
  PlanInfoBodyListItemInner,
  PlanInfoFooter,
  PlanFooterPricing,
  PlanFooterPricingItem,
  PlanFooterPricingItemTitle,
  PlanTile,
  PlanTilePadding,
  PlanTileInner,
  PlanTilePlanItems,
  PlanTilePlanName,
  PlanTilePlanIcon,
  FeatureText
} from "./style";

class PlanChooser extends Component {

  constructor(props) {
    super(props);
    const { user, session } = props;
    const current_account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    this.state = { current_account };
  }

  static propTypes = {
    setNewState: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { getCustomerSubscriptions, getActiveUserPlans, account, plans, partner_plans } = this.props;
    const { current_account } = this.state;
    if (current_account && (!account.requestedSubscriptions && !account.isFetchingSubscriptions)) getCustomerSubscriptions(current_account.users.find((u) => u.customer_id && !u.linked_account).customer_id);
    if ((!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans) && !partner_plans) getActiveUserPlans();
    if ((!plans.isFetchingActivePartnerPlans && !plans.requestedActivePartnerPlans) && partner_plans) getActivePartnerPlans();
  }

  render() {
    let { setNewState, plans, initial_plan, sorted_plans } = this.props;
    let { planChoice = {}, responsibility } = this.props;
    if (responsibility === "credits") sorted_plans = sorted_plans.filter((p) => p.monthly);
    const current_features = JSON.parse(planChoice.features || "{}");
    const activeFeatures = Object.keys(current_features).filter((feature) => current_features[feature]);

    return (
      <PlanTiles gutter={25}>
        {plans.isFetchingActiveUserPlans || plans.isFetchingActivePartnerPlans
          ? (
            <PlanTileSection span={12}>
              <PlanTileRow gutter={0}>
                <PlanTile span={12}>
                  <PlanTilePadding>
                    <PlanTileInner style={{ textAlign: "center" }}>
                      <FontAwesomeIcon icon={["far", "spinner"]} spin />
                    </PlanTileInner>
                  </PlanTilePadding>
                </PlanTile>
              </PlanTileRow>
            </PlanTileSection>
          )
          : (
            <>
              {plans.active_user_plans.length || plans.active_partner_plans.length
                ? (
                  <>
                    {sorted_plans.map((plan = {}, index) => {
                      const isActive = planChoice.id === plan.id;
                      const features = JSON.parse(plan.features || "{}");
                      const agreements = plan.agreements || [];
                      let monthly_cost = (plan && plan.monthly) ? (plan.monthly / 100) : 0;
                      if (plan && plan.coupon) monthly_cost = (monthly_cost - (((plan.coupon.percent_off ? (plan.coupon.percent_off * monthly_cost) : plan.coupon.amount_off)) / 100));
                      return (
                        <PlanTileSection key={index} xs={12} sm={12} md={12 / sorted_plans.length} lg={12 / sorted_plans.length} xl={12 / sorted_plans.length}>
                          <PlanTileRow gutter={0}>
                            <PlanTile key={index} onClick={() => setNewState("plan_choice", plan)} span={12}>
                              <PlanTilePadding>
                                <PlanTileInner active={isActive}>
                                  <PlanTilePlanItems>
                                    <PlanTilePlanName span={10}>
                                      <PlanTileTitleItems>
                                        <PlanTileTitleItemMain span={12}>{plan.name}{(initial_plan && (initial_plan.id === plan.id)) ? " (Current)" : null}</PlanTileTitleItemMain>
                                        <PlanTileTitleItemSecondary span={12}>{plan.excerpt}</PlanTileTitleItemSecondary>
                                      </PlanTileTitleItems>
                                    </PlanTilePlanName>
                                    <PlanTilePlanIcon span={2}>
                                      {isActive
                                        ? <FontAwesomeIcon icon={["fas", "check-circle"]} />
                                        : null
                                      }
                                    </PlanTilePlanIcon>
                                  </PlanTilePlanItems>
                                  <PlanInfoRow>
                                    <PlanInfoBody span={12}>
                                      <PlanInfoBodyList blurred={activeFeatures.length === Object.values(features).length ? 0 : 1}>
                                        {Object.keys(features).map((feature, index) => {
                                          return (
                                            <PlanInfoBodyListItem key={index}>
                                              <PlanInfoBodyListItemPadding>
                                                <PlanInfoBodyListItemInner>
                                                  <PlanInfoBodyListItemIcon disabled={features[feature] ? 0 : 1}> <FontAwesomeIcon icon={["far", features[feature] ? "check" : "times"]} /> </PlanInfoBodyListItemIcon><FeatureText strike={features[feature] ? 0 : 1}>{feature}</FeatureText>
                                                </PlanInfoBodyListItemInner>
                                              </PlanInfoBodyListItemPadding>
                                            </PlanInfoBodyListItem>
                                          );
                                        })}
                                      </PlanInfoBodyList>
                                      <PlanInfoBodyList blurred={activeFeatures.length === Object.values(features).length ? 0 : 1}>
                                        {agreements.map((agreement, index) => {
                                          return (
                                            <PlanInfoBodyListItem key={index}>
                                              <PlanInfoBodyListItemPadding>
                                                <PlanInfoBodyListItemInner>
                                                  <PlanInfoBodyListItemIcon blue={1}> <FontAwesomeIcon icon={["fas", "circle"]} /> </PlanInfoBodyListItemIcon><FeatureText>{agreement}</FeatureText>
                                                </PlanInfoBodyListItemInner>
                                              </PlanInfoBodyListItemPadding>
                                            </PlanInfoBodyListItem>
                                          );
                                        })}
                                      </PlanInfoBodyList>
                                    </PlanInfoBody>
                                    <PlanInfoFooter span={12}>
                                      <PlanFooterPricing>
                                        {plan.one_time_fee
                                          ? (
                                            <PlanFooterPricingItem span={6}>
                                              <PlanFooterPricingItemTitle>One Time Fee</PlanFooterPricingItemTitle> ${plan.one_time_fee / 100}
                                            </PlanFooterPricingItem>
                                          )
                                          : null
                                        }
                                        <PlanFooterPricingItem span={plan.one_time_fee ? 6 : 12}>
                                          <PlanFooterPricingItemTitle>Monthly</PlanFooterPricingItemTitle> {(plan.coupon && plan.coupon.duration !== "once") ? <div><s>${(plan.monthly / 100)}</s> ${monthly_cost} per month</div> : <div>${plan.monthly / 100} per month</div>}
                                        </PlanFooterPricingItem>
                                      </PlanFooterPricing>
                                    </PlanInfoFooter>
                                  </PlanInfoRow>
                                </PlanTileInner>
                              </PlanTilePadding>
                            </PlanTile>
                          </PlanTileRow>
                        </PlanTileSection>
                      );
                    })}
                  </>
                )
              : (
                <PlanTileSection span={12}>
                  <PlanTileRow gutter={0}>
                    <PlanTile span={12}>
                      <PlanTilePadding>
                        <PlanTileInner style={{ textAlign: "center" }}>
                          No Plans Found
                        </PlanTileInner>
                      </PlanTilePadding>
                    </PlanTile>
                  </PlanTileRow>
                </PlanTileSection>
              )
            }
            </>
          )
        }
      </PlanTiles>
    );
  }
}

const mapStateToProps = (state) => ({
  plans: state.plans,
  account: state.account,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  getCustomerSubscriptions: (customer_id, override) => dispatch(getCustomerSubscriptions(customer_id, override)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  getActivePartnerPlans: (override) => dispatch(getActivePartnerPlans(override))
});
export default connect(mapStateToProps, dispatchToProps)(PlanChooser);
