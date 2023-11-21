import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { theme } from "../../global-styles";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { closeCreateTeamModal, createNewTeam } from "../../store/actions/teams";
import { isString, merge, debounce } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSelect, { createFilter, components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { checkUserEmail } from "../../store/actions/user";
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
import { isValidDomain } from "../../utilities";

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
    createNewTeam: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { user, defaults, agents, groups } = props;
    const agent_accounts = agents.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const group_accounts = groups.list.map((a) => {
      if (!a.approved_groups.includes("team")) return { value: a.cognito_id, label: a.name, data: a };
      return false;
    }).filter((e) => e);
    const current_agent = user.benefits_data;
    this.state = {
      email: "",
      check_email_error: "",
      email_valid: false,
      is_checking_email: false,
      error_code: "",
      loaderShow: false,
      loaderMessage: "",
      updates: {
        benefits_config: {},
        team: {
          parent_id: user.cognito_id
        },
        group: {
          group_assigned: false
        },
        user: {}
      },
      account: {
        benefits_config: {
          cognito_id: defaults.cognito_id || "",
          logo: defaults.logo || ""
        },
        team: {
          parent_id: defaults.parent_id || user.cognito_id,
          cognito_id: defaults.cognito_id || "",
          name: defaults.name || "",
          domains: defaults.domains || []
        },
        group: {
          group_assigned: false,
          config_id: ""
        },
        user: {
          first_name: defaults.first_name,
          last_name: defaults.last_name,
          email: defaults.email
        }
      },
      agent_accounts,
      agent_account: current_agent ? { value: current_agent.cognito_id, label: `${current_agent.first_name} ${current_agent.last_name}`, } : null,
      group_accounts,
      group_account: null,
      editing_logo: false,
      imageSrc: "",
      logo_error: ""
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
    const { createNewTeam, closeCreateTeamModal } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Creating Team..." });
    const created = await createNewTeam(updates);
    if (created.success) {
      closeCreateTeamModal();
    }
    this.setState({ loaderShow: false, loaderMessage: "" });
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state.account.team[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.updateDomains([actionOptions.name], difference, "team");
        break;
      case "select-option":
        this.updateDomains([actionOptions.name], value.map((e) => e.value), "team");
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.updateDomains([actionOptions.name], [...this.state.account.team[actionOptions.name], new_option.value], "team");
        break;
      case "clear":
        this.updateDomains([actionOptions.name], [], "team");
        break;
      default:
        break;
    }
  };

  checkEmail = async (event) => {
    const { checkUserEmail } = this.props;
    event.persist();

    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        let email = event.target.value;
        if (email.includes("@")) {
          this.setState({ is_checking_email: true });
          const is_valid_email = await checkUserEmail(email, "benefits");
          if (is_valid_email.success) this.update("email", email, "user")
          this.setState({ check_email_error: is_valid_email.message, email_valid: is_valid_email.success, is_checking_email: false, error_code: is_valid_email.error_code });
        } else {
          this.setState({ check_email_error: false });
          this.setState({ email_valid: false });
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  render() {
    const { is_open, closeCreateTeamModal, updating, viewing } = this.props;
    const { email, check_email_error, email_valid, is_checking_email, loaderShow, loaderMessage, logo_error, editing_logo, imageSrc, agent_accounts, agent_account, group_accounts, group_account, account, updates } = this.state;
    let flat = {};
    let merged = Object.assign(flat, ...Object.keys(updates).map((reg_key) => updates[reg_key]));

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateTeamModal()} center>
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
              <Col span={6}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> First Name:</InputLabel>
                  <Input readOnly={viewing} type="text" value={account.user.first_name} onChange={(event) => this.update("first_name", event.target.value, "user")} />
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Last Name:</InputLabel>
                  <Input readOnly={viewing} type="text" value={account.user.last_name} onChange={(event) => this.update("last_name", event.target.value, "user")} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper margintop={20}>
                  <InputLabel><RequiredStar>*</RequiredStar> Email:</InputLabel>
                  <Input readOnly={viewing} onKeyUp={this.checkEmail} onChange={(event) => this.setState({ email: event.target.value })} type="email" value={email} />
                  <InputHint margintop={5} error={check_email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_checking_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (check_email_error || "A temporary password will be sent to this email.")}</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Associated Agent</InputLabel>
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
                    isDisabled={!!agent_account || viewing}
                    name="agent_account"
                    placeholder="Choose a agent from the list..."
                    onChange={(select_account) => select_account ? this.setState({ agent_account: select_account }) : null}
                    value={agent_account}
                    options={agent_accounts}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              {group_accounts.length
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Associated Group</InputLabel>
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
                        onChange={(select_account) => {
                          if (select_account) {
                            this.setState({ group_account: select_account }, () => {
                              this.update("group_assigned", true, "group")
                              this.update("config_id", select_account.data.config_id, "group")
                            })
                          }
                        }}
                        value={group_account}
                        options={group_accounts}
                        isDisabled={viewing}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </Col>
                )
                : (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Associated Group</InputLabel>
                      <InputHint>All Groups currently have a Team assigned.</InputHint>
                    </InputWrapper>
                  </Col>
                )
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Valid Domains</InputLabel>
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
                    options={[]}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                    noOptionsMessage={() => null}
                    isValidNewOption={(value) => value && isValidDomain(value)}
                    formatCreateLabel={(value) => `Click or press Enter to create new domain "${value}"`}
                  />
                  <InputHint margintop={5}>Additional users will be approved to join this team if they register with any of these domains. The team owner will be able to manually approve domains outside this organization.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                {!updating && !viewing
                  ? <Button disabled={!group_account || !Object.keys(merged).length || (!merged.first_name || !merged.last_name || !merged.email || !email_valid)} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Account</Button>
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
  agents: state.agents,
  teams: state.teams,
  groups: state.groups
});
const dispatchToProps = (dispatch) => ({
  closeCreateTeamModal: () => dispatch(closeCreateTeamModal()),
  createNewTeam: (data) => dispatch(createNewTeam(data)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type))
});
export default connect(mapStateToProps, dispatchToProps)(TeamCreateModal);