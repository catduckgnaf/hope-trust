import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { Button } from "../../global-components";
import Checkbox from "react-simple-checkbox";
import { merge } from "lodash";
import { limitInput } from "../../utilities";
import moment from "moment";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getHelloSignDownloadLink } from "../../store/actions/hello-sign";
import { US_STATES } from "../../utilities";
import {
  referral_sources,
  advisor_types
} from "../../store/actions/partners";
import {
  updateAccountFeatures,
  closeAccountUpdateModal,
  updatePartnerAccount,
  updateSubscriptionRecord,
  updateCoreAccount
} from "../../store/actions/account";
import {
  AccountEditModalMain,
  FeatureItems,
  FeatureItem,
  FeatureFooter,
  FeatureFooterSection,
  FeaturesHeader,
  ItemsHeader,
  Group,
  Icon
} from "./style";
import {
  InputWrapper,
  InputLabel,
  Input,
  SelectStyles,
  Select
} from "../../global-components";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import ReactSelect, { createFilter, components } from "react-select";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

const handleHeaderClick = (id) => {
  const node = document.querySelector(`#${id}`).parentElement
    .nextElementSibling;
  const classes = node.classList;
  if (classes.contains("collapsed")) {
    node.classList.remove("collapsed");
  } else {
    node.classList.add("collapsed");
  }
};

const CustomGroupHeading = (props) => {
  return (
    <Group className="group-heading-wrapper" onClick={() => handleHeaderClick(props.id)}>
      <components.GroupHeading {...props}>
        {props.children} ({props.data.options.length})
          <Icon>
            <FontAwesomeIcon icon={["fas", "chevron-down"]} />
          </Icon>
      </components.GroupHeading>
    </Group>
  );
};

class AccountEditModal extends Component {

  constructor(props) {
    super(props);
    const { defaults, referral } = this.props;
    const target_orgs = advisor_types.map((type) => {
      const orgs = referral.list.filter((o) => o.type === type.name);
      const option_items = orgs.map((o) => {
        return { value: o.name, label: o.name };
      });
      return { options: option_items, label: type.alias };
    });
    this.state = {
      features: {
        document_generation: defaults.document_generation,
        contact_options: defaults.contact_options,
        surveys: defaults.surveys,
        documents: defaults.documents,
        medications: defaults.medications,
        schedule: defaults.schedule,
        finances: defaults.finances,
        create_accounts: defaults.create_accounts,
        trust: defaults.trust,
        care_coordination: defaults.care_coordination,
        relationships: defaults.relationships,
        providers: defaults.providers,
        billing: defaults.billing,
        two_factor_authentication: defaults.two_factor_authentication,
        permissions: defaults.permissions,
        security_questions: defaults.security_questions,
        partner_conversion: defaults.partner_conversion,
        change_password: defaults.change_password,
        org_export: defaults.org_export,
        in_app_purchases: defaults.in_app_purchases,
        live_chat: defaults.live_chat,
        messaging: defaults.messaging,
        bank_account_linking: defaults.bank_account_linking
      },
      partner: {
        contract_signed: defaults.contract_signed,
        contract_signed_on: defaults.contract_signed_on,
        domain_approved: defaults.domain_approved,
        is_entity: defaults.is_entity,
        source: defaults.source,
        signature_id: defaults.signature_id,
        signature_request_id: defaults.signature_request_id,
        partner_type: defaults.partner_type,
        name: defaults.name,
        plan_type: defaults.plan_type,
        approved: defaults.approved,
        logo: defaults.logo,
        primary_network: defaults.primary_network,
        resident_state_license_number: defaults.resident_state_license_number,
        npn: defaults.npn
      },
      subscription: {
        max_cancellations: defaults.max_cancellations || 0,
        additional_seat_cost: defaults.additional_seat_cost || 0,
        subscription_id: defaults.subscription_id,
        price_id: defaults.price_id,
        account_value: defaults.account_value
      },
      user: {
        state: defaults.state
      },
      account: {
        account_name: `${defaults.first_name} ${defaults.last_name}`,
        hubspot_deal_id: defaults.hubspot_deal_id,
        subscription_id: defaults.subscription_id,
        plan_id: defaults.plan_id
      },
      updated_features: {},
      updated_partner: {},
      updated_subscription: {},
      updated_account: {},
      saving_features: false,
      is_downloading_agreement: false,
      target_orgs
    };
  }

  onFileChange = async (event) => {
    event.persist();
    Resizer.imageFileResizer(
      event.target.files[0],
      200,
      200,
      "JPEG",
      100,
      0,
      (uri) => {
        this.update("logo", uri, "partner");
      },
      "base64"
    );
  };

  update = (key, value, type) => {
    const newState = merge(this.state[type], { [key]: value });
    let updated = merge(this.state[`updated_${type}`], { [key]: value });
    if (updated[key] && !value && typeof value !== "boolean") delete updated[key];
    this.setState({ [type]: newState, [`updated_${type}`]: updated });
  };

  saveFeatures = async () => {
    const { updateSubscriptionRecord, updatePartnerAccount, updateAccountFeatures, updateCoreAccount, defaults, type, closeAccountUpdateModal } = this.props;
    const { updated_features, updated_partner, updated_subscription, updated_account } = this.state;
    this.setState({ saving_features: true });
    if (Object.keys(updated_account).length) await updateCoreAccount(updated_account, defaults.account_id, type);
    if (Object.keys(updated_features).length) await updateAccountFeatures(defaults.account_id, updated_features, type);
    if (Object.keys(updated_partner).length) await updatePartnerAccount(defaults.account_id, updated_partner);
    if (Object.keys(updated_subscription).length) await updateSubscriptionRecord(defaults.account_id, defaults.subscription_lookup_id, updated_subscription, type);
    this.setState({ saving_features: false }, () => closeAccountUpdateModal());
  }

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.setState({ is_downloading_agreement: true });
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.setState({ is_downloading_agreement: false });
  };

  render() {
    const { account_edit_show, closeAccountUpdateModal, defaults, type, hello_sign } = this.props;
    const { features, updated_features, saving_features, user, partner, account, subscription, updated_partner, updated_subscription, updated_account, is_downloading_agreement, target_orgs } = this.state;
    const has_downloadable_contract = (defaults.signature_request_id && defaults.contract_signed);
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={account_edit_show} onClose={() => closeAccountUpdateModal()} center>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Partner Agreement.pdf">{null}</a>
        <AccountEditModalMain>
          <FeaturesHeader>Account Update</FeaturesHeader>
          <FeatureItems gutter={20}>
            <ItemsHeader span={12}>General</ItemsHeader>
            <FeatureItem span={12}>
              <InputWrapper>
                <InputLabel capitalize>Account Name</InputLabel>
                <Input
                  type="text"
                  id="account_name"
                  value={account.account_name}
                  onChange={(event) => this.update(event.target.id, event.target.value, "account")}
                  readOnly />
              </InputWrapper>
            </FeatureItem>
            <FeatureItem span={12}>
              <InputWrapper>
                <InputLabel capitalize>Hubspot Deal ID</InputLabel>
                <Input
                  type="text"
                  id="hubspot_deal_id"
                  value={account.hubspot_deal_id}
                  onChange={(event) => this.update(event.target.id, event.target.value, "account")} />
              </InputWrapper>
            </FeatureItem>
          </FeatureItems>
          <FeatureItems gutter={20}>
            <ItemsHeader span={12}>Subscription Information</ItemsHeader>
            <FeatureItem span={12}>
              <InputWrapper>
                <InputLabel capitalize>Subscription ID</InputLabel>
                <Input
                  type="text"
                  id="subscription_id"
                  value={account.subscription_id}
                  onChange={(event) => {
                    this.update(event.target.id, event.target.value, "account");
                    this.update(event.target.id, event.target.value, "subscription");
                  }} />
              </InputWrapper>
            </FeatureItem>
            <FeatureItem span={12}>
              <InputWrapper>
                <InputLabel capitalize>Plan/Price ID</InputLabel>
                <Input
                  type="text"
                  id="plan_id"
                  value={account.plan_id}
                  onChange={(event) => {
                    this.update(event.target.id, event.target.value, "account");
                    this.update("price_id", event.target.value, "subscription");
                  }} />
              </InputWrapper>
            </FeatureItem>
            <FeatureItem span={12}>
              <InputWrapper>
                <InputLabel capitalize>Account Value</InputLabel>
                <Input
                  type="number"
                  id="account_value"
                  value={subscription.account_value}
                  onChange={(event) => this.update(event.target.id, event.target.value, "subscription")} />
              </InputWrapper>
            </FeatureItem>
          </FeatureItems>
           {type === "partner"
             ? (
              <>
                <FeatureItem span={12}>
                  <InputWrapper>
                    <InputLabel capitalize>Plan Name</InputLabel>
                    <Input
                      type="text"
                      id="plan_type"
                      value={partner.plan_type}
                      onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                  </InputWrapper>
                </FeatureItem>
                {defaults.subscription_lookup_id
                    ? (
                      <>
                        <FeatureItem span={12}>
                          <InputWrapper>
                            <InputLabel capitalize>Max Cancellations</InputLabel>
                            <Input
                              type="number"
                              id="max_cancellations"
                              value={subscription.max_cancellations}
                              onChange={(event) => this.update(event.target.id, Number(event.target.value), "subscription")} />
                          </InputWrapper>
                        </FeatureItem>
                        <FeatureItem span={12}>
                          <InputWrapper>
                            <InputLabel capitalize>Additional Seat Cost</InputLabel>
                            <Input
                              type="number"
                              id="additional_seat_cost"
                              value={subscription.additional_seat_cost}
                              onChange={(event) => this.update(event.target.id, Number(event.target.value), "subscription")} />
                          </InputWrapper>
                        </FeatureItem>
                      </>
                    )
                    : null
                  }
                <FeatureItems gutter={20}>
                  <ItemsHeader span={12}>Partner Information</ItemsHeader>
                  <FeatureItem span={6}>
                    <InputWrapper>
                      <InputLabel capitalize>Training Complete</InputLabel>
                      <Checkbox
                        checked={partner.approved}
                        borderThickness={3}
                        size={2}
                        tickSize={2}
                        onChange={(is_checked) => this.update("approved", is_checked, "partner")}
                      />
                    </InputWrapper>
                  </FeatureItem>
                  {defaults.referral_code
                    ? (
                      <FeatureItem span={6}>
                        <InputWrapper>
                          <InputLabel capitalize>Domain Approved</InputLabel>
                          <Checkbox
                            checked={partner.domain_approved}
                            borderThickness={3}
                            size={2}
                            tickSize={2}
                            onChange={(is_checked) => this.update("domain_approved", is_checked, "partner")}
                          />
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  <FeatureItem span={6}>
                    <InputWrapper>
                      <InputLabel capitalize>Is Entity?</InputLabel>
                      <Checkbox
                        checked={partner.is_entity}
                        borderThickness={3}
                        size={2}
                        tickSize={2}
                        onChange={(is_checked) => this.update("is_entity", is_checked, "partner")}
                      />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem span={6}>
                    <InputWrapper>
                      <InputLabel capitalize>Contracts Signed?</InputLabel>
                      <Checkbox
                        checked={partner.contract_signed}
                        borderThickness={3}
                        size={2}
                        tickSize={2}
                        onChange={(is_checked) => this.update("contract_signed", is_checked, "partner")}
                      />
                    </InputWrapper>
                  </FeatureItem>
                  {partner.is_entity
                    ? (
                      <FeatureItem span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={15} capitalize>Partner Logo (Click to browse)</InputLabel>
                          <Input
                            style={{ position: "fixed", top: "-100em" }}
                            type="file"
                            id="logo"
                            onChange={(e) => this.onFileChange(e)}
                            accept=".jpg, .jpeg, .png, .JPG, .JPEG, .PNG" />
                          <InputLabel htmlFor="logo">
                            <ReactAvatar size={100} name={partner.name} src={partner.logo} style={{ verticalAlign: "middle" }} round />
                          </InputLabel>
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>Organization</InputLabel>
                      <ReactSelect
                        components={{ Option, GroupHeading: CustomGroupHeading }}
                        filterOption={createFilter({ ignoreAccents: false })}
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent"
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "13px",
                            lineHeight: "13px"
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          })
                        }}
                        isSearchable
                        name="name"
                        placeholder="Choose an organization from the list..."
                        onChange={(select_account) => this.update("name", select_account.label, "partner")}
                        value={partner.name ? { value: partner.name, label: partner.name } : null}
                        options={target_orgs}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </FeatureItem>
                  {["ria", "insurance"].includes(partner.partner_type)
                    ? (
                      <FeatureItem span={12}>
                        <InputWrapper>
                          <InputLabel capitalize>Primary Network</InputLabel>
                          <Input
                            type="text"
                            id="primary_network"
                            value={partner.primary_network}
                            onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Referral Source</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent"
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: "12px",
                            opacity: "0.5"
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base
                          }),
                          menuPortal: (base) => ({
                            ...base
                          })
                        }}
                        isSearchable
                        name="source"
                        placeholder="How did you hear about Hope Trust? Choose from the list or type a new one..."
                        onCreateOption={(value) => this.update("source", value, "partner")}
                        onChange={(choice) => this.update("source", choice.value, "partner")}
                        value={partner.source ? { value: partner.source, label: partner.source } : null}
                        options={referral_sources}
                        formatCreateLabel={(value) => `Click or press Enter to create new referral source "${value}"`}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Partner Type</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 997
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 997
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "13px",
                            lineHeight: "13px",
                            opacity: "0.5"
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 997
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          })
                        }}
                        isSearchable
                        name="advisor_type"
                        placeholder="Choose a partner type..."
                        onChange={(choice) => this.update("partner_type", choice.value, "partner")}
                        value={partner.partner_type ? { value: partner.partner_type, label: advisor_types.find((t) => t.name === partner.partner_type).alias } : null}
                        options={advisor_types.map((a) => {
                          return { value: a.name, label: a.alias };
                        })}
                      />
                    </InputWrapper>
                  </FeatureItem>
                  <ItemsHeader span={12}>Course Information</ItemsHeader>
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel capitalize>Resident State</InputLabel>
                      <Select id="state" value={(user.state || "")} disabled>
                        <option disabled value="">Choose a state</option>
                        {US_STATES.map((formState, index) => {
                          return (
                            <option key={index} value={formState.name}>{formState.name}</option>
                          );
                        })}
                      </Select>
                    </InputWrapper>
                  </FeatureItem>
                  {partner.approved
                    ? (
                      <FeatureItem span={12}>
                        <InputWrapper>
                          <InputLabel capitalize>Resident State License Number</InputLabel>
                          <Input
                            type="text"
                            id="resident_state_license_number"
                            value={partner.resident_state_license_number}
                            onKeyPress={(event) => limitInput(event, 100)}
                            onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  {partner.approved
                    ? (
                      <FeatureItem span={12}>
                        <InputWrapper>
                          <InputLabel capitalize>National Producer Number (NPN)</InputLabel>
                          <Input
                            type="text"
                            id="npn"
                            value={partner.npn}
                            onKeyPress={(event) => limitInput(event, 100)}
                            onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  <ItemsHeader span={12}>Contract Information</ItemsHeader>
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel capitalize>Contracts Signed On</InputLabel>
                      <Input
                        type="date"
                        id="contract_signed_on"
                        value={moment(partner.contract_signed_on).format("YYYY-MM-DD")}
                        min="1900-01-01"
                        max={moment().format("YYYY-MM-DD")}
                        onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel capitalize>Signature ID</InputLabel>
                      <Input
                        type="text"
                        id="signature_id"
                        value={partner.signature_id}
                        onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel capitalize>Signature Request ID</InputLabel>
                      <Input
                        type="text"
                        id="signature_request_id"
                        value={partner.signature_request_id}
                        onChange={(event) => this.update(event.target.id, event.target.value, "partner")} />
                    </InputWrapper>
                  </FeatureItem>
                  {has_downloadable_contract
                    ? (
                      <FeatureItem span={12}>
                        <Button marginbottom={25} nomargin rounded outline blue onClick={() => this.getHelloSignDownloadLink(defaults.signature_request_id)}>{is_downloading_agreement ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Download Agreement"}</Button>
                      </FeatureItem>
                    )
                    : null
                  }
                </FeatureItems>
              </>
             )
             : null
           }
            <FeatureItems gutter={20}>
              <ItemsHeader span={12}>Account Features:</ItemsHeader>
              {Object.keys(features).map((key, index) => {
                if (defaults.hasOwnProperty(key)) {
                  return (
                    <FeatureItem key={index} span={6}>
                      <InputWrapper>
                        <InputLabel capitalize>{key.replaceAll("_", " ")}</InputLabel>
                        <Checkbox
                          checked={this.state.features[key]}
                          borderThickness={3}
                          size={2}
                          tickSize={2}
                          onChange={(is_checked) => this.update(key, is_checked, "features")}
                        />
                      </InputWrapper>
                    </FeatureItem>
                  );
                }
                return null;
              })}
          </FeatureItems>
          <FeatureFooter gutter={20}>
            <FeatureFooterSection span={6}>
              <Button disabled={!(Object.keys(updated_features).length || Object.keys(updated_partner).length || Object.keys(updated_subscription).length || Object.keys(updated_account).length)} widthPercent={100} rounded outline green onClick={() => this.saveFeatures()}>{saving_features ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Update"}</Button>
            </FeatureFooterSection>
            <FeatureFooterSection span={6}>
              <Button widthPercent={100} rounded outline danger onClick={() => closeAccountUpdateModal()}>Cancel</Button>
            </FeatureFooterSection>
          </FeatureFooter>
        </AccountEditModalMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  hello_sign: state.hello_sign,
  referral: state.referral
});
const dispatchToProps = (dispatch) => ({
  updateAccountFeatures: (account_id, updates, type) => dispatch(updateAccountFeatures(account_id, updates, type)),
  closeAccountUpdateModal: () => dispatch(closeAccountUpdateModal()),
  updatePartnerAccount: (account_id, updates) => dispatch(updatePartnerAccount(account_id, updates)),
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  updateSubscriptionRecord: (account_id, subscription_lookup_id, updates, type) => dispatch(updateSubscriptionRecord(account_id, subscription_lookup_id, updates, type)),
  updateCoreAccount: (updates, target_account_id, type) => dispatch(updateCoreAccount(updates, target_account_id, type))
});
export default connect(mapStateToProps, dispatchToProps)(AccountEditModal);
