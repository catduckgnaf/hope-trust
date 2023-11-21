import React, { Component } from "react";
import { Modal } from "react-responsive-modal";
import { connect } from "beautiful-react-redux";
import { Fade } from "@gfazioli/react-animatecss";
import AuthenticationStepper from "../../Pages/AuthenticationStepper";
import { merge, orderBy } from "lodash";
import { buildAuthenticationView, steps, step_conditions } from "./utilities";
import { showLoader, hideLoader } from "../../store/actions/loader";
import { closeCreateAccountModal, createBenefitsClient } from "../../store/actions/account";
import { openAddMembershipModal } from "../../store/actions/customer-support";
import { checkUserEmail, createHubspotContact, createHubspotDeal } from "../../store/actions/user";
import { addAccountToSubscription } from "../../store/actions/partners";
import { confirmAccountUserSignup, changeStep, createSignupError, updateSignupState } from "../../store/actions/signup";
import {
  AuthenticationHeader,
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationLogoContainer,
  AuthenticationFooter,
  Button,
  Hint,
  RequiredStar
} from "../../global-components";
import {
  StepperNavigation,
  AuthenticationStepperHeader,
  AuthenticationStepperHeaderMessage,
  AuthenticationStepperHeaderStepInfo
} from "../../Pages/AuthenticationStepper/style";
import { SignupViewContainer } from "./style";
import { buildHubspotPartnerCreatedDealData, buildHubspotContactData, generatePassword } from "../../utilities";

class AccountCreateModal extends Component {

  constructor(props) {
    super(props);
    const { user, config, signupState } = props;
    const storedState = signupState.state;

    this.state = {
      beneficiaryDetails: {
        beneficiaryFirst: "",
        beneficiaryMiddle: "",
        beneficiaryLast: "",
        beneficiaryAddress: "",
        beneficiaryAddress2: "",
        beneficiaryCity: "",
        beneficiaryState: "",
        beneficiaryZip: "",
        beneficiaryBirthday: "",
        beneficiaryGender: "",
        beneficiaryPronouns: "",
        beneficiaryEmail: "",
        noBeneficiaryEmail: false,
        notifyBeneficiary: false,
        hubspot_contact_id: ""
      },
      user_type: "beneficiary",
      code: "",
      plan_choice: "",
      discountCode: "",
      referral_code: "",
      cardCvc: "",
      cardExpiry: "",
      cardNumber: "",
      paymentNameOnCard: "",
      paymentZip: "",
      untouched: "",
      tokenResponse: false,
      missingFields: {},
      client_email_error: "",
      client_email_valid: false,
      is_checking_client_email: false,
      responsibility: config.responsibility || "client",
      lifecycle: "new",
      account: "",
      partner: false,
      is_creating_account: false,
      hubspot_deal_id: "",
      user,
      benefits_group: false,
      benefits_rep: false,
      benefits_agent: false,
      benefits_active: config.responsibility === "benefits" || false,
      ...storedState
    };
  }

  signupUser = async () => {
    const { updateSignupState, confirmAccountUserSignup, showLoader, createBenefitsClient } = this.props;
    const { beneficiaryDetails, partner, plan_choice, responsibility, benefits_active, benefits_group, benefits_rep, benefits_agent } = this.state;
    showLoader("Processing...");
    this.setState({ is_creating_account: true });
    updateSignupState({ state: this.state });
    const contact_creation = await this.createHubspotContact("Done");
    let hubspot_deal_id = null;
    if (contact_creation) {
      const hubspot_deal = await this.createHubspotDeal();
      if (hubspot_deal.success) hubspot_deal_id = hubspot_deal.payload.dealId;
    }
    const confirmed = await confirmAccountUserSignup({ ...this.state, hubspot_deal_id });
    if (confirmed.success) {
      let params = {
        firstname: beneficiaryDetails.beneficiaryFirst,
        lastname: beneficiaryDetails.beneficiaryLast,
        email: beneficiaryDetails.beneficiaryEmail,
        address: beneficiaryDetails.beneficiaryAddress,
        city: beneficiaryDetails.beneficiaryCity,
        state: beneficiaryDetails.beneficiaryState,
        zip: beneficiaryDetails.beneficiaryZip,
        gender: beneficiaryDetails.beneficiaryGender,
        pronouns: beneficiaryDetails.beneficiaryPronouns,
        birthday: beneficiaryDetails.beneficiaryBirthday,
        organization: benefits_active ? benefits_group.value.name : null,
        is_benefits: benefits_active
      };
      if (beneficiaryDetails.beneficiaryPhone) params.phone = beneficiaryDetails.beneficiaryPhone;
      if (confirmed.account && responsibility === "credits") await this.addAccountToSubscription(confirmed.account, partner, plan_choice);
      if (confirmed.account && benefits_active) await createBenefitsClient(confirmed.account, benefits_group.value, benefits_rep.value, (benefits_agent ? benefits_agent.value : false), params);
    }
    this.setState({ is_creating_account: false });
    return confirmed;
  };

  addAccountToSubscription = async (account, partner, plan_choice) => {
    const { addAccountToSubscription, closeCreateAccountModal } = this.props;
    this.setState({ is_creating_account: true });
    const transferred = await addAccountToSubscription(account.account_id, (account.subscription_lookup_id || account.subscription_record_id), partner.customer_id, account.user_plan, plan_choice, partner.cognito_id);
    if (transferred.success) this.setState({ is_creating_account: false });
    closeCreateAccountModal();
    return transferred;
  };

  setNewState = (id, value) => {
    const { beneficiaryDetails } = this.state;
    if (beneficiaryDetails.hasOwnProperty(id)) {
      const newState = merge(this.state.beneficiaryDetails, { [id]: value });
      this.setState({ beneficiaryDetails: newState });
    } else {
      this.setState({ [id]: value });
    }
  };

  stateRetriever = (key) => {
    return this.state[key];
  };

  updateBulkState = (type, updates) => {
    const newState = merge(this.state[type], { ...updates });
    this.setState({ [type]: newState });
  };

  validateAndRunSignup = () => {
    document.getElementById("payment_form_button").click();
  };

  checkUserEmail = async (email, type) => {
    const { checkUserEmail } = this.props;
    this.setState({ is_checking_client_email: true });
    const is_valid_email = await checkUserEmail(email, type);
    this.setState({ client_email_error: is_valid_email.message, client_email_valid: is_valid_email.success, is_checking_client_email: false });
  };

  createHubspotContact = async (status) => {
    const { createHubspotContact } = this.props;
    const { beneficiaryDetails } = this.state;
    let details_copy = {
      "first_name": beneficiaryDetails.beneficiaryFirst,
      "last_name": beneficiaryDetails.beneficiaryLast,
      "email": beneficiaryDetails.beneficiaryEmail,
      "address": beneficiaryDetails.beneficiaryAddress,
      "address2": beneficiaryDetails.beneficiaryAddress2,
      "city": beneficiaryDetails.beneficiaryCity,
      "state": beneficiaryDetails.beneficiaryState,
      "zip": beneficiaryDetails.beneficiaryZip,
      "gender": beneficiaryDetails.beneficiaryGender,
      "birthday": beneficiaryDetails.beneficiaryBirthday,
      "pronouns": beneficiaryDetails.beneficiaryPronouns
    };
    if (beneficiaryDetails.noBeneficiaryEmail || !beneficiaryDetails.beneficiaryEmail) {
      const generated_email = `hopeportalusers+${generatePassword(10)}@gmail.com`;
      details_copy.email = generated_email;
      this.setNewState("beneficiaryEmail", generated_email);
    }
    const data = buildHubspotContactData({ details_copy }, 0, status);
    const hubspot_contact = await createHubspotContact(details_copy.email, [ ...data, { "property": "account_role", "value": "beneficiary" } ]);
    if (hubspot_contact.success) this.setNewState("hubspot_contact_id", hubspot_contact.payload.vid);
    return hubspot_contact.success;
  };

  createHubspotDeal = async () => {
    const { createHubspotDeal } = this.props;
    const { beneficiaryDetails, referral_code, partner } = this.state;
    let details_copy = {
      "first_name": beneficiaryDetails.beneficiaryFirst,
      "last_name": beneficiaryDetails.beneficiaryLast,
      "email": beneficiaryDetails.beneficiaryEmail,
      "address": beneficiaryDetails.beneficiaryAddress,
      "address2": beneficiaryDetails.beneficiaryAddress2,
      "city": beneficiaryDetails.beneficiaryCity,
      "state": beneficiaryDetails.beneficiaryState,
      "zip": beneficiaryDetails.beneficiaryZip,
      "gender": beneficiaryDetails.beneficiaryGender,
      "birthday": beneficiaryDetails.beneficiaryBirthday,
      "pronouns": beneficiaryDetails.beneficiaryPronouns,
      "noBeneficiaryEmail": beneficiaryDetails.noBeneficiaryEmail,
      "notifyBeneficiary": beneficiaryDetails.notifyBeneficiary,
      "hubspot_contact_id": beneficiaryDetails.hubspot_contact_id
    };
    const data = buildHubspotPartnerCreatedDealData({ ...this.state, ...details_copy, referral_code: referral_code ? referral_code.id : null }, partner);
    return await createHubspotDeal(data);
  };

  toggleBenefits = (status) => {
    this.setNewState("benefits_active", status);
  };

  render() {
    const { signupState, changeStep, closeCreateAccountModal, openAddMembershipModal, creatingAccount, plans } = this.props;
    const { plan_choice, responsibility, lifecycle, account, partner, is_creating_account } = this.state;
    let activeSteps = steps(this.state).filter((r) => r.show.every((s) => s()));
    const required = activeSteps[signupState.currentStep].required.map((r) => activeSteps[signupState.currentStep].slug ? !!this.state[activeSteps[signupState.currentStep].slug][r] : !!this.state[r]);
    const conditions = step_conditions(this.state)[activeSteps[signupState.currentStep].title].map((r) => r());
    let sorted_plans = orderBy(plans.active_user_plans.filter((up) => !up.account_id), [(plan) => plan.name === "Free", "monthly"], ["desc", "asc"]).map((p, index) => {
      return { ...p, index };
    });
    return (
      <Modal animationDuration={100} closeOnOverlayClick={false} styles={{ modal: { maxWidth: "1800px", minWidth: "300px", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingAccount} onClose={() => closeCreateAccountModal()} center>
        <SignupViewContainer>
          <AuthenticationHeader>
            <AuthenticationLogoContainer>
              {!signupState.confirmationRequired
                ? (
                  <AuthenticationStepperHeader>
                    <AuthenticationStepperHeaderMessage>{activeSteps[signupState.currentStep].message}</AuthenticationStepperHeaderMessage>
                    <AuthenticationStepperHeaderStepInfo>Step {signupState.currentStep + 1} of {activeSteps.length}</AuthenticationStepperHeaderStepInfo>
                  </AuthenticationStepperHeader>
                )
                : null
              }
            </AuthenticationLogoContainer>
            {!signupState.confirmationRequired
              ? <AuthenticationStepper steps={activeSteps} currentStep={signupState.currentStep} />
              : null
            }
          </AuthenticationHeader>
          <AuthenticationWrapper>
            <AuthenticationWrapperItem>
              <Fade animate={true}>
                {buildAuthenticationView({ ...this.state, steps: activeSteps, sorted_plans }, { toggleBenefits: this.toggleBenefits, openAddMembershipModal, stateRetriever: this.stateRetriever, checkUserEmail: this.checkUserEmail, setNewState: this.setNewState, updateBulkState: this.updateBulkState, check: this.check, signupUser: this.signupUser })}
                {activeSteps[signupState.currentStep].required.length
                  ? <Hint paddingtop={10}><RequiredStar>*</RequiredStar> indicates a required field.</Hint>
                  : null
                }
              </Fade>
            </AuthenticationWrapperItem>
          </AuthenticationWrapper>
          <AuthenticationFooter position="absolute">
            {!signupState.confirmationRequired
              ? (
                <StepperNavigation>
                  {signupState.currentStep > 0
                    ? (
                      <Fade animate={true}>
                        <Button type="button" onClick={() => changeStep("backward", this.state)} primary outline>Previous</Button>
                      </Fade>
                    )
                    : null
                  }
                  {signupState.currentStep === activeSteps.length - 1
                    ? (
                      <>
                        {!!plan_choice.monthly && responsibility !== "credits"
                          ? (
                            <Fade animate={true}>
                              <Button type="button" secondary outline disabled={!required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={() => this.validateAndRunSignup()}>Complete</Button>
                            </Fade>
                          )
                          : (
                            <Fade animate={true}>
                              <Button type="button" secondary outline disabled={!required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={(responsibility === "credits" && lifecycle === "existing" && account) ? () => this.addAccountToSubscription(account, partner, plan_choice) : () => this.signupUser()}>Complete</Button>
                            </Fade>
                          )
                        }
                      </>
                    )
                    : (
                      <Fade animate={true}>
                        <Button type="button" disabled={!required.every((req) => req) || !conditions.every((con) => con)} onClick={() => changeStep("forward", this.state)} secondary outline>Next</Button>
                      </Fade>
                    )
                  }
                </StepperNavigation>
              )
              : null
            }
          </AuthenticationFooter>
        </SignupViewContainer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  signupState: state.signup,
  user: state.user,
  session: state.session,
  plans: state.plans,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  openAddMembershipModal: (type) => dispatch(openAddMembershipModal(type)),
  confirmAccountUserSignup: (fields) => dispatch(confirmAccountUserSignup(fields)),
  addAccountToSubscription: (account_id, subscription_record_id, customer_id, current_plan, new_plan, cognito_id) => dispatch(addAccountToSubscription(account_id, subscription_record_id, customer_id, current_plan, new_plan, cognito_id)),
  hideLoader: () => dispatch(hideLoader()),
  showLoader: (message) => dispatch(showLoader(message)),
  changeStep: (step, state) => dispatch(changeStep(step, state)),
  updateSignupState: (updates) => dispatch(updateSignupState(updates)),
  createSignupError: (error, resource) => dispatch(createSignupError(error, resource)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  closeCreateAccountModal: () => dispatch(closeCreateAccountModal()),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  createHubspotDeal: (data) => dispatch(createHubspotDeal(data)),
  createBenefitsClient: (account, group, rep, agent, params) => dispatch(createBenefitsClient(account, group, rep, agent, params))
});
export default connect(mapStateToProps, dispatchToProps)(AccountCreateModal);

