import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeAddMembershipModal } from "../../store/actions/customer-support";
import { createMembership } from "../../store/actions/membership";
import { showNotification } from "../../store/actions/notification";
import ReactSelect, { createFilter, components } from "react-select";
import RelationshipPermissionsSettings from "../../Components/RelationshipPermissionsSettings";
import {
  BenefitsModuleMainContent,
  ViewBenefitsModuleModalInner,
  ViewBenefitsModuleModalInnerHeader,
  ViewBenefitsModuleModalInnerLogo,
  ViewBenefitsModuleModalInnerLogoImg
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { capitalize } from "lodash";

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class AddMembershipModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeAddMembershipModal: PropTypes.func.isRequired,
    createMembership: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props)
    
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      target_account: null,
      new_member: null,
      permissions: {},
      membership_type: props.membership_type
    };
  }

  createRecord = async () => {
    const { target_account, new_member, permissions } = this.state;
    const { createMembership, closeAddMembershipModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    let finalPermissions = [];
    Object.keys(permissions).forEach((category) => {
      if (permissions[category] === "edit") {
        finalPermissions.push(`${category}-edit`);
        finalPermissions.push(`${category}-view`);
      } else if (permissions[category] !== "off") {
        finalPermissions.push(`${category}-${permissions[category]}`);
      }
    });
    if (target_account && target_account.type && !finalPermissions.includes(target_account.type)) finalPermissions.push(target_account.type);
    if (!finalPermissions.includes("basic-user")) finalPermissions.push("basic-user");
    const created = await createMembership(target_account.value, new_member.value, { type: target_account.type, permissions: finalPermissions });
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Membership Created", "Membership was successfully created.");
      closeAddMembershipModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Creation failed", created.message);
    }
  };

  setPermission = (category, id) => {
    let { permissions } = this.state;
    let newPermissions = permissions;
    newPermissions[category] = id;
    this.setState({
      permissions: newPermissions
    });
  };

  render() {
    const {
      is_open,
      closeAddMembershipModal,
      customer_support,
      wholesale,
      retail,
      agents,
      groups,
      teams
    } = this.props;
    const {
      loaderShow,
      loaderMessage,
      new_member,
      target_account,
      membership_type
    } = this.state;
    let users = customer_support.partners.map((partner) => {
      return { value: partner.cognito_id, label: `${partner.first_name} ${partner.last_name}` };
    });
    let target_accounts = customer_support.accounts.map((a) => {
      return { value: a.account_id, label: `${a.first_name} ${a.last_name}` };
    });
    if (membership_type === "benefits") {
      target_accounts = [...wholesale.list, ...retail.list, ...agents.list, ...groups.list, ...teams.list].map((a) => {
        return { value: a.account_id, label: `${a.first_name} ${a.last_name}`, type: a.type };
      });
    }
    if (membership_type === "benefits" && target_account) {
      users = customer_support.users.filter((u) => (u.cognito_id !== target_account.value) && !u.accounts && u.type === "benefits").map((u) => {
        return { u, value: u.cognito_id, label: `${u.first_name} ${u.last_name}` };
      });
    }

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeAddMembershipModal()} center>
        <ViewBenefitsModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewBenefitsModuleModalInnerLogo span={12}>
              <ViewBenefitsModuleModalInnerLogoImg alt="HopeTrust Logo" src={icons.colorLogoOnly} />
            </ViewBenefitsModuleModalInnerLogo>
          </Col>
          <BenefitsModuleMainContent span={12}>
            <Row>
              <ViewBenefitsModuleModalInnerHeader span={12}>New Membership</ViewBenefitsModuleModalInnerHeader>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Type</InputLabel>
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
                    name="membership_type"
                    placeholder="Choose a membership type..."
                    onChange={(select_account) => this.setState({ membership_type: select_account.value, target_account: null, new_member: null, permissions: {} })}
                    value={{ value: membership_type, label: capitalize(membership_type) }}
                    options={[
                      { value: "client", label: "Client" },
                      { value: "benefits", label: "Benefits" }
                    ]}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Account</InputLabel>
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
                    name="target_account"
                    placeholder="Choose an account from the list..."
                    onChange={(select_account) => this.setState({ target_account: select_account, new_member: null })}
                    value={target_account}
                    options={target_accounts}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              {target_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> New Member</InputLabel>
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
                        name="new_member"
                        placeholder="Choose a user from the list..."
                        onChange={(select_account) => this.setState({ new_member: select_account })}
                        value={new_member}
                        options={users}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }

              {target_account
                ? (
                  <Col span={12}>
                    <RelationshipPermissionsSettings membership_type={membership_type} disabled={!new_member} setPermission={this.setPermission} defaults={[]} />
                  </Col>
                )
                : null
              }

              <Col span={12}>
                <Button disabled={!new_member || !target_account} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Membership</Button>
                <Button type="button" onClick={() => closeAddMembershipModal()} outline danger rounded>Cancel</Button>
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
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  closeAddMembershipModal: () => dispatch(closeAddMembershipModal()),
  createMembership: (account_id, cognito_id, data) => dispatch(createMembership(account_id, cognito_id, data)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(AddMembershipModal);