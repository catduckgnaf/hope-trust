import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersAndDecimalsOnly, numbersLettersUnderscoresHyphens } from "../../utilities";
import { toastr } from "react-redux-toastr";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import { openCreateProviderModal } from "../../store/actions/provider";
import { openCreateRelationshipModal } from "../../store/actions/relationship";
import { createMedication, updateMedication, closeCreateMedicationModal, searchMedications, medication_frequencies, times_per_day, side_effects_defaults, default_routes, default_strengths, default_units, default_dosage_forms } from "../../store/actions/medication";
import { times } from "../../store/actions/schedule";
import ReactSelect, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MedicationMainContent,
  ViewMedicationModalInner,
  ViewMedicationModalInnerLogo,
  ViewMedicationModalInnerLogoImg,
  ViewMedicationModalInnerHeader,
  MedicationSearchButton,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer
} from "./style";
import {
  Button,
  RequiredStar,
  InputWrapper,
  InputLabel,
  InputHint,
  CheckBoxInput,
  TextArea,
  Input,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import ReactAvatar from "react-avatar";
import { uniqBy, orderBy, sortBy } from "lodash";

const days_of_the_week_defaults = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" }
];

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar size={25} src={props.data.avatar} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};


class MedicationCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    createMedication: PropTypes.func.isRequired,
    updateMedication: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, relationship } = props;
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");

    this.state = {
      results: [],
      menu_open: false,
      choice: defaults.id ? { name: defaults.name, value: defaults.name, label: defaults.detailed_name } : "",
      strength: defaults.strength || null,
      frequency: defaults.frequency || "",
      dosage_interval: defaults.dosage_interval || null,
      unit: defaults.unit || null,
      route: defaults.route || null,
      dosage_form: defaults.dosage_form || null,
      has_set_times: defaults.has_set_times || false,
      daily_times: (defaults && defaults.daily_times) ? defaults.daily_times.split(",") : [],
      has_set_dates: defaults.has_set_dates || false,
      days_of_the_week: (defaults && defaults.days_of_the_week) ? defaults.days_of_the_week.split(",") : [],
      physician: defaults.physician || "",
      provider_id: defaults.provider_id || null,
      assistance: defaults.assistance || false,
      assistant: defaults.assistant || "",
      assistant_name: defaults.assistant_name || "",
      prescribed: !!defaults.physician,
      side_effects: (defaults && defaults.side_effects) ? defaults.side_effects.split(",") : [],
      note: defaults.note || "",
      dose: defaults.dose || defaults.strength || null,
      strengths: default_strengths,
      routes: default_routes,
      dosage_forms: default_dosage_forms,
      units: default_units,
      term: defaults.name || "",
      is_search: defaults.is_search || false,
      beneficiary
    };
  }

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name] : difference });
        break;
      case "select-option":
        this.setState({ [actionOptions.name]: value.map((e) => e.value) });
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.setState({ [actionOptions.name]: [...this.state[actionOptions.name], new_option.value] });
        break;
      case "clear":
        this.setState({ [actionOptions.name]: [] });
        break;
      default:
        break;
    }
  };

  mapOptionsToValues = (options) => {
    let strengths = [];
    let routes = [];
    let dosage_forms = [];
    let units = [];
    options.forEach((option) => {
      const unit = (option.strength && option.strength.unit) ? option.strength.unit.split("/")[0] : false;
      if (option.strength.number) strengths.push({ label: option.strength.number, value: Number(option.strength.number) });
      if (option.route) routes.push({ label: option.route, value: option.route });
      if (option.dosage_form) dosage_forms.push({ label: option.dosage_form, value: option.dosage_form });
      if (unit) units.push({ label: unit, value: unit });
    });
    this.setState({
      strengths: sortBy(uniqBy(strengths, "label"), "value"),
      routes: orderBy(uniqBy(routes, "label"), "label", "desc"),
      dosage_forms: orderBy(uniqBy(dosage_forms, "label"), "label", "desc"),
      units: orderBy(uniqBy(units, "label"), "label", "desc")
    });
    return options.map((option) => ({
      value: option.name,
      label: option.name,
      prescribable_name: option.prescribable_name,
      name: option.name,
      dosage_form: option.dosage_form,
      otc: option.otc,
      route: option.route,
      strength: option.strength
    }));
  };

  runSearch = async (term) => {
    const { searchMedications } = this.props;
    this.setState({ isLoading: true });
    const results = await searchMedications(term);
    const results_deduped = uniqBy(results, "name");
    this.setState({ results: this.mapOptionsToValues(results_deduped), isLoading: false, menu_open: true });
  };

  clearSearch = () => {
    this.setState({
      results: [],
      term: "",
      isLoading: false,
      menu_open: false,
      strengths: default_strengths,
      routes: default_routes,
      dosage_forms: default_dosage_forms,
      units: default_units,
      strength: null,
      route: null,
      dosage_form: null,
      unit: null,
      is_search: false
  });
  };

  handleCreate = (id, value) => {
    this.setState({ [id]: value, menu_open: false });
  };

  createMedication = async () => {
    const { createMedication, showNotification, closeCreateMedicationModal } = this.props;
    const { provider_id, is_search, choice, frequency, dosage_interval, has_set_times, has_set_dates, daily_times, side_effects, assistant, assistance, physician, days_of_the_week, note, strength, unit, route, dosage_form, dose, term } = this.state;
    const { name, label, otc } = choice;

    const isComplete = (name || term) && frequency && unit && strength && dose;
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createMedication({
        name: name ? name.replace("'", "’") : term,
        detailed_name: label ? label.replace("'", "’") : null,
        dosage_form,
        route,
        unit,
        strength: strength ? strength : null,
        otc,
        frequency,
        dosage_interval: dosage_interval ? dosage_interval : null,
        has_set_times,
        daily_times: daily_times ? daily_times.join(",") : null,
        has_set_dates,
        days_of_the_week: days_of_the_week ? days_of_the_week.join(",") : null,
        physician,
        provider_id,
        assistance,
        assistant: assistance ? assistant : null,
        side_effects: side_effects ? side_effects.join(",") : null,
        note,
        dose: dose ? dose : null,
        is_search
      });
      if (created.success) {
        showNotification("success", "Medication record created", created.message);
        closeCreateMedicationModal();
      } else {
        showNotification("error", "Creation failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }
  };

  updateMedication = async () => {
    const { updateMedication, showNotification, closeCreateMedicationModal, defaults } = this.props;
    const { provider_id, is_search, choice, frequency, dosage_interval, has_set_times, has_set_dates, daily_times, side_effects, assistant, assistance, physician, days_of_the_week, note, strength, unit, route, dosage_form, dose, term } = this.state;
    const { name, label, otc } = choice;

    const isComplete = (name || term) && frequency && unit && strength && dose;
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateMedication(defaults.id, {
        name: term ? term : (name ? name.replace("'", "’") : null),
        detailed_name: label ? label.replace("'", "’") : null,
        dosage_form,
        route,
        unit,
        strength: strength ? strength : null,
        otc,
        frequency,
        dosage_interval: dosage_interval ? dosage_interval : null,
        has_set_times,
        daily_times: daily_times ? daily_times.join(",") : null,
        has_set_dates,
        days_of_the_week: days_of_the_week ? days_of_the_week.join(",") : null,
        physician,
        provider_id,
        assistance,
        assistant: assistance ? assistant : null,
        side_effects: side_effects ? side_effects.join(",") : null,
        note,
        dose: dose ? dose : null,
        is_search
      });
      if (updated.success) {
        showNotification("success", "Medication record updated", updated.message);
        closeCreateMedicationModal();
      } else {
        showNotification("error", "Update failed", updated.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }
  };

  capitalize = (str, lower = false) =>
    ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());
  ;

  createNewProvider = (value) => {
    const { openCreateProviderModal } = this.props;
    this.setState({ physician: value });
    openCreateProviderModal({ name: value }, false, false);
  };

  createNewRelationship = (value) => {
    const { openCreateRelationshipModal } = this.props;
    let new_relationship;
    const name = value.split(" ");
    if (name.length > 1) {
      new_relationship = { first_name: name[0], last_name: name[1] };
    } else {
      new_relationship = { first_name: name[0] };
    }
    this.setState({ assistant: value });
    openCreateRelationshipModal(new_relationship, false, false);
  };

  createNewPrompt = (type, value) => {
    let createOptions;
    switch (type) {
      case "provider":
        createOptions = {
          onOk: () => this.createNewProvider(value),
          onCancel: () => {
            toastr.removeByType("confirms");
            this.setState({ physician: "" });
          },
          okText: "Create Provider",
          cancelText: "No Thanks"
        };
        break;
      case "relationship":
        createOptions = {
          onOk: () => this.createNewRelationship(value),
          onCancel: () => {
            toastr.removeByType("confirms");
            this.setState({ assistant: "" });
          },
          okText: "Create Relatonship",
          cancelText: "No Thanks"
        };
        break;
      default:
        break;
    }
    toastr.confirm(`Do you want to create a new ${type}?`, createOptions);
  };

  render() {
    const { creatingMedication, closeCreateMedicationModal, updating, viewing, provider, relationship } = this.props;
    const {
      results,
      loaderShow,
      loaderMessage,
      choice,
      frequency,
      dosage_interval,
      has_set_times,
      daily_times,
      has_set_dates,
      days_of_the_week,
      physician,
      provider_id,
      assistance,
      assistant,
      assistant_name,
      note,
      side_effects,
      term,
      menu_open,
      isLoading,
      strengths,
      routes,
      units,
      dosage_forms,
      strength,
      unit,
      dosage_form,
      route,
      prescribed,
      dose,
      beneficiary
    } = this.state;

    let start_index = 0;
    times.forEach((t, i) => {
      if (t.value === daily_times[daily_times.length - 1]) start_index = i + 1;
    });
    const sliced = (frequency !== "daily/multiple times per day" || daily_times.length < dosage_interval) ? times.slice(start_index) : [];

    const physicians = provider.list.filter((p) => p.type === "medical").map((prov) => {
      return {
        label: (prov.contact_first && prov.contact_last) ? `${prov.contact_first} ${prov.contact_last} | ${prov.name} | ${prov.specialty}` : `${prov.name} | ${prov.specialty}`,
        value: prov.id,
        contact_name: (prov.contact_first && prov.contact_last) ? `${prov.contact_first} ${prov.contact_last}` : null,
        name: prov.name
      };
    });
    const relationships = relationship.list.filter((r) => r.type !== "beneficiary").map((user) => {
      return {
        value: user.cognito_id,
        label: `${user.first_name} ${user.last_name}`,
        avatar: user.avatar
      };
    });
    let current_physician = physicians.find((p) => p.id === provider_id);
    if (!current_physician) current_physician = physicians.find((prov) => ([prov.label, prov.contact_name, prov.name].includes(physician)));
    let current_assistant = relationships.find((u) => u.value === assistant);
    if (!current_assistant) current_assistant = relationships.find((u) => ([u.label].includes(assistant_name)));

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "850px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingMedication} onClose={() => closeCreateMedicationModal()} center>
        <ViewMedicationModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0}>
          <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewMedicationModalInnerLogo span={12}>
              <ViewMedicationModalInnerLogoImg alt="HopeTrust Income Logo" src={icons.colorLogoOnly} />
            </ViewMedicationModalInnerLogo>
          </Col>
          <MedicationMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewMedicationModalInnerHeader span={12}>New Medication Record</ViewMedicationModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewMedicationModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Medication Record</ViewMedicationModalInnerHeader>
                : null
              }
              {!results.length
                ? (
                  <Col xs={8} sm={8} md={10} lg={10} xl={10}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Medication Name:</InputLabel>
                      <Input
                        onChange={(event) => this.setState({ term: event.target.value, is_search: false })}
                        type="text"
                        placeholder="Enter a medication or search for a new one..."
                        readOnly={viewing}
                        value={term} />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {results.length
                ? (
                  <Col xs={8} sm={8} md={10} lg={10} xl={10}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Medication Name</InputLabel>
                      <CreatableSelect
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
                            fontSize: "12px",
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
                        name="medications"
                        isClearable
                        isSearchable
                        clearValue={() => this.setState("choice", "")}
                        value={!choice ? { label: term, value: term } : choice}
                        placeholder={`Type to search results for "${term}"...`}
                        onChange={(selectedOption) => this.setState({ choice: selectedOption ? selectedOption : "", menu_open: false, is_search: true })}
                        noOptionsMessage={() => "No results found."}
                        options={results}
                        hideSelectedOptions={true}
                        isDisabled={viewing}
                        isLoading={isLoading}
                        menuIsOpen={results.length > 0 && menu_open}
                        blurInputOnSelect={true}
                        onBlur={() => this.setState({ menu_open: false })}
                        onFocus={() => this.setState({ menu_open: true })}
                        onCreateOption={(value) => this.setState({ term: value, is_search: false })}
                        formatCreateLabel={(value) => `Click or press enter to add new medication "${value}"`}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col xs={4} sm={4} md={2} lg={2} xl={2}>
                <MedicationSearchButton>
                  {!results.length
                    ? <Button blue normargin marginleft={5} widthPercent={100} disabled={!term || isLoading} onClick={() => this.runSearch(term)}>{isLoading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Search"}</Button>
                    : <Button danger normargin marginleft={5} widthPercent={100} onClick={() => this.clearSearch()}>Clear</Button>
                  }
                </MedicationSearchButton>
              </Col>
              {choice || term
                ? (
                  <>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Strength</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 999
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 999
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 999
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
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
                          name="strength"
                          placeholder="Choose a strength or add a new one..."
                          onChange={(l) => this.setState({ strength: l.value })}
                          onCreateOption={(l) => Number.isFinite(Number(l)) ? this.setState({ strength: Number(l) }) : null}
                          value={strength ? { value: strength, label: strength } : null}
                          options={strengths}
                          formatCreateLabel={(value) => `Click or press Enter to add strength "${value}"`}
                          isDisabled={viewing}
                          noOptionsMessage={() => "No other options, try typing a new one..."}
                          onBlur={allowNumbersAndDecimalsOnly}
                        />
                        <InputHint>The total strength of this medication</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Dose</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 998
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 998
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 998
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
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
                          name="dose"
                          placeholder="Choose a dose or add a new one..."
                          onChange={(l) => this.setState({ dose: l.value })}
                          onCreateOption={(l) => Number.isFinite(Number(l)) ? this.setState({ dose: Number(l) }) : null}
                          value={dose ? { value: dose, label: dose } : null}
                          options={strengths}
                          formatCreateLabel={(value) => `Click or press Enter to add dose "${value}"`}
                          isDisabled={viewing}
                          noOptionsMessage={() => "No other options, try typing a new one..."}
                        />
                        {beneficiary
                          ? <InputHint>{`The dose given to ${beneficiary.first_name}`}</InputHint>
                          : null
                        }
                      </InputWrapper>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Unit</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 997
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 997
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 997
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
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
                          name="unit"
                          placeholder="Choose a unit or add a new one..."
                          onChange={(l) => this.setState({ unit: l.value })}
                          onCreateOption={(l) => this.setState({ unit: l })}
                          value={unit ? { value: unit, label: unit } : null}
                          options={units}
                          formatCreateLabel={(value) => `Click or press Enter to add unit "${value}"`}
                          isDisabled={viewing}
                          noOptionsMessage={() => "No other options, try typing a new one..."}
                        />
                      </InputWrapper>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}>Dosage Form</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 996
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 996
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 996
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
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
                          name="dosage_form"
                          placeholder="Choose a dosage form or add a new one..."
                          onChange={(l) => this.setState({ dosage_form: l.value })}
                          onCreateOption={(l) => this.setState({ dosage_form: l })}
                          value={dosage_form ? { value: dosage_form, label: dosage_form } : null}
                          options={dosage_forms}
                          formatCreateLabel={(value) => `Click or press Enter to add dosage form "${value}"`}
                          isDisabled={viewing}
                          noOptionsMessage={() => "No other options, try typing a new one..."}
                        />
                        <InputHint>In what form is this medication taken?</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}>Route</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 995
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 995
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 995
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
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
                          name="route"
                          placeholder="Choose a route or add a new one..."
                          onChange={(l) => this.setState({ route: l.value })}
                          onCreateOption={(l) => this.setState({ route: l })}
                          value={route ? { value: route, label: route } : null}
                          options={routes}
                          formatCreateLabel={(value) => `Click or press Enter to add route "${value}"`}
                          isDisabled={viewing}
                          noOptionsMessage={() => "No other options, try typing a new one..."}
                        />
                        <InputHint>How is this medication taken?</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Frequency?</InputLabel>
                        <CreatableSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 994
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 994
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "12px",
                              lineHeight: "13px",
                              opacity: "0.5"
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 994
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
                          name="frequency"
                          placeholder="How often is this medication given?"
                          clearValue={() => this.setState({ "frequency": "" })}
                          onChange={(val) => this.setState({ "frequency": val ? val.value : "", dosage_interval: null, has_set_dates: false, days_of_the_week: [], has_set_times: false, daily_times: [] })}
                          value={frequency ? { value: frequency, label: this.capitalize(frequency) } : null}
                          options={medication_frequencies}
                          isDisabled={viewing}
                        />
                        <InputHint>Add any frequency-specific information as a note.</InputHint>
                      </InputWrapper>
                    </Col>
                  </>
                )
                : null
              }
              {frequency && frequency === "daily/multiple times per day"
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>How many times per day?</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 993
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 993
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "13px",
                            opacity: "0.5"
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 993
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
                        name="dosage_interval"
                        placeholder="How many times daily is this medication taken?"
                        clearValue={() => this.setState({ "dosage_interval": "" })}
                        onCreateOption={(l) => Number.isFinite(Number(l)) ? this.setState({ dosage_interval: Number(l) }) : null}
                        onChange={(val) => this.setState({ "dosage_interval": val ? val.value : "" })}
                        value={dosage_interval ? { value: dosage_interval, label: dosage_interval } : null}
                        formatCreateLabel={(value) => `Click or press Enter to add dosage interval "${value}"`}
                        options={times_per_day}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {(frequency === "weekly" || frequency === "monthly")
                ? (
                  <Col span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Is this medication taken on specific days?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={has_set_dates}
                        onChange={(event) => this.setState({ has_set_dates: event.target.checked })}
                        type="checkbox"
                        id="has_set_dates"
                        readOnly={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {(frequency === "weekly" || frequency === "monthly") && has_set_dates
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Days of the week</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 992
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 992
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 992
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "13px",
                            opacity: "0.5"
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
                        isMulti
                        name="days_of_the_week"
                        placeholder="What days of the week is this medication taken? (please select all that apply)"
                        backspaceRemovesValue={true}
                        onChange={this.updateSelectInput}
                        defaultValue={days_of_the_week.filter((e) => e).map((s) => {
                          return { value: s, label: this.capitalize(s) };
                        })
                        }
                        options={days_of_the_week_defaults}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {dosage_interval || days_of_the_week.length
                ? (
                  <Col span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>{!days_of_the_week.length ? "Is this medication taken at specific times?" : "Is the medication taken at the same time(s) everyday?"}</InputLabel>
                      <CheckBoxInput
                        defaultChecked={has_set_times}
                        onChange={(event) => this.setState({ has_set_times: event.target.checked })}
                        type="checkbox"
                        id="has_set_times"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {has_set_times
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>{dosage_interval ? `At what ${dosage_interval} times daily?` : "At what times?"}</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 991
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 991
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 991
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "13px",
                            opacity: "0.5"
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
                        isMulti
                        name="daily_times"
                        placeholder="Choose which times this medication is taken daily..."
                        onChange={this.updateSelectInput}
                        backspaceRemovesValue={true}
                        defaultValue={daily_times.filter((e) => e).map((s) => {
                          return { value: s, label: s };
                        })
                        }
                        options={sliced}
                        isDisabled={viewing}
                        noOptionsMessage={() => (frequency === "daily/multiple times per day" && daily_times.length === dosage_interval) ? `You may only choose ${dosage_interval} times` : "No options found."}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Is this medication prescribed by a physician?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={prescribed}
                    onChange={(event) => this.setState({ prescribed: event.target.checked })}
                    type="checkbox"
                    id="prescribed"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Assistance Required?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={assistance}
                    onChange={(event) => this.setState({ assistance: event.target.checked })}
                    type="checkbox"
                    id="assistance"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>
              {prescribed
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Physician</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 990
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 990
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 990
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "13px",
                            opacity: "0.5"
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
                        name="physician"
                        placeholder="Who is the prescribing physician? Choose one or type a new one..."
                        onChange={(l) => this.setState({ physician: l.label, provider_id: l.value })}
                        onCreateOption={(value) => this.createNewPrompt("provider", value)}
                        value={current_physician}
                        options={physicians}
                        formatCreateLabel={(value) => `Click or press Enter to create new Provider for "${value}"`}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {assistance
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Assistant</InputLabel>
                      <CreatableSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 989
                          }),
                          multiValue: (base) => ({
                            ...base,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 989
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 989
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontWeight: 300,
                            fontSize: "12px",
                            lineHeight: "13px",
                            opacity: "0.5"
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
                        components={{ Option }}
                        name="assistant"
                        placeholder="Who assists with this medication? Choose from the list or type a new one..."
                        onChange={(l) => this.setState({ assistant: l.value })}
                        onCreateOption={(value) => this.createNewPrompt("relationship", value)}
                        value={current_assistant}
                        options={relationships}
                        formatCreateLabel={(value) => `Click or press Enter to create new Relationship for "${value}"`}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Does this medication cause any side effects?</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 988
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 988
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 988
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontWeight: 300,
                        fontSize: "12px",
                        lineHeight: "13px",
                        opacity: "0.5"
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
                    isMulti
                    name="side_effects"
                    placeholder="Choose from the list or type a new one...(select all that apply)"
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={side_effects.filter((e) => e).map((s) => {
                      return { value: s, label: this.capitalize(s) };
                    })
                    }
                    options={side_effects_defaults}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Note ({255 - note.length} characters remaining)</InputLabel>
                  <TextArea readOnly={viewing} maxLength={255} onKeyPress={numbersLettersUnderscoresHyphens} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} paddingtop={10} placeholder="Add any specific notes about this medication..." onChange={(event) => this.setState({ note: event.target.value })} value={note}></TextArea>
                </InputWrapper>
              </Col>

              {!viewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button type="button" onClick={() => this.createMedication()} green nomargin>Create Medication</Button>
                      : <Button type="button" onClick={() => this.updateMedication()} green nomargin>Update Medication</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </MedicationMainContent>
        </ViewMedicationModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
user: state.user,
  session: state.session,
  provider: state.provider,
  relationship: state.relationship,
  medication: state.medication
});
const dispatchToProps = (dispatch) => ({
  closeCreateMedicationModal: () => dispatch(closeCreateMedicationModal()),
  createMedication: (type, record) => dispatch(createMedication(type, record)),
  updateMedication: (id, record) => dispatch(updateMedication(id, record)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  searchMedications: (query) => dispatch(searchMedications(query)),
  openCreateProviderModal: (defaults, updating, viewing) => dispatch(openCreateProviderModal(defaults, updating, viewing)),
  openCreateRelationshipModal: (defaults, updating, viewing) => dispatch(openCreateRelationshipModal(defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(MedicationCreateModal);
