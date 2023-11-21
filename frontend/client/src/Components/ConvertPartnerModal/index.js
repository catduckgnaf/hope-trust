import React, { Component } from "react";
import { Modal } from "react-responsive-modal";
import { connect } from "beautiful-react-redux";
import CreatableSelect from "react-select/creatable";
import ReactSelect from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toastr } from "react-redux-toastr";
import { searchReferrals } from "../../store/actions/referral";
import { checkUserEmail } from "../../store/actions/user";
import { debounce } from "lodash";
import { closeConvertToPartnerModal } from "../../store/actions/partners";
import { advisor_types, convert } from "../../store/actions/partners";
import { allowNumbersOnly, verifyPhoneFormat, formatUSPhoneNumberPretty } from "../../utilities";
import { hideLoader } from "../../store/actions/loader";
import { showNotification } from "../../store/actions/notification";
import { isMobile } from "react-device-detect";
import {
  PartnerContainerAuthSection,
  PartnerAuthHeader,
  PartnerAuthForm,
  PartnerAuthButtonContainer
} from "./style";
import {
  ViewContainer,
  Button,
  InputHint,
  InputWrapper,
  InputLabel,
  RequiredStar,
  Input,
  SelectStyles
} from "../../global-components";
import { orderBy } from "lodash";

class ConvertPartnerModal extends Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      advisor_type: "other",
      home_phone: user.home_phone && verifyPhoneFormat(user.home_phone) ? formatUSPhoneNumberPretty(user.home_phone) : "",
      mapped: [],
      new_org_created: false,
      name: "",
      domain_approved: false,
      isLoading: false,
      home_phone_error: user.home_phone && verifyPhoneFormat(user.home_phone) ? "" : (user.home_phone ? "Phone number format is incorrect." : ""),
      home_phone_valid: user.home_phone && verifyPhoneFormat(user.home_phone),
      creator_email_error: false,
      creator_email_valid: !!user.email,
      is_checking_creator_email: false,
      fetching_referrals: false
    };
  }

  fireAlert = (org, email) => {
    const deleteOptions = {
      onOk: () => toastr.removeByType("confirms"),
      okText: "Understood",
      disableCancel: true
    };
    toastr.confirm(`Looks like the email you entered does not belong to ${org.value}. You can still sign up with ${email}, but Hope Trust will need to manually approve this domain.\n\nTo expedite the approval process, you could sign up with your company email at the following domain(s):\n\n${org.domains.map((d) => d).join(", ")}`, deleteOptions);
  };

  handleCreate = (id, value) => {
    this.setState({ [id]: value });
    this.setState({ "new_org_created": true });
  };

  selectOrganization = (org, action) => {
    const { email } = this.state;
    if (action.action === "select-option") {
      this.setState({ name: org ? org.value : "", new_org_created: false });
      if (!org.domains.includes(email.split("@")[1])) {
        this.fireAlert(org, email);
        this.setState({ "domain_approved": false });
      } else {
        this.setState({ "domain_approved": true });
      }
    } else if (action.action === "clear") {
      this.setState({ new_org_created: false, name: "" });
    }
  };

  onChangePartnerType = async (val, parameter_search = false) => {
    const { searchReferrals } = this.props;
    let { email, name, fetching_referrals } = this.state;
    if (val && val.value && !fetching_referrals && !parameter_search) {
      const partnerTypeConfig = {
        onOk: async () => {
          let mapped = [];
          let current_org = false;
          this.setState({ isLoading: true, fetching_referrals: true, advisor_type: val.value });
          const results = await searchReferrals("type", val.value);
          if (results.success) {
            mapped = results.payload.map((res) => {
              return { label: res.name, value: res.name, domains: res.domains };
            });
            current_org = mapped.find((o) => o.domains.includes(email.split("@")[1]));
          }
          this.setState({ isLoading: false, fetching_referrals: false, mapped: orderBy(mapped, ["value"], ["asc"]) });
          if (!name && current_org) this.setState({ name: current_org.label, domain_approved: true });
          toastr.removeByType("confirms");
        },
        onCancel: () => {
          this.setState({ advisor_type: "other", domain_approved: false });
          toastr.removeByType("confirms");
        },
        okText: "Yes, I'm Sure",
        cancelText: "No"
      };
      toastr.confirm(`It's important that you select your correct partner type. We use this information to customize your experience as a partner and generate proper contracts for your organization.\n\nAre you sure "${advisor_types.find((t) => t.name === val.value).alias}" is your correct partner type?`, partnerTypeConfig);
    } else {
      let mapped = [];
      let current_org = false;
      this.setState({ isLoading: true, fetching_referrals: true, advisor_type: val.value });
      const results = await searchReferrals("type", val.value);
      if (results.success) {
        mapped = results.payload.map((res) => {
          return { label: res.name, value: res.name, domains: res.domains };
        });
        current_org = mapped.find((o) => o.domains.includes(email.split("@")[1]));
      }
      this.setState({ isLoading: false, fetching_referrals: false, mapped: orderBy(mapped, ["value"], ["asc"]) });
      if (!name && current_org) this.setState({ name: current_org.label, domain_approved: true });
    }
  };

  checkEmail = (event) => {
    const { user } = this.props;
    event.persist();

    if (!this.debouncedFn) {
      this.debouncedFn = debounce(() => {
        let email = event.target.value;
        if (email.includes("@") && (email !== user.email)) {
          this.checkUserEmail(email, "partner");
        } else {
          this.setState({ creator_email_error: false, creator_email_valid: false });
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  checkUserEmail = async (email, type) => {
    const { checkUserEmail } = this.props;
    const is_valid_email = await checkUserEmail(email, type);
    this.setState({
      creator_email_error: is_valid_email.message,
      creator_email_valid: is_valid_email.success,
      is_checking_creator_email: false
    });
  };

  registrationComplete = () => {
    const {
      advisor_type,
      first_name,
      last_name,
      email,
      home_phone_valid,
      name,
      creator_email_valid
    } = this.state;
    return creator_email_valid && home_phone_valid && advisor_type && first_name && last_name && email && name;
  };

  updateAuth = (event) => this.setState({ [event.target.id]: event.target.value });

  submitRegistration = async (e) => {
    const { convert, showNotification, closeConvertToPartnerModal } = this.props;
    const {
      advisor_type,
      first_name,
      last_name,
      email,
      home_phone,
      name,
      new_org_created,
      domain_approved
    } = this.state;
    e.preventDefault();
    if (this.registrationComplete()) {
      await convert({
        advisor_type,
        first_name,
        last_name,
        email,
        home_phone,
        name,
        new_org_created,
        domain_approved
      });
      closeConvertToPartnerModal();
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  componentDidMount() {
    const { is_checking_creator_email, creator_email_valid, fetching_referrals, mapped, advisor_type, email } = this.state;
    const { user } = this.props;
    if (advisor_type && !fetching_referrals && !mapped.length) this.onChangePartnerType({ value: advisor_type }, true);
    if (user.email && !is_checking_creator_email) {
      if (!creator_email_valid) {
        this.setState({ is_checking_creator_email: true });
        if (email !== user.email) this.checkUserEmail(user.email, "partner");
      }
      this.registrationComplete();
    }
  }

  render() {
    const {
      advisor_type,
      first_name,
      last_name,
      email,
      home_phone,
      name,
      mapped,
      isLoading,
      home_phone_error,
      creator_email_error,
      creator_email_valid,
      is_checking_creator_email
    } = this.state;
    const { convertingAccount, closeConvertToPartnerModal } = this.props;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "600px", minWidth: isMobile ? "300px" : "600px", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={convertingAccount} onClose={() => closeConvertToPartnerModal()} center>
        <ViewContainer>
          <PartnerAuthHeader>Partner Conversion</PartnerAuthHeader>
          <PartnerAuthForm onSubmit={this.submitRegistration}>

            <PartnerContainerAuthSection span={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> First Name</InputLabel>
                <Input
                  type="text"
                  id="first_name"
                  value={first_name}
                  placeholder="Joe"
                  onChange={(event) => this.updateAuth(event)}
                  autoComplete="new-password"
                  autofill="off"
                  readOnly
                />
              </InputWrapper>
            </PartnerContainerAuthSection>

            <PartnerContainerAuthSection span={6}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Last Name</InputLabel>
                <Input
                  type="text"
                  id="last_name"
                  value={last_name}
                  placeholder="Jones"
                  onChange={(event) => this.updateAuth(event)}
                  autoComplete="new-password"
                  autofill="off"
                  readOnly
                />
              </InputWrapper>
            </PartnerContainerAuthSection>

            <PartnerContainerAuthSection span={12}>
              <InputWrapper>
                <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Partner Type</InputLabel>
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
                  name="advisor_type"
                  placeholder="Choose a partner type..."
                  onChange={(val) => this.onChangePartnerType(val)}
                  value={advisor_type ? { value: advisor_type, label: advisor_types.find((t) => t.name === advisor_type).alias } : null}
                  options={advisor_types.map((a) => {
                    return { value: a.name, label: a.alias };
                  })}
                />
              </InputWrapper>
            </PartnerContainerAuthSection>

            <PartnerContainerAuthSection span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Mobile Phone</InputLabel>
                <Input
                  id="home_phone"
                  inputMode="numeric"
                  type="tel"
                  value={home_phone}
                  minLength={10}
                  maxLength={10}
                  autoFill={false}
                  autoComplete="new-password"
                  placeholder="Enter a phone number..."
                  onFocus={(event) => {
                    this.setState({ home_phone_error: "", home_phone_valid: false, [event.target.id]: "" });
                  }}
                  onKeyPress={allowNumbersOnly}
                  onBlur={(event) => {
                    if (verifyPhoneFormat(event.target.value)) {
                      this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value), home_phone_valid: true, home_phone_error: "" });
                    } else if (event.target.value) {
                      this.setState({ home_phone_error: "This is not a valid phone format.", [event.target.id]: event.target.value });
                    } else {
                      this.setState({ home_phone_error: "" });
                    }
                  }}
                  onChange={(event) => this.setState({ [event.target.id]: event.target.value })} />
                {home_phone_error
                  ? <InputHint error>{home_phone_error}</InputHint>
                  : null
                }
              </InputWrapper>
            </PartnerContainerAuthSection>

            <PartnerContainerAuthSection span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
                <Input
                  autoComplete="new-password"
                  autofill="off"
                  type="text"
                  name="email"
                  id="email"
                  value={email}
                  placeholder="you@yourcompany.com"
                  onKeyUp={this.checkEmail}
                  onChange={(event) => this.setState({ [event.target.id]: event.target.value, name: "", domain_approved: false, new_org_created: false })}
                  readOnly
                />
                <InputHint margintop={5} error={creator_email_error ? 1 : 0} success={creator_email_valid ? 1 : 0}>{is_checking_creator_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : creator_email_error}</InputHint>
              </InputWrapper>
            </PartnerContainerAuthSection>

            {email && creator_email_valid
              ? (
                <PartnerContainerAuthSection span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Organization</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles,
                          borderBottom: "1px solid hsl(0,0%,80%)"
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          fontSize: "13px",
                          paddingLeft: 0
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: "12px",
                          opacity: "0.5",
                          color: "black"
                        }),
                        multiValue: (base) => ({
                          ...base,
                          borderRadius: "15px",
                          padding: "2px 10px"
                        }),
                        menu: (base) => ({
                          ...base
                        }),
                        menuPortal: (base) => ({
                          ...base
                        })
                      }}
                      isClearable
                      isSearchable
                      name="name"
                      placeholder="Choose an organization from the list or type a new one..."
                      onCreateOption={(value) => this.handleCreate("name", value)}
                      onChange={this.selectOrganization}
                      value={name ? { value: name, label: name } : null}
                      formatCreateLabel={(value) => `Click or press Enter to create new organization "${value}"`}
                      allowCreateWhileLoading={true}
                      createOptionPosition="first"
                      isLoading={isLoading}
                      options={mapped}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                </PartnerContainerAuthSection>
              )
              : null
            }

            <PartnerContainerAuthSection span={12}>
              <PartnerAuthButtonContainer>
                <Button disabled={this.registrationComplete() ? 0 : 1} widthPercent={80} blue type="submit">Register</Button>
              </PartnerAuthButtonContainer>
            </PartnerContainerAuthSection>
          </PartnerAuthForm>
        </ViewContainer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  searchReferrals: (param, value) => dispatch(searchReferrals(param, value)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  hideLoader: () => dispatch(hideLoader()),
  closeConvertToPartnerModal: () => dispatch(closeConvertToPartnerModal()),
  convert: (details) => dispatch(convert(details))
});
export default connect(mapStateToProps, dispatchToProps)(ConvertPartnerModal);