import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { formatUSPhoneNumber, formatUSPhoneNumberPretty, allowNumbersOnly, verifyEmailFormat, verifyPhoneFormat, limitInput, isValidURL, capitalize } from "../../utilities";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import { createProvider, updateProvider, closeCreateProviderModal, provider_networks } from "../../store/actions/provider";
import { US_STATES } from "../../utilities";
import { openCreateRelationshipModal } from "../../store/actions/relationship";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import ReactAvatar from "react-avatar";
import moment from "moment";
import {
  ProviderMainContent,
  ViewProviderModalInner,
  ViewProviderModalInnerLogo,
  ViewProviderModalInnerLogoImg,
  ViewProviderModalInnerHeader,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  Select,
  SelectLabel,
  RequiredStar,
  InputError,
  CheckBoxInput,
  SelectStyles
} from "../../global-components";
import { uniq } from "lodash";
import LoaderOverlay from "../LoaderOverlay";
import DatePicker from "react-datepicker";
import CustomDateInput from "../../Components/CustomDateInput";
import "react-datepicker/dist/react-datepicker.css";

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

const select_provider_networks = provider_networks.map((provider_network) => {
  return { label: provider_network, value: provider_network };
});

class ProviderCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, customer_support } = props;
    const categories = uniq(customer_support.core_settings.contact_types.map((t) => t.category));
    const contact_categories = uniq(customer_support.core_settings.contact_types.map((t) => t.child_category));
    const contact_types = contact_categories.map((cat) => {
      const types = customer_support.core_settings.contact_types.filter((o) => o.child_category === cat);
      const option_items = types.map((o) => {
        return { value: o.type, label: o.type };
      });
      return { options: option_items, label: cat };
    });
    this.state = {
      categories,
      contact_types,
      loaderShow: false,
      loaderMessage: "",
      type: defaults.type || "",
      specialty: defaults.specialty || "",
      email_error: "",
      phone_error: "",
      fax_error: "",
      url_error: "",
      network: defaults.network || "",
      provider_name: defaults.name || "",
      email: defaults.email || "",
      start: defaults.start || null,
      contact_first: defaults.contact_first,
      contact_last: defaults.contact_last,
      initial_phone: defaults.phone ? formatUSPhoneNumberPretty(defaults.phone) : "",
      phone: defaults.phone ? formatUSPhoneNumberPretty(defaults.phone) : "",
      initial_fax: defaults.fax ? formatUSPhoneNumberPretty(defaults.fax) : "",
      fax: defaults.fax ? formatUSPhoneNumberPretty(defaults.fax) : "",
      url: defaults.url || "",
      associated: defaults.associated_cognito_id ? !!defaults.associated_cognito_id : false,
      associated_cognito_id: defaults.associated_cognito_id ? defaults.associated_cognito_id : null,
    };
  }

  createProvider = async () => {
    const { createProvider, showNotification, closeCreateProviderModal } = this.props;
    const { contact_first, contact_last, start, associated_cognito_id, type, specialty, provider_name, email, phone, fax, email_error, phone_error, fax_error, url, url_error, associated, network } = this.state;
    let name = provider_name.replace("'", "’");
    let address = this.addressInput.value;
    let address2 = this.address2Input.value;
    let city = this.cityInput.value;
    let state = this.stateInput.value;
    let zip = this.zipInput.value;
    let frequency = this.frequencyInput ? this.frequencyInput.value : null;
    const isComplete = this.isComplete(type, name, specialty, (email_error || phone_error || fax_error || url_error));
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createProvider({
        name,
        contact_first,
        contact_last,
        address,
        address2,
        city,
        state,
        zip,
        email,
        url,
        phone: formatUSPhoneNumber(phone),
        fax: formatUSPhoneNumber(fax),
        type,
        frequency,
        network,
        specialty,
        start,
        associated_cognito_id: associated ? associated_cognito_id : null
      });
      if (created.success) {
        showNotification("success", "Provider created", created.message);
        closeCreateProviderModal();
      } else {
        showNotification("error", "Creation failed", created.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields. Some values may not be valid.");
    }
  };

  updateProvider = async () => {
    const { updateProvider, showNotification, closeCreateProviderModal, defaults } = this.props;
    const { contact_first, contact_last, start, associated_cognito_id, type, specialty, provider_name, email, phone, fax, email_error, phone_error, fax_error, url, url_error, associated, network } = this.state;
    let name = provider_name.replace("'", "’");
    let address = this.addressInput.value;
    let address2 = this.address2Input.value;
    let city = this.cityInput.value;
    let state = this.stateInput.value;
    let zip = this.zipInput.value;
    let frequency = this.frequencyInput ? this.frequencyInput.value : null;
    const isComplete = this.isComplete(type, name, specialty, (email_error || phone_error || fax_error || url_error));
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateProvider(defaults.id, {
        name,
        contact_first,
        contact_last,
        address,
        address2,
        city,
        state,
        zip,
        email,
        url,
        phone: formatUSPhoneNumber(phone),
        fax: formatUSPhoneNumber(fax),
        type,
        frequency,
        network,
        specialty,
        start,
        associated_cognito_id: associated ? associated_cognito_id : null
      });
      if (updated.success) {
        showNotification("success", "Provider created", updated.message);
        closeCreateProviderModal();
      } else {
        showNotification("error", "Creation failed", updated.message);
      }
      this.setState({ loaderShow: false, loaderMessage: "" });
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields. Some values may not be valid.");
    }
  };

  verifyEmail = (email) => {
    const isEmail = verifyEmailFormat(email);
    if (!isEmail) {
      if (email.length) {
        this.setState({ email_error: "Format is not valid." });
      } else {
        this.setState({ email_error: "" });
      }
      return false;
    } else {
      this.setState({ email_error: "" });
      return true;
    }
  };

  verifyURL = (url) => {
    const isURL = isValidURL(url);
    if (!isURL) {
      if (url.length) {
        this.setState({ url_error: "Format is not valid." });
      } else {
        this.setState({ url_error: "" });
      }
      return false;
    } else {
      this.setState({ url_error: "", url });
      return true;
    }
  };

  getUser = (cognito_id) => {
    const { relationship } = this.props;
    const owner = relationship.list ? relationship.list.find((u) => cognito_id === u.cognito_id) : false;
    if (owner) return `${owner.first_name} ${owner.last_name}`;
    return false;
  };

  createNewRelationship = (value) => {
    const { openCreateRelationshipModal } = this.props;
    let new_relationship;
    const name = value.split(" ");
    if (name.length > 1) {
      new_relationship = { first_name: name[0], last_name: name[1], prefill: true };
    } else {
      new_relationship = { first_name: name[0], prefill: true };
    }
    openCreateRelationshipModal(new_relationship, false, false);
  };

  isComplete = (type, name, specialty, has_errors) => {
    if (type === "service") {
      return type && name && specialty && !has_errors;
    } else if (type === "medical") {
      return type && name && specialty && !has_errors;
    } else {
      const { contact_first, contact_last } = this.state;
      return type && contact_first && contact_last && !has_errors
    }
  };

  render() {
    const { creatingProvider, closeCreateProviderModal, defaults = {}, updating, viewing, relationship } = this.props;
    const { contact_first, contact_last, start, categories, contact_types, loaderShow, loaderMessage, type, specialty, provider_name, email_error, phone_error, fax_error, url_error, email, initial_phone, initial_fax, phone, fax, url, network, associated, associated_cognito_id } = this.state;
    const relationships = relationship.list.filter((r) => r.type !== "beneficiary").map((user) => {
      return {
        value: user.cognito_id,
        label: `${user.first_name} ${user.last_name}`,
        first: user.first_name,
        last: user.last_name,
        avatar: user.avatar,
        address: user.address,
        address2: user.address2,
        state: user.state,
        city: user.city,
        zip: user.zip,
        email: user.email,
        home_phone: user.home_phone
      };
    });
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1000px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingProvider} onClose={() => closeCreateProviderModal()} center>
        <ViewProviderModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0}>
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewProviderModalInnerLogo span={12}>
              <ViewProviderModalInnerLogoImg alt="HopeTrust Provider Logo" src={icons.colorLogoOnly} />
            </ViewProviderModalInnerLogo>
          </Col>
          <ProviderMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewProviderModalInnerHeader span={12}>New Provider</ViewProviderModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewProviderModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Provider</ViewProviderModalInnerHeader>
                : null
              }

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper marginbottom={15}>
                      <InputLabel marginbottom={10}>Is this provider also a user on this account??</InputLabel>
                      <CheckBoxInput
                        defaultChecked={associated}
                        onChange={(event) => this.setState({ associated: event.target.checked, associated_cognito_id: event.target.checked ? defaults.associated_cognito_id || associated_cognito_id : false })}
                        type="checkbox"
                        id="associated"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  {associated
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}>Associated Relationship</InputLabel>
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
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontWeight: 300,
                                fontSize: "13px",
                                lineHeight: "13px"
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: "13px",
                                paddingLeft: 0
                              })
                            }}
                            isSearchable
                            components={{ Option }}
                            name="associated_cognito_id"
                            placeholder="Choose a relationship or start typing a new one..."
                            onChange={(l) => {
                              if (l) {
                                this.addressInput.value = l.address;
                                this.address2Input.value = l.address2;
                                this.cityInput.value = l.city;
                                this.stateInput.value = l.state;
                                this.zipInput.value = l.zip;
                                this.setState({
                                  email: formatUSPhoneNumberPretty(l.email),
                                  phone: formatUSPhoneNumberPretty(l.home_phone),
                                  associated_cognito_id: l.value,
                                  contact_first: l.first,
                                  contact_last: l.last
                                });
                              }
                            }}
                            onCreateOption={(value) => this.createNewRelationship(value)}
                            value={associated_cognito_id ? { value: associated_cognito_id, label: this.getUser(associated_cognito_id) } : null}
                            options={relationships}
                            formatCreateLabel={(value) => `Click or press Enter to create new Relationship for "${value}"`}
                            isDisabled={viewing}
                          />
                          <InputHint>Hint: To add a new user, type their first and last name.</InputHint>
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Provider Type:</InputLabel>
                      <SelectLabel>
                        <Select disabled={viewing} value={type || ""} onChange={(event) => this.setState({ type: event.target.value, specialty: "" })}>
                          <option disabled value="">Choose a provider type</option>
                          {categories.map((c, index) => {
                            return <option key={index} value={c.toLowerCase()}>{c}</option>;
                          })}
                        </Select>
                      </SelectLabel>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      {type === "medical"
                        ? <InputLabel><RequiredStar>*</RequiredStar> Practice Name:</InputLabel>
                        : <InputLabel>{type !== "relationship" ? <RequiredStar>*</RequiredStar> : null} Entity Name:</InputLabel>
                      }
                      <Input readOnly={viewing} onChange={(event) => this.setState({ provider_name: event.target.value })} type="text" value={provider_name} placeholder={`${type !== "medical" ? "Add a name for this provider..." : "What is the name of this practice or business?"}`} />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>{type === "relationship" ? <RequiredStar>*</RequiredStar> : null} First Name:</InputLabel>
                      <Input readOnly={viewing} type="text" value={contact_first} placeholder="Add a contact first name..." onChange={(e) => this.setState({contact_first: e.target.value })}/>
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>{type === "relationship" ? <RequiredStar>*</RequiredStar> : null} Last Name:</InputLabel>
                      <Input readOnly={viewing} type="text" value={contact_last} placeholder="Add a contact last name..." onChange={(e) => this.setState({contact_last: e.target.value })}/>
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Address:</InputLabel>
                      <Input
                        readOnly={viewing}
                        ref={(input) => this.addressInput = input}
                        defaultValue={defaults.address}
                        placeholder="Add an address..."
                        autoComplete="new-password"
                        autoFill="off"
                        type="text"
                        name="address2"
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Address 2:</InputLabel>
                      <Input
                        readOnly={viewing}
                        ref={(input) => this.address2Input = input}
                        defaultValue={defaults.address2}
                        placeholder="Add an address..."
                        autoComplete="new-password"
                        autoFill="off"
                        type="text"
                        name="address2"
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>City:</InputLabel>
                      <Input
                        readOnly={viewing}
                        ref={(input) => this.cityInput = input}
                        defaultValue={defaults.city}
                        placeholder="Add a city..."
                        autoComplete="new-password"
                        autoFill="off"
                        type="text"
                        name="city"
                      />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>State</InputLabel>
                      <SelectLabel>
                        <Select disabled={viewing} ref={(input) => this.stateInput = input} defaultValue={defaults.state || ""}>
                          <option disabled value="">Choose a state</option>
                          {US_STATES.map((state, index) => {
                            return (
                              <option key={index} value={state.name}>{state.name}</option>
                            );
                          })}
                        </Select>
                      </SelectLabel>
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Zip:</InputLabel>
                      <Input
                        onKeyPress={(event) => limitInput(event, 4)}
                        readOnly={viewing}
                        ref={(input) => this.zipInput = input}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        max="99999"
                        defaultValue={defaults.zip}
                        placeholder="Add a zip code..."
                        autoComplete="new-password"
                        autoFill="off"
                        name="zip"
                      />
                    </InputWrapper>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Email: <InputError>{email_error}</InputError></InputLabel>
                      <Input ref={(input) => this.emailInput = input} readOnly={viewing} onBlur={(event) => this.verifyEmail(event.target.value)} onChange={(event) => this.setState({ email: event.target.value })} type="text" value={email} placeholder="Add an email..." />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Website: <InputError>{url_error}</InputError></InputLabel>
                      <Input readOnly={viewing} onBlur={(event) => this.verifyURL(event.target.value)} onChange={(event) => this.setState({ url: event.target.value })} type="url" value={url} placeholder="Add a website..." />
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Phone:</InputLabel>
                      <Input
                        ref={(input) => this.phoneInput = input}
                        id="phone"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="tel"
                        value={phone}
                        minLength={10}
                        maxLength={10}
                        autoFill={false}
                        autoComplete="new-password"
                        placeholder="Enter a phone number..."
                        onFocus={(event) => {
                          this.setState({ [event.target.id]: "" });
                          this.setState({ phone_error: "" });
                        }}
                        onKeyPress={allowNumbersOnly}
                        onBlur={(event) => {
                          if (verifyPhoneFormat(event.target.value)) {
                            this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                            this.setState({ phone_error: "" });
                          } else if (event.target.value) {
                            this.setState({ [event.target.id]: event.target.value });
                            this.setState({ "phone_error": "This is not a valid phone format." });
                          } else {
                            this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_phone) });
                            this.setState({ phone_error: "" });
                          }
                        }}
                        onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                        readOnly={viewing} />
                        {phone_error
                          ? <InputHint error>{phone_error}</InputHint>
                          : null
                        }
                    </InputWrapper>
                  </Col>
                  <Col span={6}>
                    <InputWrapper>
                      <InputLabel>Fax:</InputLabel>
                      <Input
                        id="fax"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        type="tel"
                        value={fax}
                        minLength={10}
                        maxLength={10}
                        autoFill={false}
                        autoComplete="new-password"
                        placeholder="Enter a fax number..."
                        onFocus={(event) => {
                          this.setState({ [event.target.id]: "" });
                          this.setState({ fax_error: "" });
                        }}
                        onKeyPress={allowNumbersOnly}
                        onBlur={(event) => {
                          if (verifyPhoneFormat(event.target.value)) {
                            this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                            this.setState({ fax_error: "" });
                          } else if (event.target.value) {
                            this.setState({ [event.target.id]: event.target.value });
                            this.setState({ "fax_error": "This is not a valid fax format." });
                          } else {
                            this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_fax) });
                            this.setState({ fax_error: "" });
                          }
                        }}
                        onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                        readOnly={viewing || defaults.is_partner} />
                        {fax_error
                          ? <InputHint error>{fax_error}</InputHint>
                          : null
                        }
                    </InputWrapper>
                  </Col>
                  {type === "medical"
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel>Frequency of visit:</InputLabel>
                          <SelectLabel>
                            <Select disabled={viewing} ref={(input) => this.frequencyInput = input} defaultValue={defaults.frequency || ""}>
                              <option disabled value="">Choose a frequency</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="semi-annually">Semi-Annually</option>
                              <option value="annually">Annually</option>
                            </Select>
                          </SelectLabel>
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {type === "medical"
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={5} margintop={-5}>Medical Network:</InputLabel>
                          <CreatableSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 1002
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 1002
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
                                zIndex: 1002
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
                            name="network"
                            placeholder="Choose a medical network or create a new one..."
                            clearValue={() => this.setState({ "network": "" })}
                            onChange={(val) => this.setState({ "network": val ? val.value : "" })}
                            value={network ? { value: network, label: network } : null}
                            options={select_provider_networks}
                            isDisabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={5} margintop={-5}>{["service", "medical"].includes(type) ? <RequiredStar>*</RequiredStar> : null} Specialty:</InputLabel>
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
                            fontSize: "13px",
                            lineHeight: "13px",
                            opacity: "0.5"
                          }),
                          control: (base) => ({
                            ...base,
                            ...SelectStyles
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 1000
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            fontSize: "13px",
                            paddingLeft: 0
                          })
                        }}
                        isClearable
                        isSearchable
                        name="specialty"
                        placeholder="Choose a service specialty or create a new one..."
                        clearValue={() => this.setState({ "specialty": "" })}
                        onChange={(val) => this.setState({ "specialty": val ? val.value : "" })}
                        value={specialty ? { value: specialty, label: capitalize(specialty) } : null}
                        options={contact_types}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                  {type === "medical"
                    ? (
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel>When did you start seeing this provider? (Estimated date):</InputLabel>
                          <DatePicker
                            selected={start ? new Date(moment(start).utc().format("YYYY-MM-DD")) : null}
                            dateFormat="MMMM d, yyyy"
                            customInput={<CustomDateInput flat />}
                            onChange={(date) => this.setState({ start: moment(date).utc().format("YYYY-MM-DD") })}
                            placeholderText="Choose a start date"
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            withPortal
                            minDate={new Date(moment().subtract(100, "year").format("YYYY-MM-DD"))}
                            value={start ? new Date(moment(start).utc().format("YYYY-MM-DD")) : null}
                            disabled={viewing}
                          />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                </Row>
              </Col>
              {!viewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button disabled={!this.isComplete(type, provider_name, specialty, (phone_error || fax_error || email_error || url_error))} type="button" onClick={() => this.createProvider()} green nomargin>Create Provider</Button>
                      : <Button disabled={!this.isComplete(type, provider_name, specialty, (phone_error || fax_error || email_error || url_error))} type="button" onClick={() => this.updateProvider()} green nomargin>Update Provider</Button>
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </ProviderMainContent>
        </ViewProviderModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  relationship: state.relationship,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeCreateProviderModal: () => dispatch(closeCreateProviderModal()),
  createProvider: (provider) => dispatch(createProvider(provider)),
  updateProvider: (ID, provider) => dispatch(updateProvider(ID, provider)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  openCreateRelationshipModal: (defaults, updating, viewing) => dispatch(openCreateRelationshipModal(defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(ProviderCreateModal);
