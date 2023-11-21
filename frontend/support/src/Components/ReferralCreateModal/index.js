import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { allowNumbersOnly, allowNumbersAndDecimalsOnly, isValidDomain, limitNumberRange, limitInput, default_features } from "../../utilities";
import { advisor_types } from "../../store/actions/partners";
import { closeCreateReferralModal, createReferral, updateReferral, durations } from "../../store/actions/referral";
import { showNotification } from "../../store/actions/notification";
import CreatableSelect from "react-select/creatable";
import ReactSelect from "react-select";
import { uniqBy, sortBy } from "lodash";
import {
  ReferralMainContent,
  ViewReferralModalInner,
  ViewReferralModalInnerLogo,
  ViewReferralModalInnerLogoImg,
  ViewReferralModalInnerHeader,
  ReferralHint,
  ReferralHintPadding,
  ReferralHintInner
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  InputHint,
  Input,
  CheckBoxInput,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

class ReferralCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateReferralModal: PropTypes.func.isRequired,
    createReferral: PropTypes.func.isRequired,
    updateReferral: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, referral } = this.props;
    let all_domains = [];
    const prefixes = referral.list.map((ref) => {
      return { label: ref.prefix, value: ref.prefix };
    });
    const organizations = referral.list.map((r) => {
      return { label: capitalize(r.name), value: r.name };
    });
    referral.list.forEach((r) => {
      r.domains.forEach((d) => all_domains.push({ label: d, value: d }));
    });
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      type: defaults.type || "",
      prefix: defaults.prefix || "",
      hubspot_company_id: defaults.hubspot_company_id || "",
      domains: defaults.domains || [],
      amount_off: defaults.amount_off || null,
      percent_off: defaults.percent_off || null,
      duration: defaults.duration || "once",
      duration_in_months: defaults.duration_in_months || null,
      max_redemptions: defaults.max_redemptions || null,
      name: defaults.name || "",
      new_accounts: defaults.new_accounts || false,
      myto_allowed: defaults.myto_allowed || false,
      used_prefixes: uniqBy(prefixes, "label"),
      organizations,
      all_domains: sortBy(all_domains, ["label"]),
      limit_use: defaults && !!defaults.max_redemptions ? true : false,
      features: defaults.features ? defaults.features : default_features.filter((default_feature) => default_feature.default).map((default_feature) => default_feature.value)
    };
  }

  createReferral = async () => {
    const { type, prefix, domains, amount_off, percent_off, duration, duration_in_months, max_redemptions, name, new_accounts, myto_allowed, features, hubspot_company_id } = this.state;
    const { createReferral, closeCreateReferralModal, showNotification } = this.props;
    if (name && duration && (amount_off || percent_off) && prefix && type) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await createReferral({
        type,
        prefix,
        domains: domains.length ? domains.map((d) => isValidDomain(d) ? d.toLowerCase() : false).filter((e) => e) : [],
        amount_off: amount_off ? amount_off : null,
        percent_off: percent_off ? percent_off : null,
        duration,
        duration_in_months: duration_in_months ? duration_in_months : null,
        max_redemptions: max_redemptions ? max_redemptions : null,
        name: name ? name.replace("'", "’") : null,
        hubspot_company_id,
        new_accounts,
        myto_allowed,
        features
      });
      if (created.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Referral Created", "Your referral was successfully created.");
        closeCreateReferralModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", created.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill all required fields.");
    }
  };

  updateReferral = async () => {
    const { type, prefix, domains, amount_off, percent_off, duration, duration_in_months, max_redemptions, name, new_accounts, myto_allowed, features, hubspot_company_id } = this.state;
    const { updateReferral, closeCreateReferralModal, showNotification, defaults } = this.props;
    if (name && duration && (amount_off || percent_off) && prefix && type) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateReferral(defaults.id, {
        type,
        prefix,
        domains: domains.length ? domains.map((d) => isValidDomain(d) ? d.toLowerCase() : false).filter((e) => e) : [],
        amount_off: amount_off ? amount_off : null,
        percent_off: percent_off ? percent_off : null,
        duration,
        duration_in_months: duration_in_months ? duration_in_months : null,
        max_redemptions: max_redemptions ? max_redemptions : null,
        name: name ? name.replace("'", "’") : null,
        hubspot_company_id,
        new_accounts,
        myto_allowed,
        features
      });
      if (updated.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Referral Updated", "Your referral was successfully updated.");
        closeCreateReferralModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", updated.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill all required fields.");
    }
  };

  handleCreatePrefix = (value) => {
    this.setState({ prefix: value });
  };

  handleCreateOrg = (value) => {
    this.setState({ name: value, prefix: this.getPrefix(value) });
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name]: difference });
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

  getPrefix = (name) => {
    name = capitalize(name);
    if (name.length > 35) return name.match(/[A-Z]/g).join("").toUpperCase();
    return name.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_").toUpperCase();
  };

  render() {
    const { creating_referral, closeCreateReferralModal, updating, viewing, defaults } = this.props;
    const { loaderShow, loaderMessage, all_domains, organizations, used_prefixes, type, prefix, domains, amount_off, percent_off, duration, duration_in_months, max_redemptions, name, new_accounts, myto_allowed, limit_use, features, hubspot_company_id } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creating_referral} onClose={() => closeCreateReferralModal()} center>
        <ViewReferralModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewReferralModalInnerLogo span={12}>
              <ViewReferralModalInnerLogoImg alt="HopeTrust Document Logo" src={icons.colorLogoOnly} />
            </ViewReferralModalInnerLogo>
          </Col>
          <ReferralMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewReferralModalInnerHeader span={12}>New Organization</ViewReferralModalInnerHeader>
                : <ViewReferralModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Organization</ViewReferralModalInnerHeader>
              }
              {updating
                ? (
                  <ReferralHint span={12}>
                    <ReferralHintPadding>
                      <ReferralHintInner>
                        Note: Updating this record will not retroactively update all past partner referral codes. Referral codes created after this update will use the updated configuration.
                      </ReferralHintInner>
                    </ReferralHintPadding>
                  </ReferralHint>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Will this referral be limited to a certain number of redemptions?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={limit_use}
                    onChange={(event) => this.setState({ limit_use: event.target.checked, max_redemptions: event.target.checked ? max_redemptions : null })}
                    type="checkbox"
                    id="limit_use"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>
              {limit_use
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Max Redemptions:</InputLabel>
                      <Input onKeyPress={allowNumbersOnly} readOnly={viewing} onChange={(event) => this.setState({ max_redemptions: event.target.value })} min={0} max={100} type="number" value={max_redemptions} placeholder="Add a max redemption..." />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Hubspot Company ID:</InputLabel>
                  <Input readOnly={viewing} onChange={(event) => this.setState({ hubspot_company_id: event.target.value })} type="text" value={hubspot_company_id} placeholder="Add a Hubspot company ID..." />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Organization</InputLabel>
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
                    name="name"
                    placeholder="Choose an organization, or create a new one..."
                    clearValue={() => this.setState({ name: "" })}
                    onChange={(val) => this.setState({ name: val ? val.value : "", prefix: val ? this.getPrefix(val.value) : null })}
                    value={name ? { value: name, label: name } : null}
                    options={organizations}
                    onCreateOption={(value) => this.handleCreateOrg(value)}
                    formatCreateLabel={(value) => `Click or press Enter to create new organization "${value}"`}
                    isDisabled={viewing || (updating && defaults.status === "active")}
                  />
                  {updating && defaults.status === "active"
                    ? <InputHint>You cannot update this organization name. Please create a new referral configuration with a new organization.</InputHint>
                    : null
                  }
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Prefix</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 999
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 999
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
                        zIndex: 999
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
                    name="prefix"
                    placeholder="Choose a prefix, or create a new one..."
                    clearValue={() => this.setState({ prefix: "" })}
                    onChange={(val) => this.setState({ prefix: val ? val.value : "" })}
                    value={prefix ? { value: prefix.toUpperCase(), label: prefix.toUpperCase() } : null}
                    options={used_prefixes}
                    onCreateOption={(value) => this.handleCreatePrefix(value)}
                    formatCreateLabel={(value) => `Click or press Enter to create new prefix "${value}"`}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              {!percent_off
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>{amount_off && !percent_off ? <RequiredStar>*</RequiredStar> : null} Amount Off:</InputLabel>
                      <Input onFocus={() => this.setState({ amount_off: ""})} min={0} max={4000} onKeyUp={(e) => limitInput(e, 3)} onBlur={(e) => limitNumberRange(e, 0, 4000)} onKeyPress={allowNumbersAndDecimalsOnly} readOnly={viewing} onChange={(event) => this.setState({ amount_off: event.target.value })} type="number" value={amount_off} placeholder="Add an amount off..." />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {!amount_off
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>{percent_off && !amount_off ? <RequiredStar>*</RequiredStar> : null} Percent Off:</InputLabel>
                      <Input onFocus={() => this.setState({ percent_off: ""})} step={0.01} min={0.01} max={100} onKeyUp={(e) => limitInput(e, 2)} onBlur={(e) => limitNumberRange(e, 0.01, 100)} onKeyPress={allowNumbersAndDecimalsOnly} readOnly={viewing} onChange={(event) => this.setState({ percent_off: event.target.value })} type="number" value={percent_off} placeholder="Add a percent off..." />
                      <InputHint>Minimum percent off is 0.01%</InputHint>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Duration</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 998
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 998
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
                        zIndex: 998
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
                    name="duration"
                    placeholder="Choose a duration..."
                    clearValue={() => this.setState({ duration: "" })}
                    onChange={(val) => this.setState({ duration: val ? val.value : "", duration_in_months: val.value !== "repeating" ? null : duration_in_months })}
                    value={duration ? { value: duration, label: capitalize(duration) } : null}
                    options={durations}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              {duration === "repeating"
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Duration In Months:</InputLabel>
                      <Input onKeyPress={allowNumbersOnly} readOnly={viewing} onChange={(event) => this.setState({ duration_in_months: event.target.value })} min={0} max={12} type="number" value={duration_in_months} placeholder="Add a duration in months..." />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Type</InputLabel>
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
                    isClearable
                    isSearchable
                    name="type"
                    placeholder="Choose a referral type..."
                    clearValue={() => this.setState({ type: "" })}
                    onChange={(val) => this.setState({ type: val ? val.value : "" })}
                    value={type ? { value: type, label: advisor_types.find((t) => t.name === type).alias } : null}
                    options={advisor_types.map((a) => {
                      return { value: a.name, label: a.alias };
                    })}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Client Features</InputLabel>
                  <ReactSelect
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
                    isMulti
                    name="features"
                    placeholder="Choose from the list or type a new one...(select all that apply)"
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={default_features.filter((e) => features.includes(e.value))}
                    options={default_features}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>Note: Only these features will be given to the client who uses this referral code.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Domains</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 996
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
                        zIndex: 996
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 996
                      })
                    }}
                    isClearable
                    isSearchable
                    isMulti
                    name="domains"
                    placeholder="Choose which domains can use this referral..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={domains.map((s) => {
                      return { value: s, label: s };
                    })
                    }
                    options={all_domains}
                    formatCreateLabel={(value) => `Click or press Enter to create new domain "${value}"`}
                  />
                  {!domains.length
                    ? <InputHint error>This referral record will be inactive until a domain is added.</InputHint>
                    : null
                  }
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>This Referral allows the partner to create new accounts</InputLabel>
                  <CheckBoxInput
                    defaultChecked={new_accounts}
                    onChange={(event) => this.setState({ new_accounts: event.target.checked })}
                    type="checkbox"
                    id="new_accounts"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>This Referral grants MYTO permissions</InputLabel>
                  <CheckBoxInput
                    defaultChecked={myto_allowed}
                    onChange={(event) => this.setState({ myto_allowed: event.target.checked })}
                    type="checkbox"
                    id="myto_allowed"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                {!updating && !viewing
                  ? <Button type="button" onClick={() => this.createReferral()} outline green rounded nomargin>Create Organization</Button>
                  : null
                }
                {updating
                  ? <Button type="button" onClick={() => this.updateReferral()} outline green rounded nomargin>Update Organization</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateReferralModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </ReferralMainContent>
        </ViewReferralModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  referral: state.referral
});
const dispatchToProps = (dispatch) => ({
  closeCreateReferralModal: () => dispatch(closeCreateReferralModal()),
  createReferral: (question) => dispatch(createReferral(question)),
  updateReferral: (id, updates) => dispatch(updateReferral(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(ReferralCreateModal);
