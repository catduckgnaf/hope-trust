import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { closeCreateTeamModal, createTeam, updateTeam } from "../../store/actions/teams";
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

class TeamCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateTeamModal: PropTypes.func.isRequired,
    createTeam: PropTypes.func.isRequired,
    updateTeam: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults, customer_support, agents, groups } = props;
    let users = customer_support.users.filter((u) => (["benefits"].includes(u.type) && !u.is_account_owner)).map((user) => {
      return { value: user.cognito_id, label: `${user.first_name} ${user.last_name}`, email: user.email };
    });
    const agent_accounts = agents.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const group_accounts = groups.list.map((a) => {
      return { value: a.cognito_id, label: a.name };
    });
    const current_agent = agents.list.find((a) => a.cognito_id === defaults.parent_id);
    const current_group = groups.list.find((a) => a.cognito_id === defaults.parent_id);
    const associated = defaults.cognito_id ? { value: defaults.cognito_id, label: `${defaults.first_name} ${defaults.last_name}`, email: defaults.email } : null;
    if (associated) users.unshift(associated);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      is_downloading_agreement: false,
      updates: {
        benefits_config: {},
        team: {}
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
        team: {
          parent_id: defaults.parent_id,
          cognito_id: defaults.cognito_id || "",
          name: defaults.name || "",
          domains: defaults.domains || [],
          approved_groups: defaults.approved_groups || [],
          pending_groups: defaults.pending_groups || [],
          groups: []
        }
      },
      updated_group: false,
      updated_agent: false,
      updated_user: false,
      associated,
      agent_accounts,
      agent_account: defaults.parent_id && current_agent ? { value: defaults.parent_id, label: `${current_agent.first_name} ${current_agent.last_name}` } : null,
      group_accounts,
      group_account: defaults.parent_id && current_group ? { value: defaults.parent_id, label: current_group.name } : null,
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

  updateArray = (key, value, object) => {
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
    const { createTeam, closeCreateTeamModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const created = await createTeam(updates);
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Created", "Account was successfully created.");
      closeCreateTeamModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateRecord = async () => {
    const { updates, agent_account, updated_agent, group_account, updated_group, updated_user } = this.state;
    const { updateTeam, closeCreateTeamModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateTeam(defaults.id, {
      updates,
      old_agent_id: defaults.parent_id,
      new_agent_id: (updated_agent ? agent_account.value : (updated_group ? group_account.value : false)),
      old_cognito_id: defaults.cognito_id,
      new_cognito_id: (updated_user ? updates.team.cognito_id : false),
      config_id: defaults.config_id
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Updated", "Account was successfully updated.");
      closeCreateTeamModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  handleChange = (selected, config) => {
    const { defaults } = this.props;
    if (selected) this.setState({ [`${config.name}_account`]: selected, [`updated_${config.name}`]: selected.value !== defaults.parent_id }, this.update("parent_id", selected.value, "team"));
    else this.setState({ [`${config.name}_account`]: null, [`updated_${config.name}`]: false }, this.update("parent_id", "", "team"));
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state.account.team[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.updateArray([actionOptions.name], difference, "team");
        break;
      case "select-option":
        this.updateArray([actionOptions.name], value.map((e) => e.value), "team");
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.updateArray([actionOptions.name], [...this.state.account.team[actionOptions.name], new_option.value], "team");
        break;
      case "clear":
        this.updateArray([actionOptions.name], [], "team");
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
    const { groups, is_open, closeCreateTeamModal, defaults, updating, viewing, hello_sign } = this.props;
    const { loaderShow, loaderMessage, logo_error, editing_logo, imageSrc, users, updated_agent, agent_accounts, agent_account, updated_group, group_accounts, group_account, associated, account, updates, is_downloading_agreement } = this.state;
    let flat = {};
    let merged = Object.assign(flat, ...Object.keys(updates).map((reg_key) => updates[reg_key]));
    const has_downloadable_contract = (defaults.signature_request_id && defaults.contract_signed);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateTeamModal()} center>
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
                    <ReactAvatar size={100} src={imageSrc || account.benefits_config.logo} name={(account.team.first_name && account.team.last_name) ? `${account.team.first_name} ${account.team.last_name}` : "Hope Trust"} round />
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
                ? <ViewBenefitsModuleModalInnerHeader span={12}>New Team Account</ViewBenefitsModuleModalInnerHeader>
                : <ViewBenefitsModuleModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Team Account</ViewBenefitsModuleModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Team Account Name:</InputLabel>
                  <Input readOnly={viewing} type="text" value={account.team.name} onChange={(event) => this.update("name", event.target.value, "team")} />
                </InputWrapper>
              </Col>
              {!group_account
                ? (
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
                        isClearable
                        name="agent"
                        placeholder="Choose a agent from the list..."
                        onChange={this.handleChange}
                        value={agent_account}
                        options={agent_accounts}
                        isDisabled={viewing}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                      <InputHint margintop={5}>This agent would be considered the owner of this team.</InputHint>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {!agent_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Associated Group</InputLabel>
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
                        isClearable
                        name="group"
                        placeholder="Choose a group from the list..."
                        onChange={this.handleChange}
                        value={group_account}
                        options={group_accounts}
                        isDisabled={viewing}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                      <InputHint margintop={5}>This group would be considered the owner of this team.</InputHint>
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
                        }, () => this.update("cognito_id", selected_account.value, "team"));
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
                    {(!updating && !viewing) || ((updating || viewing) && account.team.approved_groups.length)
                      ? (
                        <InputWrapper>
                          <InputLabel><RequiredStar>*</RequiredStar> {(updating || viewing) ? "Approved Groups" : "Groups"}</InputLabel>
                          <ReactSelect
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
                            isClearable
                            isSearchable
                            isMulti
                            isDisabled={updating || viewing}
                            name={(updating || viewing) ? "approved_groups" : "groups"}
                            placeholder="Select a Group(s) from the list..."
                            backspaceRemovesValue={false}
                            onChange={this.updateSelectInput}
                            defaultValue={account.team.approved_groups.map((group) => {
                              const group_record = groups.list.find((g) => g.config_id === +group);
                              if (group_record) return { value: group, label: group_record.name };
                              return null;
                            })}
                            options={groups.list.map((g) => {
                              if (!account.team.pending_groups.includes(g.config_id)) return { value: g.config_id, label: g.name };
                              return false;
                            }).filter((e) => e)}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                          {!updating && !viewing
                            ? <InputHint margintop={5}>Group requests will be sent out to the chosen groups.</InputHint>
                            : null
                          }
                        </InputWrapper>
                      )
                      : null
                    }
                    {account.team.pending_groups.length
                      ? (
                        <InputWrapper>
                          <InputLabel><RequiredStar>*</RequiredStar> Pending Groups</InputLabel>
                          <ReactSelect
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
                            isClearable
                            isSearchable
                            isMulti
                            isDisabled={updating || viewing}
                            name="pending_groups"
                            placeholder="Select a Group(s) from the list..."
                            backspaceRemovesValue={false}
                            onChange={this.updateSelectInput}
                            defaultValue={account.team.pending_groups.map((group) => {
                              const group_record = groups.list.find((g) => g.config_id === +group);
                              if (group_record) return { value: group, label: group_record.name };
                              return null;
                            })}
                            options={groups.list.map((g) => {
                              if (!account.team.pending_groups.includes(g.config_id)) return { value: g.config_id, label: g.name };
                              return false;
                            }).filter((e) => e)}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                        </InputWrapper>
                      )
                      : null
                    }
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
                        defaultValue={account.team.domains.map((domain) => {
                          return { value: domain, label: domain };
                        })}
                        value={account.team.domains.map((domain) => {
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
                  ? <Button disabled={!Object.keys(merged).length || !((agent_account || group_account) && (agent_account?.value || group_account?.value) && associated)} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Account</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!Object.keys(merged).length && !(updated_agent || updated_group)} type="button" onClick={() => this.updateRecord()} outline green rounded nomargin>Update Account</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateTeamModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
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
  agents: state.agents,
  teams: state.teams,
  groups: state.groups
});
const dispatchToProps = (dispatch) => ({
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  closeCreateTeamModal: () => dispatch(closeCreateTeamModal()),
  createTeam: (data) => dispatch(createTeam(data)),
  updateTeam: (ID, update_data) => dispatch(updateTeam(ID, update_data)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(TeamCreateModal);