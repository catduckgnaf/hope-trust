import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import ReactSelect, { createFilter, components } from "react-select";
import { allowNumbersOnly, numbersLettersUnderscoresHyphens } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoaderOverlay from "../LoaderOverlay";
import { advisor_types } from "../../store/actions/partners";
import {
  Button,
  InputWrapper,
  InputLabel,
  InputHint,
  Input,
  TextArea,
  CheckBoxInput,
  RequiredStar,
  SelectStyles,
  HeavyFont
} from "../../global-components";
import {
  PartnerPlanMain,
  PartnerPlanPadding,
  PartnerPlanInner,
  PartnerPlanInnerSection,
  PartnerPlanButtonContainer,
  PartnerPlanButton,
  FeatureItemInputMain,
  FeatureItemInputPadding,
  FeatureItemInputInner,
  FeatureItemInput,
  FeatureItemRemove,
  AdditionalContractInputs,
  AdditionalContractField
} from "./style";
import { closeCreatePartnerPlanModal, createPartnerPlan, updatePartnerPlan, all_permissions } from "../../store/actions/plans";
import { showNotification } from "../../store/actions/notification";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class PartnerPlanModal extends Component {

  constructor(props) {
    super(props);
    const { defaults, customer_support, referral } = props;
    const current_account = customer_support.partners.find((acc) => defaults ? acc.account_id === defaults.account_id : false);
    const current_org = referral.list.find((acc) => defaults ? acc.name === defaults.org_name : false);
    const target_accounts = customer_support.partners.map((a) => {
      return { value: a.account_id, label: `${a.first_name} ${a.last_name}` };
    });
    const target_orgs = referral.list.map((a) => {
      return { value: a.name, label: a.name };
    });
    this.state = {
      name: defaults.name || "",
      price_id: defaults.price_id || "",
      status: defaults.status === "active",
      monthly: defaults.monthly/100 || 0,
      one_time_fee: defaults.one_time_fee/100 || 0,
      cancellation_fee_on: defaults.cancellation_fee_on || false,
      cancellation_fee: defaults.cancellation_fee || 0,
      contract_length_months: defaults.contract_length_months || 0,
      bill_remainder: defaults.bill_remainder || false,
      is_metered: defaults.is_metered || false,
      billing_days: defaults.billing_days || 0,
      excerpt: defaults.excerpt || "",
      features: (defaults.features && Object.keys(JSON.parse(defaults.features || "{}")).length) ? JSON.parse(defaults.features) : {},
      new_feature: "",
      agreements: defaults.agreements && defaults.agreements.length ? defaults.agreements : [],
      permissions: defaults.permissions && defaults.permissions.length ? defaults.permissions : [],
      new_agreement: "",
      new_permission: null,
      discount: defaults.discount || "",
      additional_plan_credits: defaults.additional_plan_credits || 0,
      seats_included: defaults.seats_included || 0,
      max_cancellations: defaults.max_cancellations || 0,
      vault_limit: defaults.vault_limit || 0,
      plan_cost_agreement: defaults.plan_cost_agreement || "",
      default_template: defaults.default_template || "",
      type: defaults.type || "",
      additional_contracts: defaults.additional_contracts ? JSON.parse(defaults.additional_contracts || "{}") : {},
      new_addl_contract_key: "",
      new_addl_contract_value: "",
      current_account: (current_account) ? { value: current_account.account_id, label: `${current_account.first_name} ${current_account.last_name}` } : null,
      current_org: (current_org) ? { value: current_org.name, label: current_org.name } : null,
      account_specific: (current_account) ? true : false,
      org_specific: (current_org) ? true : false,
      target_accounts,
      target_orgs
    };
  }

  createPlan = async () => {
    const { createPartnerPlan, showNotification, closeCreatePartnerPlanModal } = this.props;
    const {
      name,
      price_id,
      status,
      monthly,
      one_time_fee,
      cancellation_fee_on,
      cancellation_fee,
      contract_length_months,
      bill_remainder,
      billing_days,
      excerpt,
      features,
      discount,
      agreements,
      additional_plan_credits,
      seats_included,
      max_cancellations,
      plan_cost_agreement,
      default_template,
      type,
      additional_contracts,
      permissions,
      vault_limit,
      current_account,
      current_org,
      is_metered
    } = this.state;
    if (name && price_id && type && default_template && Object.keys(features).length) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createPartnerPlan({
        name,
        price_id,
        status: status ? "active" : "inactive",
        monthly: (monthly * 100),
        one_time_fee: (one_time_fee * 100),
        cancellation_fee_on,
        cancellation_fee,
        contract_length_months,
        bill_remainder,
        billing_days,
        excerpt,
        features,
        discount,
        agreements,
        additional_plan_credits,
        seats_included,
        max_cancellations,
        plan_cost_agreement,
        default_template,
        type,
        additional_contracts,
        permissions,
        vault_limit,
        account_id: current_account ? current_account.value : null,
        org_name: current_org ? current_org.value : null,
        is_metered
      });
      if (created.success) {
        showNotification("success", "Plan Created", "Plan was successfully created.");
        closeCreatePartnerPlanModal();
      } else {
        showNotification("error", "Creation Failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  updatePlan = async () => {
    const { updatePartnerPlan, defaults, showNotification, closeCreatePartnerPlanModal } = this.props;
    const {
      name,
      price_id,
      status,
      monthly,
      one_time_fee,
      cancellation_fee_on,
      cancellation_fee,
      contract_length_months,
      bill_remainder,
      billing_days,
      excerpt,
      features,
      agreements,
      discount,
      additional_plan_credits,
      seats_included,
      max_cancellations,
      plan_cost_agreement,
      default_template,
      type,
      additional_contracts,
      permissions,
      vault_limit,
      current_account,
      current_org,
      is_metered
    } = this.state;
    if (name && price_id && type && default_template && Object.keys(features).length) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updatePartnerPlan(defaults.id, {
        name,
        price_id,
        status: status ? "active": "inactive",
        monthly: (monthly * 100),
        one_time_fee: (one_time_fee * 100),
        cancellation_fee_on,
        cancellation_fee,
        contract_length_months,
        bill_remainder,
        billing_days,
        excerpt,
        features,
        discount,
        agreements,
        additional_plan_credits,
        seats_included,
        max_cancellations,
        plan_cost_agreement,
        default_template,
        type,
        additional_contracts,
        permissions,
        vault_limit,
        account_id: current_account ? current_account.value : null,
        org_name: current_org ? current_org.value : null,
        is_metered
      });
      if (updated.success) {
        showNotification("success", "Plan Updated", "Plan was successfully updated.");
        closeCreatePartnerPlanModal();
      } else {
        showNotification("error", "Update Failed", updated.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  removeFeature = (feature) => {
    const { features } = this.state;
    let features_copy = features;
    delete features_copy[feature];
    this.setState({ features: features_copy });
  };

  addNewFeature = (event, blurred) => {
    const { showNotification } = this.props;
    const { features } = this.state;
    let features_copy = features;
    if (event.key === "Enter") {
      if (event.target.value.length) {
        if (!Object.values(features_copy).includes(event.target.value)) {
          features_copy[event.target.value] = true;
          this.setState({ features: features_copy, new_feature: "" }, () => document.getElementById("addNewFeatureInput").value = "");
        } else {
          showNotification("error", "Missing information", "This feature is already on your list.");
        }
      } else {
        showNotification("error", "Missing information", "You need to enter a feature to add.");
      }
    } else if (blurred) {
      if (event.target.value.length) {
        features_copy[event.target.value] = true;
        this.setState({ features: features_copy, new_feature: "" }, () => document.getElementById("addNewFeatureInput").value = "");
      }
    }
  };

  updateFeatureStatus = (feature, status) => {
    const { features } = this.state;
    let features_copy = features;
    features_copy[feature] = status;
    this.setState({ features: features_copy });
  };

  removeAgreement = (agreement) => {
    const { agreements } = this.state;
    let agreements_copy = agreements;
    agreements_copy = agreements_copy.filter((i) => i !== agreement);
    this.setState({ agreements: agreements_copy.filter((e) => e) });
  };

  addNewAgreement= (event, blurred) => {
    const { showNotification } = this.props;
    const { agreements } = this.state;
    let agreements_copy = agreements;
    if (event.key === "Enter") {
      if (event.target.value.length) {
        if (!agreements_copy.includes(event.target.value)) {
          agreements_copy.push(event.target.value);
          this.setState({ agreements: agreements_copy, new_agreement: "" }, () => document.getElementById("addNewAgreementInput").value = "");
        } else {
          showNotification("error", "Missing information", "This agreement is already on your list.");
        }
      } else {
        showNotification("error", "Missing information", "You need to enter an agreement to add.");
      }
    } else if (blurred) {
      if (event.target.value.length) {
        agreements_copy.push(event.target.value);
        this.setState({ agreements: agreements_copy, new_agreement: "" }, () => document.getElementById("addNewAgreementInput").value = "");
      }
    }
  };

  AddAdditionalContractFields = (key, value) => {
    const { additional_contracts } = this.state;
    if (key && value) {
      let additional_contracts_copy = additional_contracts;
      additional_contracts_copy[key] = value;
      this.setState({
        additional_contracts: additional_contracts_copy, new_addl_contract_key: "", new_addl_contract_value: "" }, () => {
        document.getElementById("addNewOrgKeyInput").value = "";
        document.getElementById("addNewContractTemplateInput").value = "";
      });
    } else {
      showNotification("error", "Missing information", "Additional contracts must have a key and a value.");
    }
  };

  updateContractKey = (value, key) => {
    const { additional_contracts } = this.state;
    let additional_contracts_copy = additional_contracts;
    additional_contracts_copy[value] = additional_contracts_copy[key];
    delete additional_contracts_copy[key];
    this.setState({ additional_contracts: additional_contracts_copy });
  };

  updateContractValue = (value, key) => {
    const { additional_contracts } = this.state;
    let additional_contracts_copy = additional_contracts;
    additional_contracts_copy[key] = value;
    this.setState({ additional_contracts: additional_contracts_copy });
  };

  removeContractConfig = (key) => {
    const { additional_contracts } = this.state;
    let additional_contracts_copy = additional_contracts;
    delete additional_contracts_copy[key];
    this.setState({ additional_contracts: additional_contracts_copy }, () => {
      document.getElementById("addNewOrgKeyInput").value = "";
      document.getElementById("addNewContractTemplateInput").value = "";
    });
  };

  removePermission = (permission) => {
    const { permissions } = this.state;
    let permissions_copy = permissions;
    permissions_copy = permissions_copy.filter((i) => i !== permission);
    this.setState({ permissions: permissions_copy.filter((e) => e) });
  };

  addNewPermission = (val) => {
    const { showNotification } = this.props;
    const { permissions } = this.state;
    let permissions_copy = permissions;
    if (val.value) {
      if (!permissions_copy.includes(val.value)) {
        permissions_copy.push(val.value);
        this.setState({ permissions: permissions_copy, new_permission: null });
      } else {
        showNotification("error", "Missing information", "This permission is already on your list.");
      }
    } else {
      showNotification("error", "Missing information", "You need to enter a permission to add.");
    }
  };

  render() {
    const { viewing_partner_plan, updating, viewing, closeCreatePartnerPlanModal, defaults } = this.props;
    const {
      loaderShow,
      loaderMessage,
      name,
      price_id,
      monthly,
      one_time_fee,
      discount,
      cancellation_fee_on,
      cancellation_fee,
      contract_length_months,
      bill_remainder,
      billing_days,
      excerpt,
      features,
      new_feature,
      agreements,
      permissions,
      new_permission,
      new_agreement,
      type,
      additional_plan_credits,
      status,
      seats_included,
      max_cancellations,
      plan_cost_agreement,
      default_template,
      additional_contracts,
      new_addl_contract_key,
      new_addl_contract_value,
      vault_limit,
      target_orgs,
      target_accounts,
      current_account,
      current_org,
      org_specific,
      account_specific,
      is_metered
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewing_partner_plan} onClose={() => closeCreatePartnerPlanModal()} center>
        <PartnerPlanMain>
          <PartnerPlanPadding>
            <PartnerPlanInner align="middle" justify="center" isloading={loaderShow ? 1 : 0}>
              <LoaderOverlay show={loaderShow} message={loaderMessage} />

              {!org_specific
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Is this plan account-specific?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={account_specific}
                        onChange={(event) => this.setState({ account_specific: event.target.checked, current_org: null })}
                        type="checkbox"
                        id="account_specific"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                    )
                : null
              }

              {!account_specific
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Is this plan organization-specific?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={org_specific}
                        onChange={(event) => this.setState({ org_specific: event.target.checked, current_account: null })}
                        type="checkbox"
                        id="org_specific"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              <PartnerPlanInnerSection span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Is this plan setup for metered usage? (Any non-standard plan with a monthly fee <HeavyFont>MUST</HeavyFont> be set to metered)</InputLabel>
                  <CheckBoxInput
                    defaultChecked={is_metered}
                    onChange={(event) => this.setState({ is_metered: event.target.checked })}
                    type="checkbox"
                    id="is_metered"
                    disabled={defaults.is_metered}
                  />
                </InputWrapper>
              </PartnerPlanInnerSection>

              {org_specific
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel>Organization</InputLabel>
                      <ReactSelect
                        components={{ Option }}
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
                        name="current_org"
                        placeholder="Choose an organization from the list..."
                        onChange={(select_account) => this.setState({ current_org: select_account, name: `${select_account.label} Plan` })}
                        value={current_org}
                        options={target_orgs}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              {account_specific
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel>Partner Account</InputLabel>
                      <ReactSelect
                        components={{ Option }}
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
                        name="current_account"
                        placeholder="Choose a client account from the list..."
                        onChange={(select_account) => this.setState({ current_account: select_account, name: `${select_account.label} Plan` })}
                        value={current_account}
                        options={target_accounts}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Name:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ name: event.target.value })} type="text" value={name} placeholder="Enter a plan name..." />
                  <InputHint>This is the name of the plan, must be unique per partner type.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Partner Type</InputLabel>
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
                    name="type"
                    placeholder="Choose a partner type..."
                    onChange={(val) => this.setState({ type: val ? val.value : ""})}
                    value={type ? { value: type, label: advisor_types.find((t) => t.name === type).alias } : null}
                    options={advisor_types.map((a) => {
                      return { value: a.name, label: a.alias };
                    })}
                  />
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Stripe Price ID:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ price_id: event.target.value })} type="text" value={price_id} placeholder="Enter a price ID..." />
                  <InputHint>This ID is the identifier from Stripe for this specific product price.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={6}>
                <InputWrapper>
                  <InputLabel>Monthly Cost:</InputLabel>
                  <Input readOnly={viewing || updating} onChange={(event) => this.setState({ monthly: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={monthly} placeholder="Enter a plan cost..." />
                  <InputHint>This is the amount the plan costs monthly</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={6}>
                <InputWrapper>
                  <InputLabel>Initial Charge:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ one_time_fee: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={one_time_fee} placeholder="Enter a one time fee..." />
                  <InputHint>Subscription cost of the first month, ${monthly || 0} every month after. Leave 0 to keep monthly charge. Trial period does not halt this charge, this will be billed immediately. Coupons WILL NOT discount this charge.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Discount Code:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ discount: event.target.value })} type="text" value={discount} placeholder="Enter a discount code..." />
                  <InputHint>The coupon has it's own configuration, the discount will be applied to the <b>subscription only</b> based on it's configuration. ie: "12 months", "once", "forever".</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Trial Days:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ billing_days: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={billing_days} placeholder="Enter an amount of trial days..." />
                  <InputHint>Will this subscription have a trial period? Leave 0 to start the subscription immediately.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Will the subscriber have to pay a cancellation fee to cancel this plan?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={cancellation_fee_on}
                    onChange={(event) => this.setState({ cancellation_fee_on: event.target.checked })}
                    type="checkbox"
                    id="cancellation_fee_on"
                    disabled={viewing}
                  />
                </InputWrapper>
              </PartnerPlanInnerSection>

              {cancellation_fee_on
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Contract Length in Months:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ contract_length_months: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={24} type="number" value={contract_length_months} placeholder="Enter a contract length in months..." />
                      <InputHint>How many months will this subscription be enforced? Leave 0 if a contract will not be enforced or will charge a one time cancellation fee.</InputHint>
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              {cancellation_fee_on && !bill_remainder
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Cancellation Fee:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ cancellation_fee: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={24} type="number" value={cancellation_fee} placeholder="Enter a cancellation fee..." />
                      <InputHint>This one time charge will be charged at the time of cancellation. Leave 0 for no static cancellation fee.</InputHint>
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              {cancellation_fee_on && !cancellation_fee
                ? (
                  <PartnerPlanInnerSection span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Will the subscriber be billed for remaining months if subscription is cancelled early?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={bill_remainder}
                        onChange={(event) => this.setState({ bill_remainder: event.target.checked })}
                        type="checkbox"
                        id="bill_remainder"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </PartnerPlanInnerSection>
                )
                : null
              }

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Max Cancellations:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ max_cancellations: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={max_cancellations} placeholder="Enter a max cancellation limit..." />
                  <InputHint>The number of cancellations a partner can cancel before intervention.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Seats Included:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ seats_included: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={seats_included} placeholder="Enter a max credit limit..." />
                  <InputHint>The initial amount of credits applied for this subscription</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Additional Plan Credits:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ additional_plan_credits: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={additional_plan_credits} placeholder="Enter an amount of credits..." />
                  <InputHint>The cost in credits for each additional managed subscription</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Vault Limit (in bytes):</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ vault_limit: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={vault_limit} placeholder="Enter a document vault limit in bytes..." />
                  <InputHint>The limit in bytes that this plan owner can upload to their document vault</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Features (add a feature and press enter)</InputLabel>
                  <Input value={new_feature} placeholder="Add a new feature..." type="text" id="addNewFeatureInput" onChange={(event) => this.setState({ new_feature: event.target.value })} onBlur={(event) => !Object.values(features).includes(event.target.value) ? this.addNewFeature(event, true) : null} onKeyPress={(event) => this.addNewFeature(event)} />
                  {Object.values(features).length
                    ? Object.keys(features).map((feature, index) => {
                      return (
                        <FeatureItemInputMain key={index}>
                          <FeatureItemInputPadding>
                            <FeatureItemInputInner gutter={20}>
                              <FeatureItemInput span={1}>
                                <Input key={index} type="checkbox" defaultChecked={features[feature]} onChange={(event) => this.updateFeatureStatus(feature, event.target.checked)} />
                              </FeatureItemInput>
                              <FeatureItemInput span={10}>
                                <Input readOnly key={index} type="text" value={feature} />
                              </FeatureItemInput>
                              <FeatureItemRemove span={1} onClick={() => this.removeFeature(feature)}>
                                <FontAwesomeIcon icon={["fal", "times"]} />
                              </FeatureItemRemove>
                            </FeatureItemInputInner>
                          </FeatureItemInputPadding>
                        </FeatureItemInputMain>
                      );
                    })
                    : null
                  }
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Agreements (add an agreement and press enter)</InputLabel>
                  <Input value={new_agreement} placeholder="Add a new agreement..." type="text" id="addNewAgreementInput" onChange={(event) => this.setState({ new_agreement: event.target.value })} onBlur={(event) => !agreements.includes(event.target.value) ? this.addNewAgreement(event, true) : null} onKeyPress={(event) => this.addNewAgreement(event)} />
                  {agreements
                    ? agreements.map((agreement, index) => {
                      return (
                        <FeatureItemInputMain key={index}>
                          <FeatureItemInputPadding>
                            <FeatureItemInputInner gutter={20}>
                              <FeatureItemInput span={11}>
                                <Input readOnly key={index} type="text" value={agreement} />
                              </FeatureItemInput>
                              <FeatureItemRemove span={1} onClick={() => this.removeAgreement(agreement)}>
                                <FontAwesomeIcon icon={["fal", "times"]} />
                              </FeatureItemRemove>
                            </FeatureItemInputInner>
                          </FeatureItemInputPadding>
                        </FeatureItemInputMain>
                      );
                    })
                    : null
                  }
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Permissions</InputLabel>
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
                    name="new_permission"
                    placeholder="Choose a permission..."
                    onChange={(val) => this.setState({ new_permission: val }, () => this.addNewPermission(val))}
                    value={new_permission ? { value: new_permission.value, label: new_permission.label } : null}
                    options={all_permissions}
                  />
                  {permissions
                    ? permissions.map((permission, index) => {
                      return (
                        <FeatureItemInputMain key={index}>
                          <FeatureItemInputPadding>
                            <FeatureItemInputInner gutter={20}>
                              <FeatureItemInput span={11}>
                                <Input readOnly={true} key={index} type="text" value={all_permissions.find((p) => p.value === permission).label} />
                              </FeatureItemInput>
                              <FeatureItemRemove span={1} onClick={() => this.removePermission(permission)}>
                                <FontAwesomeIcon icon={["fal", "times"]} />
                              </FeatureItemRemove>
                            </FeatureItemInputInner>
                          </FeatureItemInputPadding>
                        </FeatureItemInputMain>
                      );
                    })
                    : null
                  }
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Plan Cost HelloSign Template:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ plan_cost_agreement: event.target.value })} type="text" value={plan_cost_agreement} placeholder="Enter a template ID..." />
                  <InputHint>The template ID from HelloSign for the plan payment contract.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Default HelloSign Template:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ default_template: event.target.value })} type="text" value={default_template} placeholder="Enter a template ID..." />
                  <InputHint>The template ID from HelloSign for the default agreement.</InputHint>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Additional Contracts</InputLabel>
                  <AdditionalContractInputs gutter={20}>
                    <AdditionalContractField span={5}>
                      <Input autoComplete="new-password" value={new_addl_contract_key} placeholder="Add an organization name..." type="text" id="addNewOrgKeyInput" onChange={(event) => this.setState({ new_addl_contract_key: event.target.value })} />
                      <InputHint>This must be spelled correctly or the contract will not apply.</InputHint>
                    </AdditionalContractField>
                    <AdditionalContractField span={6}>
                      <Input autoComplete="new-password" value={new_addl_contract_value} placeholder="Add a template value..." type="text" id="addNewContractTemplateInput" onChange={(event) => this.setState({ new_addl_contract_value: event.target.value })} />
                    </AdditionalContractField>
                    <AdditionalContractField span={1}>
                      <Button green small rounded normargin outline onClick={() => this.AddAdditionalContractFields(new_addl_contract_key, new_addl_contract_value)}>Add</Button>
                    </AdditionalContractField>
                  </AdditionalContractInputs>
                  {additional_contracts
                    ? Object.keys(additional_contracts).map((key, index) => {
                      return (
                        <FeatureItemInputMain key={index}>
                          <FeatureItemInputPadding>
                            <FeatureItemInputInner gutter={20}>
                              <FeatureItemInput span={5}>
                                <Input key={index} type="text" onChange={(event) => this.updateContractKey(event.target.value, key)} value={key} />
                              </FeatureItemInput>
                              <FeatureItemInput span={6}>
                                <Input key={index} type="text" onChange={(event) => this.updateContractValue(event.target.value, key)} value={additional_contracts[key]} />
                              </FeatureItemInput>
                              <FeatureItemRemove span={1} onClick={() => this.removeContractConfig(key)}>
                                <FontAwesomeIcon icon={["fal", "times"]} />
                              </FeatureItemRemove>
                            </FeatureItemInputInner>
                          </FeatureItemInputPadding>
                        </FeatureItemInputMain>
                      );
                    })
                    : null
                  }
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Excerpt (optional): ({50 - excerpt.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={excerpt} maxLength={50} onKeyPress={numbersLettersUnderscoresHyphens} onChange={(event) => this.setState({ excerpt: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 50)} rows={4} placeholder="Add an excerpt..."></TextArea>
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Is this plan active?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={status}
                    onChange={(event) => this.setState({ status: event.target.checked })}
                    type="checkbox"
                    id="status"
                    disabled={viewing}
                  />
                </InputWrapper>
              </PartnerPlanInnerSection>

              <PartnerPlanInnerSection span={12}>
                <PartnerPlanButtonContainer gutter={20}>
                  {updating
                    ? (
                      <PartnerPlanButton span={6}>
                        <Button widthPercent={100} green rounded normargin outline onClick={() => this.updatePlan()}>Update</Button>
                      </PartnerPlanButton>
                    )
                    : null
                  }
                  {!updating && !viewing
                    ? (
                      <PartnerPlanButton span={6}>
                        <Button widthPercent={100} green rounded normargin outline onClick={() => this.createPlan()}>Create</Button>
                      </PartnerPlanButton>
                    )
                    : null
                  }
                  <PartnerPlanButton span={6}>
                    <Button widthPercent={100} danger rounded normargin outline onClick={() => closeCreatePartnerPlanModal()}>Close</Button>
                  </PartnerPlanButton>
                </PartnerPlanButtonContainer>
              </PartnerPlanInnerSection>

            </PartnerPlanInner>
          </PartnerPlanPadding>
        </PartnerPlanMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  referral: state.referral
});
const dispatchToProps = (dispatch) => ({
  closeCreatePartnerPlanModal: () => dispatch(closeCreatePartnerPlanModal()),
  createPartnerPlan: (plan) => dispatch(createPartnerPlan(plan)),
  updatePartnerPlan: (id, updates) => dispatch(updatePartnerPlan(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(PartnerPlanModal);
