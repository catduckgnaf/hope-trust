import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersAndDecimalsOnly, isSelfAccount } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { uniq, orderBy } from "lodash";
import { showNotification } from "../../store/actions/notification";
import { createGrantorAssetRecord, updateGrantorAssetRecord, closeCreateGrantorAssetModal } from "../../store/actions/grantor-assets";
import { addMytoAsset, updateMytoAsset, deleteMytoAsset } from "../../store/actions/myto";
import ReactSelect from "react-select";
import {
  GrantorAssetMainContent,
  ViewGrantorAssetModalInner,
  ViewGrantorAssetModalInnerLogo,
  ViewGrantorAssetModalInnerLogoImg,
  ViewGrantorAssetModalInnerHeader
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  CheckBoxInput,
  Input,
  TextArea,
  Select,
  SelectLabel,
  RequiredStar,
  InputHint,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";

class GrantorAssetCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    createGrantorAssetRecord: PropTypes.func.isRequired,
    updateGrantorAssetRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { type, accounts, session, defaults = {} } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      assetType: type,
      account,
      vesting_type: defaults.vesting_type || "",
      user_permissions: account.permissions,
      inflation: Object.values(defaults).length ? defaults.inflation : true,
      account_type: defaults.account_type || "",
      has_debt: defaults.has_debt || false,
      debt: (defaults && defaults.has_debt) ? defaults.debt : 0,
      details: defaults.description || ""
    };
  }

  createGrantorAsset = async () => {
    const { addMytoAsset, createGrantorAssetRecord, showNotification, closeCreateGrantorAssetModal, financeType, source, simulation } = this.props;
    let { assetType, user_permissions, vesting_type, inflation, account_type, has_debt, debt, details } = this.state;
    const isViewing = user_permissions.includes("grantor-assets-edit");
    
    if (isViewing) {
      let financial_institution = this.financeInstitutionInput.value;
      let account_number = this.accountNumberInput.value;
      let assigned_percent = this.trustPercentageInput ? this.trustPercentageInput.value : 0;
      let grantor_assets = this.grantorAssetsInput ? this.grantorAssetsInput.value : 0;
      let trust_assets = ((assigned_percent * (grantor_assets - debt)) / 100);
      let friendly_name = this.friendlyNameInput ? (this.friendlyNameInput.value).replace("'", "’") : "";
      vesting_type = assigned_percent <= 0 ? "non-trust" : vesting_type;
      trust_assets = assigned_percent <= 0 ? 0 : trust_assets;

      const isComplete = vesting_type && assetType && account_type && grantor_assets;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Creating..." });
        if (!simulation) {
          const created = await createGrantorAssetRecord(financeType, {
            account_type,
            institution_name: financial_institution,
            account_number,
            vesting_type,
            assigned_percent: vesting_type === "non-trust" ? 0 : Number(assigned_percent || 0),
            value: Number(grantor_assets || 0),
            trust_assets: vesting_type === "non-trust" ? 0 : Number(trust_assets || 0),
            source,
            type: assetType,
            friendly_name,
            description: details,
            inflation,
            has_debt,
            debt: debt || 0
          });
          if (created.success) {
            showNotification("success", "Trust asset record created", created.message);
            closeCreateGrantorAssetModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        } else {
          addMytoAsset({
            account_type,
            institution_name: financial_institution,
            account_number,
            vesting_type,
            assigned_percent: vesting_type === "non-trust" ? 0 : Number(assigned_percent || 0),
            value: Number(grantor_assets || 0),
            trust_assets: vesting_type === "non-trust" ? 0 : Number(trust_assets || 0),
            source,
            type: assetType,
            friendly_name,
            description: details,
            inflation,
            has_debt,
            debt: debt || 0
          });
          showNotification("success", "Simulated trust asset created", `Successfully created ${account_type} asset.`);
          closeCreateGrantorAssetModal();
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateGrantorAsset = async () => {
    const { updateMytoAsset, updateGrantorAssetRecord, showNotification, closeCreateGrantorAssetModal, source, defaults, simulation } = this.props;
    let { assetType, vesting_type, user_permissions, inflation, account_type, has_debt, debt, details } = this.state;
    const isEditable = user_permissions.includes("grantor-assets-edit");
    
    if (isEditable) {
      let financial_institution = this.financeInstitutionInput.value;
      let account_number = this.accountNumberInput.value;
      let assigned_percent = this.trustPercentageInput ? this.trustPercentageInput.value : 0;
      let grantor_assets = this.grantorAssetsInput ? this.grantorAssetsInput.value : 0;
      let trust_assets = ((assigned_percent * (grantor_assets - debt)) / 100);
      let friendly_name = this.friendlyNameInput ? (this.friendlyNameInput.value).replace("'", "’") : "";
      vesting_type = assigned_percent <= 0 ? "non-trust" : vesting_type;
      trust_assets = assigned_percent <= 0 ? 0 : trust_assets;

      const isComplete = vesting_type && assetType && account_type && grantor_assets;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        if (!simulation) {
          const updated = await updateGrantorAssetRecord(defaults.id, {
            account_type,
            institution_name: financial_institution,
            account_number,
            vesting_type,
            assigned_percent: vesting_type === "non-trust" ? 0 : Number(assigned_percent || 0),
            value: Number(grantor_assets || defaults.value || 0),
            trust_assets: vesting_type === "non-trust" ? 0 : Number(trust_assets || 0),
            source,
            type: assetType,
            friendly_name,
            description: details,
            plaid_account_id: defaults.plaid_account_id,
            plaid_item_id: defaults.plaid_item_id,
            inflation,
            has_debt,
            debt: debt || 0
          });
          if (updated.success) {
            showNotification("success", "Trust Asset record updated", updated.message);
            closeCreateGrantorAssetModal();
          } else {
            showNotification("error", "Update failed", updated.message);
          }
        } else {
          updateMytoAsset(defaults.id, {
            account_type,
            institution_name: financial_institution,
            account_number,
            vesting_type,
            assigned_percent: vesting_type === "non-trust" ? 0 : Number(assigned_percent || 0),
            value: Number(grantor_assets || defaults.value || 0),
            trust_assets: vesting_type === "non-trust" ? 0 : Number(trust_assets || 0),
            source,
            type: assetType,
            friendly_name,
            description: details,
            plaid_account_id: defaults.plaid_account_id,
            plaid_item_id: defaults.plaid_item_id,
            inflation,
            has_debt,
            debt: debt || 0
          });
          showNotification("success", "Simulated trust asset updated", `Successfully updated ${account_type} asset.`);
          closeCreateGrantorAssetModal();
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  validPercentage = (event) => {
    if (event.target.value < 0) event.target.value = 0;
    if (event.target.value > 100) event.target.value = 100;
  };

  render() {
    const { core_settings, creatingGrantorAsset, closeCreateGrantorAssetModal, defaults = {}, updating, viewing, user } = this.props;
    const { loaderShow, loaderMessage, assetType, vesting_type, inflation, account, account_type, has_debt, debt, details } = this.state;
    const isViewing = viewing;
    const isUpdating = updating;
    
    let categories = uniq(core_settings.asset_types.map((a) => a.category)).sort();
    const account_type_groups = categories.map((group_key) => {
      const category_items = orderBy(core_settings.asset_types.filter((a) => a.category === group_key), "type");
      const option_items = category_items.map((item) => {
        return { value: item.type, label: item.type, parent: group_key };
      });
      return { options: orderBy(option_items, "value", "asc"), label: group_key };
    });
    
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingGrantorAsset} onClose={() => closeCreateGrantorAssetModal()} center>
        <ViewGrantorAssetModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewGrantorAssetModalInnerLogo span={12}>
              <ViewGrantorAssetModalInnerLogoImg alt="HopeTrust GrantorAsset Logo" src={icons.colorLogoOnly} />
            </ViewGrantorAssetModalInnerLogo>
          </Col>
          <GrantorAssetMainContent span={12}>
            <Row>
              {!isUpdating && !isViewing
                ? <ViewGrantorAssetModalInnerHeader span={12}>New {isSelfAccount(user, account) ? "Trust" : "Grantor"} Asset</ViewGrantorAssetModalInnerHeader>
                : null
              }
              {isUpdating || isViewing
                ? <ViewGrantorAssetModalInnerHeader span={12}>{isUpdating ? "Updating" : "Viewing"} {isSelfAccount(user, account) ? "Trust" : "Grantor"} Asset</ViewGrantorAssetModalInnerHeader>
                : null
              }

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Asset Type</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 1000
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 1000
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
                            zIndex: 1000
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
                        isClearable
                        isSearchable
                        name="account_type"
                        isDisabled={viewing}
                        placeholder="Choose an account type, type to search..."
                        clearValue={() => this.setState({ "account_type": "" })}
                        onChange={(val) => this.setState({ "account_type": val ? val.value : "" })}
                        value={(account_type) ? { value: account_type, label: account_type } : null}
                        options={account_type_groups}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Financial Institution:</InputLabel>
                      <Input readOnly={isViewing} ref={(input) => this.financeInstitutionInput = input} maxLength={100} type="text" defaultValue={defaults.institution_name} placeholder="Which financial institution holds this asset?" />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Account Number:</InputLabel>
                      <Input readOnly={isViewing || (defaults.source === "Plaid" && isUpdating)} maxLength="25" ref={(input) => this.accountNumberInput = input} type="text" defaultValue={defaults.source !== "Plaid" ? defaults.account_number : `****${defaults.account_number}`} placeholder="Add an account number..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Nickname:</InputLabel>
                      <Input readOnly={isViewing} maxLength="50" ref={(input) => this.friendlyNameInput = input} type="text" defaultValue={defaults.friendly_name} placeholder="Example: Jack's Savings Account" />
                    </InputWrapper>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                  <Row>
                    {assetType === "grantor"
                      ? (
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar> Vesting Type (When will this asset be added to the trust?):</InputLabel>
                            <SelectLabel>
                              <Select onChange={(event) => this.setState({ vesting_type: event.target.value })} value={vesting_type}>
                                <option disabled value="">Choose a vesting type</option>
                                <option value="current" disabled={isViewing}>Current</option>
                                <option value="future" disabled={isViewing}>Future</option>
                                <option value="non-trust" disabled={isViewing}>Non-Trust</option>
                              </Select>
                            </SelectLabel>
                          </InputWrapper>
                        </Col>
                      )
                      : null
                    }
                    {vesting_type !== "non-trust"
                      ? (
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar>Trust Allocation % (What percentage will be placed in trust?):</InputLabel>
                            <Input min={0} max={100} readOnly={isViewing} onBlur={this.validPercentage} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.trustPercentageInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.assigned_percent} placeholder="What percent will go to a trust?" />
                          </InputWrapper>
                        </Col>
                      )
                      : null
                    }
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Total Value:</InputLabel>
                        <Input disabled={defaults.source === "Plaid"} min={0} readOnly={isViewing || defaults.source === "Plaid"} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.grantorAssetsInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.value} placeholder="What is the value of this asset?" />
                        {defaults.source === "Plaid"
                          ? <InputHint>This balance is managed by your bank, it will update as the account balance changes</InputHint>
                          : null
                        }
                      </InputWrapper>
                    </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Details (optional): ({250 - details.length} characters remaining)</InputLabel>
                      <TextArea readOnly={isViewing} value={details} maxLength={250} onChange={(event) => this.setState({ details: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 250)} rows={4} placeholder="Add some details..."></TextArea>
                    </InputWrapper>
                  </Col>
                  {defaults.source !== "Plaid"
                    ? (
                      <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}>Does this asset have debt?</InputLabel>
                          <CheckBoxInput
                            defaultChecked={has_debt}
                            onChange={(event) => this.setState({ has_debt: event.target.checked, debt: event.target.checked ? (defaults.debt || 0) : 0 })}
                            type="checkbox"
                            id="has_debt"
                            disabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {has_debt && defaults.source !== "Plaid"
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel>Total Debt:</InputLabel>
                          <Input disabled={!has_debt} min={0} readOnly={isViewing || !has_debt} onKeyPress={allowNumbersAndDecimalsOnly} onChange={(event) => this.setState({ "debt": event.target.value })} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={debt || 0} placeholder="How much debt does this asset have?" />
                          <InputHint>Example: You owe $100,000 on a $200,000 mortgage, your total debt is $100,000.</InputHint>
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Does this asset increase with inflation?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={inflation}
                        onChange={(event) => this.setState({ inflation: event.target.checked })}
                        type="checkbox"
                        id="inflation"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  </Row>
              </Col>

              {!isViewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createGrantorAsset()} green nomargin>Create Record</Button>
                      : <Button type="button" onClick={() => this.updateGrantorAsset()} green nomargin>Update Record</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </GrantorAssetMainContent>
        </ViewGrantorAssetModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  core_settings: state.customer_support.core_settings
});
const dispatchToProps = (dispatch) => ({
  closeCreateGrantorAssetModal: () => dispatch(closeCreateGrantorAssetModal()),
  createGrantorAssetRecord: (type, record) => dispatch(createGrantorAssetRecord(type, record)),
  updateGrantorAssetRecord: (id, record) => dispatch(updateGrantorAssetRecord(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  addMytoAsset: (asset) => dispatch(addMytoAsset(asset)),
  updateMytoAsset: (id, updates) => dispatch(updateMytoAsset(id, updates)),
  deleteMytoAsset: (id) => dispatch(deleteMytoAsset(id)),
});
export default connect(mapStateToProps, dispatchToProps)(GrantorAssetCreateModal);
