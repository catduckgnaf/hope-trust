import React, { Component } from "react";
import { Modal } from "react-responsive-modal";
import { connect } from "beautiful-react-redux";
import { Fade } from "@gfazioli/react-animatecss";
import AuthenticationStepper from "../../Pages/AuthenticationStepper";
import { merge, orderBy } from "lodash";
import { buildAuthenticationView, steps, step_conditions } from "./utilities";
import { showLoader, hideLoader } from "../../store/actions/loader";
import { closeCreateAccountModal } from "../../store/actions/account";
import { createBenefitsClient } from "../../store/actions/customer-support";
import { checkUserEmail, createHubspotContact, createHubspotDeal } from "../../store/actions/user";
import { confirmAccountUserSignup, changeStep, createSignupError, updateSignupState } from "../../store/actions/signup";
import { getActiveUserPlans  } from "../../store/actions/plans";
import { sendClientInvite } from "../../store/actions/clients";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { getClients } from "../../store/actions/clients";

class AccountCreateModal extends Component {

  constructor(props) {
    super(props);
    const { user, signupState, agents, groups } = props;
    const storedState = signupState.state;
    const is_entity = user.benefits_data ? ["agent", "group", "team"].includes(user.benefits_data.type) : false;
    const isParentAgent = (user.benefits_data.parent_id === user.cognito_id) && agents.list ? agents.list[0] : agents.list.find((a) => a.cognito_id === user.benefits_data.parent_id);

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
      is_creating_account: false,
      hubspot_deal_id: "",
      benefits_group: (user.benefits_data.type === "group") ? { value: user.benefits_data, label: user.benefits_data.name } : false,
      benefits_rep: is_entity ? { value: user.benefits_data, label: (user.benefits_data.name ? `${user.first_name} ${user.last_name} - ${user.benefits_data.name}` : `${user.first_name} ${user.last_name}`) } : false,
      benefits_agent: (isParentAgent && groups.length === 1) ? { value: isParentAgent, label: isParentAgent.agent_name } : false,
      user,
      is_entity,
      creation_type: "create",
      isParentAgent,
      is_group_entity: user.benefits_data.type === "group",
      sending_invite: false,
      independent: false,
      ...storedState
    };
  }

  signupUser = async () => {
    const { getClients, updateSignupState, confirmAccountUserSignup, showLoader, createBenefitsClient } = this.props;
    const { benefits_group, benefits_rep, benefits_agent } = this.state;
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
    if (confirmed.success) await createBenefitsClient(confirmed.account, benefits_group.value, benefits_rep.value, (benefits_agent ? benefits_agent.value : false), { ...confirmed.user, organization: benefits_group.value.name, is_benefits: true });
    await getClients(true);
    this.setState({ is_creating_account: false });
    return confirmed;
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
    const is_valid_email = await checkUserEmail(email, "client");
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
    const data = buildHubspotPartnerCreatedDealData({ ...this.state, ...details_copy, referral_code: referral_code ? referral_code.id : null }, { ...user, ...user.benefits_data});
    return await createHubspotDeal(data);
  };

  sendClientInvite = async () => {
    const { closeCreateAccountModal, createBenefitsClient, sendClientInvite } = this.props;
    const { beneficiaryDetails, benefits_group, benefits_rep, benefits_agent } = this.state;
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
      organization: benefits_group.value.name,
      is_benefits: true
    };
    if (beneficiaryDetails.beneficiaryPhone) params.phone = beneficiaryDetails.beneficiaryPhone;
    this.setState({ sending_invite: true });
    const new_client = await createBenefitsClient({ account_id: "pending", invite_code: "pending", status: "pending" }, benefits_group.value, benefits_rep.value, (benefits_agent ? benefits_agent.value : false), params);
    if (new_client.success) {
      const sent_invite = await sendClientInvite(beneficiaryDetails, new_client.payload, benefits_group.value);
      if (sent_invite.success) closeCreateAccountModal();
      this.setState({ sending_invite: false });
    }
  };

  async componentDidMount() {
    const { getActiveUserPlans, plans } = this.props;
    if (!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans) await getActiveUserPlans();
  }

  render() {
    const { signupState, changeStep, closeCreateAccountModal, creatingAccount, plans } = this.props;
    const { is_creating_account, creation_type, sending_invite } = this.state;
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
                {buildAuthenticationView({ ...this.state, steps: activeSteps, sorted_plans }, { stateRetriever: this.stateRetriever, checkUserEmail: this.checkUserEmail, setNewState: this.setNewState, updateBulkState: this.updateBulkState, check: this.check, signupUser: this.signupUser })}
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
                      <Fade animate={true}>
                        {creation_type === "invite"
                          ? <Button type="button" secondary outline disabled={sending_invite || !required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={() => this.sendClientInvite()}>{sending_invite ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Invite"}</Button>
                          : <Button type="button" secondary outline disabled={!required.every((req) => req) || !conditions.every((con) => con) || is_creating_account} onClick={() => this.validateAndRunSignup()}>Complete</Button>
                        }
                      </Fade>
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
  location: state.router.location,
  agents: state.agents,
  groups: state.groups
});
const dispatchToProps = (dispatch) => ({
  confirmAccountUserSignup: (fields) => dispatch(confirmAccountUserSignup(fields)),
  hideLoader: () => dispatch(hideLoader()),
  getClients: (override) => dispatch(getClients(override)),
  showLoader: (message) => dispatch(showLoader(message)),
  changeStep: (step, state) => dispatch(changeStep(step, state)),
  updateSignupState: (updates) => dispatch(updateSignupState(updates)),
  createSignupError: (error, resource) => dispatch(createSignupError(error, resource)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  closeCreateAccountModal: () => dispatch(closeCreateAccountModal()),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  createHubspotDeal: (data) => dispatch(createHubspotDeal(data)),
  createBenefitsClient: (account, group, rep, agent, params) => dispatch(createBenefitsClient(account, group, rep, agent, params)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  sendClientInvite: (client_info, invite_info, group, params) => dispatch(sendClientInvite(client_info, invite_info, group, params))
});
export default connect(mapStateToProps, dispatchToProps)(AccountCreateModal);

