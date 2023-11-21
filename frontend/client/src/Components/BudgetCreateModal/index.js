import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersOnly, allowNumbersAndDecimalsOnly, getUserAge } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import {  addMytoExpense, updateMytoExpense } from "../../store/actions/myto";
import { createBudgetRecord, updateBudgetRecord, closeCreateBudgetModal } from "../../store/actions/budgets";
import ReactSelect from "react-select";
import { uniq, orderBy } from "lodash";
import {
  FinanceMainContent,
  ViewBudgetModalInner,
  ViewBudgetModalInnerLogo,
  ViewBudgetModalInnerLogoImg,
  ViewBudgetModalInnerHeader
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

class BudgetCreateModal extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired,
    createBudgetRecord: PropTypes.func.isRequired,
    updateBudgetRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, relationship, session, defaults } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      user_permissions: account.permissions,
      beneficiary,
      inflation: Object.values(defaults).length ? defaults.inflation : true,
      budget_type: defaults ? defaults.budget_category : "",
      parent_category: defaults ? defaults.parent_category : "",
      details: defaults ? (defaults.details || "") : ""
    };
  }

  createBudget = async () => {
    const { addMytoExpense, simulation, createBudgetRecord, showNotification, closeCreateBudgetModal } = this.props;
    const { user_permissions, inflation, budget_type, parent_category, details } = this.state;
    const isViewing = user_permissions.includes("budget-edit");
    
    if (isViewing) {
      let value = this.valueInput.value || 0;
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;
      const isComplete = budget_type && parent_category && value;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Creating..." });
        if (!simulation) {
          const created = await createBudgetRecord({
            parent_category,
            budget_category: budget_type,
            details,
            term: [fromAge, toAge],
            value: Number(value),
            inflation
          });
          if (created.success) {
            showNotification("success", "Budget record created", created.message);
            closeCreateBudgetModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        } else {
          addMytoExpense({
            parent_category,
            budget_category: budget_type,
            details,
            term: [fromAge, toAge],
            value: Number(value),
            inflation
          });
          showNotification("success", "Simulated expense record created", `Successfully created ${budget_type} expense.`);
          closeCreateBudgetModal();
        }
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateBudget = async () => {
    const { updateMytoExpense, simulation, updateBudgetRecord, showNotification, closeCreateBudgetModal, defaults } = this.props;
    const { user_permissions, inflation, budget_type, parent_category, details } = this.state;
    const isEditable = user_permissions.includes("budget-edit");
    
    if (isEditable) {
      let value = this.valueInput.value || 0;
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;

      const isComplete = budget_type && parent_category && value;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        if (!simulation) {
          const updated = await updateBudgetRecord(defaults.id, {
            parent_category,
            budget_category: budget_type,
            details,
            term: [fromAge, toAge],
            value: Number(value),
            inflation
          });
          if (updated.success) {
            showNotification("success", "Finance record updated", updated.message);
            closeCreateBudgetModal();
          } else {
            showNotification("error", "Update failed", updated.message);
          }
        } else {
          updateMytoExpense(defaults.id, {
            parent_category,
            budget_category: budget_type,
            details,
            term: [fromAge, toAge],
            value: Number(value),
            inflation
          });
          showNotification("success", "Simulated expense record updated", `Successfully updated ${budget_type} expense.`);
          closeCreateBudgetModal();
        }
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

  capitalize = (str, lower = false) =>
    ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());
  ;

  componentWillUnmount() {
    this.setState({ loaderShow: false, loaderMessage: "" });
  }
  
  render() {
    const { core_settings, creatingBudget, closeCreateBudgetModal, defaults = {}, updating, viewing } = this.props;
    const { loaderShow, loaderMessage, beneficiary, inflation, parent_category, budget_type, details } = this.state;
    const isViewing = viewing;
    const isUpdating = updating;

    let categories = uniq(core_settings.budget_categories.map((a) => a.category)).sort();
    const expense_type_groups = categories.map((group_key) => {
      const category_items = orderBy(core_settings.budget_categories.filter((a) => a.category === group_key), "name");
      const option_items = category_items.map((item) => {
        return { value: item.name, label: item.name, parent: group_key };
      });
      return { options: orderBy(option_items, "value", "asc"), label: group_key };
    });
    
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingBudget} onClose={() => closeCreateBudgetModal()} center>
        <ViewBudgetModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewBudgetModalInnerLogo span={12}>
              <ViewBudgetModalInnerLogoImg alt="HopeTrust Budget Logo" src={icons.colorLogoOnly} />
            </ViewBudgetModalInnerLogo>
          </Col>
          <FinanceMainContent span={12}>
            <Row>
              {!isUpdating && !isViewing
                ? <ViewBudgetModalInnerHeader span={12}>New Budget Record</ViewBudgetModalInnerHeader>
                : null
              }
              {isUpdating || isViewing
                ? <ViewBudgetModalInnerHeader span={12}>{isUpdating ? "Updating" : "Viewing"} Record</ViewBudgetModalInnerHeader>
                : null
              }

              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Expense Category</InputLabel>
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
                        name="budget_type"
                        isDisabled={isViewing}
                        placeholder="Choose an expense category, type to search..."
                        clearValue={() => this.setState({ "budget_type": "", "parent_category": "" })}
                        onChange={(val) => this.setState({ "budget_type": val ? val.value : "", "parent_category": val ? val.parent : "" })}
                        value={(budget_type && parent_category) ? { value: budget_type, label: budget_type, parent: parent_category } : null}
                        options={expense_type_groups}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Projected Start Age (optional):</InputLabel>
                      <Input min={1} max={100} readOnly={isViewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.fromAge = input} type="number" inputMode="numeric" pattern="[0-9]*" placeholder={getUserAge(beneficiary.birthday)} defaultValue={(defaults && defaults.term && defaults.term.length && defaults.term[0]) ? defaults.term[0] : getUserAge(beneficiary.birthday)} />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Projected End Age (optional):</InputLabel>
                      <Input min={0} max={100} readOnly={isViewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.toAge = input} type="number" inputMode="numeric" pattern="[0-9]*" placeholder={getUserAge(beneficiary.birthday) + 1} defaultValue={(defaults && defaults.term && defaults.term.length && defaults.term[1]) ? defaults.term[1] : 100} />
                      <InputHint>Hint: 100 indicates lifetime expense.</InputHint>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Details (optional): ({250 - details.length} characters remaining)</InputLabel>
                      <TextArea readOnly={isViewing} value={details} maxLength={250} onChange={(event) => this.setState({ details: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 250)} rows={4} placeholder="Add some details..."></TextArea>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Monthly Cost:</InputLabel>
                      <Input min={0} readOnly={isViewing} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.valueInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.value} placeholder="What does this expense cost monthly?" />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Does this expense increase with inflation?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={inflation}
                        onChange={(event) => this.setState({ inflation: event.target.checked })}
                        type="checkbox"
                        id="inflation"
                        disabled={isViewing}
                      />
                    </InputWrapper>
                  </Col>
                </Row>
              </Col>

              {!isViewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createBudget()} green nomargin>Create Record</Button>
                      : <Button type="button" onClick={() => this.updateBudget()} green nomargin>Update Record</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </FinanceMainContent>
        </ViewBudgetModalInner>
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
  closeCreateBudgetModal: () => dispatch(closeCreateBudgetModal()),
  createBudgetRecord: (type, record) => dispatch(createBudgetRecord(type, record)),
  updateBudgetRecord: (id, record) => dispatch(updateBudgetRecord(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  addMytoExpense: (expense) => dispatch(addMytoExpense(expense)),
  updateMytoExpense: (id, updates) => dispatch(updateMytoExpense(id, updates))
});
export default connect(mapStateToProps, dispatchToProps)(BudgetCreateModal);
