import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersAndDecimalsOnly, isSelfAccount } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import ReactSelect from "react-select";
import { createBeneficiaryAssetRecord, updateBeneficiaryAssetRecord, closeCreateBeneficiaryAssetModal } from "../../store/actions/beneficiary-assets";
import { isMobile } from "react-device-detect";
import { uniq, orderBy } from "lodash";
import {
  BeneficiaryAssetMainContent,
  ViewBeneficiaryAssetModalInner,
  ViewBeneficiaryAssetModalInnerLogo,
  ViewBeneficiaryAssetModalInnerLogoImg,
  ViewBeneficiaryAssetModalInnerHeader
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  CheckBoxInput,
  Input,
  TextArea,
  RequiredStar,
  InputHint,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";

class BeneficiaryAssetCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    createBeneficiaryAssetRecord: PropTypes.func.isRequired,
    updateBeneficiaryAssetRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { type, accounts, session, defaults } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      assetType: type,
      account,
      user_permissions: account.permissions,
      inflation: Object.values(defaults).length ? defaults.inflation : true,
      account_type: defaults ? defaults.account_type : "",
      has_debt: defaults.has_debt || false,
      debt: (defaults && defaults.has_debt) ? defaults.debt : 0,
      details: defaults ? (defaults.description || "") : ""
    };
  }

  createBeneficiaryAsset = async () => {
    const { createBeneficiaryAssetRecord, showNotification, closeCreateBeneficiaryAssetModal, financeType, source, user } = this.props;
    const { assetType, user_permissions, inflation, account, account_type, has_debt, debt, details } = this.state;
    const isViewing = user_permissions.includes("finance-edit");
    
    if (isViewing) {
      let financial_institution = this.financeInstitutionInput.value;
      let account_number = this.accountNumberInput.value;
      let beneficiary_assets = this.beneficiaryAssetsInput ? this.beneficiaryAssetsInput.value : 0;
      let friendly_name = this.friendlyNameInput ? (this.friendlyNameInput.value).replace("'", "’") : "";

      const isComplete = assetType && account_type && beneficiary_assets;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Creating..." });
        const created = await createBeneficiaryAssetRecord(financeType, {
          account_type,
          institution_name: financial_institution,
          account_number,
          value: Number(beneficiary_assets || 0),
          source,
          type: assetType,
          friendly_name,
          description: details,
          inflation,
          has_debt,
          debt: debt || 0
        });
        if (created.success) {
          showNotification("success", `${isSelfAccount(user, account) ? "Personal" : "Beneficiary"} asset record created`, created.message);
          closeCreateBeneficiaryAssetModal();
        } else {
          showNotification("error", "Creation failed", created.message);
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateBeneficiaryAsset = async () => {
    const { updateBeneficiaryAssetRecord, showNotification, closeCreateBeneficiaryAssetModal, source, defaults, user } = this.props;
    const { assetType, user_permissions, inflation, account, account_type, has_debt, debt, details } = this.state;
    const isEditable = user_permissions.includes("finance-edit");
    
    if (isEditable) {
      let financial_institution = this.financeInstitutionInput.value;
      let account_number = this.accountNumberInput.value;
      let beneficiary_assets = this.beneficiaryAssetsInput ? this.beneficiaryAssetsInput.value : 0;
      let friendly_name = this.friendlyNameInput ? (this.friendlyNameInput.value).replace("'", "’") : "";

      const isComplete = assetType && account_type && beneficiary_assets;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        const updated = await updateBeneficiaryAssetRecord(defaults.id, {
          account_type,
          institution_name: financial_institution,
          account_number,
          value: Number(beneficiary_assets || defaults.value || 0),
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
          showNotification("success", `${isSelfAccount(user, account) ? "Personal" : "Beneficiary"} asset record updated`, updated.message);
          closeCreateBeneficiaryAssetModal();
        } else {
          showNotification("error", "Update failed", updated.message);
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
    const { core_settings, creatingBeneficiaryAsset, closeCreateBeneficiaryAssetModal, defaults = {}, updating, viewing, user } = this.props;
    const { loaderShow, loaderMessage, inflation, account, account_type, has_debt, debt, details } = this.state;
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
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingBeneficiaryAsset} onClose={() => closeCreateBeneficiaryAssetModal()} center>
        <ViewBeneficiaryAssetModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewBeneficiaryAssetModalInnerLogo span={12}>
              <ViewBeneficiaryAssetModalInnerLogoImg alt="HopeTrust BeneficiaryAsset Logo" src={icons.colorLogoOnly} />
            </ViewBeneficiaryAssetModalInnerLogo>
          </Col>
          <BeneficiaryAssetMainContent span={12}>
            <Row>
              {!isUpdating && !isViewing
                ? <ViewBeneficiaryAssetModalInnerHeader span={12}>New {isSelfAccount(user, account) ? "Personal" : "Beneficiary"} Asset</ViewBeneficiaryAssetModalInnerHeader>
                : null
              }
              {isUpdating || isViewing
                ? <ViewBeneficiaryAssetModalInnerHeader span={12}>{isUpdating ? "Updating" : "Viewing"} {isSelfAccount(user, account) ? "Personal" : "Beneficiary"} Asset</ViewBeneficiaryAssetModalInnerHeader>
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
                      <Input readOnly={isViewing} ref={(input) => this.financeInstitutionInput = input} type="text" defaultValue={defaults.institution_name} placeholder="Which financial institution holds this asset?" />
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
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Total Value:</InputLabel>
                      <Input min={0} disabled={defaults.source === "Plaid"} readOnly={isViewing || defaults.source === "Plaid"} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.beneficiaryAssetsInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.value} placeholder="What is the value of this asset?" />
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
                      <Col span={12}>
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
                </Row>
              </Col>
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

              {!isViewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createBeneficiaryAsset()} green nomargin>Create Record</Button>
                      : <Button type="button" onClick={() => this.updateBeneficiaryAsset()} green nomargin>Update Record</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </BeneficiaryAssetMainContent>
        </ViewBeneficiaryAssetModalInner>
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
  closeCreateBeneficiaryAssetModal: () => dispatch(closeCreateBeneficiaryAssetModal()),
  createBeneficiaryAssetRecord: (type, record) => dispatch(createBeneficiaryAssetRecord(type, record)),
  updateBeneficiaryAssetRecord: (id, record) => dispatch(updateBeneficiaryAssetRecord(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(BeneficiaryAssetCreateModal);
