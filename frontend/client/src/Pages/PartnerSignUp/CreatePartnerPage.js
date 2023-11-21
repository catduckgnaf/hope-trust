import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { bulkUpdatePartnerRegistrationState, updatePartnerRegistrationState, registerPartner, confirmPartnerRegistration } from "../../store/actions/partner-registration";
import { createHubspotContact, updateHubspotContact } from "../../store/actions/hubspot";
import { checkUserEmail, cancelSignup } from "../../store/actions/user";
import { claimThisEmail } from "../../store/actions/utilities";
import { searchReferrals } from "../../store/actions/referral";
import { MultipartForm, MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { changeFormSlide } from "../../store/actions/multipart-form";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import { debounce } from "lodash";
import AccountSlide from "./slides/account.slide";
import AddressSlide from "./slides/address.slide";
import VerificationSlide from "./slides/verification.slide";
import RegisterSlide from "./slides/password.slide";
import PartnerInfoSlide from "./slides/partner-info.slide";
import AvatarSlide from "./slides/avatar.slide";
import { buildHubspotPartnerContactData } from "../../utilities";
import signup_background from "../../assets/images/signup_background.jpeg";
import { hotjar } from "react-hotjar";
import { showLoader } from "../../store/actions/loader";

class CreatePartnerPage extends Component {
  constructor(props) {
    super(props);
    const { changeFormSlide, location } = props;
    this.state = {};
    if (location.query.slide) changeFormSlide(location.query.slide);
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

  checkEmail = async (event) => {
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        await this.check();
      }, 1000);
    }
    this.debouncedFn();
  };

  check = async (query_email) => {
    const { checkUserEmail, partner_registration } = this.props;
    let email = query_email || this.retrieveValueFromState("email");
    if (email.includes("@")) {
      this.composeState("is_loading_email", true, "registration_config");
      const { domain_approved } = partner_registration.partner_details;
      const { mapped = [] } = partner_registration.registration_config;
      const emailCheck = await checkUserEmail((email || "").toLowerCase().replace(/\s+/g, ""), this.retrieveValueFromState("partner_type"));
      const found_org = mapped.find((m) => m.domains.includes(email.split("@")[1]));
      this.bulkComposeState("registration_config", {
        is_confirmed_org: !!found_org,
        new_org_created: false,
        email_error: emailCheck.message,
        error_code: emailCheck.error_code,
        email_valid: emailCheck.success
      });
      if (emailCheck.success) {
        this.composeState("hubspot_company_id", found_org ? found_org.hubspot_company_id : "", "registration_config");
        this.bulkComposeState("partner_details", {
          name: found_org ? found_org.value : (this.retrieveValueFromState("is_invite") ? this.retrieveValueFromState("name") : ""),
          partner_type: found_org ? found_org.type : (this.retrieveValueFromState("is_invite") ? this.retrieveValueFromState("partner_type") : ""),
          domain_approved: !domain_approved ? !!found_org : (this.retrieveValueFromState("is_invite") ? this.retrieveValueFromState("domain_approved") : false)
        });
      } else {
        this.bulkComposeState("registration_config", {
          email_error: emailCheck.message,
          error_code: emailCheck.error_code,
          email_valid: emailCheck.success
        });
      }
    } else {
      this.composeState("email_error", false, "registration_config");
      this.composeState("error_code", "", "registration_config");
      this.composeState("email_valid", false, "registration_config");
    }
    this.composeState("is_loading_email", false, "registration_config");
  };

  createHubspotContact = async (status) => {
    const { partner_registration, createHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotPartnerContactData(partner_registration, multi_part_form.slide, status);
    const hubspot_contact = await createHubspotContact(partner_registration.client_details.email, data);
    if (hubspot_contact.success) {
      this.composeState("hubspot_contact_id", hubspot_contact.payload.vid, "client_details");
      this.composeState("contact_created", true, "registration_config");
    }
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("lead captured");
    return hubspot_contact.success;
  };

  updateHubspotContact = async (status) => {
    const { partner_registration, updateHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotPartnerContactData(partner_registration, multi_part_form.slide, status);
    return await updateHubspotContact(partner_registration.client_details.hubspot_contact_id, data);
  };

  runRegisterAccount = async (code) => {
    const { partner_registration, confirmPartnerRegistration, showLoader } = this.props;
    showLoader("Processing...");
    await this.updateHubspotContact("In Progress", partner_registration.client_details.hubspot_contact_id);
    let registration_data = { ...partner_registration.client_details, ...partner_registration.partner_details, ...partner_registration.registration_config };
    if (partner_registration.partner_details.is_life_insurance_affiliate) registration_data.partner_type = "insurance";
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("account registration");
    return await confirmPartnerRegistration(code, registration_data);
  };

  runRegisterPartner = async () => {
    const { registerPartner, partner_registration } = this.props;
    const registered = await registerPartner(partner_registration.client_details);
    await this.updateHubspotContact("In Progress");
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("user registration");
    return registered;
  };

  searchReferrals = async (type = "type", value, domain = false) => {
    const { searchReferrals } = this.props;
    const results = await searchReferrals(type, value, domain);
    if (results.success) {
      let mapped = results.payload.map((res) => {
        return { label: res.name, value: res.name, domains: res.domains, type: res.type, hubspot_company_id: res.hubspot_company_id };
      });
      this.bulkComposeState("registration_config", {
        mapped: mapped.sort((a, b) => a.label.localeCompare(b.label)),
        new_org_created: false,
        is_creating_new_org: this.retrieveValueFromState("is_creating_new_org") || false
      });
      this.bulkComposeState("partner_details", {
        name: this.retrieveValueFromState("name") || "",
        domain_approved: false
      });
      return mapped;
    }
  };

  getInsuranceNetworks = async (type = "type", value, domain = false) => {
    const { searchReferrals } = this.props;
    const results = await searchReferrals(type, value, domain);
    if (results.success) {
      let insurance_networks = results.payload.map((res) => {
        return { label: res.name, value: res.name };
      });
      this.bulkComposeState("registration_config", {
        insurance_networks: insurance_networks.sort((a, b) => a.label.localeCompare(b.label)),
        new_primary_network_created: false,
        is_creating_new_primary_network: false
      });
      return insurance_networks;
    }
  };

  render() {
    const { location, cancelSignup, claimThisEmail } = this.props;
    let configuration = new MultipartFormConfig({
      slides: [
        AccountSlide,
        AvatarSlide,
        AddressSlide,
        PartnerInfoSlide,
        RegisterSlide,
        VerificationSlide
      ],
      splitLayout: false
    });
    
    return (
      <Container background_image={signup_background}>
        <MultipartForm 
          config={configuration}
          state={this.state} 
          bulkComposeState={this.bulkComposeState}
          stateConsumer={this.composeState}
          stateRetriever={this.retrieveValueFromState}
          stateCollection="partner_registration"
          helpers={{
            checkEmail: this.checkEmail,
            check: this.check,
            createHubspotContact: this.createHubspotContact,
            updateHubspotContact: this.updateHubspotContact,
            runRegisterPartner: this.runRegisterPartner,
            runRegisterAccount: this.runRegisterAccount,
            location,
            cancelSignup,
            claimThisEmail,
            searchReferrals: this.searchReferrals,
            getInsuranceNetworks: this.getInsuranceNetworks
          }}
        />
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  partner_registration: state.partner_registration,
  location: state.router.location,
  multi_part_form: state.multi_part_form
});
const dispatchToProps = (dispatch) => ({
  searchReferrals: (param, value, domain) => dispatch(searchReferrals(param, value, domain)),
  updatePartnerRegistrationState: (collector, key, value) => dispatch(updatePartnerRegistrationState(collector, key, value)),
  bulkUpdatePartnerRegistrationState: (collector, data) => dispatch(bulkUpdatePartnerRegistrationState(collector, data)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  registerPartner: (details) => dispatch(registerPartner(details)),
  cancelSignup: (email) => dispatch(cancelSignup(email)),
  claimThisEmail: (email) => dispatch(claimThisEmail(email)),
  confirmPartnerRegistration: (code, client_details, registration_config) => dispatch(confirmPartnerRegistration(code, client_details, registration_config)),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  updateHubspotContact: (hubspot_contact_id, data) => dispatch(updateHubspotContact(hubspot_contact_id, data)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide)),
  showLoader: (message) => dispatch(showLoader(message))
});
export default connect(mapStateToProps, dispatchToProps)(CreatePartnerPage);
