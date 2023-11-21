import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { updateClientRegistrationState, registerClient, confirmClientRegistration } from "../../store/actions/client-registration";
import { cancelSignup } from "../../store/actions/utilities";
import { checkUserEmail, createHubspotContact, updateHubspotContact } from "../../store/actions/user";
import { claimThisEmail } from "../../store/actions/utilities";
import { MultipartForm, MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { changeFormSlide } from "../../store/actions/multipart-form";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import { debounce } from "lodash";
import AccountSlide from "./slides/account.slide";
import AddressSlide from "./slides/address.slide";
import VerificationSlide from "./slides/verification.slide";
import RegisterSlide from "./slides/password.slide";
import { buildHubspotContactData } from "../../utilities";
import signup_background from "../../assets/images/signup_background.jpeg";
import { hotjar } from "react-hotjar";

class CreateUserPage extends Component {
  constructor(props) {
    super(props);
    const { changeFormSlide, location } = props;
    this.state = {};
    if (location.query.slide) changeFormSlide(location.query.slide);
  }

  composeState = (key, value, collector) => {
    const { updateClientRegistrationState } = this.props;
    updateClientRegistrationState(collector, key, value);
  };

  retrieveValueFromState = (key) => {
    const { client_registration } = this.props;
    let flat = {};
    let state = Object.assign(flat, ...Object.keys(client_registration).map((reg_key) => client_registration[reg_key]));
    return state[key];
  };

  checkEmail = async (event, query_email = false) => {
    const { checkUserEmail } = this.props;
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        let email = query_email || this.retrieveValueFromState("email");
        if (email.includes("@")) {
          this.composeState("is_loading_email", true, "registration_config");
          const emailCheck = await checkUserEmail(email);
          if (emailCheck.success) {
            this.composeState("email_error", emailCheck.message, "registration_config");
            this.composeState("error_code", "", "registration_config");
            this.composeState("email_valid", true, "registration_config");
          } else {
            this.composeState("email_error", emailCheck.message, "registration_config");
            this.composeState("error_code", emailCheck.error_code, "registration_config");
            this.composeState("email_valid", false, "registration_config");
          }
        } else {
          this.composeState("email_error", false, "registration_config");
          this.composeState("error_code", "", "registration_config");
          this.composeState("email_valid", false, "registration_config");
        }
        this.composeState("is_loading_email", false, "registration_config");
      }, 1000);
    }
    this.debouncedFn();
  };

  createHubspotContact = async (status) => {
    const { client_registration, createHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotContactData(client_registration, multi_part_form.slide, status);
    const hubspot_contact = await createHubspotContact(client_registration.client_details.email, data);
    if (hubspot_contact.success) {
      this.composeState("hubspot_contact_id", hubspot_contact.payload.vid, "client_details");
      this.composeState("primary_contact_created", true, "registration_config");
    }
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("lead captured");
    return hubspot_contact.success;
  };

  updateHubspotContact = async (status) => {
    const { client_registration, updateHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotContactData(client_registration, multi_part_form.slide, status);
    return await updateHubspotContact(client_registration.client_details.hubspot_contact_id, data);
  };

  render() {
    const { client_registration, location, cancelSignup, claimThisEmail } = this.props;
    let configuration = new MultipartFormConfig({
      slides: [
        AccountSlide,
        AddressSlide,
        RegisterSlide,
        VerificationSlide
      ],
      splitLayout: false
    });

    let runRegisterClient = async () => {
      const { registerClient } = this.props;
      const registered = await registerClient(client_registration.client_details);
      await this.updateHubspotContact("In Progress");
      if (process.env.REACT_APP_STAGE === "production") hotjar.event("user registration");
      return registered;
    };

    let runVerification = async (code) => {
      const { confirmClientRegistration } = this.props;
      const verified = await confirmClientRegistration(code, client_registration.client_details, client_registration.registration_config);
      await this.updateHubspotContact("In Progress");
      if (process.env.REACT_APP_STAGE === "production") hotjar.event("verification");
      return verified;
    };
    
    return (
      <Container background_image={signup_background}>
        <MultipartForm 
          config={configuration}
          state={this.state} 
          stateConsumer={this.composeState}
          stateRetriever={this.retrieveValueFromState}
          stateCollection="client_registration"
          helpers={{
            checkEmail: this.checkEmail,
            createHubspotContact: this.createHubspotContact,
            updateHubspotContact: this.updateHubspotContact,
            runRegisterClient,
            runVerification,
            location,
            cancelSignup,
            claimThisEmail
          }}
        />
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  client_registration: state.client_registration,
  location: state.router.location,
  multi_part_form: state.multi_part_form
});
const dispatchToProps = (dispatch) => ({
  updateClientRegistrationState: (collector, key, value) => dispatch(updateClientRegistrationState(collector, key, value)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  registerClient: (details) => dispatch(registerClient(details)),
  cancelSignup: (email) => dispatch(cancelSignup(email)),
  claimThisEmail: (email) => dispatch(claimThisEmail(email)),
  confirmClientRegistration: (code, client_details, registration_config) => dispatch(confirmClientRegistration(code, client_details, registration_config)),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  updateHubspotContact: (hubspot_contact_id, data) => dispatch(updateHubspotContact(hubspot_contact_id, data)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide))
});
export default connect(mapStateToProps, dispatchToProps)(CreateUserPage);
