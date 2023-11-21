import React, { Component } from "react";
import { Modal } from "react-responsive-modal";
import { connect } from "beautiful-react-redux";
import { Fade } from "@gfazioli/react-animatecss";
import AuthenticationStepper from "../../Pages/AuthenticationStepper";
import { merge, orderBy } from "lodash";
import { buildAuthenticationView, steps, step_conditions } from "./utilities";
import { showLoader, hideLoader } from "../../store/actions/loader";
import { closeCreateAccountModal } from "../../store/actions/account";
import { checkUserEmail } from "../../store/actions/user";
import { createHubspotContact, createHubspotDeal } from "../../store/actions/hubspot";
import { newMessage } from "../../store/actions/message";
import { confirmAccountUserSignup, changeStep, createSignupError, updateSignupState } from "../../store/actions/signup";
import { addAccountToSubscription } from "../../store/actions/partners";
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
import { hotjar } from "react-hotjar";

class AccountCreateModal extends Component {

  constructor(props) {
    super(props);
    const { accounts, user, signupState, is_partner_creation, is_user_creation } = props;
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
      terms_accepted: false,
      SAAS_accepted: false,
      code: "",
      plan_choice: "",
      discountCode: "",
      referral_code: user.coupon && user.coupon.valid && is_partner_creation ? user.coupon : "",
      cardCvc: "",
      cardExpiry: "",
      cardNumber: "",
      paymentNameOnCard: "",
      paymentZip: "",
      untouched: "",
      tokenResponse: false,
      missingFields: {},
      beneficiary_email_error: "",
      beneficiary_email_valid: false,
      is_checking_beneficiary_email: false,
      is_partner_creation,
      is_user_creation,
      responsibility: "client",
      lifecycle: "new",
      account: "",
      is_creating_account: false,
      hubspot_deal_id: "",
      user,
      accounts,
      ...storedState
    };
  }

  shareReferral = () => {
    const { user, newMessage, closeCreateAccountModal, session, accounts, relationship } = this.props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const current_user = relationship.list.find((u) => u.cognito_id === user.cognito_id);
    newMessage({
      type: "registration",
      url_parameters: { referral_code: current_account.referral_code },
      from_email: user.email,
      to_email: "",
      to_first: "",
      to_last: "",
      subject: "Hope Trust Referral Code",
      body: `Below please find my referral code for Hope Trust. If you are a new user, please use this code during sign up to link our accounts. For existing Hope Trust users, please use this code to add me to your account by going to your accounts tab, pressing "Add User" and then "Add a professional using a Referral Code".\n\nReferral Code: ${current_account.referral_code}\n\nDon't forget to grant me permission to see appropriate sections of your account by going to Relationships and using the sliding permission settings.\n\nI look forward to working with you through the Hope Trust platform.\n\nBest,\n${current_user.first_name} ${current_user.last_name}`
    });
    closeCreateAccountModal();
  };

  signupUser = async () => {
    const { updateSignupState, confirmAccountUserSignup, showLoader } = this.props;
    showLoader("Processing...");
    this.setState({ is_creating_account: true });
    updateSignupState({ state: this.state });
    const contact_creation = await this.createHubspotContact("Done");
    let hubspot_deal_id = null;
    if (contact_creation) {
      const hubspot_deal = await this.createHubspotDeal();
      if (process.env.REACT_APP_STAGE === "production") hotjar.event("account registration");
      if (hubspot_deal.success) hubspot_deal_id = hubspot_deal.payload.dealId;
    }
    const confirmed = await confirmAccountUserSignup({ ...this.state, hubspot_deal_id });
    this.setState({ is_creating_account: false });
    return confirmed;
  };

  addAccountToSubscription = async (account) => {
    const { addAccountToSubscription, user } = this.props;
    const { plan_choice } = this.state;
    this.setState({ is_creating_account: true });
    const transferred = await addAccountToSubscription(account.account_id, account.subscription.id, user.customer_id, account.user_plan, plan_choice);
    if (transferred.success) this.setState({ is_creating_account: false });
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
    this.setState({ [`is_checking_${type}_email`]: true });
    const is_valid_email = await checkUserEmail(email, type);
    this.setState({ [`${type}_email_error`]: is_valid_email.message, [`${type}_email_valid`]: is_valid_email.success, [`is_checking_${type}_email`]: false });
  };

  createHubspotContact = async (status) => {
    const { createHubspotContact } = this.props;
    const { beneficiaryDetails, is_partner_creation } = this.state;
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
    const hubspot_contact = await createHubspotContact(details_copy.email, [ ...data, { "property": "account_role", "value": is_partner_creation ? "beneficiary" : "self" } ]);
    if (hubspot_contact.success) this.setNewState("hubspot_contact_id", hubspot_contact.payload.vid);
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("lead captured");
    return hubspot_contact.success;
  };

  createHubspotDeal = async () => {
    const { createHubspotDeal, user } = this.props;
    const { beneficiaryDetails, referral_code } = this.state;
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
    const data = buildHubspotPartnerCreatedDealData({ ...this.state, ...details_copy, referral_code: referral_code ? referral_code.id : null }, user);
    return await createHubspotDeal(data);
  };

  render() {
    const { signupState, changeStep, closeCreateAccountModal, creatingAccount, plans } = this.props;
    const { plan_choice, responsibility, lifecycle, account, is_creating_account } = this.state;
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
                {buildAuthenticationView({ ...this.state, steps: activeSteps, sorted_plans }, { stateRetriever: this.stateRetriever, shareReferral: this.shareReferral, checkUserEmail: this.checkUserEmail, setNewState: this.setNewState, updateBulkState: this.updateBulkState, check: this.check, signupUser: this.signupUser, throwAvatarError: this.throwAvatarError })}
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
                        <Button type="button" green onClick={() => changeStep("backward", this.state)}>Previous</Button>
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
                              <Button type="button" green disabled={!required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={() => this.validateAndRunSignup()}>Complete</Button>
                            </Fade>
                          )
                          : (
                            <Fade animate={true}>
                              <Button type="button" green disabled={!required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={(responsibility === "credits" && lifecycle === "existing" && account) ? () => this.addAccountToSubscription(account) : () => this.signupUser()}>Complete</Button>
                            </Fade>
                          )
                        }
                      </>
                    )
                    : (
                      <Fade animate={true}>
                        <Button type="button" green disabled={!required.every((req) => req) || !conditions.every((con) => con)} onClick={() => changeStep("forward", this.state)}>Next</Button>
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
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  plans: state.plans,
  location: state.router.location,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  confirmAccountUserSignup: (fields) => dispatch(confirmAccountUserSignup(fields)),
  addAccountToSubscription: (account_id, subscription_record_id, customer_id, current_plan, new_plan) => dispatch(addAccountToSubscription(account_id, subscription_record_id, customer_id, current_plan, new_plan)),
  hideLoader: () => dispatch(hideLoader()),
  showLoader: (message) => dispatch(showLoader(message)),
  changeStep: (step, state) => dispatch(changeStep(step, state)),
  updateSignupState: (updates) => dispatch(updateSignupState(updates)),
  createSignupError: (error, resource) => dispatch(createSignupError(error, resource)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  closeCreateAccountModal: () => dispatch(closeCreateAccountModal()),
  newMessage: (config) => dispatch(newMessage(config)),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  createHubspotDeal: (data) => dispatch(createHubspotDeal(data))
});
export default connect(mapStateToProps, dispatchToProps)(AccountCreateModal);

