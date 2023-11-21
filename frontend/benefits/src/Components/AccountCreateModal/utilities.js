import React from "react";
import BeneficiarySignUpForm from "../BeneficiarySignUpForm";
import { ActivePlansChooser } from "../ActivePlansChooser";
import SignupPaymentContainer from "../SignupPaymentContainer";
import { AuthenticationWrapperItemInner } from "../../global-components";
import BenefitsChooser from "../BenefitsChooser";
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
      icon: "user-plus",
      slug: "create",
      title: "Create New Client",
      description: "A new account will be created under the selected group. Note that you will need the clients credit card information in order to complete creation of the account. Following successful creation, the client account will be linked to you accordingly.",
      action: null,
      show: true

    },
    {
      icon: "envelope",
      slug: "invite",
      title: "Invite New Client",
      description: "By inviting a new client, it is the client’s responsibility to complete the account creation process. Once the client has created their account and enters in your invite code, they will be linked to you accordingly.",
      action: null,
      show: true


    }
  ];
  return responsibility_choices;
};

const switchStep = (state, helpers) => {
  let created = state.beneficiaryDetails;
  switch(state.steps[store.getState().signup.currentStep].title) {
    case "Creation Type":
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
                      <PaymentResponsibilitySectionInner active={state.creation_type === choice.slug ? 1 : 0} onClick={choice.action ? () => choice.action() : () => helpers.setNewState("creation_type", choice.slug)}>

                        <PaymentResponsibilityInnerHeadingSection>
                          <PaymentResponsibilityInnerIcon xs={2} sm={2} md={1} lg={1} xl={1}><FontAwesomeIcon icon={["fad", choice.icon]} /></PaymentResponsibilityInnerIcon>
                          <PaymentResponsibilityInnerInfo xs={10} sm={10} md={11} lg={11} xl={11}>
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
    case "Service Tier":
      return (
        <ActivePlansChooser
          page="upgrade"
          type="user"
          stateRetriever={helpers.stateRetriever}
          stateConsumer={helpers.setNewState}
          benefits={true}
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
          details={{ ...created, user_type: state.user_type, creation_type: state.creation_type }}
          missingFields={state.missingFields}
        />
      );
    case "Payment":
      const paymentDetails = {
        first: created.beneficiaryFirst,
        last: created.beneficiaryLast,
        paymentZip: state.paymentZip,
        discountCode: state.discountCode,
        paymentNameOnCard: state.paymentNameOnCard,
        user_type: state.user_type,
        planChoice: state.plan_choice
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
    title: "Creation Type",
    message: "How Should This Account Be Created?",
    show: [
      () => store.getState().groups.list.length || store.getState().user.benefits_data.type === "group"
    ],
    slug: "",
    required: [
      "creation_type"
    ]
  },
  {
    title: "Employee Benefits",
    message: "Choose a Group",
    show: [],
    slug: "",
    required: [
      "benefits_group",
      "benefits_rep"
    ]
  },
  {
    title: "Service Tier",
    message: "Select a Service Tier",
    show: [
      () => state.creation_type === "create"
    ],
    slug: "",
    required: [
      "plan_choice"
    ]
  },
  {
    title: "Beneficiary",
    message: "Who is This Account Being Established to Help?",
    show: [],
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
      "beneficiaryPronouns",
      ...((state.creation_type === "invite") ? ["beneficiaryEmail"] : []),
    ]
  },
  {
    title: "Payment",
    message: "Client Billing Information",
    show: [
      () => state.creation_type === "create"
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
    "Creation Type": [],
    "Employee Benefits": [],
    "Service Tier": [],
    "Beneficiary": [
      () => state.beneficiaryDetails.beneficiaryEmail ? state.client_email_valid : (state.beneficiaryDetails.noBeneficiaryEmail),
    ],
    "Payment": []
  };
};