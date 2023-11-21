import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { toastr } from "react-redux-toastr";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import { deleteMedication, openCreateMedicationModal } from "../../store/actions/medication";
import {
  MedicationCardMain,
  MedicationCardPadding,
  MedicationCardInner,
  MedicationCardSection,
  MedicationCardSectionText,
  MobileLabel
} from "./style";

class MedicationCard extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      permissions: account.permissions
    };
  }


  deleteMedication = (id) => {
    const { deleteMedication } = this.props;
    const deleteOptions = {
      onOk: () => deleteMedication(id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete",
      cancelText: "Cancel"
    };
    toastr.confirm("Are you sure you want to delete this medication?", deleteOptions);
  };
  
  render() {
    const { medication, openCreateMedicationModal, current_page } = this.props;
    const { permissions } = this.state;

    const days_of_the_week_short = medication.days_of_the_week ? medication.days_of_the_week.split(",") : [];
    const first_letter_days = days_of_the_week_short.map((day) => `${day.charAt(0)}${day.charAt(1)}${day.charAt(2)}`);
    return (
      <MedicationCardMain>
        <MedicationCardPadding>
          <MedicationCardInner color="grey">
            <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Name: </MobileLabel><MedicationCardSectionText transform="capitalize">{medication.name}</MedicationCardSectionText>
            </MedicationCardSection>
            {first_letter_days.length
              ? (
                <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                  <MobileLabel>Dosage Times/Days: </MobileLabel><MedicationCardSectionText transform="capitalize">{first_letter_days.length ? first_letter_days.join(", ") : "N/A"}</MedicationCardSectionText>
                </MedicationCardSection>
              )
              : (
                <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
                  <MobileLabel>Dosage Times/Days: </MobileLabel><MedicationCardSectionText transform="capitalize">{medication.daily_times ? `${medication.daily_times.split(",").slice(0, 3).join(", ")}...` : "N/A"}</MedicationCardSectionText>
                </MedicationCardSection>
              )
            }
            <MedicationCardSection xs={12} sm={12} md={1} lg={1} xl={1}>
              <MobileLabel>Frequency: </MobileLabel><MedicationCardSectionText transform="capitalize">{medication.dosage_interval ? `${medication.dosage_interval} ` : null}{medication.daily_times ? (medication.daily_times.split(",").length > 1 ? " times " : " time ") : null}{medication.frequency === "daily/multiple times per day" ? "Daily" : medication.frequency || "N/A"}</MedicationCardSectionText>
            </MedicationCardSection>
            <MedicationCardSection xs={12} sm={12} md={1} lg={1} xl={1}>
              <MobileLabel>Strength/Unit: </MobileLabel><MedicationCardSectionText>{medication.strength}{medication.unit}</MedicationCardSectionText>
            </MedicationCardSection>
            <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Physician: </MobileLabel><MedicationCardSectionText transform="capitalize">{medication.physician || "N/A"}</MedicationCardSectionText>
            </MedicationCardSection>
            <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Assistant: </MobileLabel><MedicationCardSectionText>{(medication.assistance && medication.assistant) ? medication.assistant : (medication.assistance) ? "Anyone" : "N/A"}</MedicationCardSectionText>
            </MedicationCardSection>
            <MedicationCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>
              {permissions.includes("health-and-life-edit")
                ? (
                  <MedicationCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateMedicationModal(medication, true, false, current_page)}>Edit</Button>
                    <Button nomargin danger small onClick={() => this.deleteMedication(medication.id)}>Delete</Button>
                  </MedicationCardSectionText>
                )
                : (
                  <MedicationCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateMedicationModal(medication, false, true, current_page)}>View</Button>
                  </MedicationCardSectionText>
                )
              }
            </MedicationCardSection>
          </MedicationCardInner>
        </MedicationCardPadding>
      </MedicationCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  deleteMedication: (id) => dispatch(deleteMedication(id)),
  openCreateMedicationModal: (defaults, updating, viewing, current_page) => dispatch(openCreateMedicationModal(defaults, updating, viewing, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(MedicationCard);