import React, { Component, lazy, Suspense } from "react";
import { connect } from "beautiful-react-redux";
import { getActivePartnerPlans } from "../../store/actions/plans";
import { bulkUpdatePartnerRegistrationState, updatePartnerRegistrationState } from "../../store/actions/partner-registration";
import { getEmbeddableHelloSignURL } from "../../store/actions/hello-sign";
import { changeFormSlide, stepComplete } from "../../store/actions/multipart-form";
import { getOrganizationPartners, sendEntityInvitation } from "../../store/actions/partners";
import { getStripeExpandedCustomer } from "../../store/actions/stripe";
import { checkUserEmail } from "../../store/actions/user";
import { MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import { showNotification } from "../../store/actions/notification";
import InviteSlide from "./slides/invite.slide";
import AuthorizedSlide from "./slides/authorize.slide";
import PlanSlide from "./slides/plan.slide";
import BillingSlide from "./slides/billing.slide";
import ContractSlide from "./slides/contract.slide";
import signup_background from "../../assets/images/signup_background.jpeg";
import { debounce } from "lodash";
import { getHelloSignDownloadLink } from "../../store/actions/hello-sign";
import { sleep } from "../../utilities";
const MultipartForm = lazy(() => import("../../Components/multipart-form/LazyMultiPartForm"));

class PartnerAccountRegistration extends Component {
  constructor(props) {
    super(props);
    document.title = "Account Registration";
    this.state = {
      loading: false
    };
  }

  composeState = (key, value, collector) => {
    const { updatePartnerRegistrationState } = this.props;
    updatePartnerRegistrationState(collector, key, value);
  };

  bulkComposeState = (collector, data) => {
    const { bulkUpdatePartnerRegistrationState } = this.props;
    bulkUpdatePartnerRegistrationState(collector, data);
  };

  retrieveValueFromState = (key) => {
    const { partner_registration } = this.props;
    let flat = {};
    let state = Object.assign(flat, ...Object.keys(partner_registration).map((reg_key) => partner_registration[reg_key]));
    return state[key];
  };

  fetchActivePlans = async (type, name, account_id) => {
    const { getActivePartnerPlans } = this.props;
    await getActivePartnerPlans(type, name, account_id, true);
  };

  checkEmail = async (event) => {
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        await this.check();
      }, 1000);
    }
    this.debouncedFn();
  };

  check = async (query_email) => {
    const { checkUserEmail, user } = this.props;
    let email = query_email || this.retrieveValueFromState("invite_email");
    if (email.includes("@")) {
      this.composeState("is_loading_invite_email", true, "registration_config");
      const emailCheck = await checkUserEmail((email || "").toLowerCase().replace(/\s+/g, ""), user.partner_type);
      this.bulkComposeState("registration_config", {
        email_error: emailCheck.message,
        error_code: (emailCheck.error_code || ""),
        email_valid: emailCheck.success
      });
    } else {
      this.bulkComposeState("registration_config", {
        email_error: false,
        error_code: "",
        email_valid: false
      });
    }
    this.composeState("is_loading_invite_email", false, "registration_config");
  };

  sendEntityInvitation = async () => {
    const { sendEntityInvitation, showNotification, user, partner_registration, changeFormSlide } = this.props;
    if (user.partner_data.partner_type && partner_registration.registration_config.invite_first && partner_registration.registration_config.invite_last && partner_registration.registration_config.invite_email && user.partner_data.partner_type) {
      const sent_invite = await sendEntityInvitation(user.partner_data.name, partner_registration.registration_config.invite_first, partner_registration.registration_config.invite_last, partner_registration.registration_config.invite_email, user.partner_data.partner_type);
      if (sent_invite.success) {
        this.bulkComposeState("registration_config", { invite_first: "", invite_last: "", invite_email: "" });
        changeFormSlide(0);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  launchSignature = async (plan_type, partner_signature_id, subject, message, signers, templates, cost, additional_plan_credits, additional_plan_cost) => {
    const { getEmbeddableHelloSignURL, plans, user, partners } = this.props;
    const plan = plans.active_partner_plans.find((p) => p.name === plan_type) || {};
    this.composeState(`is_loading_${plan_type}`, true, "registration_config");
    await getEmbeddableHelloSignURL(
      partner_signature_id,
      subject,
      message,
      signers,
      templates,
      {
        plan_type,
        plan,
        name: user.partner_data.name,
        is_entity: user.partner_data.is_entity || this.retrieveValueFromState("is_entity") || (partners.organization_partners.length ? false : true)
      },
      true,
      cost,
      additional_plan_credits,
      additional_plan_cost,
      this.composeState
    );
    this.composeState(`is_loading_${plan_type}`, false, "registration_config");
  };

  finishSignature = async (plan_choice, partner_signature_id, cost, additional_plan_credits, additional_plan_cost) => {
    const { getEmbeddableHelloSignURL, user, partners } = this.props;
    this.composeState("finishing", true, "registration_config");
    await getEmbeddableHelloSignURL(
      partner_signature_id,
      false,
      false,
      false,
      false,
      {
        plan_type: plan_choice.name,
        plan: plan_choice,
        name: user.partner_data.name,
        is_entity: user.partner_data.is_entity || (partners.organization_partners.length ? false : true)
      },
      true,
      cost,
      additional_plan_credits,
      additional_plan_cost,
      this.composeState
    );
    this.composeState("finishing", false, "registration_config");
  };

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.composeState("is_downloading_agreement", true, "registration_config");
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.composeState("is_downloading_agreement", false, "registration_config");
  };

  getOrgPartners = async (config, override) => {
    const { getOrganizationPartners, partners } = this.props;
    console.log("hi")
    if (!partners.requestedOrgPartners || override) {
      this.setState({ loading: true });
      const org_partners = await getOrganizationPartners(config, override);
      if (org_partners) this.composeState("authorized", true, "registration_config");
      else this.composeState("authorized", false, "registration_config");
      await sleep(5000);
      this.setState({ loading: false });
      return org_partners;
    }
  };

  render() {
    const { getStripeExpandedCustomer, changeFormSlide, stepComplete } = this.props;
    const { loading } = this.state;
    let configuration = new MultipartFormConfig({
      slides: [
        AuthorizedSlide,
        InviteSlide,
        PlanSlide,
        BillingSlide,
        ContractSlide
      ],
      splitLayout: false
    });
    return (
      <Container background_image={signup_background} absolute>
        <Suspense fallback={<div>Loading...</div>}>
          <MultipartForm
            loading={loading}
            config={configuration}
            state={this.state}
            bulkComposeState={this.bulkComposeState}
            stateConsumer={this.composeState}
            stateRetriever={this.retrieveValueFromState}
            stateCollection="partner_registration"
            helpers={{
              checkEmail: this.checkEmail,
              fetchActivePlans: this.fetchActivePlans,
              getOrganizationPartners: this.getOrgPartners,
              getStripeExpandedCustomer,
              sendEntityInvitation: this.sendEntityInvitation,
              launchSignature: this.launchSignature,
              finishSignature: this.finishSignature,
              getHelloSignDownloadLink: this.getHelloSignDownloadLink,
              changeFormSlide,
              stepComplete
            }}
          />
        </Suspense>
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  partner_registration: state.partner_registration,
  partners: state.partners,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  stepComplete: (step, status) => dispatch(stepComplete(step, status)),
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  updatePartnerRegistrationState: (collector, key, value) => dispatch(updatePartnerRegistrationState(collector, key, value)),
  bulkUpdatePartnerRegistrationState: (collector, data) => dispatch(bulkUpdatePartnerRegistrationState(collector, data)),
  getActivePartnerPlans: (type, name, account_id, override) => dispatch(getActivePartnerPlans(type, name, account_id, override)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  getOrganizationPartners: (config, override) => dispatch(getOrganizationPartners(config, override)),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  sendEntityInvitation: (organization, first, last, email, partner_type) => dispatch(sendEntityInvitation(organization, first, last, email, partner_type)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide)),
  getEmbeddableHelloSignURL: (partner_signature_id, subject, message, signers, templates, partner_config, allowCancel, cost, full_cost, additional_plan_credits, additional_plan_cost, stateSetter) => dispatch(getEmbeddableHelloSignURL(partner_signature_id, subject, message, signers, templates, partner_config, allowCancel, cost, full_cost, additional_plan_credits, additional_plan_cost, stateSetter))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerAccountRegistration);
