import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { updateClientRegistrationState, bulkUpdateClientRegistrationState } from "../../store/actions/client-registration";
import { sendEntityInvitation, getHelloSignDownloadLink, getEmbeddableHelloSignURL } from "../../store/actions/hello-sign";
import { confirmAccountRegistration } from "../../store/actions/signup";
import { showLoader } from "../../store/actions/loader";
import { checkUserEmail, updateHubspotContact, createHubspotDeal } from "../../store/actions/user";
import { MultipartForm, MultipartFormConfig } from "../../Components/multipart-form/MultipartForm";
import { Container } from "../../Components/multipart-form/layouts/single-layout.styles";
import RelationshipTypeSlide from "./slides/relationship-type.slide";
import AccountOptionsSlide from "./slides/account-options.slide";
import AccountSlide from "./slides/account.slide";
import AuthorizedSlide from "./slides/authorize.slide";
import ContractSlide from "./slides/contract.slide";
import InviteSlide from "./slides/invite.slide";
import { buildHubspotContactData, buildHubspotDealData, sleep } from "../../utilities";
import { changeFormSlide } from "../../store/actions/multipart-form";
import signup_background from "../../assets/images/signup_background.jpeg";
import { hotjar } from "react-hotjar";
import { flatten, debounce  } from "lodash";
import { getPublicWholesalers } from "../../store/actions/wholesale";
import { getPublicRetailers } from "../../store/actions/retail";
import { getPublicAgents } from "../../store/actions/agents";
import { getPublicGroups } from "../../store/actions/groups";
import { getPublicTeams } from "../../store/actions/teams";
import { WEBMAIL_PROVIDER_DOMAINS } from "../../utilities";

class CreateAccountPage extends Component {
  constructor(props) {
    super(props);
    const { changeFormSlide, location } = props;
    this.state = {
      loading: true
    };
    this.getAllOrgs();
    if (location.query.slide) changeFormSlide(location.query.slide);
  }

  bulkComposeState = (collector, data) => {
    const { bulkUpdateClientRegistrationState } = this.props;
    bulkUpdateClientRegistrationState(collector, data);
  };

  composeState = (key, value, collector) => {
    const { updateClientRegistrationState } = this.props;
    updateClientRegistrationState(collector, key, value);
  };

  retrieveValueFromState = (key, root_state = false) => {
    const { client_registration } = this.props;
    let flat = {};
    let state = this.state;
    if (!root_state) state = Object.assign(flat, ...Object.keys(client_registration).map((reg_key) => client_registration[reg_key]));
    return state[key];
  };

  checkEmail = async (event, query_email = false) => {
    const { checkUserEmail } = this.props;
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        let email = query_email || this.retrieveValueFromState("invite_email");
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

  createHubspotDeal = async () => {
    const { client_registration, createHubspotDeal, user } = this.props;
    const data = buildHubspotDealData(client_registration, user);
    return await createHubspotDeal(data);
  };

  updateHubspotContact = async (status, target_id) => {
    const { client_registration, updateHubspotContact, multi_part_form } = this.props;
    const data = buildHubspotContactData(client_registration, multi_part_form.slide, status);
    return await updateHubspotContact(target_id, [
      ...data,
      { "property": "self_account", "value": true },
      { "property": "account_role", "value": client_registration.account_details.user_type }
    ]);
  };

  runRegisterAccount = async () => {
    const { client_registration, confirmAccountRegistration, showLoader, user } = this.props;
    showLoader("Processing...");
    await this.updateHubspotContact("Done", user.hubspot_contact_id);
    let registration_data = { ...client_registration.account_details, ...client_registration.registration_config, ...user.benefits_data };
    //const hubspot_deal = await this.createHubspotDeal();
    if (process.env.REACT_APP_STAGE === "production") hotjar.event("account registration");
    //if (hubspot_deal.success) registration_data["hubspot_deal_id"] = hubspot_deal.payload.dealId;
    return await confirmAccountRegistration(registration_data);
  };

  getAllOrgs = async (override = false) => {
    const { user } = this.props;
    const {
      wholesale,
      retail,
      agents,
      groups,
      teams,
      getPublicWholesalers,
      getPublicRetailers,
      getPublicAgents,
      getPublicGroups,
      getPublicTeams
    } = this.props;
    let requests = [];
    const domain = user.email.split("@")[1];
    if ((!wholesale.requested && !wholesale.isFetching) || override) requests.push(getPublicWholesalers(override));
    if ((!retail.requested && !retail.isFetching) || override) requests.push(getPublicRetailers(override));
    if ((!agents.requested && !agents.isFetching) || override) requests.push(getPublicAgents(override));
    if ((!groups.requested && !groups.isFetching) || override) requests.push(getPublicGroups(override));
    if ((!teams.requested && !teams.isFetching) || override) requests.push(getPublicTeams(override));
    const all_orgs = await Promise.allSettled(requests);
    let spread = flatten(all_orgs.map((o) => o.value.payload));
    if (!spread.length) spread = this.retrieveValueFromState("all_orgs");
    this.composeState("all_orgs", spread, "account_details");
    await sleep(3000);
    this.composeState("fetched_all", true, "account_details");
    if (!WEBMAIL_PROVIDER_DOMAINS.includes(domain)) {
      const matched_orgs = spread.filter((org) => !["agent"].includes(org.type) && org.domains.includes(domain));
      if (matched_orgs.length && !this.retrieveValueFromState("create_override")) {
        this.composeState("matched_orgs", matched_orgs, "account_details");
        this.composeState("account_type", "addition", "account_details");
      }
    }
    this.setState({ loading: false });
  };

  setLoading = async () => {
    this.setState({ loading: true });
    await sleep(3000);
    this.setState({ loading: false });
  };

  joinOrg = (name) => {
    this.composeState("is_joining_org", true, "account_details");
    this.composeState("account_type", "addition", "account_details");
    this.composeState("name_valid", false, "account_details");
    this.composeState("name_error", "", "account_details");
    this.composeState("name", name, "account_details");
  };

  sendEntityInvitation = async () => {
    const { sendEntityInvitation, showNotification, client_registration, changeFormSlide } = this.props;
    if (this.retrieveValueFromState("name") && client_registration.registration_config.invite_first && client_registration.registration_config.invite_last && client_registration.registration_config.invite_email && this.retrieveValueFromState("user_type")) {
      const sent_invite = await sendEntityInvitation(this.retrieveValueFromState("name"), client_registration.registration_config.invite_first, client_registration.registration_config.invite_last, client_registration.registration_config.invite_email, this.retrieveValueFromState("user_type"));
      if (sent_invite.success) {
        this.bulkComposeState("registration_config", { invite_first: "", invite_last: "", invite_email: "" });
        changeFormSlide(0);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  launchSignature = async (signature_id, organization, subject, message, signers, templates, callback) => {
    const { getEmbeddableHelloSignURL } = this.props;
    this.composeState(`is_loading_${organization}`, true, "registration_config");
    let config = {
      name: organization,
      domains: this.retrieveValueFromState("valid_domains"),
      groups: this.retrieveValueFromState("valid_groups"),
      wholesalers: this.retrieveValueFromState("valid_wholesalers"),
      parent_id: this.retrieveValueFromState("agent_id")  || this.retrieveValueFromState("parent_id")
    };
    if (this.retrieveValueFromState("user_type") === "group" && this.retrieveValueFromState("wholesale_id")) config.wholesale_id = Number(this.retrieveValueFromState("wholesale_id") || 0);
    await getEmbeddableHelloSignURL(
      signature_id,
      subject,
      message,
      signers,
      templates,
      config,
      true,
      this.composeState,
      callback,
      this.retrieveValueFromState("user_type")
    );
    this.composeState(`is_loading_${organization}`, false, "registration_config");
  };

  finishSignature = async (signature_id, callback) => {
    const { getEmbeddableHelloSignURL, user } = this.props;
    this.composeState("finishing", true, "registration_config");
    await getEmbeddableHelloSignURL(
      signature_id,
      false,
      false,
      false,
      false,
      {
        ...user.benefits_data
      },
      false,
      this.composeState,
      callback);
    this.composeState("finishing", false, "registration_config");
  };

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.composeState("is_downloading_agreement", true, "registration_config");
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.composeState("is_downloading_agreement", false, "registration_config");
  };

  componentWillUnmount() {
    this.setState({ loading: false });
  }

  render() {
    const { loading  } = this.state;
    const {
      changeFormSlide,
      getPublicWholesalers,
      getPublicRetailers,
      getPublicAgents,
      getPublicGroups,
      getPublicTeams,
      wholesale,
      retail,
      agents,
      groups,
      teams,
      location
    } = this.props;
    let configuration = new MultipartFormConfig({
      slides: [
        AccountOptionsSlide,
        RelationshipTypeSlide,
        AccountSlide,
        AuthorizedSlide,
        ContractSlide,
        InviteSlide
      ],
      splitLayout: false
    });
    
    return (
      <Container background_image={signup_background}>
        <MultipartForm
          loading={loading}
          config={configuration}
          state={this.state}
          bulkComposeState={this.bulkComposeState}
          stateConsumer={this.composeState}
          stateRetriever={this.retrieveValueFromState}
          stateCollection="client_registration"
          helpers={{
            changeFormSlide,
            updateHubspotContact: this.updateHubspotContact,
            createHubspotContact: this.createHubspotContact,
            runRegisterAccount: this.runRegisterAccount,
            sendEntityInvitation: this.sendEntityInvitation,
            launchSignature: this.launchSignature,
            finishSignature: this.finishSignature,
            getHelloSignDownloadLink: this.getHelloSignDownloadLink,
            checkEmail: this.checkEmail,
            getPublicWholesalers,
            getPublicRetailers,
            getPublicAgents,
            getPublicGroups,
            getPublicTeams,
            wholesalers: wholesale.list,
            retailers: retail.list,
            agents: agents.list,
            groups: groups.list,
            teams: teams.list,
            getAllOrgs: this.getAllOrgs,
            setLoading: this.setLoading,
            joinOrg: this.joinOrg,
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
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  bulkUpdateClientRegistrationState: (collector, data) => dispatch(bulkUpdateClientRegistrationState(collector, data)),
  updateClientRegistrationState: (collector, key, value) => dispatch(updateClientRegistrationState(collector, key, value)),
  confirmAccountRegistration: (details) => dispatch(confirmAccountRegistration(details)),
  showLoader: (message) => dispatch(showLoader(message)),
  createHubspotDeal: (data) => dispatch(createHubspotDeal(data)),
  updateHubspotContact: (hubspot_contact_id, data) => dispatch(updateHubspotContact(hubspot_contact_id, data)),
  changeFormSlide: (slide) => dispatch(changeFormSlide(slide)),
  getPublicWholesalers: (override) => dispatch(getPublicWholesalers(override)),
  getPublicRetailers: (override) => dispatch(getPublicRetailers(override)),
  getPublicAgents: (override) => dispatch(getPublicAgents(override)),
  getPublicGroups: (override) => dispatch(getPublicGroups(override)),
  getPublicTeams: (override) => dispatch(getPublicTeams(override)),
  checkUserEmail: (email) => dispatch(checkUserEmail(email)),
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  sendEntityInvitation: (organization, first, last, email, partner_type) => dispatch(sendEntityInvitation(organization, first, last, email, partner_type)),
  getEmbeddableHelloSignURL: (signature_id, subject, message, signers, templates, additional_config, allowCancel, stateSetter, callback, type) => dispatch(getEmbeddableHelloSignURL(signature_id, subject, message, signers, templates, additional_config, allowCancel, stateSetter, callback, type))
});
export default connect(mapStateToProps, dispatchToProps)(CreateAccountPage);
