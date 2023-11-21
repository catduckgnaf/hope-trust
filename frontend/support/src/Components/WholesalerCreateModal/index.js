import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { closeCreateWholesaleModal, createWholesaler, updateWholesaler } from "../../store/actions/wholesale";
import { showNotification } from "../../store/actions/notification";
import { isString, merge } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "react-simple-checkbox";
import ReactSelect, { createFilter, components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { getHelloSignDownloadLink } from "../../store/actions/hello-sign";
import {
  BenefitsModuleMainContent,
  ViewBenefitsModuleModalInner,
  ViewBenefitsModuleModalInnerHeader,
  ViewBenefitsModuleModalInnerLogo,
  ViewBenefitsModuleModalInnerLogoOverlay,
  ViewBenefitsModuleModalInnerLogoContainer,
  ViewBenefitsModuleModalInnerLogoOverlayIcon,
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  RequiredStar,
  ViewContainer,
  SelectStyles,
  InputHint
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import moment from "moment";
import { isValidDomain, WEBMAIL_PROVIDER_DOMAINS } from "../../utilities";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class WholesalerCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateWholesaleModal: PropTypes.func.isRequired,
    createWholesaler: PropTypes.func.isRequired,
    updateWholesaler: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults, customer_support } = props;
    let users = customer_support.users.filter((u) => (["benefits"].includes(u.type) && !u.is_account_owner)).map((user) => {
      return { value: user.cognito_id, label: `${user.first_name} ${user.last_name}`, email: user.email };
    });
    const associated = defaults.cognito_id ? { value: defaults.cognito_id, label: `${defaults.first_name} ${defaults.last_name}`, email: defaults.email } : null;
    if (associated) users.unshift(associated);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      is_downloading_agreement: false,
      updates: {
        benefits_config: {},
        wholesaler: {}
      },
      account: {
        benefits_config: {
          cognito_id: defaults.cognito_id || "",
          logo: defaults.logo || "",
          contract_signed: defaults.contract_signed || false,
          contract_signed_on: defaults.contract_signed_on,
          signature_id: defaults.signature_id,
          signature_request_id: defaults.signature_request_id
        },
        wholesaler: {
          cognito_id: defaults.cognito_id || "",
          name: defaults.name || "",
          domains: defaults.domains || []
        }
      },
      updated_user: false,
      associated,
      editing_logo: false,
      imageSrc: "",
      logo_error: "",
      users
    };
  }

  update = (key, value, object) => {
    const { account, updates } = this.state;
    const newState = merge(account[object], { [key]: value });
    let updated = merge(updates[object], { [key]: isString(value) ? value.replace("'", "’") : value });
    if (updated[object] && updated[object].hasOwnProperty(key) && !value && typeof value !== "boolean") delete updated[object][key];
    this.setState({ account: { ...account, [object]: newState }, updates: { ...updates, [object]: updated } });
  };

  updateDomains = (key, value, object) => {
    const { account, updates } = this.state;
    const new_account = {
      ...account,
      [object]: {
        ...account[object],
        [key]: value
      }
    };
    this.setState({
      account: new_account,
      updates: {
        ...updates,
        [object]: {
          ...updates[object],
          [key]: value
        }
      }
    });
  };

  onFileChange = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      event.type === "image/png" ? "PNG" : "JPEG",
      100,
      0,
      (uri) => {
        this.update("logo", uri, "benefits_config");
        this.setState({ imageSrc: uri, logo_error: "", editing_logo: false });
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
    }, 3000);
  };

  createRecord = async () => {
    const { updates } = this.state;
    const { createWholesaler, closeCreateWholesaleModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const created = await createWholesaler(updates);
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Created", "Account was successfully created.");
      closeCreateWholesaleModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateRecord = async () => {
    const { updates, updated_user } = this.state;
    const { updateWholesaler, closeCreateWholesaleModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateWholesaler(defaults.id, updates, defaults.cognito_id, (updated_user ? updates.wholesaler.cognito_id : false), defaults.config_id);
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Updated", "Account was successfully updated.");
      closeCreateWholesaleModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state.account.wholesaler[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.updateDomains([actionOptions.name], difference, "wholesaler");
        break;
      case "select-option":
        this.updateDomains([actionOptions.name], value.map((e) => e.value), "wholesaler");
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.updateDomains([actionOptions.name], [...this.state.account.wholesaler[actionOptions.name], new_option.value], "wholesaler");
        break;
      case "clear":
        this.updateDomains([actionOptions.name], [], "wholesaler");
        break;
      default:
        break;
    }
  };

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.setState({ is_downloading_agreement: true });
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.setState({ is_downloading_agreement: false });
  };

  render() {
    const { is_open, closeCreateWholesaleModal, defaults, updating, viewing, hello_sign } = this.props;
    const { loaderShow, loaderMessage, logo_error, editing_logo, imageSrc, users, associated, account, updates, is_downloading_agreement } = this.state;
    let flat = {};
    let merged = Object.assign(flat, ...Object.keys(updates).map((reg_key) => updates[reg_key]));
    const has_downloadable_contract = (defaults.signature_request_id && defaults.contract_signed);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateWholesaleModal()} center>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Benefits Agreement.pdf">{null}</a>
        <ViewBenefitsModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0}>
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewBenefitsModuleModalInnerLogo editing={editing_logo ? 1 : 0} span={12}>
              {!editing_logo
                ? (
                  <ViewBenefitsModuleModalInnerLogoContainer>
                    <ViewBenefitsModuleModalInnerLogoOverlay onClick={() => this.setState({ editing_logo: true })}>
                      <ViewBenefitsModuleModalInnerLogoOverlayIcon>
                        <FontAwesomeIcon icon={["fad", "camera"]} />
                      </ViewBenefitsModuleModalInnerLogoOverlayIcon>
                    </ViewBenefitsModuleModalInnerLogoOverlay>
                    <ReactAvatar size={100} src={imageSrc || account.benefits_config.logo} name={(account.wholesaler.first_name && account.wholesaler.last_name) ? `${account.wholesaler.first_name} ${account.wholesaler.last_name}` : "Hope Trust"} round />
                  </ViewBenefitsModuleModalInnerLogoContainer>
                )
                : (
                  <ViewContainer style={{ margin: "auto", position: "relative", width: editing_logo ? "200px" : "100px", height: editing_logo ? "200px" : "100px", border: `2px dashed ${logo_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                    <AvatarImageCr
                      cancel={() => this.setState({ imageSrc: "", editing_logo: false, logo_error: "" })}
                      apply={(e) => this.onFileChange(e)}
                      isBack={false}
                      text={logo_error ? logo_error : "Drag a File or Click to Browse"}
                      errorHandler={(type) => this.throwAvatarError(type)}
                      iconStyle={{ marginBottom: "5px", width: "50px", height: "32px" }}
                      sliderConStyle={{ position: "relative", top: "25px", background: "#FFFFFF" }}
                      textStyle={{ fontSize: "12px" }}
                      actions={[
                        <Button key={0} style={{ display: "none" }}></Button>,
                        <Button key={1} small rounded green nomargin marginbottom={5} widthPercent={100} outline>Apply</Button>
                      ]}
                    />
                  </ViewContainer>
                )
              }
            </ViewBenefitsModuleModalInnerLogo>
          </Col>
          {editing_logo
            ? (
              <Col span={12} style={{textAlign: "center", marginTop: "25px"}}>
                <Button onClick={() => this.setState({ imageSrc: "", editing_logo: false, logo_error: "" })} small rounded danger nomargin marginbottom={5} outline>Cancel</Button>
              </Col>
            )
            : null
          }
          <BenefitsModuleMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewBenefitsModuleModalInnerHeader span={12}>New Wholesale Account</ViewBenefitsModuleModalInnerHeader>
                : <ViewBenefitsModuleModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Wholesale Account</ViewBenefitsModuleModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Wholesale Account Name:</InputLabel>
                  <Input type="text" value={account.wholesaler.name} onChange={(event) => this.update("name", event.target.value, "wholesaler")}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Associated User</InputLabel>
                  <ReactSelect
                    components={{ Option }}
                    filterOption={createFilter({ ignoreAccents: false })}
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
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
                        zIndex: 9999
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontWeight: 300,
                        fontSize: "13px",
                        lineHeight: "13px"
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
                    name="cognito_id"
                    placeholder="Choose a user from the list..."
                    onChange={(selected) => selected ? this.setState({
                      associated: selected,
                      updated_user: selected.value !== defaults.cognito_id
                    }, () => this.update("cognito_id", selected.value, "wholesaler")) : null}
                    value={associated}
                    options={users}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              {associated
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Valid Domains</InputLabel>
                      <CreatableSelect
                        components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "white",
                            zIndex: 988,
                            padding: "0 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #EBEDEE"
                          }),
                          multiValue: (base, state) => ({
                            ...base,
                            backgroundColor: state.data.isFixed ? "gray" : base.backgroundColor,
                            borderRadius: "15px",
                            padding: "2px 10px"
                          }),
                          multiValueLabel: (base, state) => {
                            return state.data.isFixed
                              ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
                              : base;
                          },
                          multiValueRemove: (base, state) => {
                            return state.data.isFixed ? { ...base, display: "none" } : base;
                          },
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
                            ...SelectStyles,
                            borderBottom: "none"
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
                        name="domains"
                        placeholder="Start typing a domain and hit the Enter key..."
                        backspaceRemovesValue={false}
                        onChange={this.updateSelectInput}
                        defaultValue={account.wholesaler.domains.map((domain) => {
                          return { value: domain, label: domain };
                        })}
                        value={account.wholesaler.domains.map((domain) => {
                          const user_domain = associated.email.split("@")[1];
                          const isFixed = (user_domain === domain && !WEBMAIL_PROVIDER_DOMAINS.includes(domain));
                          if (!WEBMAIL_PROVIDER_DOMAINS.includes(domain)) return { value: domain, label: domain, isFixed };
                          return null;
                        })}
                        options={[]}
                        isDisabled={viewing}
                        className="select-menu"
                        classNamePrefix="ht"
                        noOptionsMessage={() => null}
                        isValidNewOption={(value) => value && isValidDomain(value)}
                        formatCreateLabel={(value) => `Click or press Enter to create new domain "${value}"`}
                      />
                      <InputHint margintop={5}>You must add at least one valid domain.</InputHint>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Contracts Signed?</InputLabel>
                  <Checkbox
                    checked={account.benefits_config.contract_signed}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => this.update("contract_signed", is_checked, "benefits_config")}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel capitalize>Contracts Signed On</InputLabel>
                  <Input
                    type="date"
                    id="contract_signed_on"
                    value={moment(account.benefits_config.contract_signed_on).format("YYYY-MM-DD")}
                    min="1900-01-01"
                    max={moment().format("YYYY-MM-DD")}
                    onChange={(event) => this.update(event.target.id, event.target.value, "benefits_config")} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel capitalize>Signature ID</InputLabel>
                  <Input
                    type="text"
                    id="signature_id"
                    value={account.benefits_config.signature_id}
                    onChange={(event) => this.update(event.target.id, event.target.value, "benefits_config")} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel capitalize>Signature Request ID</InputLabel>
                  <Input
                    type="text"
                    id="signature_request_id"
                    value={account.benefits_config.signature_request_id}
                    onChange={(event) => this.update(event.target.id, event.target.value, "benefits_config")} />
                </InputWrapper>
              </Col>
              {has_downloadable_contract
                ? (
                  <Col span={12}>
                    <Button marginbottom={25} nomargin rounded outline blue onClick={() => this.getHelloSignDownloadLink(defaults.signature_request_id)}>{is_downloading_agreement ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Download Agreement"}</Button>
                  </Col>
                )
                : null
              }

              <Col span={12}>
                {!updating && !viewing
                  ? <Button disabled={!merged.name || !merged.cognito_id} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Account</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!Object.keys(merged).length} type="button" onClick={() => this.updateRecord()} outline green rounded nomargin>Update Account</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateWholesaleModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </BenefitsModuleMainContent>
        </ViewBenefitsModuleModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  customer_support: state.customer_support,
  hello_sign: state.hello_sign,
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  closeCreateWholesaleModal: () => dispatch(closeCreateWholesaleModal()),
  createWholesaler: (data) => dispatch(createWholesaler(data)),
  updateWholesaler: (id, updates, old_cognito_id, new_cognito_id, config_id) => dispatch(updateWholesaler(id, updates, old_cognito_id, new_cognito_id, config_id)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(WholesalerCreateModal);
