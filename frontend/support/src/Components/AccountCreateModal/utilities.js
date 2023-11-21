import React from "react";
import BeneficiarySignUpForm from "../../Components/BeneficiarySignUpForm";
import { ActivePlansChooser } from "../../Components/ActivePlansChooser";
import SignupPaymentContainer from "../../Components/SignupPaymentContainer";
import ClientLifecycleChooser from "../../Components/ClientLifecycleChooser";
import ClientChooser from "../../Components/ClientChooser";
import BenefitsChooser from "../../Components/BenefitsChooser";
import PartnerChooser from "../../Components/PartnerChooser";
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
  const responsibility_choices = [
    {
      icon: "users",
      slug: "credits",
      title: "Add To Partner Subscription",
      description: "The selected partner will take financial responsibility for this subscription. The account will be added as a seat on their partner subscription.",
      action: () => helpers.toggleBenefits(false),
      show: () => true

    },
    {
      icon: "user",
      slug: "client",
      title: "Client Responsibility",
      description: "The client takes financial responsibility for this subscription. Please note, in order to complete the sign-up process to create a Paid account, you will need the client's credit card information.",
      action: () => helpers.toggleBenefits(false),
      show: () => true
    },
    {
      icon: "users-medical",
      slug: "benefits",
      title: "Employee Benefits",
      description: "The client takes financial responsibility for this subscription. You will choose a network Group to associate the account with.",
      action: () => helpers.toggleBenefits(true),
      show: () => helpers.stateRetriever("responsibility") === "benefits"
    },
    {
      icon: "user-plus",
      slug: "member",
      title: "Create An Account Membership",
      description: "Add a new member to an account. This member will have the permissions granted at the time of creation, the existing user will receive an email confirmation when their membership is approved.",
      action: () => {
        helpers.openAddMembershipModal("client");
        helpers.toggleBenefits(false);
      },
      show: () => true
    }
  ];
  return responsibility_choices;
};

const switchStep = (state, helpers) => {
  let created = state.beneficiaryDetails;
  switch(state.steps[store.getState().signup.currentStep].title) {
    case "Responsibility":
      const responsibility_choices = getResponsibilitySteps(helpers);
      const active_choices = responsibility_choices.filter((rc) => rc.show());
      return (
        <PaymentResponsibilityContainer>
          <PaymentResponsibilityPadding>
            <PaymentResponsibilityInner gutter={20}>
              {active_choices.map((choice, index) => {
                return (
                  <PaymentResponsbilitySection key={index} span={12}>
                    <PaymentResponsibilitySectionPadding>
                      <PaymentResponsibilitySectionInner active={state.responsibility === choice.slug ? 1 : 0} onClick={() => {
                        if (choice.action) {
                          choice.action();
                          helpers.setNewState("responsibility", choice.slug);
                        } else {
                          helpers.setNewState("responsibility", choice.slug);
                        }
                      }}>

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
    case "Select Partner":
      return (
        <PartnerChooser
          stateConsumer={helpers.setNewState}
          stateRetriever={helpers.stateRetriever}
          partner={state.partner}
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
    case "Service Tier":
      return (
        <ActivePlansChooser
          page="upgrade"
          type="user"
          stateRetriever={helpers.stateRetriever}
          stateConsumer={helpers.setNewState}
          transfer={(state.responsibility === "credits")}
          benefits={state.benefits_active}
        />
      );
    case "Employee Benefits":
      return (
        <BenefitsChooser
          stateConsumer={helpers.setNewState}
          stateRetriever={helpers.stateRetriever}
          benefits_group={state.benefits_group}
          benefits_rep={state.benefits_rep}
          benefits_agent={state.benefits_agent}
        />
      );
    case "Beneficiary":
      return (
        <BeneficiarySignUpForm
          is_checking_client_email={state.is_checking_client_email}
          client_email_valid={state.client_email_valid}
          client_email_error={state.client_email_error}
          checkUserEmail={helpers.checkUserEmail}
          updateBulkState={helpers.updateBulkState}
          setNewState={helpers.setNewState}
          details={{...created, user_type: state.user_type }}
          missingFields={state.missingFields}
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
          missingFields={state.missingFields}
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
      () => state.responsibility !== "benefits"
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
      () => state.responsibility === "credits"
    ],
    required: [
      "lifecycle"
    ]
  },
  {
    title: "Select Partner",
    message: "Which Partner Will Be Managing This Subscription?",
    show: [
      () => state.responsibility === "credits"
    ],
    slug: "",
    required: [
      "partner"
    ]
  },
  {
    title: "Client",
    message: "Which Of Your Clients Would You Like To Add?",
    slug: "",
    show: [
      () => state.lifecycle === "existing"
    ],
    required: [
      "account"
    ]
  },
  {
    title: "Service Tier",
    message: "Select a Service Tier",
    show: [
      () => (state.lifecycle === "new" || (state.lifecycle === "existing" && state.account && (!state.account.user_plan.monthly || state.account.user_plan.account_id)))
    ],
    slug: "",
    required: [
      "plan_choice"
    ]
  },
  {
    title: "Employee Benefits",
    message: "Is This Account Part Of The Hope Trust Benefits Network?",
    slug: "",
    show: [
      () => state.benefits_active
    ],
    required: [
      "benefits_group",
      "benefits_rep"
    ]
  },
  {
    title: "Beneficiary",
    message: "Who is This Account Being Established to Help?",
    show: [
      () => state.lifecycle === "new"
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
      () => ["client", "benefits"].includes(state.responsibility),
      () => state.lifecycle === "new"
    ],
    slug: "",
    required: [
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
    "Select Partner": [],
    "Type": [],
    "Client": [],
    "Service Tier": [],
    "Employee Benefits": [],
    "Beneficiary": [
      () => state.beneficiaryDetails.beneficiaryEmail ? state.client_email_valid : (state.beneficiaryDetails.noBeneficiaryEmail),
    ],
    "Payment": []
  };
};