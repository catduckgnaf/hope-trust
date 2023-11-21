import React, { Component } from "react";
import { Prompt } from "react-router";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import Checkbox from "react-simple-checkbox";
import ReactAvatar from "react-avatar";
import { updatePartner } from "../../store/actions/partners";
import { showNotification } from "../../store/actions/notification";
import authenticated from "../../store/actions/authentication";
import { US_STATES } from "../../utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import { isMobile } from "react-device-detect";
import {
  advisor_types,
  law_specialties,
  law_affiliations,
  ria_certifications,
  insurance_certifications,
  insurance_networks,
  broker_dealers,
  insurance_licensing,
  custodian_banks,
  bank_trust_roles,
  firm_sizes,
  organizations,
  referral_sources
} from "../../store/actions/partners";
import { orderBy, uniq } from "lodash";
import {
  InputWrapper,
  InputLabel,
  Input,
  RequiredStar,
  SelectStyles,
  Button
} from "../../global-components";
import { theme } from "../../global-styles";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer,
  SettingsHeader,
  SettingsHeaderLabel,
  SettingsHeaderAvatar,
  SettingsHeaderInfo,
  SettingsHeaderName,
  ViewContainer,
  AvatarContainer
} from "../../Pages/Settings/style";
import { SaveProfileButton } from "./style";

const default_states = US_STATES.map((state) => {
  return { value: state.name, label: state.name };
});

const ins_networks = insurance_networks.map((network) => {
  return { value: network, label: network };
});

const br_dealers = broker_dealers.map((broker) => {
  return { value: broker, label: broker };
});

const cus_banks = custodian_banks.map((bank) => {
  return { value: bank, label: bank };
});


class GeneralPartnerSettingsForm extends Component {
  static propTypes = {
    verifyAttribute: PropTypes.func.isRequired,
    confirmAttributeVerification: PropTypes.func.isRequired,
    updatePartner: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const advisor_type = user.is_partner ? advisor_types.find((a) => a.name === user.partner_data.partner_type) : {};
    this.state = {
      details: {
        title: user.partner_data.title,
        name: user.partner_data.name,
        department: user.partner_data.department,
        custodian: user.partner_data.custodian,
        states: user.partner_data.states || [],
        licenses: user.partner_data.licenses || [],
        specialties: user.partner_data.specialties || [],
        affiliations: user.partner_data.affiliations || [],
        certifications: user.partner_data.certifications || [],
        role: user.partner_data.role,
        firm_size: user.partner_data.firm_size,
        source: user.partner_data.source,
        primary_network: user.partner_data.primary_network,
        broker_dealer_affiliation: user.partner_data.broker_dealer_affiliation,
        chsnc_graduate: user.partner_data.chsnc_graduate,
        is_investment_manager: user.partner_data.is_investment_manager,
        is_life_insurance_affiliate: user.partner_data.is_life_insurance_affiliate
      },
      advisor_type: advisor_type.name,
      all_states: (user.partner_data.states || []).length === 59 || false,
      updatedProfileInfo: {},
      shouldBlockNavigation: false,
      is_loading: false,
      imageSrc: "",
      editing_logo: false,
      logo_error: "",
      account
    };
  }

  componentDidUpdate = () => {
    const { shouldBlockNavigation } = this.state;
    if (shouldBlockNavigation) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
  }

  onFileChange = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      event.type === "image/png" ? "PNG" : "JPEG",
      100,
      0,
      (uri) => {
        this.setState({ imageSrc: uri, logo_error: "", editing_logo: false }, () => this.saveAvatar(uri));
      },
      "base64"
    );
  };

  throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        this.setState({ logo_error: "This file type is not supported." });
        break;
      case "maxsize":
        this.setState({ logo_error: "Avatar must be less than 2MB" });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setState({ logo_error: "" });
    }, 5000);
  };

  saveAvatar = async (logo) => {
    const { updatePartner } = this.props;
    await updatePartner({ logo });
    this.setState({ editing_logo: false, imageSrc: "" });
  };

  resetStates = () => {
    let details = {...this.state.details};
    details.states = [];
    this.setState({ details });
  }

  set = (id, value) => {
    let { details, updatedProfileInfo } = this.state;
    let details_copy = details;
    let updatedProfileInfo_copy = updatedProfileInfo;
    updatedProfileInfo_copy[id] = value;
    details_copy[id] = value;
    this.setState({
      details: details_copy,
      updatedProfileInfo: updatedProfileInfo_copy,
      shouldBlockNavigation: true
    });
  };

  updateSelectInput = (value, actionOptions) => {
    const { details } = this.state;
    switch (actionOptions.action) {
      case "remove-value":
        let difference = details[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.set(actionOptions.name, difference);
        break;
      case "select-option":
        this.set(actionOptions.name, value.map((e) => e.value));
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.set(actionOptions.name, [...details[actionOptions.name], new_option.value]);
        break;
      case "clear":
        this.set(actionOptions.name, []);
        break;
      default:
        break;
    }
  };

  saveSettings = async () => {
    const {
      updatePartner,
      showNotification
    } = this.props;
    let {
      updatedProfileInfo,
      advisor_type
    } = this.state;
    let isChanged = Object.keys(updatedProfileInfo).length;
    if (this.checkCompletion(advisor_type)) {
      if (isChanged) {
        this.setState({ is_loading: true });
        await updatePartner(updatedProfileInfo);
        this.setState({ shouldBlockNavigation: false, updatedProfileInfo: {}, is_loading: false }, window.onbeforeunload = null);
        showNotification("success", "Partner Updated", "Your partner record was successfully updated.");
      }
    } else {
      showNotification("error", "Update Failed", "You must fill in all required fields.");
    }
  };

  checkCompletion = (advisor_type) => {
    const { details } = this.state;
    const required = this.getCurrentRequired(advisor_type);
    return required.every((p) => typeof details[p] === "boolean" ? true : !!details[p]);
  };

  getCurrentRequired = (advisor_type) => {
    const { details } = this.state;
    let result = ["name"];
    let notRequired = [
      "is_investment_manager",
      "is_life_insurance_affiliate",
      "chsnc_graduate",
      "certifications",
      "custodian",
      "broker_dealer_affiliation",
      "specialties",
      "affiliations",
      "all_states",
      "source"
    ];
    if (advisor_type === "law") notRequired.push("department", "role", "title", "licenses");
    if (advisor_type === "bank_trust") notRequired.push("title", "licenses", "states", "firm_size");
    if (advisor_type === "insurance") notRequired.push("department", "role", "title", "firm_size", "licenses");
    if (advisor_type === "ria") notRequired.push("department", "role", "title", "firm_size", "licenses");
    if (advisor_type === "healthcare") notRequired.push("department", "role", "title", "licenses", "states", "firm_size");
    if (advisor_type === "accountant") notRequired.push("department", "role", "title", "licenses", "states");
    if (advisor_type === "advocate") notRequired.push("department", "role", "licenses", "states", "firm_size");
    if (advisor_type === "education") notRequired.push("department", "role", "licenses", "states", "firm_size");
    if (advisor_type === "other") notRequired.push("department", "role", "licenses", "states", "firm_size");

    if (advisor_type === "law") result.push(...["name", "firm_size", "states"]);
    if (details.is_life_insurance_affiliate) result.push("primary_network");
    if (advisor_type === "bank_trust") result.push(...["name", "department", "role"]);
    if (advisor_type === "insurance") result.push(...["name", "states", "primary_network"]);
    if (advisor_type === "ria") result.push(...["name", "states"]);
    if (advisor_type === "healthcare") result.push(...["name"]);
    if (advisor_type === "accountant") result.push(...["name", "firm_size"]);
    if (advisor_type === "advocate") result.push(...["name", "title"]);
    if (advisor_type === "education") result.push(...["name", "title"]);
    if (advisor_type === "other") result.push(...["name", "title"]);
    return uniq(result.filter((r) => !notRequired.includes(r)));
  };

  render() {
    const {
      shouldBlockNavigation,
      is_loading,
      updatedProfileInfo,
      details,
      advisor_type,
      all_states,
      imageSrc,
      editing_logo,
      logo_error
    } = this.state;
    const { user } = this.props;
    return (
      <RowBody>
        <Prompt
          when={shouldBlockNavigation}
          message="You have unsaved changes to your profile, are you sure you want to leave?"
        />
        <RowHeader>
          <Row>
            <Col>General Partner Information</Col>
          </Row>
        </RowHeader>
        {user.partner_data.is_entity
          ? (
            <RowContentSection span={12}>
              <SettingsHeader style={editing_logo ? { marginBottom: "75px" } : {}}>
                <Col xs={12} sm={3} md={3} lg={2} xl={2}>
                  {editing_logo
                    ? (
                      <AvatarContainer>
                        <ViewContainer style={{ width: "150px", height: "150px", border: `2px dashed ${logo_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                          <AvatarImageCr
                            cancel={() => this.setState({ imageSrc: "", editing_logo: false, logo_error: "" })}
                            apply={(e) => this.onFileChange(e)}
                            isBack={false}
                            text={logo_error ? logo_error : "Drag a File or Click to Browse"}
                            errorHandler={(type) => this.throwAvatarError(type)}
                            iconStyle={{ marginBottom: "20px", width: "50px", height: "32px" }}
                            sliderConStyle={{ position: "relative", top: "25px", background: "#FFFFFF" }}
                            textStyle={{ fontSize: "12px" }}
                            actions={[
                              <Button key={0} style={{ display: "none" }}></Button>,
                              <Button key={1} small green nomargin marginbottom={5} widthPercent={100} outline>Apply</Button>
                            ]}
                          />
                        </ViewContainer>
                      </AvatarContainer>
                    )
                    : user.partner_data.logo ? <SettingsHeaderAvatar src={imageSrc || user.partner_data.logo} /> : <ReactAvatar size={100} name={user.partner_data.name} round />
                  }
                </Col>
                <SettingsHeaderInfo xs={12} sm={9} md={9} lg={10} xl={10}>
                  <SettingsHeaderLabel onClick={() => this.setState({ editing_logo: !editing_logo })}>
                    {!editing_logo
                      ? <Button small green nomargin margintop={isMobile ? 15 : 0} marginbottom={5}>Upload a Logo</Button>
                      : <Button small danger nomargin marginbottom={5}>Cancel</Button>
                    }
                  </SettingsHeaderLabel>
                  <SettingsHeaderName>{user.partner_data.name}</SettingsHeaderName>
                </SettingsHeaderInfo>
              </SettingsHeader>
            </RowContentSection>
          )
          : null
        }
        <RowContentSection span={12}>
          <RowBodyPadding gutter={50} paddingbottom={1}>
            <RowContentSection xs={12} sm={12} md={12} lg={6} xl={6}>
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
                      ...SelectStyles
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      fontSize: "13px",
                      paddingLeft: 0
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: "12px",
                      opacity: "0.5"
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
                  isDisabled={true}
                  placeholder="Choose an organization from the list or type a new one..."
                  clearValue={() => this.set("name", "")}
                  onCreateOption={(value) => this.set("name", value)}
                  onChange={(size) => this.set("name", size ? size.value : "")}
                  value={details.name ? { value: details.name, label: details.name } : null}
                  options={orderBy(organizations[advisor_type], ["value"], ["asc"])}
                  formatCreateLabel={(value) => `Click or press Enter to create new organization "${value}"`}
                  className="select-menu"
                  classNamePrefix="ht"
                />
              </InputWrapper>

              <InputWrapper>
                <InputLabel marginbottom={10}>Referral Source</InputLabel>
                <CreatableSelect
                  styles={{
                    container: (base, state) => ({
                      ...base,
                      opacity: state.isDisabled ? ".5" : "1",
                      backgroundColor: "transparent"
                    }),
                    control: (base) => ({
                      ...base,
                      ...SelectStyles
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      fontSize: "13px",
                      paddingLeft: 0
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: "12px",
                      opacity: "0.5"
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
                  menuPosition="absolute"
                  menuPlacement="top"
                  maxMenuHeight={200}
                  isClearable
                  isSearchable
                  name="source"
                  placeholder="How did you hear about Hope Trust? Choose from the list or type a new one..."
                  clearValue={() => this.set("source", "")}
                  onCreateOption={(value) => this.set("source", value)}
                  onChange={(choice) => this.set("source", choice ? choice.value : "")}
                  value={details.source ? { value: details.source, label: details.source } : null}
                  options={referral_sources}
                  formatCreateLabel={(value) => `Click or press Enter to create new referral source "${value}"`}
                  className="select-menu"
                  classNamePrefix="ht"
                />
              </InputWrapper>

              {["law", "accountant"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Firm Size</InputLabel>
                    <ReactSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                        menu: (base) => ({
                          ...base
                        }),
                        menuPortal: (base) => ({
                          ...base
                        })
                      }}
                      name="firm_size"
                      placeholder="What is the size of the firm you are associated with?"
                      onChange={(size) => this.set("firm_size", size.value)}
                      defaultValue={details.firm_size ? { value: details.firm_size, label: details.firm_size } : null}
                      options={firm_sizes}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["bank_trust"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Department</InputLabel>
                    <Input
                      type="text"
                      id="department"
                      value={details.department}
                      placeholder="What department do you work in?"
                      onChange={(event) => this.set(event.target.id, event.target.value)}
                      required
                    />
                  </InputWrapper>
                )
                : null
              }
              {["advocate", "education", "other"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Title</InputLabel>
                    <Input
                      type="text"
                      id="title"
                      value={details.title}
                      placeholder="Enter your title..."
                      onChange={(event) => this.set(event.target.id, event.target.value)}
                      required
                    />
                  </InputWrapper>
                )
                : null
              }
              {["insurance", "ria"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel>ChSNC Graduate?</InputLabel>
                    <Checkbox
                      checked={details.chsnc_graduate}
                      borderThickness={3}
                      size={2}
                      tickSize={2}
                      onChange={(is_checked) => this.set("chsnc_graduate", is_checked)}
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel>Do you have a life insurance affiliation?</InputLabel>
                    <Checkbox
                      checked={details.is_life_insurance_affiliate}
                      borderThickness={3}
                      size={2}
                      tickSize={2}
                      onChange={(is_checked) => this.set("is_life_insurance_affiliate", is_checked)}
                    />
                  </InputWrapper>
                )
                : null
              }
              {["insurance"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel>Do you provide investment management?</InputLabel>
                    <Checkbox
                      checked={details.is_investment_manager}
                      borderThickness={3}
                      size={2}
                      tickSize={2}
                      onChange={(is_checked) => this.set("is_investment_manager", is_checked)}
                    />
                  </InputWrapper>
                )
                : null
              }
              {["law", "insurance", "ria"].includes(advisor_type)
                ? (
                  <>
                    {!all_states
                      ? (
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Licensed States</InputLabel>
                          <ReactSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent"
                              }),
                              control: (base) => ({
                                ...base,
                                ...SelectStyles
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
                            isMulti
                            name="states"
                            placeholder="Choose which states you are licensed in..."
                            backspaceRemovesValue={true}
                            onChange={this.updateSelectInput}
                            defaultValue={details.states.map((s) => {
                              return { value: s, label: s };
                            })
                            }
                            options={default_states}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                        </InputWrapper>
                      )
                      : null
                    }
                    <InputWrapper>
                      <InputLabel>Are you licensed in all 50 states?</InputLabel>
                      <Checkbox
                        checked={all_states}
                        borderThickness={3}
                        size={2}
                        tickSize={2}
                        onChange={(is_checked) => {
                          this.setState({ all_states: is_checked });
                          if (is_checked) {
                            this.set("states", [...US_STATES.map((s) => s.name)]);
                          } else {
                            this.resetStates();
                          }
                        }}
                      />
                    </InputWrapper>
                  </>
                )
                : null
              }
              {["law"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Specialty</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      isMulti
                      name="specialties"
                      placeholder="Choose from the list or enter a new specialty..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={details.specialties.map((s) => {
                        return { value: s, label: s };
                      })
                      }
                      options={law_specialties}
                      formatCreateLabel={(value) => `Click or press Enter to create new specialty "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["law"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Affiliations</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      isMulti
                      name="affiliations"
                      placeholder="Choose from the list or enter a new affiliation..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={details.affiliations.map((s) => {
                        return { value: s, label: s };
                      })
                      }
                      options={law_affiliations}
                      formatCreateLabel={(value) => `Click or press Enter to create new affiliation "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Certifications</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      isMulti
                      name="certifications"
                      placeholder="Choose from the list or enter a new certification..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={details.certifications.map((s) => {
                        return { value: s, label: s };
                      })
                      }
                      options={ria_certifications}
                      formatCreateLabel={(value) => `Click or press Enter to create new certification "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria", "insurance"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Licensing</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      isMulti
                      name="licenses"
                      placeholder="Choose from the list or enter a new license..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={details.licenses.map((s) => {
                        return { value: s, label: s };
                      })
                      }
                      options={insurance_licensing}
                      formatCreateLabel={(value) => `Click or press Enter to create new license "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria", "insurance"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>{details.is_life_insurance_affiliate || ["insurance"].includes(advisor_type) ? <RequiredStar>*</RequiredStar> : null} Primary Life Insurance Network</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      name="primary_network"
                      placeholder="Choose from the list or enter a new network..."
                      clearValue={() => this.set("primary_network", "")}
                      onCreateOption={(value) => this.set("primary_network", value)}
                      onChange={(val) => this.set("primary_network", val ? val.value : "")}
                      value={details.primary_network ? { value: details.primary_network, label: details.primary_network } : null}
                      options={ins_networks}
                      formatCreateLabel={(value) => `Click or press Enter to create new network "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Custodian?</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      name="custodian"
                      placeholder="Choose from the list or enter a new custodian..."
                      clearValue={() => this.set("custodian", "")}
                      onCreateOption={(value) => this.set("custodian", value)}
                      onChange={(val) => this.set("custodian", val ? val.value : "")}
                      value={details.custodian ? { value: details.custodian, label: details.custodian } : null}
                      options={cus_banks}
                      formatCreateLabel={(value) => `Click or press Enter to create new custodian "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["ria", "insurance"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Broker Dealer Affiliation</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      name="broker_dealer_affiliation"
                      placeholder="Choose from the list or enter a new broker dealer..."
                      clearValue={() => this.set("broker_dealer_affiliation", "")}
                      onCreateOption={(value) => this.set("broker_dealer_affiliation", value)}
                      onChange={(val) => this.set("broker_dealer_affiliation", val ? val.value : "")}
                      value={details.broker_dealer_affiliation ? { value: details.broker_dealer_affiliation, label: details.broker_dealer_affiliation } : null}
                      options={br_dealers}
                      formatCreateLabel={(value) => `Click or press Enter to create new broker dealer "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["insurance"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Certifications</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                      isMulti
                      name="certifications"
                      placeholder="Choose from the list or enter a new certification..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={details.certifications.map((s) => {
                        return { value: s, label: s };
                      })
                      }
                      options={insurance_certifications}
                      formatCreateLabel={(value) => `Click or press Enter to create new certification "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
              {["bank_trust"].includes(advisor_type)
                ? (
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Role</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent",
                          zIndex: 1001
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
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
                          ...base,
                          zIndex: 1001
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 1001
                        })
                      }}
                      isClearable
                      isSearchable
                      name="role"
                      placeholder="What is your role at your Bank or Trust Company? Choose from the list or type a new one..."
                      clearValue={() => this.set("role", "")}
                      onCreateOption={(value) => this.set("role", value)}
                      onChange={(size) => this.set("role", size ? size.value : "")}
                      value={details.role ? { value: details.role, label: details.role } : null}
                      options={bank_trust_roles}
                      formatCreateLabel={(value) => `Click or press Enter to create new role "${value}"`}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  </InputWrapper>
                )
                : null
              }
            </RowContentSection>
            <RowContentSection xs={12} sm={12} md={12} lg={6} xl={6}>
              {/* // second col */}
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection>
          <SettingsButtonContainer span={12}>
            <SaveProfileButton disabled={!Object.keys(updatedProfileInfo).length} type="button" onClick={() => this.saveSettings()} small nomargin primary green>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Profile"}</SaveProfileButton>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  updatePartner: (updates) => dispatch(updatePartner(updates)),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  verifyAttribute: (attribute) => dispatch(authenticated.verifyAttribute(attribute)),
  confirmAttributeVerification: (attribute, code) => dispatch(authenticated.confirmAttributeVerification(attribute, code)),
});
export default connect(mapStateToProps, dispatchToProps)(GeneralPartnerSettingsForm);
