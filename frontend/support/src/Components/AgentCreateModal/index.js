import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { isString, merge, uniqBy } from "lodash";
import Checkbox from "react-simple-checkbox";
import { Modal } from "react-responsive-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { closeCreateAgentModal, createAgent, updateAgent } from "../../store/actions/agents";
import { showNotification } from "../../store/actions/notification";
import ReactSelect, { createFilter, components } from "react-select";
import { getHelloSignDownloadLink } from "../../store/actions/hello-sign";
import {
  BenefitsModuleMainContent,
  ViewBenefitsModuleModalInner,
  ViewBenefitsModuleModalInnerLogo,
  ViewBenefitsModuleModalInnerLogoImg,
  ViewBenefitsModuleModalInnerHeader
} from "./style";
import {
  Button,
  Input,
  InputWrapper,
  InputLabel,
  InputHint,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import moment from "moment";
import LoaderOverlay from "../LoaderOverlay";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class AgentCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateAgentModal: PropTypes.func.isRequired,
    createAgent: PropTypes.func.isRequired,
    updateAgent: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults, customer_support, retail } = props;
    let users = customer_support.users.filter((u) => (["benefits"].includes(u.type) && !u.is_account_owner)).map((user) => {
      return { value: user.cognito_id, label: `${user.first_name} ${user.last_name}`, email: user.email };
    });
    const retailer_accounts = retail.list.map((r) => {
      return { value: r, label: r.name };
    });
    const current_retailer = retail.list.find((r) => r.cognito_id === defaults.parent_id);
    const associated = defaults.cognito_id ? { value: defaults.cognito_id, label: `${defaults.first_name} ${defaults.last_name}`, email: defaults.email } : null;
    if (associated) users.unshift(associated);
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      is_downloading_agreement: false,
      updates: {
        benefits_config: {},
        agent: {}
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
        agent: {
          parent_id: defaults.parent_id || "",
          cognito_id: defaults.cognito_id || "",
          approved_groups: defaults.approved_groups || [],
          pending_groups: defaults.pending_groups || [],
          groups: []
        }
      },
      updated_retailer: false,
      updated_user: false,
      is_additional_account: false,
      associated,
      retailer_accounts: uniqBy(retailer_accounts, "value"),
      retailer_account: defaults.parent_id && current_retailer ? { value: defaults.parent_id, label: current_retailer.name } : null,
      editing_logo: false,
      imageSrc: "",
      logo_error: "",
      users
    };
  }

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

  update = (key, value, object) => {
    const { account, updates } = this.state;
    const newState = merge(account[object], { [key]: value });
    let updated = merge(updates[object], { [key]: isString(value) ? value.replace("'", "’") : value });
    if (updated[object] && updated[object].hasOwnProperty(key) && !value && typeof value !== "boolean") delete updated[object][key];
    this.setState({ account: { ...account, [object]: newState }, updates: { ...updates, [object]: updated } });
  };

  createRecord = async () => {
    const { updates } = this.state;
    const { createAgent, closeCreateAgentModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const created = await createAgent(updates);
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Created", "Account was successfully created.");
      closeCreateAgentModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateRecord = async () => {
    const { updates, retailer_account, updated_retailer, updated_user } = this.state;
    const { updateAgent, closeCreateAgentModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateAgent(defaults.id, {
      updates,
      old_retailer_id: defaults.retailer_id,
      new_retailer_id: (updated_retailer ? retailer_account.value.cognito_id : false),
      old_cognito_id: defaults.cognito_id,
      new_cognito_id: (updated_user ? updates.agent.cognito_id : false),
      config_id: defaults.config_id
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Account Updated", "Account was successfully updated.");
      closeCreateAgentModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.setState({ is_downloading_agreement: true });
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.setState({ is_downloading_agreement: false });
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state.account.agent[actionOptions.name].filter((item) => item !== actionOptions.removedValue.value);
        this.updateArray([actionOptions.name], difference, "agent");
        break;
      case "select-option":
        this.updateArray([actionOptions.name], value.map((e) => e.value), "agent");
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.updateArray([actionOptions.name], [...this.state.account.agent[actionOptions.name], new_option.value], "agent");
        break;
      case "clear":
        this.updateArray([actionOptions.name], [], "agent");
        break;
      default:
        break;
    }
  };

  render() {
    const {
      is_open,
      closeCreateAgentModal,
      defaults,
      updating,
      viewing,
      groups,
      hello_sign
    } = this.props;
    const {
      loaderShow,
      loaderMessage,
      users,
      updated_retailer,
      retailer_accounts,
      retailer_account,
      associated,
      account,
      updates,
      is_downloading_agreement
    } = this.state;
    let flat = {};
    let merged = Object.assign(flat, ...Object.keys(updates).map((reg_key) => updates[reg_key]));
    const has_downloadable_contract = (defaults.signature_request_id && defaults.contract_signed);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateAgentModal()} center>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Benefits Agreement.pdf">{null}</a>
        <ViewBenefitsModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewBenefitsModuleModalInnerLogo span={12}>
              <ViewBenefitsModuleModalInnerLogoImg alt="HopeTrust Logo" src={icons.colorLogoOnly} />
            </ViewBenefitsModuleModalInnerLogo>
          </Col>
          <BenefitsModuleMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewBenefitsModuleModalInnerHeader span={12}>New Agent Account</ViewBenefitsModuleModalInnerHeader>
                : <ViewBenefitsModuleModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Agent Account</ViewBenefitsModuleModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Associated Retailer</InputLabel>
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
                    name="retailer_account"
                    placeholder="Choose a retail account from the list..."
                    onChange={(select_account) => select_account ? this.setState({ retailer_account: select_account, updated_retailer: select_account.value.cognito_id !== defaults.parent_id }, this.update("parent_id", select_account.value.cognito_id, "agent")) : null}
                    value={retailer_account}
                    options={retailer_accounts}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
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
                    onChange={(account) => account ? this.setState({ associated: account, updated_user: account.value !== defaults.cognito_id }, () => this.update("cognito_id", account.value, "agent")) : null}
                    value={associated}
                    options={users}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
                {(!updating && !viewing) || ((updating || viewing) && account.agent.approved_groups.length)
                  ? (
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> {(updating || viewing) ? "Approved Groups" : "Allowed Groups"}</InputLabel>
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
                        defaultValue={account.agent.approved_groups.map((group) => {
                          const group_record = groups.list.find((g) => g.config_id === +group);
                          if (group_record) return { value: group, label: group_record.name };
                          return null;
                        })}
                        options={groups.list.map((g) => {
                          if (!account.agent.pending_groups.includes(g.config_id)) return { value: g.config_id, label: g.name };
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
                {account.agent.pending_groups.length
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
                        defaultValue={account.agent.pending_groups.map((group) => {
                          const group_record = groups.list.find((g) => g.config_id === +group);
                          if (group_record) return { value: group, label: group_record.name };
                          return null;
                        })}
                        options={groups.list.map((g) => {
                          if (!account.agent.pending_groups.includes(g.config_id)) return { value: g.config_id, label: g.name };
                          return false;
                        }).filter((e) => e)}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  )
                  : null
                }
              </Col>
              <Col span={6}>
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
                  ? <Button disabled={!Object.keys(merged).length || !(retailer_account && retailer_account.value && associated)} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Account</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!Object.keys(merged).length && !updated_retailer} type="button" onClick={() => this.updateRecord()} outline green rounded nomargin>Update Account</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateAgentModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
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
  retail: state.retail,
  groups: state.groups
});
const dispatchToProps = (dispatch) => ({
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  closeCreateAgentModal: () => dispatch(closeCreateAgentModal()),
  createAgent: (updates) => dispatch(createAgent(updates)),
  updateAgent: (id, update_data) => dispatch(updateAgent(id, update_data)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(AgentCreateModal);
