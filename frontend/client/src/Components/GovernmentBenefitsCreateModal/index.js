import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersOnly, allowNumbersAndDecimalsOnly, getUserAge } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import moment from "moment";
import { showNotification } from "../../store/actions/notification";
import { addMytoBenefit, updateMytoBenefit} from "../../store/actions/myto";
import { createBenefitRecord, updateBenefitRecord, closeCreateBenefitModal } from "../../store/actions/benefits";
import DatePicker from "react-datepicker";
import ReactSelect from "react-select";
import { uniq, orderBy } from "lodash";
import {
  FinanceMainContent,
  ViewGovernmentBenefitsModalInner,
  ViewGovernmentBenefitsModalInnerLogo,
  ViewGovernmentBenefitsModalInnerLogoImg,
  ViewGovernmentBenefitsModalInnerHeader
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  TextArea,
  RequiredStar,
  InputHint,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import CustomDateInput from "../../Components/CustomDateInput";
import "react-datepicker/dist/react-datepicker.css";

class GovernmentBenefitsCreateModal extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired,
    createBenefitRecord: PropTypes.func.isRequired,
    updateBenefitRecord: PropTypes.func.isRequired
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
      renewal_date: defaults.renewal_date ? new Date(defaults.renewal_date) : null,
      beneficiary,
      program_name: defaults.program_name || "",
      details: defaults.details || ""
    };
  }

  createBenefit = async () => {
    const { simulation, addMytoBenefit, createBenefitRecord, showNotification, closeCreateBenefitModal } = this.props;
    const { user_permissions, renewal_date, program_name, details } = this.state;
    const isViewing = user_permissions.includes("finance-edit");
    
    if (isViewing) {
      let account_number = this.accountNumberInput.value;
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;
      let value = this.valueInput.value || 0;

      const isComplete = program_name && value;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Creating..." });
        if (!simulation) {
          const created = await createBenefitRecord({
            program_name,
            term: [fromAge, toAge],
            renewal_date: renewal_date ? renewal_date : null,
            account_number,
            value: Number(value),
            details
          });
          if (created.success) {
            showNotification("success", "Benefit record created", created.message);
            closeCreateBenefitModal();
          } else {
            showNotification("error", "Creation failed", created.message);
          }
        } else {
          addMytoBenefit({
            program_name,
            term: [fromAge, toAge],
            renewal_date: renewal_date ? renewal_date : null,
            account_number,
            value: Number(value),
            details
          });
          showNotification("success", "Simulated benefit record created", `Successfully created ${program_name} benefit.`);
          closeCreateBenefitModal();
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      } else {
        showNotification("error", "Required fields missing", "You must fill in all required fields.");
      }
    }
  };

  updateBenefit = async () => {
    const { updateMytoBenefit, simulation, updateBenefitRecord, showNotification, closeCreateBenefitModal, defaults } = this.props;
    const { user_permissions, renewal_date, program_name, details } = this.state;
    const isEditable = user_permissions.includes("finance-edit");
    
    if (isEditable) {
      let account_number = this.accountNumberInput.value;
      let fromAge = this.fromAge.value || 0;
      let toAge = this.toAge.value || 0;
      let value = this.valueInput.value || 0;

      const isComplete = program_name && value;
      if (isComplete) {
        this.setState({ loaderShow: true, loaderMessage: "Updating..." });
        if (!simulation) {
          const updated = await updateBenefitRecord(defaults.id, {
            program_name,
            term: [fromAge, toAge],
            renewal_date: renewal_date ? renewal_date : null,
            account_number,
            value: Number(value),
            details
          });
          if (updated.success) {
            showNotification("success", "Finance record updated", updated.message);
            closeCreateBenefitModal();
          } else {
            showNotification("error", "Update failed", updated.message);
          }
        } else {
          updateMytoBenefit(defaults.id, {
            program_name,
            term: [fromAge, toAge],
            renewal_date: renewal_date ? renewal_date : null,
            account_number,
            value: Number(value),
            details
          });
          showNotification("success", "Simulated benefit record updated", `Successfully created ${program_name} benefit.`);
          closeCreateBenefitModal();
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
    const { core_settings, creatingBenefit, closeCreateBenefitModal, defaults = {}, updating, viewing } = this.props;
    const { loaderShow, loaderMessage, renewal_date, beneficiary, program_name, details } = this.state;
    const isViewing = viewing;
    const isUpdating = updating;

    let categories = uniq(core_settings.benefit_types.map((a) => a.category)).sort();
    const program_name_groups = categories.map((group_key) => {
      const category_items = orderBy(core_settings.benefit_types.filter((a) => a.category === group_key), "type");
      const option_items = category_items.map((item) => {
        return { value: item.type, label: item.type, parent: group_key };
      });
      return { options: orderBy(option_items, "value", "asc"), label: group_key };
    });
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingBenefit} onClose={() => closeCreateBenefitModal()} center>
        <ViewGovernmentBenefitsModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewGovernmentBenefitsModalInnerLogo span={12}>
              <ViewGovernmentBenefitsModalInnerLogoImg alt="HopeTrust Benefit Logo" src={icons.colorLogoOnly} />
            </ViewGovernmentBenefitsModalInnerLogo>
          </Col>
          <FinanceMainContent span={12}>
            <Row>
              {!isUpdating && !isViewing
                ? <ViewGovernmentBenefitsModalInnerHeader span={12}>New Benefit Record</ViewGovernmentBenefitsModalInnerHeader>
                : null
              }
              {isUpdating || isViewing
                ? <ViewGovernmentBenefitsModalInnerHeader span={12}>{isUpdating ? "Updating" : "Viewing"} Record</ViewGovernmentBenefitsModalInnerHeader>
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
                        name="program_name"
                        isDisabled={viewing}
                        placeholder="Choose an income source, type to search..."
                        clearValue={() => this.setState({ "program_name": "" })}
                        onChange={(val) => this.setState({ "program_name": val ? val.value : "" })}
                        value={(program_name) ? { value: program_name, label: program_name } : null}
                        options={program_name_groups}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Projected Start Age (optional):</InputLabel>
                      <Input min={1} max={100} readOnly={viewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.fromAge = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="1" inputMode="decimal" placeholder={getUserAge(beneficiary.birthday)} defaultValue={defaults && defaults.term && defaults.term.length ? defaults.term[0] : getUserAge(beneficiary.birthday)} />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper marginbottom={1}>
                      <InputLabel>Projected End Age (optional):</InputLabel>
                      <Input min={0} max={100} readOnly={viewing} onBlur={this.validAge} onKeyPress={allowNumbersOnly} ref={(input) => this.toAge = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="1" inputMode="decimal" placeholder={getUserAge(beneficiary.birthday) + 1} defaultValue={defaults && defaults.term && defaults.term.length ? defaults.term[1] : 100} />
                      <InputHint margintop={5}>Hint: 100 indicates lifetime income.</InputHint>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper marginbottom={20} width={100}>
                      <InputLabel marginbottom={10}>Renewal Date: (optional)</InputLabel>
                      <DatePicker
                        selected={renewal_date ? new Date(renewal_date) : null}
                        dateFormat="MMMM d, yyyy"
                        customInput={<CustomDateInput />}
                        onChange={(date) => this.setState({ renewal_date: moment(date).format("MM/DD/YYYY") })}
                        placeholderText="Choose a renewal date"
                        minDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        withPortal
                        value={renewal_date ? new Date(renewal_date) : null}
                        disabled={isViewing}
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Account Number:</InputLabel>
                      <Input readOnly={isViewing} ref={(input) => this.accountNumberInput = input} maxLength="25" type="text" defaultValue={defaults.account_number} placeholder="Enter an account number..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Monthly Value:</InputLabel>
                      <Input min={0} readOnly={isViewing} onKeyPress={allowNumbersAndDecimalsOnly} ref={(input) => this.valueInput = input} type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" defaultValue={defaults.value} placeholder="What amount of monthly income?" />
                      <InputHint>Government Benefits are inflation adjusted by default.</InputHint>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Details (optional): ({250 - details.length} characters remaining)</InputLabel>
                      <TextArea readOnly={isViewing} value={details} maxLength={250} onChange={(event) => this.setState({ details: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 250)} rows={4} placeholder="Add some details..."></TextArea>
                    </InputWrapper>
                  </Col>
                </Row>
              </Col>

              {!isViewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createBenefit()} green nomargin>Create Record</Button>
                      : <Button type="button" onClick={() => this.updateBenefit()} green nomargin>Update Record</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </FinanceMainContent>
        </ViewGovernmentBenefitsModalInner>
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
  closeCreateBenefitModal: () => dispatch(closeCreateBenefitModal()),
  createBenefitRecord: (type, record) => dispatch(createBenefitRecord(type, record)),
  updateBenefitRecord: (id, record) => dispatch(updateBenefitRecord(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  addMytoBenefit: (benefit) => dispatch(addMytoBenefit(benefit)),
  updateMytoBenefit: (id, updates) => dispatch(updateMytoBenefit(id, updates))
});
export default connect(mapStateToProps, dispatchToProps)(GovernmentBenefitsCreateModal);
