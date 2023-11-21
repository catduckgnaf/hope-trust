import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { allowNumbersOnly, numbersLettersUnderscoresHyphens } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoaderOverlay from "../LoaderOverlay";
import ReactSelect, { createFilter, components } from "react-select";
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
  HeavyFont,
  SelectLabel,
  Select
} from "../../global-components";
import {
  UserPlanMain,
  UserPlanPadding,
  UserPlanInner,
  UserPlanInnerSection,
  UserPlanButtonContainer,
  UserPlanButton,
  FeatureItemInputMain,
  FeatureItemInputPadding,
  FeatureItemInputInner,
  FeatureItemInput,
  FeatureItemRemove
} from "./style";
import { closeCreateUserPlanModal, createUserPlan, updateUserPlan, all_permissions } from "../../store/actions/plans";
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

class UserPlanModal extends Component {

  constructor(props) {
    super(props);
    const { defaults, customer_support } = props;
    const current_account = customer_support.accounts.find((acc) => defaults ? acc.account_id === defaults.account_id : false);
    const target_accounts = customer_support.accounts.map((a) => {
      return { value: a.account_id, label: `${a.first_name} ${a.last_name}` };
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
      is_metered: defaults.is_metered || false,
      type: defaults.type || "",
      bill_remainder: defaults.bill_remainder || false,
      billing_days: defaults.billing_days || 0,
      excerpt: defaults.excerpt || "",
      vault_limit: defaults.vault_limit || 0,
      permissions: defaults.permissions && defaults.permissions.length ? defaults.permissions : [],
      features: (defaults.features && Object.keys(JSON.parse(defaults.features || "{}")).length) ? JSON.parse(defaults.features) : {},
      new_feature: "",
      new_permission: "",
      discount: defaults.discount || "",
      current_account: (current_account) ? { value: current_account.account_id, label: `${current_account.first_name} ${current_account.last_name}` } : null,
      account_specific: (current_account) ? true : false,
      target_accounts
    };
  }

  createPlan = async () => {
    const { createUserPlan, showNotification, closeCreateUserPlanModal } = this.props;
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
      permissions,
      vault_limit,
      current_account,
      is_metered,
      type
    } = this.state;
    if (name && price_id && excerpt && Object.keys(features).length) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createUserPlan({
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
        permissions,
        vault_limit,
        account_id: current_account ? current_account.value : null,
        is_metered,
        type
      });
      if (created.success) {
        showNotification("success", "Plan Created", "Plan was successfully created.");
        closeCreateUserPlanModal();
      } else {
        showNotification("error", "Creation Failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  updatePlan = async () => {
    const { updateUserPlan, defaults, showNotification, closeCreateUserPlanModal } = this.props;
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
      permissions,
      vault_limit,
      current_account,
      is_metered,
      type
    } = this.state;
    if (name && price_id && excerpt && Object.keys(features).length) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateUserPlan(defaults.id, {
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
        permissions,
        vault_limit,
        account_id: current_account ? current_account.value : null,
        is_metered,
        type
      });
      if (updated.success) {
        showNotification("success", "Plan Updated", "Plan was successfully updated.");
        closeCreateUserPlanModal();
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
    let updated_features = features;
    delete updated_features[feature];
    this.setState({ features: updated_features });
  };

  addNewFeature = (event, blurred) => {
    const { showNotification } = this.props;
    const { features } = this.state;
    let updated_features = features;
    if (event.key === "Enter") {
      if (event.target.value.length) {
        if (!Object.values(updated_features).includes(event.target.value)) {
          updated_features[event.target.value] = true;
          this.setState({ features: updated_features, new_feature: "" }, () => document.getElementById("addNewFeatureInput").value = "");
        } else {
          showNotification("error", "Missing information", "This feature is already on your list.");
        }
      } else {
        showNotification("error", "Missing information", "You need to enter a feature to add.");
      }
    } else if (blurred) {
      if (event.target.value.length) {
        updated_features[event.target.value] = true;
        this.setState({ features: updated_features, new_feature: "" }, () => document.getElementById("addNewFeatureInput").value = "");
      }
    }
  };

  updateFeatureStatus = (feature, status) => {
    const { features } = this.state;
    let updated_features = features;
    updated_features[feature] = status;
    this.setState({ features: updated_features });
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

  onTypeSelect = (event) => this.setState({ type: event.target.value });

  render() {
    const { viewing_user_plan, updating, viewing, closeCreateUserPlanModal, defaults } = this.props;
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
      status,
      permissions,
      new_permission,
      vault_limit,
      target_accounts,
      current_account,
      account_specific,
      is_metered,
      type
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewing_user_plan} onClose={() => closeCreateUserPlanModal()} center>
        <UserPlanMain>
          <UserPlanPadding>
            <UserPlanInner align="middle" justify="center" isloading={loaderShow ? 1 : 0}>
              <LoaderOverlay show={loaderShow} message={loaderMessage} />

              <UserPlanInnerSection span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Is this plan account-specific?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={account_specific}
                    onChange={(event) => this.setState({ account_specific: event.target.checked })}
                    type="checkbox"
                    id="account_specific"
                    disabled={viewing}
                  />
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
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
              </UserPlanInnerSection>

              {account_specific
                ? (
                  <UserPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel>Client Account</InputLabel>
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
                  </UserPlanInnerSection>
                )
                : null
              }

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Name:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ name: event.target.value })} type="text" value={name} placeholder="Enter a plan name..." />
                  <InputHint>This is the name of the plan, must be unique.</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Stripe Price ID:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ price_id: event.target.value })} type="text" value={price_id} placeholder="Enter a price ID..." />
                  <InputHint>This ID is the identifier from Stripe for this specific product price.</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={6}>
                <InputWrapper>
                  <InputLabel>Monthly Cost:</InputLabel>
                  <Input readOnly={viewing || updating} onChange={(event) => this.setState({ monthly: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={monthly} placeholder="Enter a plan cost..." />
                  <InputHint>This is the amount the plan costs monthly</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={6}>
                <InputWrapper>
                  <InputLabel>Initial Charge:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ one_time_fee: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={one_time_fee} placeholder="Enter a one time fee..." />
                  <InputHint>Subscription cost of the first month, ${monthly || 0} every month after. Leave 0 to keep monthly charge. Trial period does not halt this charge, this will be billed immediately. Coupons WILL NOT discount this charge.</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Discount Code:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ discount: event.target.value })} type="text" value={discount} placeholder="Enter a discount code..." />
                  <InputHint>The coupon has it's own configuration, the discount will be applied to the <b>subscription only</b> based on it's configuration. ie: "12 months", "once", "forever".</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Trial Days:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ billing_days: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={billing_days} placeholder="Enter an amount of trial days..." />
                  <InputHint>Will this subscription have a trial period? Leave 0 to start the subscription immediately.</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Will the subscriber have to pay a cancellation fee to cancel this plan?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={cancellation_fee_on}
                    onChange={(event) => this.setState({ cancellation_fee_on: event.target.checked })}
                    type="checkbox"
                    id="status"
                    disabled={viewing}
                  />
                </InputWrapper>
              </UserPlanInnerSection>

              {cancellation_fee_on
                ? (
                  <UserPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Contract Length in Months:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ contract_length_months: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={24} type="number" value={contract_length_months} placeholder="Enter a contract length in months..." />
                      <InputHint>How many months will this subscription be enforced? Leave 0 if a contract will not be enforced or will charge a one time cancellation fee.</InputHint>
                    </InputWrapper>
                  </UserPlanInnerSection>
                )
                : null
              }

              {cancellation_fee_on && !bill_remainder
                ? (
                  <UserPlanInnerSection span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Cancellation Fee:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ cancellation_fee: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={24} type="number" value={cancellation_fee} placeholder="Enter a cancellation fee..." />
                      <InputHint>This one time charge will be charged at the time of cancellation. Leave 0 for no static cancellation fee.</InputHint>
                    </InputWrapper>
                  </UserPlanInnerSection>
                )
                : null
              }

              {cancellation_fee_on && !cancellation_fee
                ? (
                  <UserPlanInnerSection span={12}>
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
                  </UserPlanInnerSection>
                )
                : null
              }

              <UserPlanInnerSection span={12}>
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
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
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
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel>Vault Limit (in bytes):</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ vault_limit: event.target.value })} onKeyPress={allowNumbersOnly} min={0} max={9999} type="number" value={vault_limit} placeholder="Enter a document vault limit in bytes..." />
                  <InputHint>The limit in bytes that this plan owner can upload to their document vault</InputHint>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Excerpt (optional): ({50 - excerpt.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={excerpt} maxLength={50} onKeyPress={numbersLettersUnderscoresHyphens} onChange={(event) => this.setState({ excerpt: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 50)} rows={4} placeholder="Add an excerpt..."></TextArea>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Type</InputLabel>
                  <SelectLabel>
                    <Select defaultValue={type || ""} onChange={this.onTypeSelect}>
                      <option disabled value="">Choose a plan type</option>
                      <option value="user">User</option>
                      <option value="benefits">Benefits</option>
                    </Select>
                  </SelectLabel>
                </InputWrapper>
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
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
              </UserPlanInnerSection>

              <UserPlanInnerSection span={12}>
                <UserPlanButtonContainer gutter={20}>
                  {updating
                    ? (
                      <UserPlanButton span={6}>
                        <Button widthPercent={100} green rounded normargin outline onClick={() => this.updatePlan()}>Update</Button>
                      </UserPlanButton>
                    )
                    : null
                  }
                  {!updating && !viewing
                    ? (
                      <UserPlanButton span={6}>
                        <Button widthPercent={100} green rounded normargin outline onClick={() => this.createPlan()}>Create</Button>
                      </UserPlanButton>
                    )
                    : null
                  }
                  <UserPlanButton span={6}>
                    <Button widthPercent={100} danger rounded normargin outline onClick={() => closeCreateUserPlanModal()}>Close</Button>
                  </UserPlanButton>
                </UserPlanButtonContainer>
              </UserPlanInnerSection>

            </UserPlanInner>
          </UserPlanPadding>
        </UserPlanMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeCreateUserPlanModal: () => dispatch(closeCreateUserPlanModal()),
  createUserPlan: (plan) => dispatch(createUserPlan(plan)),
  updateUserPlan: (id, updates) => dispatch(updateUserPlan(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(UserPlanModal);
