import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersOnly, allowNumbersAndDecimalsOnly, getUserAge } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import { createIncomeRecord, updateIncomeRecord, closeCreateIncomeModal } from "../../store/actions/income";
import { addMytoIncome, updateMytoIncome } from "../../store/actions/myto";
import ReactSelect from "react-select";
import { uniq, orderBy } from "lodash";
import {
  FinanceMainContent,
  ViewIncomeModalInner,
  ViewIncomeModalInnerLogo,
  ViewIncomeModalInnerLogoImg,
  ViewIncomeModalInnerHeader
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  CheckBoxInput,
  Input,
  RequiredStar,
  InputHint,
  TextArea,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";

class IncomeCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    createIncomeRecord: PropTypes.func.isRequired,
    updateIncomeRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, relationship, session, defaults = {} } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      user_permissions: account.permissions,
      beneficiary,
      inflation: Object.values(defaults).length ? defaults.inflation : true,
      income_type: defaults.income_type || "",
      details: defaults.details || "",
    };
  }

  createIncome = async () => {
    const { addMytoIncome, simulation, createIncomeRecord, showNotification, closeCreateIncomeModal } = this.props;
    const { user_permissions, inflation, income_type, details } = this.state;
    const viewing = user_permissions.includes("finance-edit");
    
    if (viewing) {
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;
      let monthly_income = this.monthlyIncomeInput.value || 0;
      let annual_income = monthly_income * 12 || 0;

      const isComplete = income_type && monthly_income;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Creating..." });
        if (!simulation) {
          const created = await createIncomeRecord({
            income_type,
            details,
            term: [fromAge, toAge],
            monthly_income: Number(monthly_income),
            annual_income: Number(annual_income),
            inflation
          });
          if (created.success) {
            showNotification("success", "Income record created", created.message);
            closeCreateIncomeModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        } else {
          addMytoIncome({
            income_type,
            details,
            term: [fromAge, toAge],
            monthly_income: Number(monthly_income),
            annual_income: Number(annual_income),
            inflation
          });
          showNotification("success", "Simulated income record created", `Successfully created ${income_type} asset.`);
          closeCreateIncomeModal();
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateIncome = async () => {
    const { updateMytoIncome, simulation, updateIncomeRecord, showNotification, closeCreateIncomeModal, defaults } = this.props;
    const { user_permissions, inflation, income_type, details } = this.state;
    const isEditable = user_permissions.includes("finance-edit");
    
    if (isEditable) {
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;
      let monthly_income = this.monthlyIncomeInput.value || 0;
      let annual_income = monthly_income * 12 || 0;

      const isComplete = income_type && monthly_income;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        if (!simulation) {
          const updated = await updateIncomeRecord(defaults.id, {
            income_type,
            details,
            term: [fromAge, toAge],
            monthly_income: Number(monthly_income),
            annual_income: Number(annual_income),
            inflation
          });
          if (updated.success) {
            showNotification("success", "Finance record updated", updated.message);
            closeCreateIncomeModal();
          } else {
            showNotification("error", "Update failed", updated.message);
          }
        } else {
          updateMytoIncome(defaults.id, {
            income_type,
            details,
            term: [fromAge, toAge],
            monthly_income: Number(monthly_income),
            annual_income: Number(annual_income),
            inflation
          });
          showNotification("success", "Simulated income record updated", `Successfully updated ${income_type} asset.`);
          closeCreateIncomeModal();
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  validAge = (event) => {
    const { beneficiary } = this.state;
    if (event.target.value && event.target.value < getUserAge(beneficiary.birthday)) event.target.value = getUserAge(beneficiary.birthday);
    if (event.target.value && event.target.value > 100) event.target.value = 100;
  };

  render() {
    const { core_settings, creatingIncome, closeCreateIncomeModal, defaults = {}, updating, viewing } = this.props;
    const { loaderShow, loaderMessage, beneficiary, inflation, income_type, details } = this.state;

    let categories = uniq(core_settings.income_types.map((a) => a.category)).sort();
    const income_type_groups = categories.map((group_key) => {
      const category_items = orderBy(core_settings.income_types.filter((a) => a.category === group_key), "type");
      const option_items = category_items.map((item) => {
        return { value: item.type, label: item.type, parent: group_key };
      });
      return { options: orderBy(option_items, "value", "asc"), label: group_key };
    });
    
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingIncome} onClose={() => closeCreateIncomeModal()} center>
        <ViewIncomeModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewIncomeModalInnerLogo span={12}>
              <ViewIncomeModalInnerLogoImg alt="HopeTrust Income Logo" src={icons.colorLogoOnly} />
            </ViewIncomeModalInnerLogo>
          </Col>
          <FinanceMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewIncomeModalInnerHeader span={12}>New Income Record</ViewIncomeModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewIncomeModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Record</ViewIncomeModalInnerHeader>
                : null
              }

              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Source</InputLabel>
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
                        name="income_type"
                        isDisabled={viewing}
                        placeholder="Choose an income source, type to search..."
                        clearValue={() => this.setState({ "income_type": "" })}
                        onChange={(val) => this.setState({ "income_type": val ? val.value : "" })}
                        value={(income_type) ? { value: income_type, label: income_type} : null}
                        options={income_type_groups}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Details (optional): ({250 - details.length} characters remaining)</InputLabel>
                      <TextArea readOnly={viewing} value={details} maxLength={250} onChange={(event) => this.setState({ details: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 250)} rows={4} placeholder="Add some details..."></TextArea>
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Projected Start Age (optional):</InputLabel>
                      <Input min={1} max={100} readOnly={viewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.fromAge = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="1" inputMode="decimal" placeholder={getUserAge(beneficiary.birthday)} defaultValue={defaults && defaults.term && defaults.term.length ? defaults.term[0] : getUserAge(beneficiary.birthday)} />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Projected End Age (optional):</InputLabel>
                      <Input min={0} max={100} readOnly={viewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.toAge = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="1" inputMode="decimal" placeholder={getUserAge(beneficiary.birthday) + 1} defaultValue={defaults && defaults.term && defaults.term.length ? defaults.term[1] : 100} />
                      <InputHint>Hint: 100 indicates lifetime income.</InputHint>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Monthly Income:</InputLabel>
                      <Input min={0} readOnly={viewing} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.monthlyIncomeInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.monthly_income} placeholder="What amount of monthly income?" />
                    </InputWrapper>
                  </Col>
                  {viewing || updating
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel>Annual Income:</InputLabel>
                          <Input readOnly={true} defaultValue={`$${defaults.annual_income.toLocaleString()}`} />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                </Row>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Does this income increase with inflation?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={inflation}
                    onChange={(event) => this.setState({ inflation: event.target.checked })}
                    type="checkbox"
                    id="inflation"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>

              {!viewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createIncome()} green nomargin>Create Record</Button>
                      : <Button type="button" onClick={() => this.updateIncome()} green nomargin>Update Record</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </FinanceMainContent>
        </ViewIncomeModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session,
  core_settings: state.customer_support.core_settings
});
const dispatchToProps = (dispatch) => ({
  closeCreateIncomeModal: () => dispatch(closeCreateIncomeModal()),
  createIncomeRecord: (type, record) => dispatch(createIncomeRecord(type, record)),
  updateIncomeRecord: (id, record) => dispatch(updateIncomeRecord(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  addMytoIncome: (record) => dispatch(addMytoIncome(record)),
  updateMytoIncome: (id, updates) => dispatch(updateMytoIncome(id, updates)),
});
export default connect(mapStateToProps, dispatchToProps)(IncomeCreateModal);
