import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { closeCreateGroupModal, createGroup, updateGroup } from "../../store/actions/groups";
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
  ViewBenefitsModuleModalInnerLogoOverlayIcon
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

class GroupCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateGroupModal: PropTypes.func.isRequired,
    createGroup: PropTypes.func.isRequired,
    updateGroup: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults, customer_support, agents, retail, wholesale } = props;
    let users = customer_support.users.filter((u) => (["benefits"].includes(u.type) && !u.is_account_owner)).map((user) => {
      return { value: user.cognito_id, label: `${user.first_name} ${user.last_name}`, email: user.email };
    });
    const agent_accounts = agents.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}`, parent_id: a.parent_id };
    });
    const retail_accounts = retail.list.map((r) => {
      return { value: r.cognito_id, label: r.name, data: r };
    });
    const wholesale_accounts = wholesale.list.map((w) => {
      return { value: w.id, label: w.name, config_id: w.config_id };
    });
    const current_agent = agents.list.find((a) => a.cognito_id === defaults.parent_id);
    const current_retailer = current_agent ? retail.list.find((r) => r.cognito_id === current_agent.parent_id) : null;
    const current_wholesaler = current_retailer ? wholesale.list.find((w) => w.id === defaults.wholesale_id) : null;
    const associated = defaults.cognito_id ? { value: defaults.cognito_id, label: `${defaults.first_name} ${defaults.last_name}`, email: defaults.email } : null;
    if (associated) users.unshift(associated);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      is_downloading_agreement: false,
      updates: {
        benefits_config: {},
        group: {}
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
        group: {
          parent_id: defaults.parent_id,
          cognito_id: defaults.cognito_id || "",
          name: defaults.name || "",
          domains: defaults.domains || [],
          wholesale_id: defaults.wholesale_id
        }
      },
      updated_agent: false,
      updated_user: false,
      associated,
      agent_accounts,
      retail_accounts,
      wholesale_accounts,
      agent_account: defaults.parent_id && current_agent ? { value: defaults.parent_id, label: `${current_agent.first_name} ${current_agent.last_name}`, parent_id: current_agent.parent_id } : null,
      retail_account: current_retailer ? { value: current_retailer.cognito_id, label: current_retailer.name, data: current_retailer } : null,
      wholesale_account: (current_retailer && current_wholesaler) ? { value: current_wholesaler.id, label: current_wholesaler.name } : null,
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
    const { createGroup, closeCreateGroupModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const created = await createGroup(updates);
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Created", "Account was successfully created.");
      closeCreateGroupModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateRecord = async () => {
    const { updates, agent_account, updated_agent, updated_user } = this.state;
    const { updateGroup, closeCreateGroupModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateGroup(defaults.id, {
      updates,
      old_agent_id: (defaults.parent_id === defaults.cognito_id) ? false : defaults.parent_id,
      new_agent_id: (updated_agent ? agent_account.value : false),
      old_cognito_id: defaults.cognito_id,
      new_cognito_id: (updated_user ? updates.group.cognito_id : false),
      config_id: defaults.config_id
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Updated", "Account was successfully updated.");
      closeCreateGroupModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state.account.group[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.updateDomains([actionOptions.name], difference, "group");
        break;
      case "select-option":
        this.updateDomains([actionOptions.name], value.map((e) => e.value), "group");
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.updateDomains([actionOptions.name], [...this.state.account.group[actionOptions.name], new_option.value], "group");
        break;
      case "clear":
        this.updateDomains([actionOptions.name], [], "group");
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
    const { is_open, closeCreateGroupModal, defaults, updating, viewing, hello_sign } = this.props;
    const { loaderShow, loaderMessage, logo_error, editing_logo, imageSrc, agent_accounts, retail_accounts, wholesale_accounts, agent_account, retail_account, wholesale_account, associated, account, updates, is_downloading_agreement } = this.state;
    let { users } = this.state;
    let flat = {};
    let merged = Object.assign(flat, ...Object.keys(updates).map((reg_key) => updates[reg_key]));
    const has_downloadable_contract = (defaults.signature_request_id && defaults.contract_signed);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateGroupModal()} center>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Benefits Agreement.pdf">{null}</a>
        <ViewBenefitsModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
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
                    <ReactAvatar size={100} src={imageSrc || account.benefits_config.logo} name={(account.group.first_name && account.group.last_name) ? `${account.group.first_name} ${account.group.last_name}` : "Hope Trust"} round />
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
                ? <ViewBenefitsModuleModalInnerHeader span={12}>New Group Account</ViewBenefitsModuleModalInnerHeader>
                : <ViewBenefitsModuleModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Group Account</ViewBenefitsModuleModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Group Account Name:</InputLabel>
                  <Input readOnly={viewing} type="text" value={account.group.name} onChange={(event) => this.update("name", event.target.value, "group")} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Associated Agent</InputLabel>
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
                        zIndex: 9999
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
                    name="agent_account"
                    placeholder="Choose a agent from the list..."
                    onChange={(select_account) => {
                      const found_retail_account = select_account ? retail_accounts.find((r) => r.value === select_account.parent_id) : false;
                      if (select_account) {
                        let config = { agent_account: select_account, updated_agent: select_account.value !== defaults.parent_id };
                        if (found_retail_account) config.retail_account = found_retail_account;
                        this.setState(config, () => this.update("parent_id", select_account.value, "group"))
                      }
                    }}
                    value={agent_account}
                    options={agent_accounts}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              {agent_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Retail Account</InputLabel>
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
                            zIndex: 9999
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
                        isDisabled={!!retail_account || viewing}
                        name="retail_account"
                        placeholder="Choose a retail account from the list..."
                        onChange={(select_account) => select_account ? this.setState({ retail_account: select_account }) : null}
                        value={retail_account}
                        options={retail_accounts}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {retail_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Wholesale Account</InputLabel>
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
                            zIndex: 9999
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
                        isDisabled={viewing}
                        name="wholesale_account"
                        placeholder="Choose a wholesale account from the list..."
                        onChange={(select_account) => select_account ? this.setState({ wholesale_account: select_account }, () => this.update("wholesale_id", Number(select_account.value), "group")) : null}
                        value={wholesale_account}
                        options={wholesale_accounts.filter((w) => {
                          if (retail_account && retail_account.data.approved_wholesalers && retail_account.data.approved_wholesalers.includes(w.config_id)) return w;
                          return false;
                        }).filter((e) => e)}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
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
                        zIndex: 9999
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
                    onChange={(selected_account) => {
                      if (selected_account) {
                        this.setState({
                          associated: selected_account,
                          updated_user: selected_account.value !== defaults.cognito_id
                        }, () => this.update("cognito_id", selected_account.value, "group"));
                      }
                    }}
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
                        defaultValue={account.group.domains.map((domain) => {
                          return { value: domain, label: domain };
                        })}
                        value={account.group.domains.map((domain) => {
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
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <InputWrapper>
                  <InputLabel capitalize>Contracts Signed?</InputLabel>
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
                  ? <Button disabled={!Object.keys(merged).length || !associated} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Account</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!Object.keys(merged).length && !associated} type="button" onClick={() => this.updateRecord()} outline green rounded nomargin>Update Account</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateGroupModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
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
  closeCreateGroupModal: () => dispatch(closeCreateGroupModal()),
  createGroup: (data) => dispatch(createGroup(data)),
  updateGroup: (ID, update_data) => dispatch(updateGroup(ID, update_data)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(GroupCreateModal);