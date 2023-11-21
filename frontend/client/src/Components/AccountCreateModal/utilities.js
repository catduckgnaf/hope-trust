import React from "react";
import BeneficiarySignUpForm from "../../Components/BeneficiarySignUpForm";
import { ActivePlansChooser } from "../../Components/ActivePlansChooser";
import SignupPaymentContainer from "../../Components/SignupPaymentContainer";
import RelationshipPicker from "../../Components/RelationshipPicker";
import ClientLifecycleChooser from "../../Components/ClientLifecycleChooser";
import ClientChooser from "../../Components/ClientChooser";
import { AuthenticationWrapperItemInner } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  PaymentResponsibilityContainer,
  PaymentResponsibilityPadding,
  PaymentResponsibilityInner,
  PaymentResponsbilitySection,
  PaymentResponsibilitySectionPadding,
  PaymentResponsibilitySectionInner,
  PaymentResponsibilityInnerHeadingSection,
  PaymentResponsibilityInnerInfo,
  PaymentResponsibilityInnerIcon,
  PaymentResponsibilityInnerHeading,
  PaymentResponsibilityInnerDescription
} from "./style";
import { store } from "../../store";

const getResponsibilitySteps = (helpers) => {
  const paid_accounts = (store.getState().account.subscriptions.active && store.getState().account.subscriptions.active.length) ? store.getState().account.subscriptions.active.filter((s) => s.type === "user") : [];
  const responsibility_choices = [
    {
      icon: "users",
      slug: "credits",
      title: "Add Client To My Subscription",
      description: `You, the partner, may choose to take financial responsibility for this subscription. In this case, you will be responsible for this account’s monthly subscription cost. The account will be added as a seat on your partner subscription, in which you are currently using ${paid_accounts.length} ${paid_accounts.length === 1 ? "seat" : "seats"}.`,
      action: null,
      show: !!store.getState().accounts.find((a) => a.is_primary).partner_plan.monthly

    },
    {
      icon: "user",
      slug: "client",
      title: "Client Responsibility",
      description: `Your client takes financial responsibility for this subscription. In this case, the client selects either a Free or Paid Plan. If Paid, the client pays for the monthly subscription cost and it will not be added as a seat to your partner subscription. You will still only be using ${paid_accounts.length} ${paid_accounts.length === 1 ? "seat" : "seats"}. Please note, in order to complete the sign-up process to create the Paid account, you will need the client's credit card information.`,
      action: null,
      show: true

    },
    {
      icon: "terminal",
      slug: "share",
      title: "Share My Referral Code",
      description: "By simply sharing your referral code, it is the client’s responsibility to complete the account creation process. Once the client has created their account and enters in your referral code, you can then log in and approve the link for their account.",
      action: () => helpers.shareReferral(),
      show: !!store.getState().user.coupon

    }
  ];
  return responsibility_choices;
};

const switchStep = (state, helpers) => {
  let created = state.beneficiaryDetails;
  switch(state.steps[store.getState().signup.currentStep].title) {
    case "Responsibility":
      const responsibility_choices = getResponsibilitySteps(helpers);
      const active_choices = responsibility_choices.filter((rc) => rc.show);
      return (
        <PaymentResponsibilityContainer>
          <PaymentResponsibilityPadding>
            <PaymentResponsibilityInner gutter={20}>
              {active_choices.map((choice, index) => {
                return (
                  <PaymentResponsbilitySection key={index} span={12}>
                    <PaymentResponsibilitySectionPadding>
                      <PaymentResponsibilitySectionInner active={state.responsibility === choice.slug ? 1 : 0} onClick={choice.action ? () => choice.action() : () => helpers.setNewState("responsibility", choice.slug)}>

                        <PaymentResponsibilityInnerHeadingSection>
                          <PaymentResponsibilityInnerIcon xs={2} sm={2} md={1} lg={1}xl={1}><FontAwesomeIcon icon={["fad", choice.icon]} /></PaymentResponsibilityInnerIcon>
                          <PaymentResponsibilityInnerInfo xs={10} sm={10} md={11} lg={11}xl={11}>
                            <PaymentResponsibilityInnerHeadingSection>
                              <PaymentResponsibilityInnerHeading span={12}>{choice.title}</PaymentResponsibilityInnerHeading>
                              <PaymentResponsibilityInnerDescription span={12}>{choice.description}</PaymentResponsibilityInnerDescription>
                            </PaymentResponsibilityInnerHeadingSection>
                          </PaymentResponsibilityInnerInfo>
                        </PaymentResponsibilityInnerHeadingSection>
                        
                      </PaymentResponsibilitySectionInner>
                    </PaymentResponsibilitySectionPadding>
                  </PaymentResponsbilitySection>
                );
              })}
            </PaymentResponsibilityInner>
          </PaymentResponsibilityPadding>
        </PaymentResponsibilityContainer>
      );
    case "Type":
      return (
        <ClientLifecycleChooser
          stateConsumer={helpers.setNewState}
          stateRetriever={helpers.stateRetriever}
          lifecycle={state.lifecycle}
        />
      );
    case "Client":
      return (
        <ClientChooser
          stateConsumer={helpers.setNewState}
          stateRetriever={helpers.stateRetriever}
          account={state.account}
        />
      );
    case "Relationship":
      return (
        <RelationshipPicker
          stateConsumer={helpers.setNewState}
          stateRetriever={helpers.stateRetriever}
          userType={state.user_type}
        />
      );
    case "Service Tier":
      return (
        <ActivePlansChooser
          page="upgrade"
          type="user"
          responsibility={state.responsibility}
          stateRetriever={helpers.stateRetriever}
          stateConsumer={helpers.setNewState}
        />
      );
    case "Beneficiary":
      return (
        <BeneficiarySignUpForm
          is_checking_beneficiary_email={state.is_checking_beneficiary_email}
          beneficiary_email_valid={state.beneficiary_email_valid}
          beneficiary_email_error={state.beneficiary_email_error}
          checkUserEmail={helpers.checkUserEmail}
          updateBulkState={helpers.updateBulkState}
          setNewState={helpers.setNewState}
          details={{...created, user_type: state.user_type }}
          missingFields={state.missingFields}
          is_user_creation={state.is_user_creation}
          is_partner_creation={state.is_partner_creation}
        />
      );
    case "Payment":
      const paymentDetails = {
        first: created.beneficiaryFirst,
        last: created.beneficiaryLast,
        paymentZip: state.paymentZip,
        discountCode: state.discountCode,
        referral_code: state.referral_code,
        paymentNameOnCard: state.paymentNameOnCard,
        user_type: state.user_type,
        planChoice: state.plan_choice,
        responsibility: state.responsibility
      };
      return (
        <SignupPaymentContainer
          setNewState={helpers.setNewState}
          details={paymentDetails}
          signupUser={helpers.signupUser}
          termsAccepted={state.terms_accepted}
          SAASAccepted={state.SAAS_accepted}
          missingFields={state.missingFields}
          is_user_creation={state.is_user_creation}
          is_partner_creation={state.is_partner_creation}
        />
      );
    default:
      return (
        <div>Default view</div>
      );
  }
};

export const buildAuthenticationView = (state, helpers) => {
  return (
    <AuthenticationWrapperItemInner>
      {switchStep(state, helpers)}
    </AuthenticationWrapperItemInner>
  );
};

export const steps = (state) => [
  {
    title: "Responsibility",
    message: "Who will be responsible for this subscription",
    show: [
      () => state.is_partner_creation
    ],
    slug: "",
    required: [
      "responsibility"
    ]
  },
  {
    title: "Type",
    message: "What Type Of Client Are You Adding?",
    slug: "",
    show: [
      () => state.is_partner_creation && state.responsibility === "credits"
    ],
    required: [
      "lifecycle"
    ]
  },
  {
    title: "Client",
    message: "Which Of Your Clients Would You Like To Add?",
    slug: "",
    show: [
      () => state.is_partner_creation && state.lifecycle === "existing"
    ],
    required: [
      "account"
    ]
  },
  {
    title: "Relationship",
    message: "What is Your Relationship?",
    slug: "",
    show: [
      () => state.is_user_creation
    ],
    required: [
      "user_type"
    ]
  },
  {
    title: "Service Tier",
    message: "Select a Service Tier",
    show: [
      () => (state.lifecycle === "new" || (state.lifecycle === "existing" && state.account && (!state.account.user_plan.monthly || state.account.user_plan.account_id))) || state.is_user_creation
    ],
    slug: "",
    required: [
      "plan_choice"
    ]
  },
  {
    title: "Beneficiary",
    message: "Who is This Account Being Established to Help?",
    show: [
      () => state.is_partner_creation || (state.is_user_creation && state.user_type !== "beneficiary"),
      () => state.lifecycle === "new" || state.is_user_creation
    ],
    slug: "beneficiaryDetails",
    required: [
      "beneficiaryFirst",
      "beneficiaryLast",
      "beneficiaryAddress",
      "beneficiaryCity",
      "beneficiaryState",
      "beneficiaryZip",
      "beneficiaryBirthday",
      "beneficiaryGender",
      "beneficiaryPronouns"
    ]
  },
  {
    title: "Payment",
    message: "Client Billing Information",
    show: [
      () => state.plan_choice.monthly,
      () => state.is_partner_creation ? state.responsibility === "client" : true,
      () => state.lifecycle === "new" || state.is_user_creation
    ],
    slug: "",
    required: [
      "terms_accepted",
      "SAAS_accepted",
      "cardCvc",
      "cardExpiry",
      "cardNumber",
      "paymentNameOnCard",
      "paymentZip"
    ]
  },
];

export const step_conditions = (state) => {
  return {
    "Responsibility": [],
    "Type": [],
    "Client": [],
    "Relationship": [],
    "Service Tier": [],
    "Beneficiary": [
      () => state.beneficiaryDetails.beneficiaryEmail ? state.beneficiary_email_valid : (state.beneficiaryDetails.noBeneficiaryEmail || (state.is_user_creation && state.user_type === "beneficiary")),
      () => state.beneficiaryDetails.beneficiaryZip.length === 5
    ],
    "Payment": []
  };
};