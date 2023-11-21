import React from "react";
import {
  ActivePlansMain,
  ActivePlansPadding,
  ActivePlansInner,
  ActivePlans,
  ActivePlan,
  ActivePlanPadding,
  ActivePlanHeader,
  ActivePlanHeaderPadding,
  ActivePlanHeaderInner,
  ActivePlanHeaderTitle,
  ActivePlanHeaderSubTitle,
  ActivePlanExpand,
  ActivePlanFooter,
  ActivePlanFooterPadding,
  ActivePlanFooterInner,
  ActivePlanFooterTitle,
  ActivePlanFooterTitleCost,
  ActivePlanFooterAction,
  ActivePlanFooterActionButton,
  ActivePlanInner,
  ActivePlanInnerFade,
  ActivePlanFeature,
  ActivePlanFeaturePadding,
  ActivePlanFeatureInner,
  ActivePlanFeatureIcon,
  ActivePlanFeatureText
} from "./style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { orderBy } from "lodash";
import { capitalize } from "../../utilities";

export const ActivePlansChooser = (props) => {
  const { page, type, responsibility, stateRetriever, stateConsumer } = props;
  const plans_state = useSelector((state) => state.plans);
  const user = useSelector((state) => state.user);
  let base_plans = plans_state[`active_${type}_plans`];
  let active_plans = base_plans;
  if (type === "user") {
    active_plans = base_plans.filter((plan) => plan.type === "user");
    if (stateRetriever("is_benefits") || user.benefits_client_config) active_plans = base_plans.filter((plan) => plan.type === "benefits");
    if (responsibility === "credits") active_plans = active_plans.filter((plan) => plan.monthly);
  }
  const current_choice = stateRetriever("plan_choice");
  let sorted_plans = orderBy(active_plans, [(plan) => plan.name === "Free", "monthly"], ["desc", "asc"]).map((p, index) => {
    return { ...p, index };
  });

  return (
    <ActivePlansMain>
      <ActivePlansPadding>
        <ActivePlansInner>
          {sorted_plans.length && !plans_state[`isFetchingActive${capitalize(type)}Plans`]
            ? (
              <ActivePlans gutter={25}>
                {sorted_plans.map((plan, plan_index) => {
                  const isActive = current_choice ? (current_choice.id === plan.id) : false;
                  const features = JSON.parse(plan.features || "{}");
                  const agreements = plan.agreements || [];
                  let monthly_cost = (plan && plan.monthly) ? (plan.monthly / 100) : 0;
                  if (plan && plan.coupon) monthly_cost = (monthly_cost - (((plan.coupon.percent_off ? (plan.coupon.percent_off * monthly_cost) : plan.coupon.amount_off)) / 100));
                  let props = {
                    plans: sorted_plans.length,
                    key: plan_index,
                    xs: 12,
                    sm: 12,
                    page,
                    md: (sorted_plans.length > 2) ? 12 : (12 / sorted_plans.length),
                    lg: 12 / sorted_plans.length,
                    xl: 12 / sorted_plans.length
                  };
                  if (page === "upgrade") props = {
                    plans: sorted_plans.length,
                    key: plan_index,
                    page,
                    xs: 12,
                    sm: 6,
                    md: 6,
                    lg: 4,
                    xl: 3
                  };
                  if (sorted_plans.length === 1) {
                    props.xs = 12;
                    props.sm = 12;
                    props.md = 12;
                    props.lg = 12;
                    props.xl = 12;
                  }
                  return (
                    <ActivePlan {...props}>
                      <ActivePlanPadding>
                        {!stateRetriever(`plan_${plan_index}_expanded`)
                          ? <ActivePlanInnerFade />
                          : null
                        }
                        <ActivePlanHeader>
                          <ActivePlanHeaderPadding>
                            <ActivePlanHeaderInner cost={plan.monthly}>
                              <ActivePlanHeaderTitle>{plan.name}</ActivePlanHeaderTitle>
                              <ActivePlanHeaderSubTitle>{plan.excerpt}</ActivePlanHeaderSubTitle>
                            </ActivePlanHeaderInner>
                          </ActivePlanHeaderPadding>
                        </ActivePlanHeader>
                        <ActivePlanInner expanded={stateRetriever(`plan_${plan_index}_expanded`) ? 1 : 0}>
                          {Object.keys(features).map((feature, feature_index) => {
                            return (
                              <ActivePlanFeature key={feature_index}>
                                <ActivePlanFeaturePadding>
                                  <ActivePlanFeatureInner gutter={10}>
                                    <ActivePlanFeatureIcon span={1} disabled={features[feature] ? 0 : 1}>
                                      <FontAwesomeIcon icon={["fas", features[feature] ? "check" : "times"]} />
                                    </ActivePlanFeatureIcon>
                                    <ActivePlanFeatureText span={11} disabled={features[feature] ? 0 : 1}>{feature}</ActivePlanFeatureText>
                                  </ActivePlanFeatureInner>
                                </ActivePlanFeaturePadding>
                              </ActivePlanFeature>
                            );
                          })}
                          {agreements.map((agreement, agreeemnt_index) => {
                            return (
                              <ActivePlanFeature key={agreeemnt_index}>
                                <ActivePlanFeaturePadding>
                                  <ActivePlanFeatureInner gutter={10}>
                                    <ActivePlanFeatureIcon span={1} blue={1}>
                                      <FontAwesomeIcon icon={["fas", "circle"]} />
                                    </ActivePlanFeatureIcon>
                                    <ActivePlanFeatureText span={11} blue={1}>{agreement}</ActivePlanFeatureText>
                                  </ActivePlanFeatureInner>
                                </ActivePlanFeaturePadding>
                              </ActivePlanFeature>
                            );
                          })}
                        </ActivePlanInner>
                        <ActivePlanExpand onClick={() => stateConsumer(`plan_${plan_index}_expanded`, !stateRetriever(`plan_${plan_index}_expanded`), "registration_config")}>{stateRetriever(`plan_${plan_index}_expanded`) ? "Less" : "More"}</ActivePlanExpand>
                        <ActivePlanFooter>
                          <ActivePlanFooterPadding>
                            <ActivePlanFooterInner cost={plan.monthly}>
                              <ActivePlanFooterTitle span={8}><ActivePlanFooterTitleCost>{(plan.coupon && plan.coupon.duration !== "once") ? <div><s>${(plan.monthly / 100)}</s> ${monthly_cost}</div> : `$${monthly_cost}`}</ActivePlanFooterTitleCost> per Month</ActivePlanFooterTitle>
                              <ActivePlanFooterAction span={4}>
                                <ActivePlanFooterActionButton type="button" onClick={!isActive ? () => stateConsumer("plan_choice", plan, "registration_config") : null}>
                                  {isActive ? <FontAwesomeIcon icon={["fas", "check-circle"]} /> : "Select"}
                                </ActivePlanFooterActionButton>
                                </ActivePlanFooterAction>
                            </ActivePlanFooterInner>
                          </ActivePlanFooterPadding>
                        </ActivePlanFooter>
                      </ActivePlanPadding>
                    </ActivePlan>
                  );
                })}
              </ActivePlans>
            )
            : <FontAwesomeIcon size="2x" icon={["fad", "spinner"]} spin />
          }
        </ActivePlansInner>
      </ActivePlansPadding>
    </ActivePlansMain>
  );
};