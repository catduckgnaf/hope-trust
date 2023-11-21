import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { bulkUpdateClientRegistrationState, updateClientRegistrationState } from "../../store/actions/client-registration";
import { confirmAccountRegistration } from "../../store/actions/signup";
import { showLoader } from "../../store/actions/loader";
import { createHubspotContact, updateHubspotContact, createHubspotDeal } from "../../store/actions/hubspot";
import { getActiveUserPlans } from "../../store/actions/plans";
import { checkUserEmail } from "../../store/actions/user";
import { getStripeExpandedCustomer, verifyDiscount } from "../../store/actions/stripe";
import { MultipartForm, MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import { debounce } from "lodash";
import RelationshipTypeSlide from "./slides/relationship-type.slide";
import AccountSlide from "./slides/account.slide";
import AddressSlide from "./slides/address.slide";
import DemographicsSlide from "./slides/demographics.slide";
import PartnerLinkSlide from "./slides/partner-link.slide";
import NoAccountsSlide from "./slides/no_accounts.slide";
import BillingSlide from "./slides/billing.slide";
import PlanSlide from "./slides/plan.slide";
import AvatarSlide from "./slides/avatar.slide";
import { buildHubspotContactData, buildHubspotDealData } from "../../utilities";
import { changeFormSlide } from "../../store/actions/multipart-form";
import signup_background from "../../assets/images/signup_background.jpeg";
import { hotjar } from "react-hotjar";
import ReactAvatar from "react-avatar";
import {
  BannerMain,
  BannerPadding,
  BannerInner,
  BannerLogo,
  BannerText
} from "./styles";

class CreateAccountPage extends Component {
  constructor(props) {
    super(props);
    const { changeFormSlide, location, user } = props;
    document.title = "Account Registration";
    this.state = {
      user
    };
    if (location.query.slide) changeFormSlide(location.query.slide);
  }

  async componentDidMount() {
    const { plans, getActiveUserPlans } = this.props;
    if ((!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans)) await getActiveUserPlans(true);
  }

  composeState = (key, value, collector) => {
    const { updateClientRegistrationState } = this.props;
    updateClientRegistrationState(collector, key, value);
  };

  bulkComposeState = (collector, data) => {
    const { bulkUpdateClientRegistrationState } = this.props;
    bulkUpdateClientRegistrationState(collector, data);
  };

  retrieveValueFromState = (key, native_state = false) => {
    const { client_registration } = this.props;
    let flat = {};
    let state = this.state;
    if (!native_state) state = Object.assign(flat, ...Object.keys(client_registration).map((reg_key) => client_registration[reg_key]));
    return state[key];
  };

  checkEmail = async (event, query_email = "") => {
    const { checkUserEmail } = this.props;
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        let email = query_email || this.retrieveValueFromState("email");
        if (email.includes("@")) {
          this.composeState("is_loading_email", true, "registration_config");
          const emailCheck = await checkUserEmail(email);
          if (emailCheck.success) {
            this.composeState("email_error", emailCheck.message, "registration_config");
            this.composeState("email_valid", true, "registration_config");
          } else {
            this.composeState("email_error", emailCheck.message, "registration_config");
            this.composeState("email_valid", false, "registration_config");
          }
        } else {
          this.composeState("email_error", false, "registration_config");
          this.composeState("email_valid", false, "registration_config");
        }
        this.composeState("is_loading_email", false, "registration_config");
      }, 1000);
    }
    this.debouncedFn();
  };

  verifyReferral = async (code) => {
    const { verifyDiscount } = this.props;
    if (code) code = code.replace(/\s+/g, "");
    this.composeState("is_loading_referral_code", true, "registration_config");
    const coupon = await verifyDiscount(code);
    this.composeState("is_loading_referral_code", false, "registration_config");
    if (coupon) {
      if (coupon.metadata.isReferral === "true" && coupon.partner) {
        this.composeState("referral", coupon, "account_details");
        this.composeState("referral_error", `Your account will be linked to ${coupon.partner.first_name} ${coupon.partner.last_name}`, "registration_config");
        this.composeState("referral_valid", true, "registration_config");
      } else {
        this.composeState("referral", null, "account_details");
        this.composeState("referral_error", "This is not a valid referral code.", "registration_config");
        this.composeState("referral_valid", false, "registration_config");
      }
    }
  };

  createHubspotContact = async (status) => {
    const { client_registration, createHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotContactData(client_registration, multi_part_form.slide, status);
    const hubspot_contact = await createHubspotContact(client_registration.account_details.email, [ ...data, { "property": "account_role", "value": "beneficiary" }]);
    if (hubspot_contact.success) {
      this.composeState("hubspot_contact_id", hubspot_contact.payload.vid, "account_details");
      this.composeState("secondary_contact_created", true, "registration_config");
    }
    return hubspot_contact.success;
  };

  createHubspotDeal = async () => {
    const { client_registration, createHubspotDeal, user } = this.props;
    const data = buildHubspotDealData(client_registration, user);
    return await createHubspotDeal(data);
  };

  updateHubspotContact = async (status, target_id) => {
    const { client_registration, updateHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotContactData(client_registration, multi_part_form.slide, status);
    let hubspot_id = target_id || client_registration.account_details.hubspot_contact_id;
    return await updateHubspotContact(hubspot_id, [
      ...data,
      { "property": "self_account", "value": client_registration.account_details.user_type === "beneficiary" },
      { "property": "account_role", "value": client_registration.account_details.user_type === "beneficiary" ? "self" : "beneficiary" }
    ]);
  };

  runRegisterAccount = async () => {
    const { plans, client_registration, confirmAccountRegistration, updateHubspotContact, showLoader, user, getActiveUserPlans } = this.props;
    showLoader("Processing...");
    if (!plans.active_user_plans.length) await getActiveUserPlans(true);
    if (client_registration.account_details.user_type === "beneficiary") {
      await this.updateHubspotContact("Done", user.hubspot_contact_id);
    } else {
      await this.updateHubspotContact("Done");
      await updateHubspotContact(user.hubspot_contact_id, [
        { "property": "sign_up_status", "value": "Done" },
        { "property": "hs_lead_status", "value": "CUSTOMER" },
        { "property": "self_account", "value": false },
        { "property": "account_role", "value": client_registration.account_details.user_type }
      ]);
    }
    let registration_data = { ...client_registration.account_details, ...client_registration.registration_config, ...client_registration.preserved_details };
    const hubspot_deal = await this.createHubspotDeal();
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("account registration");
    if (hubspot_deal.success) registration_data["hubspot_deal_id"] = hubspot_deal.payload.dealId;
    return await confirmAccountRegistration(registration_data);
  };

  render() {
    const { user, location, getStripeExpandedCustomer } = this.props;
    let configuration = new MultipartFormConfig({
      slides: [
        NoAccountsSlide,
        PartnerLinkSlide,
        RelationshipTypeSlide,
        AccountSlide,
        AvatarSlide,
        AddressSlide,
        DemographicsSlide,
        PlanSlide,
        BillingSlide
      ],
      splitLayout: false,
      banner: true,
      banner_text: user.benefits_client_config ? (
        <BannerMain>
          <BannerPadding>
            <BannerInner>
              {user.benefits_client_config.logo
                ? (
                  <BannerLogo>
                    <ReactAvatar src={user.benefits_client_config.logo} size={25} name={user.benefits_client_config.name} round />
                  </BannerLogo>
                )
                : null
              }
              <BannerText>{`Claiming Employee Benefit for ${user.benefits_client_config.name} | Invite Code: ${user.benefits_client_config.invite_code}`}</BannerText>
            </BannerInner>
          </BannerPadding>
        </BannerMain>
      ) : false
    });
    
    return (
      <Container background_image={signup_background}>
        <MultipartForm
          config={configuration}
          state={this.state} 
          stateConsumer={this.composeState}
          stateRetriever={this.retrieveValueFromState}
          bulkComposeState={this.bulkComposeState}
          stateCollection="client_registration"
          helpers={{
            checkEmail: this.checkEmail,
            updateHubspotContact: this.updateHubspotContact,
            createHubspotContact: this.createHubspotContact,
            runRegisterAccount: this.runRegisterAccount,
            verifyReferral: this.verifyReferral,
            getStripeExpandedCustomer,
            location
          }}
        />
      </Container>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  client_registration: state.client_registration,
  location: state.router.location,
  multi_part_form: state.multi_part_form,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  bulkUpdateClientRegistrationState: (collector, data) => dispatch(bulkUpdateClientRegistrationState(collector, data)),
  updateClientRegistrationState: (collector, key, value) => dispatch(updateClientRegistrationState(collector, key, value)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  confirmAccountRegistration: (details) => dispatch(confirmAccountRegistration(details)),
  showLoader: (message) => dispatch(showLoader(message)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  createHubspotContact: (email, data) => dispatch(createHubspotContact(email, data)),
  createHubspotDeal: (data) => dispatch(createHubspotDeal(data)),
  updateHubspotContact: (hubspot_contact_id, data) => dispatch(updateHubspotContact(hubspot_contact_id, data)),
  verifyDiscount: (code) => dispatch(verifyDiscount(code)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide)),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
});
export default connect(mapStateToProps, dispatchToProps)(CreateAccountPage);
