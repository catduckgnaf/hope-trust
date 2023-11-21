import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { merge, debounce, orderBy } from "lodash";
import { limitInput, formatUSPhoneNumberPretty, formatUSPhoneNumber, limitNumberRange } from "../../utilities";
import UserPermissions from "../../Components/UserPermissions";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSelect, { createFilter, components } from "react-select";
import { US_STATES } from "../../utilities";
import { Row, Col } from "react-simple-flex-grid";
import {
  getUserRecord,
  updateUserRecord,
  closeUserUpdateModal,
  setSingleUserMFA,
  resetSingleUserMFA,
  resetUserPassword
} from "../../store/actions/customer-support";
import {
  updateMembership,
  deleteMembership
} from "../../store/actions/membership";
import { checkUserEmail, checkUsername, createUserRecord } from "../../store/actions/user";
import {
  AccountEditModalMain,
  FeatureItems,
  FeatureItem,
  FeatureFooter,
  FeatureFooterSection,
  ViewUserModalInnerLogo,
  ViewUserModalInnerLogoOverlay,
  ViewUserModalInnerLogoContainer,
  ViewUserModalInnerLogoOverlayIcon,
  ButtonsContainer,
  ButtonItem,
  EditButton,
  ButtonItemMessage,
  SettingsTabs,
  SettingsTabStatusBar,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  Group,
  Icon
} from "./style";
import {
  InputWrapper,
  InputLabel,
  InputHint,
  Input,
  Select,
  Button,
  ViewContainer,
  CheckBoxInput,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import { theme } from "../../global-styles";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import LoaderOverlay from "../LoaderOverlay";

const handleHeaderClick = (id) => {
  const node = document.querySelector(`#${id}`).parentElement
    .nextElementSibling;
  const classes = node.classList;
  if (classes.contains("collapsed")) {
    node.classList.remove("collapsed");
  } else {
    node.classList.add("collapsed");
  }
};

const Option = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

const LazyOption = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

const CustomGroupHeading = (props) => {
  return (
    <Group className="group-heading-wrapper" onClick={() => handleHeaderClick(props.id)}>
      <components.GroupHeading {...props}>
        {props.children} ({props.data.options.length})
          <Icon>
            <FontAwesomeIcon icon={["fas", "chevron-down"]} />
          </Icon>
      </components.GroupHeading>
    </Group>
  );
};

let tabs_config = [
  {
    slug: "general-profile",
    icon: "user-cog",
    title: "General Profile",
    show: () => true
  },
  {
    slug: "memberships",
    icon: "user-shield",
    title: "Memberships",
    show: (user) => user.memberships && user.memberships.length
  }
];

class UserEditModal extends Component {

  constructor(props) {
    super(props);
    const { user_defaults, customer_support, wholesale, retail, groups, teams } = props;
    const user = { ...user_defaults };
    const partners = orderBy(customer_support.partners, "name").map((partner) => {
      return { value: partner.account_id, label: `${partner.first_name} ${partner.last_name} (${partner.name})`, deal_id: partner.hubspot_deal_id };
    });
    const clients = customer_support.accounts.map((a) => {
      return { value: a.account_id, label: `${a.first_name} ${a.last_name}`, deal_id: a.hubspot_deal_id };
    });
    const wholesalers = wholesale.list.map((w) => {
      return { value: w.cognito_id, label: w.name, deal_id: w.hubspot_deal_id };
    });
    const retailers = retail.list.map((r) => {
      return { value: r.cognito_id, label: r.name, deal_id: r.hubspot_deal_id };
    });
    const group = groups.list.map((g) => {
      return { value: g.cognito_id, label: g.name, deal_id: g.hubspot_deal_id };
    });
    const team = teams.list.map((t) => {
      return { value: t.cognito_id, label: t.name, deal_id: t.hubspot_deal_id };
    });
    this.state = {
      user: { ...user, status: user.status || "active" },
      is_fetching_user: false,
      editing_avatar: false,
      loaderShow: false,
      updated_user: {
        status: "active"
      },
      saving: false,
      imageSrc: "",
      avatar_error: "",
      updating_mfa: false,
      is_sending_password: false,
      waiting_for_password: false,
      is_loading_email: false,
      email_error: "",
      error_code: "",
      username_error: "",
      username_valid: false,
      is_loading_username: false,
      email_valid: false,
      active_tab: "general-profile",
      active_membership: false,
      permissions_map: {},
      balance: 0,
      create_stripe_customer: true,
      create_hubspot_contact: true,
      clients,
      partners,
      wholesalers,
      retailers,
      group,
      team,
      associated_account: null,
      initial_status: user_defaults.status,
      pool_type: ""
    };
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
        this.update("avatar", uri);
        this.setState({ imageSrc: uri, avatar_error: "", editing_avatar: false });
      },
      "base64"
    );
  };

  throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        this.setState({ avatar_error: "This file type is not supported." });
        break;
      case "maxsize":
        this.setState({ avatar_error: "Avatar must be less than 2MB" });
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setState({ avatar_error: "" });
    }, 3000);
  };

  update = (key, value) => {
    const { user, updated_user } = this.state;
    const newState = merge(user, { [key]: value });
    let updated = merge(updated_user, { [key]: value });
    if (updated[key] && (!value.length || !value) && typeof value !== "boolean") delete updated[key];
    this.setState({ user: newState, updated_user: updated });
  };

  saveUser = async () => {
    const { updateMembership, updateUserRecord, user_defaults, closeUserUpdateModal } = this.props;
    let { permissions_map, updated_user, user, balance } = this.state;
    let requests = [];
    if (Object.keys(permissions_map).length) {
      for (let i = 0; i < user.memberships.length; i++) {
        const membership = user.memberships[i];
        if (permissions_map[`${membership.account_id}_permissions`]) {
          let permissions_obj = permissions_map[`${membership.account_id}_permissions`] || {};
          let array_permissions = [];
          Object.keys(permissions_obj).forEach((category) => {
            if (permissions_obj[category] === "edit") {
              array_permissions.push(`${category}-edit`);
              array_permissions.push(`${category}-view`);
            } else if (permissions_obj[category] === "on") {
              array_permissions.push(category);
            } else if (permissions_obj[category] !== "off") {
              array_permissions.push(`${category}-${permissions_obj[category]}`);
            }
          });
          array_permissions = array_permissions.filter((p) => !p.includes("basic"));
          if (user.is_partner) requests.push(updateMembership(membership.account_id, user.cognito_id, { permissions: ["basic-user", "account-admin-view", "account-admin-edit", ...array_permissions] }, user_defaults.cognito_id));
          if (!user.is_partner) requests.push(updateMembership(membership.account_id, user.cognito_id, { permissions: ["basic-user", ...array_permissions] }, user_defaults.cognito_id));
        }
      }
    }
    this.setState({ loaderShow: true, loaderMessage: "Updating user...", saving: true });
    if (!updated_user.email || (updated_user.email && (user_defaults.email === updated_user.email))) delete updated_user.email;
    if (Object.keys(updated_user).length) {
      let user_updates = [user_defaults.cognito_id, updated_user, user.type, (balance ? (-(Number(balance)*100)) : 0)];
      if (user.first_name && user.last_name) requests.push(updateUserRecord(...user_updates));
    }
    if (requests.length) await Promise.all(requests);
    this.setState({ saving: false, loaderShow: false, loaderMessage: "" }, () => closeUserUpdateModal());
  }

  createUser = async () => {
    const { createUserRecord, closeUserUpdateModal } = this.props;
    let { updated_user, create_stripe_customer, create_hubspot_contact, associated_account, pool_type } = this.state;
    this.setState({ loaderShow: true, loaderMessage: "Updating user...", creating: true });
    if (Object.keys(updated_user).length) await createUserRecord(updated_user, create_stripe_customer, create_hubspot_contact, associated_account, pool_type);
    this.setState({ creating: false, loaderShow: false, loaderMessage: "" }, () => closeUserUpdateModal());
  }

  setSingleUserMFA = async (cognito_id, type) => {
    const { setSingleUserMFA } = this.props;
    this.setState({ updating_mfa: true });
    await setSingleUserMFA(cognito_id, type);
    await this.getUserRecord();
    this.setState({ updating_mfa: false });
  }
  resetSingleUserMFA = async (cognito_id, type) => {
    const { resetSingleUserMFA } = this.props;
    this.setState({ updating_mfa: true });
    await resetSingleUserMFA(cognito_id, type);
    await this.getUserRecord();
    this.setState({ updating_mfa: false });
  }

  resetPassword = async (cognito_id, type, email) => {
    const { resetUserPassword } = this.props;
    this.setState({ is_sending_password: true, waiting_for_password: true });
    await resetUserPassword(cognito_id, type, email);
    this.setState({ is_sending_password: false });
    setTimeout(() => {
      this.setState({ waiting_for_password: false });
    }, 60000);
  };

  checkEmail = async (event) => {
    const { checkUserEmail, user_defaults, updating } = this.props;
    const { user, pool_type } = this.state;
    event.persist();
    if ((event.target.value && (user_defaults.email !== event.target.value)) || !updating) {
      if (!this.debouncedFnEmail) {
      this.debouncedFnEmail = debounce(async () => {
        let email = event.target.value;
        if (email.includes("@")) {
          this.setState({ is_loading_email: true });
          const emailCheck = await checkUserEmail(email, (pool_type || user.type || "client"));
          if (emailCheck.success) {
            this.setState({ email_error: emailCheck.message, error_code: "", email_valid: true });
          } else {
            this.setState({ email_error: emailCheck.message, error_code: emailCheck.error_code, email_valid: false });
          }
        } else {
          this.setState({ email_error: false, error_code: "", email_valid: false });
        }
        this.setState({ is_loading_email: false });
      }, 1000);
    }
    this.debouncedFnEmail();
    } else {
      this.setState({ email_error: false });
      this.setState({ email_valid: true });
    }
  };

  checkUsername = async (event) => {
    const { checkUsername, user_defaults, updating } = this.props;
    event.persist();
    if ((event.target.value && (user_defaults.username !== event.target.value)) || !updating) {
      if (!this.debouncedFnUsername) {
      this.debouncedFnUsername = debounce(async () => {
        let username = event.target.value;
        if (username) {
          this.setState({ is_loading_username: true });
          const usernameCheck = await checkUsername(username);
          if (usernameCheck.success) {
            this.setState({ username_error: usernameCheck.message, error_code: "", username_valid: true });
          } else {
            this.setState({ username_error: usernameCheck.message, error_code: usernameCheck.error_code, username_valid: false });
          }
        } else {
          this.setState({ username_error: false, error_code: "", username_valid: false });
        }
        this.setState({ is_loading_username: false });
      }, 1000);
    }
    this.debouncedFnUsername();
    } else {
      this.setState({ username_error: false });
      this.setState({ username_valid: true });
    }
  };

  setPermission = (category, id, account_id) => {
    const { permissions_map } = this.state;
    let new_map = permissions_map;
    if (permissions_map[`${account_id}_permissions`]) permissions_map[`${account_id}_permissions`][category] = id;
    else permissions_map[`${account_id}_permissions`] = { [category]: id };
    this.setState({
      permissions_map: new_map
    });
  };

  getUserRecord = async () => {
    const { user_defaults, getUserRecord } = this.props;
    if (!user_defaults.fetched || (user_defaults.fetched && moment(user_defaults.last_fetch).isAfter(moment(user_defaults.last_fetch).add(1, "hours")))) {
      this.setState({ loaderShow: true, loaderMessage: "Fetching user..." });
      const getUser = await getUserRecord(user_defaults.cognito_id);
      if (getUser.success) {
        const user = getUser.payload;
        this.setState({
          loaderShow: false,
          loaderMessage: "",
          updated_user: {
            status: user.status
          },
          balance: (user.customer ? (Math.abs(user.customer.balance || 0)/100) : 0),
          email_valid: true,
          active_membership: (user.memberships.length ? { label: `${user.memberships[0].first_name} ${user.memberships[0].last_name}`, value: user.memberships[0] } : false),
          user: {
            first_name: user.first_name || "",
            middle_name: user.middle_name || "",
            last_name: user.last_name || "",
            address: user.address || "",
            address2: user.address2 || "",
            city: user.city || "",
            state: user.state || "",
            zip: user.zip || "",
            email: user.email,
            avatar: user.avatar || "",
            gender: user.gender || "",
            pronouns: user.pronouns || "",
            birthday: user.birthday || "",
            username: user.username || "",
            home_phone: user.home_phone ? formatUSPhoneNumberPretty(user.home_phone) : "", 
            cell_phone: user.cell_phone ? formatUSPhoneNumberPretty(user.cell_phone) : "", 
            other_phone: user.other_phone ? formatUSPhoneNumberPretty(user.other_phone) : "", 
            fax: user.fax ? formatUSPhoneNumberPretty(user.fax) : "", 
            hubspot_contact_id: user.hubspot_contact_id || "",
            cognito_id: user.cognito_id || "", 
            customer_id: user.customer_id || "",
            status: user.status,
            type: user.type || "",
            cognito_record: user.cognito_record,
            memberships: user.memberships || [],
            customer: user.customer,
            is_partner: user.is_partner
          }
        });
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
      }
    } else {
      this.setState({
        loaderShow: false,
        loaderMessage: "",
        updated_user: {
          status: user_defaults.status
        },
        email_valid: true,
        balance: (user_defaults.customer ? (Math.abs(user_defaults.customer.balance || 0)/100) : 0),
        active_membership: (user_defaults.memberships.length ? { label: `${user_defaults.memberships[0].first_name} ${user_defaults.memberships[0].last_name}`, value: user_defaults.memberships[0] } : false),
        user: {
          ...user_defaults,
          home_phone: user_defaults.home_phone ? formatUSPhoneNumberPretty(user_defaults.home_phone) : "", 
          cell_phone: user_defaults.cell_phone ? formatUSPhoneNumberPretty(user_defaults.cell_phone) : "", 
          other_phone: user_defaults.other_phone ? formatUSPhoneNumberPretty(user_defaults.other_phone) : "", 
          fax: user_defaults.fax ? formatUSPhoneNumberPretty(user_defaults.fax) : ""
        }
      });
    }
  };

  removeMembership = async (membership_id) => {
    const { deleteMembership } = this.props;
    this.setState({ loaderShow: true });
    await deleteMembership(membership_id);
    await this.getUserRecord();
    this.setState({ loaderShow: false });
  };

  async componentDidMount() {
    const { user_defaults } = this.props;
    if (user_defaults && user_defaults.cognito_id) await this.getUserRecord();
  }

  render() {
    const { user_update_modal_open, closeUserUpdateModal, updating, user_defaults } = this.props;
    const {
      saving,
      user,
      updated_user,
      editing_avatar,
      imageSrc,
      loaderMessage,
      loaderShow,
      avatar_error,
      updating_mfa,
      waiting_for_password,
      is_sending_password,
      is_loading_email,
      email_error,
      email_valid,
      active_tab,
      active_membership,
      permissions_map,
      balance,
      creating,
      create_stripe_customer,
      create_hubspot_contact,
      associated_account,
      initial_status,
      username_error,
      username_valid,
      is_loading_username,
      pool_type,
      //partners,
      clients,
      wholesalers,
      retailers,
      group,
      team
    } = this.state;
    let permissions_obj = active_membership ? permissions_map[`${active_membership.value.account_id}_permissions`] : {};
    let array_permissions = [];
    Object.keys(permissions_obj || {}).forEach((category) => {
      if (permissions_obj[category] === "edit") {
        array_permissions.push(`${category}-edit`);
        array_permissions.push(`${category}-view`);
      } else if (permissions_obj[category] !== "off") {
        array_permissions.push(`${category}-${permissions_obj[category]}`);
      }
    });
    array_permissions = array_permissions.filter((p) => !p.includes("basic"));
    const active_tabs = tabs_config.filter((tab) => tab.show(user));
    const account_types = {
      // "Partners": {
      //   condition: pool_type === "advisor",
      //   options: partners
      // },
      "Clients": {
        condition: pool_type === "client",
        options: clients
      },
      "Wholesale": {
        condition: pool_type === "benefits",
        options: wholesalers
      },
      "Retail": {
        condition: pool_type === "benefits",
        options: retailers
      },
      "Group": {
        condition: pool_type === "benefits",
        options: group
      },
      "Team": {
        condition: pool_type === "benefits",
        options: team
      }
    };
    const all_accounts = Object.keys(account_types).map((type) => {
      if (account_types[type].condition) {
        const option_items = account_types[type].options.map((a) => {
          return { value: a.value, label: a.label, deal_id: a.deal_id };
        });
        return { options: option_items, label: type };
      }
      return false;
    }).filter((e) => e);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={user_update_modal_open} onClose={() => closeUserUpdateModal()} center>
        <AccountEditModalMain>
          <LoaderOverlay show={loaderShow} message={loaderMessage} />

          <Col span={12}>
            <ViewUserModalInnerLogo editing={editing_avatar ? 1 : 0} span={12}>
              {!editing_avatar
                ? (
                  <ViewUserModalInnerLogoContainer>
                    <ViewUserModalInnerLogoOverlay onClick={() => this.setState({ editing_avatar: true })}>
                      <ViewUserModalInnerLogoOverlayIcon>
                        <FontAwesomeIcon icon={["fad", "camera"]} />
                      </ViewUserModalInnerLogoOverlayIcon>
                    </ViewUserModalInnerLogoOverlay>
                    <ReactAvatar size={100} src={imageSrc || user.avatar} name={(user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : null} round />
                  </ViewUserModalInnerLogoContainer>
                )
                : (
                  <ViewContainer style={{ margin: "auto", position: "relative", width: editing_avatar ? "200px" : "100px", height: editing_avatar ? "200px" : "100px", border: `2px dashed ${avatar_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                    <AvatarImageCr
                      cancel={() => this.setState({ imageSrc: "", editing_avatar: false, avatar_error: "" })}
                      apply={(e) => this.onFileChange(e)}
                      isBack={false}
                      text={avatar_error ? avatar_error : "Drag a File or Click to Browse"}
                      errorHandler={(type) => this.throwAvatarError(type)}
                      iconStyle={{ marginBottom: "5px", width: "50px", height: "32px" }}
                      sliderConStyle={{ position: "relative", top: "25px", background: "#FFFFFF" }}
                      textStyle={{ fontSize: "12px" }}
                      actions={[
                        <Button key={0} style={{display: "none"}}></Button>,
                        <Button key={1} small rounded green nomargin marginbottom={5} widthPercent={100} outline>Apply</Button>
                      ]}
                    />
                  </ViewContainer>
                )
              }
            </ViewUserModalInnerLogo>
          </Col>
            {editing_avatar
              ? (
                <Col span={12} style={{textAlign: "center", marginTop: "25px"}}>
                  <Button onClick={() => this.setState({ imageSrc: "", editing_avatar: false, avatar_error: "" })} small rounded danger nomargin marginbottom={5} outline>Cancel</Button>
                </Col>
              )
              : null
            }

            <Col span={12}>
              {active_tabs.length
                ? (
                  <SettingsTabs>
                    <SettingsTabsPadding span={12}>
                      <SettingsTabsInner>

                        {active_tabs.map((tab, index) => {
                          return (
                            <SettingsTab key={index} span={12 / active_tabs.length} onClick={() => this.setState({ active_tab: tab.slug })}>
                              <SettingsTabPadding>
                                <SettingsTabInner>
                                  <SettingsTabIcon>
                                    <FontAwesomeIcon icon={["fad", tab.icon]} />
                                  </SettingsTabIcon> {tab.title}
                                </SettingsTabInner>
                                <SettingsTabStatusBar active={active_tab === tab.slug ? 1 : 0} />
                              </SettingsTabPadding>
                            </SettingsTab>
                          );
                        })}

                      </SettingsTabsInner>
                    </SettingsTabsPadding>
                  </SettingsTabs>
                )
                : null
              }
            </Col>


          <TabContent span={12}>
            {user.memberships && user.memberships.length && active_tab === "memberships"
              ? (
                <>
                  <Row>
                    <Col span={8}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Membership Permissions</InputLabel>
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
                          name="active_membership"
                          placeholder="Choose a membership from the list..."
                          onChange={(select_account) => this.setState({ active_membership: select_account })}
                          value={active_membership}
                          options={user.memberships && user.memberships.length ? user.memberships.map((m) => { return { label: `${m.first_name} ${m.last_name}`, value: m }; }) : []}
                          className="select-menu"
                          classNamePrefix="ht"
                        />
                      </InputWrapper>
                    </Col>
                    <Col span={4}>
                      <Button disabled={loaderShow || (active_membership.value.account_id === user.cognito_id)} rounded danger nomargin margintop={15} outline onClick={() => this.removeMembership(active_membership.value.id)}>Remove Membership</Button>
                    </Col>
                  </Row>
                </>
              )
              : null
            }
            {active_membership && active_membership.value.permissions.length && active_tab === "memberships"
              ? <UserPermissions disabled={!active_membership.value.permissions.length} setPermission={this.setPermission} defaults={array_permissions.length ? array_permissions : (active_membership.value.permissions || [])} account={active_membership.value} type={user.type || user_defaults.type} />
              : null
            }
            {active_tab === "general-profile"
              ? (
                <FeatureItems>
                  {updating
                    ? (
                      <>
                        <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                          <InputWrapper>
                            <InputLabel>Cognito ID</InputLabel>
                            <Input
                              id="cognito_id"
                              type="text"
                              value={user.cognito_id}
                              onChange={(event) => this.update(event.target.id, event.target.value)}
                              readOnly
                              placeholder="Enter a Cognito ID..."
                            />
                          </InputWrapper>
                        </FeatureItem>
                        <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                          <InputWrapper>
                            <InputLabel>Hubspot Contact ID</InputLabel>
                            <Input
                              id="hubspot_contact_id"
                              type="text"
                              value={user.hubspot_contact_id || ""}
                              onChange={(event) => this.update(event.target.id, event.target.value)}
                              placeholder="Enter a Hubspot Contact ID..."
                            />
                          </InputWrapper>
                        </FeatureItem>
                        <FeatureItem xs={12} sm={12} md={user.customer ? 6 : 12} lg={user.customer ? 6 : 12} xl={user.customer ? 6 : 12}>
                          <InputWrapper>
                            <InputLabel>Stripe Customer ID</InputLabel>
                            <Input
                              id="customer_id"
                              type="text"
                              value={user.customer_id || ""}
                              onChange={(event) => this.update(event.target.id, event.target.value)}
                              placeholder="Enter a Customer ID.."
                            />
                          </InputWrapper>
                        </FeatureItem>
                        {user.customer
                          ? (
                            <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                              <InputWrapper>
                                <InputLabel>Stripe Credit Balance</InputLabel>
                                <Input
                                  type="number"
                                  id="balance"
                                  value={balance}
                                  onChange={(event) => this.setState({ [event.target.id]: event.target.value })}
                                  placeholder="Enter a credit balance..."
                                  onKeyPress={(e) => limitNumberRange(e, 0, 99000)}
                                  max={99000}
                                  min={0} />
                              </InputWrapper>
                            </FeatureItem>
                          )
                          : null
                        }
                      </>
                    )
                    : null
                  }
                  {!updating
                    ? (
                      <FeatureItem xs={12} sm={12} md={12} lg={12} xl={12}>
                        <InputWrapper>
                          <InputLabel><RequiredStar>*</RequiredStar> Application</InputLabel>
                          <Select id="pool_type" value={pool_type || ""} onChange={(event) => this.setState({ [event.target.id]: event.target.value, associated_account: null })}>
                            <option disabled value="">Choose an application</option>
                            <option value="client">Client Application</option>
                            {/* <option value="advisor">Partner Application</option> */}
                            <option value="benefits">Benefits Application</option>
                            {/* <option value="support">Support Application</option> */}
                          </Select>
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }
                  <FeatureItem xs={12} sm={12} md={4} lg={4} xl={4}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> First Name</InputLabel>
                      <Input
                        id="first_name"
                        type="text"
                        value={user.first_name}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter a first name..."
                      />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem xs={12} sm={12} md={4} lg={4} xl={4}>
                    <InputWrapper>
                      <InputLabel>Middle Name</InputLabel>
                      <Input
                        id="middle_name"
                        type="text"
                        value={user.middle_name}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter a middle name..."
                      />
                    </InputWrapper>
                  </FeatureItem>
                  <FeatureItem xs={12} sm={12} md={4} lg={4} xl={4}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Last Name</InputLabel>
                      <Input
                        id="last_name"
                        type="text"
                        value={user.last_name}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter a last name..."
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Username</InputLabel>
                      <Input
                        autoComplete="new-password"
                        autofill="off"
                        type="username"
                        name="username"
                        id="username"
                        value={user.username}
                        placeholder={user.cognito_id || "Start typing a username..."}
                        onKeyUp={this.checkUsername}
                        onChange={(event) => this.update(event.target.id, (event.target.value || "").toLowerCase().replace(/\s+/g, ""))}
                      />
                      {!username_error
                        ? <InputHint margintop={5}>{user.username || user_defaults.username || user.cognito_id}{`@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`}</InputHint>
                        : <InputHint margintop={5} error={username_error ? 1 : 0} success={username_valid ? 1 : 0}>{is_loading_username ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : username_error}</InputHint>
                      }
                    </InputWrapper>
                  </FeatureItem>

                  {pool_type || updating
                    ? (
                      <FeatureItem span={12}>
                        <InputWrapper>
                          <InputLabel><RequiredStar>*</RequiredStar> Email</InputLabel>
                          <Input
                            autoComplete="new-password"
                            autofill="off"
                            type="email"
                            name="email"
                            id="email"
                            value={user.email}
                            placeholder="you@email.com"
                            onKeyUp={this.checkEmail}
                            onChange={(event) => this.update(event.target.id, (event.target.value || "").toLowerCase().replace(/\s+/g, ""))}
                          />
                          {!email_error
                            ? <InputHint margintop={5}>User must have access to this email</InputHint>
                            : <InputHint margintop={5} error={email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_loading_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : email_error}</InputHint>
                          }
                        </InputWrapper>
                      </FeatureItem>
                    )
                    : null
                  }

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Home Phone</InputLabel>
                      <Input
                        id="home_phone"
                        type="tel"
                        defaultValue={user.home_phone}
                        onChange={(event) => this.update(event.target.id, formatUSPhoneNumber(event.target.value))}
                        placeholder="Enter a phone number..."
                        onKeyUp={(event) => {
                          event.target.value = formatUSPhoneNumberPretty(event.target.value);
                        }}
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Other Phone</InputLabel>
                      <Input
                        id="other_phone"
                        type="tel"
                        defaultValue={user.other_phone}
                        onChange={(event) => this.update(event.target.id, formatUSPhoneNumber(event.target.value))}
                        placeholder="Enter a phone number..."
                        onKeyUp={(event) => {
                          event.target.value = formatUSPhoneNumberPretty(event.target.value);
                        }}
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Mobile Phone</InputLabel>
                      <Input
                        id="cell_phone"
                        type="tel"
                        defaultValue={user.cell_phone}
                        onChange={(event) => this.update(event.target.id, formatUSPhoneNumber(event.target.value))}
                        placeholder="Enter a phone number..."
                        onKeyUp={(event) => {
                          event.target.value = formatUSPhoneNumberPretty(event.target.value);
                        }}
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Fax</InputLabel>
                      <Input
                        id="fax"
                        type="tel"
                        defaultValue={user.fax}
                        onChange={(event) => this.update(event.target.id, formatUSPhoneNumber(event.target.value))}
                        placeholder="Enter a fax number..."
                        onKeyUp={(event) => {
                          event.target.value = formatUSPhoneNumberPretty(event.target.value);
                        }}
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>Birthday</InputLabel>
                      <Input
                        id="birthday"
                        type="date"
                        value={user.birthday}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        max={moment().format("YYYY-MM-DD")}
                        min={moment().subtract(100, "year").format("YYYY-MM-DD")}
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        id="gender"
                        value={user.gender || ""}
                        onChange={(event) => this.update(event.target.id, event.target.value)}>
                        <option disabled value="">Choose a gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="intersex">Intersex</option>
                      </Select>
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem xs={12} sm={12} md={6} lg={6} xl={6}>
                    <InputWrapper>
                      <InputLabel>Preferred pronouns</InputLabel>
                      <Select id="pronouns" value={user.pronouns || ""} onChange={(event) => this.update(event.target.id, event.target.value)}>
                        <option disabled value="">Choose preferred pronouns</option>
                        <option value="female-pronoun">She, Her, Hers</option>
                        <option value="male-pronoun">He, Him, His</option>
                        <option value="nongender-pronoun">They, Them, Theirs</option>
                      </Select>
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>Address</InputLabel>
                      <Input
                        id="address"
                        type="text"
                        value={user.address}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter an address..."
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>Address 2</InputLabel>
                      <Input
                        id="address2"
                        type="text"
                        value={user.address2}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter an address..."
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>City</InputLabel>
                      <Input
                        id="city"
                        type="text"
                        value={user.city}
                        onChange={(event) => this.update(event.target.id, event.target.value)}
                        placeholder="Enter a city..."
                      />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>State</InputLabel>
                      <Select id="state" value={(user.state || "")} onChange={(event) => this.update(event.target.id, event.target.value)}>
                        <option disabled value="">Choose a state</option>
                        {US_STATES.map((formState, index) => {
                          return (
                            <option key={index} value={formState.name}>{formState.name}</option>
                          );
                        })}
                      </Select>
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <InputWrapper>
                      <InputLabel>Zip</InputLabel>
                      <Input
                        type="number"
                        id="zip"
                        value={user.zip}
                        onKeyPress={(event) => limitInput(event, 4)}
                        onChange={(event) => this.update(event.target.id, Number(event.target.value))}
                        placeholder="Enter a zip code..." />
                    </InputWrapper>
                  </FeatureItem>

                  {!updating && pool_type
                    ? (
                      <>
                        <FeatureItem span={12}>
                          <InputWrapper>
                            <InputLabel>Associated Account (Optional)</InputLabel>
                            <ReactSelect
                              components={{ Option: LazyOption, GroupHeading: CustomGroupHeading }}
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
                              name="associated_account"
                              placeholder="Choose an account from the list..."
                              clearValue={() => this.setState({ associated_account: null })}
                              onChange={(aa) => this.setState({ associated_account: aa })}
                              value={associated_account}
                              options={all_accounts}
                              className="select-menu"
                              classNamePrefix="ht"
                            />
                            <InputHint margintop={5}>User will be granted base permissions to this account.</InputHint>
                          </InputWrapper>
                        </FeatureItem>
                        <FeatureItem span={4}>
                          <InputWrapper>
                            <InputLabel marginbottom={5}>Create Hubspot Contact?</InputLabel>
                            <CheckBoxInput id="create_hubspot_contact" onChange={(event) => this.setState({[event.target.id]: event.target.checked})} type="checkbox" defaultChecked={create_hubspot_contact} />
                          </InputWrapper>
                        </FeatureItem>
                        <FeatureItem span={4}>
                          <InputWrapper>
                            <InputLabel marginbottom={5}>Create Stripe Customer?</InputLabel>
                            <CheckBoxInput id="create_stripe_customer" onChange={(event) => this.setState({[event.target.id]: event.target.checked})} type="checkbox" defaultChecked={create_stripe_customer} />
                          </InputWrapper>
                        </FeatureItem>
                      </>
                    )
                    : null
                  }

                  <FeatureItem span={!updating ? 4 : 12}>
                    <InputWrapper>
                      <InputLabel marginbottom={5}>Active?</InputLabel>
                      <CheckBoxInput id="status" onChange={(event) => this.update(event.target.id, (event.target.checked ? "active" : "inactive"))} type="checkbox" defaultChecked={user.status === "active"} />
                    </InputWrapper>
                  </FeatureItem>

                  <FeatureItem span={12}>
                    <ButtonsContainer gutter={20}>
                      {user && user.cognito_id
                        ? (
                          <ButtonItem span={6}>
                            <EditButton rounded green nomargin outline disabled={waiting_for_password} onClick={() => this.resetPassword(user.cognito_id, user.type, user.email)}>{is_sending_password ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : waiting_for_password ? "Password Sent!" : "Send New Password"}</EditButton>
                          </ButtonItem>
                        )
                        : null
                      }
                      {user.cognito_record && !user.cognito_record.PreferredMfaSetting && user.cognito_record.verifications
                        ? (
                          <ButtonItem span={6}>
                            <EditButton disabled={!user.cognito_record.verifications.includes("phone_number_verified")} rounded green nomargin outline onClick={() => this.setSingleUserMFA(user.cognito_id, user.type)}>{updating_mfa ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Turn On MFA"}</EditButton>
                            {!user.cognito_record.verifications.includes("phone_number_verified")
                              ? <ButtonItemMessage>Phone number has not been verified.</ButtonItemMessage>
                              : null
                            }
                          </ButtonItem>
                        )
                        : null
                      }
                      {user.cognito_record && user.cognito_record.PreferredMfaSetting === "SMS_MFA" && user.cognito_record.verifications
                        ? (
                          <ButtonItem span={6}>
                            <EditButton disabled={!user.cognito_record.verifications.includes("phone_number_verified")} rounded green nomargin outline onClick={() => this.resetSingleUserMFA(user.cognito_id, user.type)}>{updating_mfa ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Turn Off MFA"}</EditButton>
                          </ButtonItem>
                        )
                        : null
                      }
                    </ButtonsContainer>
                  </FeatureItem>
                </FeatureItems>
              )
              : null
            }
          </TabContent>
          <FeatureFooter gutter={20}>
            <FeatureFooterSection span={6}>
              {updating
                ? <Button disabled={((Object.keys(updated_user).length === 1 && updated_user.status === initial_status) && !Object.keys(permissions_map).length && !balance) || (!user.first_name || !user.last_name || !(user.email && email_valid))} widthPercent={100} rounded outline green onClick={() => this.saveUser()}>{saving ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Update"}</Button>
                : <Button disabled={!pool_type || ((Object.keys(updated_user).length === 1 && updated_user.status === initial_status) || (!user.first_name || !user.last_name || !(user.email && email_valid)))} widthPercent={100} rounded outline green onClick={() => this.createUser()}>{creating ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Create"}</Button>
              }
            </FeatureFooterSection>
            <FeatureFooterSection span={6}>
              <Button widthPercent={100} rounded outline danger onClick={() => closeUserUpdateModal()}>Cancel</Button>
            </FeatureFooterSection>
          </FeatureFooter>
        </AccountEditModalMain>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  customer_support: state.customer_support,
  wholesale: state.wholesale,
  retail: state.retail,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  updateMembership: (target_account_id, target_cognito_id, updates, user_cognito_id) => dispatch(updateMembership(target_account_id, target_cognito_id, updates, user_cognito_id)),
  getUserRecord: (cognito_id) => dispatch(getUserRecord(cognito_id)),
  updateUserRecord: (cognito_id, updates, type, balance) => dispatch(updateUserRecord(cognito_id, updates, type, balance)),
  createUserRecord: (updates, create_stripe_customer, create_hubspot_contact, associated_account, pool_type) => dispatch(createUserRecord(updates, create_stripe_customer, create_hubspot_contact, associated_account, pool_type)),
  closeUserUpdateModal: () => dispatch(closeUserUpdateModal()),
  setSingleUserMFA: (cognito_id, type) => dispatch(setSingleUserMFA(cognito_id, type)),
  resetSingleUserMFA: (cognito_id, type) => dispatch(resetSingleUserMFA(cognito_id, type)),
  resetUserPassword: (cognito_id, type, email) => dispatch(resetUserPassword(cognito_id, type, email)),
  checkUserEmail: (email, user) => dispatch(checkUserEmail(email, user)),
  checkUsername: (username) => dispatch(checkUsername(username)),
  deleteMembership: (membership_id) => dispatch(deleteMembership(membership_id))
});
export default connect(mapStateToProps, dispatchToProps)(UserEditModal);
