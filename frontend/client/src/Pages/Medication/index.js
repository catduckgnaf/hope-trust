import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { exportMedications } from "../../store/actions/pdf";
import {
  ViewContainer
} from "../../global-components";
import { openCreateMedicationModal, getMedications, medication_frequencies, default_units } from "../../store/actions/medication";
import GenericTable from "../../Components/GenericTable";
import { medications_table_columns } from "../../column-definitions";

class Medication extends Component {
  static propTypes = {
    session: PropTypes.instanceOf(Object).isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    document.title = "Medication";
    this.state = {};
  }

  render() {
    const { session, accounts, medication, relationship, provider } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const physicians = provider.list.filter((p) => p.type === "medical").map((prov) => {
      return {
        caption: (prov.contact_first && prov.contact_last) ? `${prov.contact_first} ${prov.contact_last} | ${prov.name} | ${prov.specialty}` : `${prov.name} | ${prov.specialty}`,
        value: prov.id.toString()
      };
    });
    const relationships = relationship.list.filter((r) => r.type !== "beneficiary").map((user) => {
      return {
        value: user.cognito_id,
        caption: `${user.first_name} ${user.last_name}`
      };
    });

    return (
      <ViewContainer>
        <GenericTable
          permissions={["health-and-life-edit"]}
          getData={getMedications}
          columns={medications_table_columns}
          page_size={25}
          data_path={["medication", "list"]}
          initial_data={[]}
          loading={medication.isFetching}
          requested={medication.requested}
          header="Medications"
          newRow={{
            onClick: openCreateMedicationModal,
            arguments: [{}, false, false]
          }}
          {...((account.permissions.includes("health-and-life-view") && medication.list.length) && { exportPDFFunction: (data, searched, type) => exportMedications() })}
          paging={true}
          search={true}
          radius={0}
          columnResizing={true}
          fields={[
            {
              caption: "Medication Name",
              name: "name",
              type: "string"
            },
            {
              caption: "Detailed Name",
              name: "detailed_name",
              type: "string"
            },
            {
              caption: "Dosage Form",
              name: "dosage_form",
              type: "select",
              options: [
                { value: "Tablet", caption: "Tablet" },
                { value: "Capsule", caption: "Capsule" },
                { value: "Oral Suspension", caption: "Oral Suspension" },
                { value: "Oral Solution", caption: "Oral Solution" },
                { value: "Syrup", caption: "Syrup" },
                { value: "Tincture", caption: "Tincture" },
                { value: "Powder", caption: "Powder" },
                { value: "Lozenge", caption: "Lozenge" },
                { value: "Suppositorie", caption: "Suppositorie" },
                { value: "Transdermal Patch", caption: "Transdermal Patch" },
                { value: "Inhaler", caption: "Inhaler" },
                { value: "Intravenous", caption: "Intravenous" },
                { value: "Subcutaneous", caption: "Subcutaneous" },
                { value: "Intramuscular", caption: "Intramuscular" }
              ]
            },
            {
              caption: "Route",
              name: "route",
              type: "select",
              options: [
                { value: "Oral", caption: "Oral" },
                { value: "Injection", caption: "Injection" },
                { value: "Sublingual", caption: "Sublingual" },
                { value: "Buccal", caption: "Buccal" },
                { value: "Rectal", caption: "Rectal" },
                { value: "Vaginal", caption: "Vaginal" },
                { value: "Ocular", caption: "Ocular" },
                { value: "Nasal", caption: "Nasal" },
                { value: "Nebulization", caption: "Nebulization" },
                { value: "Cutaneous", caption: "Cutaneous" },
                { value: "Transdermal", caption: "Transdermal" },
                { value: "Inhalation", caption: "Inhalation" }
              ]
            },
            {
              caption: "Side Effect",
              name: "side_effects",
              type: "select",
              options: [
                { value: "Constipation", caption: "Constipation" },
                { value: "Skin Rash or Dermatitis", caption: "Skin Rash or Dermatitis" },
                { value: "Diarrhea", caption: "Diarrhea" },
                { value: "Dizziness", caption: "Dizziness" },
                { value: "Drowsiness", caption: "Drowsiness" },
                { value: "Dry mouth", caption: "Dry mouth" },
                { value: "Headache", caption: "Headache" },
                { value: "Insomnia", caption: "Insomnia" },
                { value: "Nausea", caption: "Nausea" },
                { value: "Suicidal Thoughts", caption: "Suicidal Thoughts" },
                { value: "Abnormal Heart Rhythms", caption: "Abnormal Heart Rhythms" },
                { value: "Internal Bleeding", caption: "Internal Bleeding" },
                { value: "Cancer", caption: "Cancer" },
                { value: "Fever", caption: "Fever" },
                { value: "Fatigue", caption: "Fatigue" },
                { value: "Swelling", caption: "Swelling" },
                { value: "Loss of Appetite", caption: "Loss of Appetite" },
                { value: "Alopecia", caption: "Alopecia" },
                { value: "Hearing Impairment", caption: "Hearing Impairment" },
                { value: "Moodiness", caption: "Moodiness" },
                { value: "Reduced Libido", caption: "Reduced Libido" },
                { value: "Cognitive Problems", caption: "Cognitive Problems" }
              ]
            },
            {
              caption: "Route",
              name: "route",
              type: "select",
              options: [
                { value: "Oral", caption: "Oral" },
                { value: "Injection", caption: "Injection" },
                { value: "Sublingual", caption: "Sublingual" },
                { value: "Buccal", caption: "Buccal" },
                { value: "Rectal", caption: "Rectal" },
                { value: "Vaginal", caption: "Vaginal" },
                { value: "Ocular", caption: "Ocular" },
                { value: "Nasal", caption: "Nasal" },
                { value: "Nebulization", caption: "Nebulization" },
                { value: "Cutaneous", caption: "Cutaneous" },
                { value: "Transdermal", caption: "Transdermal" },
                { value: "Inhalation", caption: "Inhalation" }
              ]
            },
            {
              caption: "Assistance Required",
              name: "assistance",
              type: "select",
              options: [
                { caption: 'Yes', value: "true" },
                { caption: 'No', value: "false" }
              ]
            },
            {
              caption: "Units",
              name: "unit",
              type: "select",
              options: default_units.map((u) => ({ caption: u.label, value: u.value }))
            },
            {
              caption: "Physician",
              name: "provider_id",
              type: "select",
              options: physicians
            },
            {
              caption: "Assistant",
              name: "assistant",
              type: "select",
              options: relationships
            },
            {
              caption: "Frequency",
              name: "frequency",
              type: "select",
              options: medication_frequencies.map((m) => ({ caption: m.label, value: m.value }))
            },
            {
              caption: "Created",
              name: "created_at",
              type: "date"
            }
          ]}
        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  medication: state.medication,
  relationship: state.relationship,
  provider: state.provider
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Medication);
