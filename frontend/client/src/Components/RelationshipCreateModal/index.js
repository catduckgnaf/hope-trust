import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { theme } from "../../global-styles";
import { formatUSPhoneNumber, formatUSPhoneNumberPretty, allowNumbersOnly, verifyPhoneFormat, limitInput } from "../../utilities";
import { Row, Col } from "react-simple-flex-grid";
import { US_STATES } from "../../utilities";
import { Modal } from "react-responsive-modal";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createRelationship, updateRelationship, closeCreateRelationshipModal, resetUserPassword, openCreateRelationshipModal } from "../../store/actions/relationship";
import { linkAccountByEmail } from "../../store/actions/account";
import { toastr } from "react-redux-toastr";
import moment from "moment";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import { checkUserEmail } from "../../store/actions/user";
import { capitalize, debounce, isEqual, merge, omit, pickBy, orderBy, uniq } from "lodash";
import CreatableSelect from "react-select/creatable";
import { createFilter, components } from "react-select";
import {
  UserMainContent,
  ViewUserModalInner,
  ViewUserModalInnerLogo,
  ViewUserModalInnerHeader,
  ViewUserModalInnerLogoOverlay,
  ViewUserModalInnerLogoContainer,
  ViewUserModalInnerLogoOverlayIcon,
  Group,
  Icon
} from "./style";
import {
  ViewContainer,
  Button,
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  CheckBoxInput,
  SelectWrapper,
  Select,
  SelectLabel,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import RelationshipPermissionsSettings from "../../Components/RelationshipPermissionsSettings";
import DatePicker from "react-datepicker";
import CustomDateInput from "../../Components/CustomDateInput";
import "react-datepicker/dist/react-datepicker.css";

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

class RelationshipCreateModal extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    let { defaults = {}, updating, customer_support } = props;
    const contact_categories = uniq(customer_support.core_settings.contact_types.map((t) => t.child_category));
    const contact_types = contact_categories.map((cat) => {
      const types = customer_support.core_settings.contact_types.filter((o) => o.child_category === cat);
      const option_items = types.map((o) => {
        return { value: o.type, label: o.type };
      });
      return { options: orderBy(option_items, "value", "asc"), label: cat };
    });
    let newAccountUser = {};
    if (defaults.prefill) {
      delete defaults.prefill;
      newAccountUser = pickBy(defaults, (e) => e);
    }
    this.state = {
      contact_types,
      updates: {
        newAccountUser,
        newAccountMembership: {}
      },
      newAccountUser: {
        address: defaults.address || "",
        address2: defaults.address2 || "",
        city: defaults.city || "",
        state: defaults.state || "",
        zip: defaults.zip || "",
        birthday: defaults.birthday || "",
        pronouns: defaults.pronouns || "",
        first_name: defaults.first_name || "",
        middle_name: defaults.middle_name || "",
        last_name: defaults.last_name || "",
        gender: defaults.gender || "",
        email: (defaults.email || "").toLowerCase().replace(/\s+/g, ""),
        home_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
        fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
        avatar: defaults.avatar || ""
      },
      newAccountMembership: {
        emergency: defaults.emergency || false,
        inherit: defaults.inherit || false,
        primary_contact: defaults.primary_contact || false,
        secondary_contact: defaults.secondary_contact || false,
        type: (defaults.type || "").toLowerCase(),
        permissions: {},
        notify: false
      },
      loaderShow: false,
      loaderMessage: "",
      defaultPermissions: defaults.permissions || [],
      phone_error: "",
      fax_error: "",
      initial_email: (defaults.email || "").toLowerCase().replace(/\s+/g, ""),
      initial_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
      initial_fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
      is_loading: false,
      editing_avatar: false,
      avatar_error: "",
      is_checking_email: false,
      check_email_error: "",
      email_valid: (updating && defaults.email) ? true : false,
      waiting_for_password: false,
      error_code: false
    };
  }

  createRelationship = async () => {
    const { createRelationship, closeCreateRelationshipModal, showNotification, account_id, target_hubspot_deal_id } = this.props;
    const { updates } = this.state;
    let userUpdates = updates;
    userUpdates.newAccountMembership.permissions = this.stagePermissions(userUpdates);
    const isComplete = this.checkCompletion(this.state);
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createRelationship(userUpdates, account_id, target_hubspot_deal_id);
      if (created.success) {
        localStorage.removeItem("react-avatar/failing");
        showNotification("success", "Relationship created", created.message);
        this.setState({ loaderShow: false, loaderMessage: "" });
        closeCreateRelationshipModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Relationship creation failed", created.message);
      }
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields. Some values may not be valid.");
    }
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
        localStorage.removeItem("react-avatar/failing");
        this.setState({ avatar_error: "", editing_avatar: false }, () => this.update("avatar", uri, "newAccountUser"));
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

  updateRelationship = async () => {
    const { updateRelationship, closeCreateRelationshipModal, showNotification, defaults, account_id } = this.props;
    const { updates, initial_email } = this.state;
    let userUpdates = updates;
    userUpdates.newAccountMembership.permissions = this.stagePermissions(userUpdates);
    if (initial_email && initial_email.includes("hopeportalusers") && !userUpdates.email) userUpdates.email = initial_email;
    const isComplete = this.checkCompletion(this.state);
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await updateRelationship(userUpdates, defaults.cognito_id, account_id);
      if (created.success) {
        localStorage.removeItem("react-avatar/failing");
        showNotification("success", "Relationship updated", created.message);
        this.setState({ loaderShow: false, loaderMessage: "" });
        closeCreateRelationshipModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Relationship update failed", created.message);
      }
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields. Some values may not be valid.");
    }
  };

  checkCompletion = (state) => {
    const { defaults } = this.props;
    let is_complete = false;
    if (defaults.is_partner) {
      is_complete = state.newAccountUser.first_name && state.newAccountUser.last_name;
    } else if (defaults.linked_account) {
      is_complete = state.newAccountUser.first_name && state.newAccountUser.last_name && state.newAccountMembership.type;
    } else if (state.newAccountMembership.type === "beneficiary") {
      is_complete = state.newAccountUser.first_name && state.newAccountUser.last_name && state.newAccountUser.email && state.newAccountUser.gender && (state.email_valid && !state.phone_error && !state.fax_error);
    } else {
      is_complete = state.newAccountUser.first_name && state.newAccountUser.last_name && state.newAccountMembership.type && state.newAccountUser.email && state.newAccountUser.home_phone && state.newAccountUser.gender && (state.email_valid && !state.phone_error && !state.fax_error);
    }
    if (is_complete && state.newAccountUser.zip && state.newAccountUser.zip.length !== 5) is_complete = false;
    return is_complete;
  };

  stagePermissions = (userUpdates) => {
    let basePermissions = userUpdates.newAccountMembership.permissions;
    if (basePermissions) {
      let finalPermissions = [];
      Object.keys(basePermissions).forEach((category) => {
        if (basePermissions[category] === "edit") {
          finalPermissions.push(`${category}-edit`);
          finalPermissions.push(`${category}-view`);
        } else if (basePermissions[category] !== "off") {
          finalPermissions.push(`${category}-${basePermissions[category]}`);
        }
      });
      finalPermissions = finalPermissions.filter((p) => !p.includes("basic"));
      return ["basic-user", ...finalPermissions];
    };
    return ["basic-user"];
  };

  setPermission = (category, id) => {
    let { newAccountMembership } = this.state;
    let newPermissions = newAccountMembership.permissions || {};
    newPermissions[category] = id;
    this.update("permissions", newPermissions, "newAccountMembership");
  };

  resetPassword = async (user) => {
    const { resetUserPassword } = this.props;
    this.setState({ is_loading: true, waiting_for_password: true });
    await resetUserPassword(user);
    this.setState({ is_loading: false });
    setTimeout(() => {
      this.setState({ waiting_for_password: false });
    }, 60000);
  };

  checkEmail = async (event) => {
    const { checkUserEmail } = this.props;
    const { initial_email } = this.state;
    if (!this.debouncedFn) {
      this.debouncedFn = debounce(async () => {
        const email = event.target.value;
        if (initial_email !== email) {
          if (email.includes("@")) {
            this.setState({ is_checking_email: true });
            const is_valid_email = await checkUserEmail(email, "relationship");
            this.setState({ check_email_error: is_valid_email.message, email_valid: is_valid_email.success, is_checking_email: false, error_code: is_valid_email.error_code });
          } else {
            this.setState({ check_email_error: false });
            this.setState({ email_valid: false });
          }
        } else {
          this.setState({ check_email_error: false });
          this.setState({ email_valid: false });
        }
      }, 1000);
    }
    this.debouncedFn();
  };

  confirmLinkByEmail = async (email) => {
    const { linkAccountByEmail, showNotification, openCreateRelationshipModal, closeCreateRelationshipModal, account_id } = this.props;
    if (email) {
      const linkOptions = {
        onOk: async () => {
          const linked = await linkAccountByEmail(email, account_id);
          if (linked.success) {
            closeCreateRelationshipModal();
            openCreateRelationshipModal(linked.payload.user, true, false, account_id);
          }
        },
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Invite User",
        cancelText: "Cancel"
      };
      toastr.confirm(`Are you sure you want to add ${email}? Once this user is linked, they will have access to your account.\n\nRemember to grant proper permissions to your new relationship after linking.`, linkOptions);
    } else {
      showNotification("error", "Required Field", "You need to enter an email.");
    }
  };

  update = (key, value, object, transformer) => {
    const { updates } = this.state;
    let updates_copy = updates;
    let state_copy = this.state;
    let target = state_copy[object];
    if (target && target.hasOwnProperty(key)) {
      let newState = merge(target, { [key]: value });
      let updated = { ...updates_copy, [object]: { ...updates_copy[object], [key]: (transformer ? transformer(value) : value) } };
      if (updated[key] && (!value.length || !value) && typeof value !== "boolean") delete updated[key];
      this.setState({ [object]: newState, updates: updated });
    } else {
      this.setState({ [key]: value });
    }
  };

  close = () => {
    const { updates } = this.state;
    const { closeCreateRelationshipModal, updating, defaults } = this.props;
    const permissions = this.stagePermissions(updates);
    const hasUpdates = !!Object.keys(omit({ ...updates.newAccountUser, ...updates.newAccountMembership }, ["permissions"])).length;
    if (hasUpdates || !isEqual(defaults.permissions, permissions)) {
      const closeOptions = {
        onOk: () => updating ? this.updateRelationship() : this.createRelationship(),
        onCancel: () => {
          toastr.removeByType("confirms");
          closeCreateRelationshipModal();
        },
        okText: "Save Changes",
        cancelText: "Close Editor"
      };
      toastr.confirm(`You have unsaved changes. Are you sure you want to close this editor?`, closeOptions);
    } else {
      closeCreateRelationshipModal();
    }
  };

  handleCreateFolder = (value) => {
    if (value) {
      this.update("type", capitalize(value), "newAccountMembership");
    } else {
      alert("You must enter a relationship type.");
    }
  };

  render() {
    const { creatingRelationship, defaults = {}, updating, viewing, account_id } = this.props;
    const {
      contact_types,
      updates,
      newAccountUser: {
        address,
        address2,
        city,
        state,
        zip,
        birthday,
        pronouns,
        first_name,
        middle_name,
        last_name,
        gender,
        email,
        home_phone,
        fax,
        avatar
      },
      newAccountMembership: {
        primary_contact,
        secondary_contact,
        inherit,
        type,
        emergency,
        notify
      },
      loaderShow,
      loaderMessage,
      phone_error,
      fax_error,
      initial_phone,
      initial_fax,
      defaultPermissions,
      is_loading,
      editing_avatar,
      avatar_error,
      is_checking_email,
      email_valid,
      check_email_error,
      waiting_for_password,
      error_code
    } = this.state;
    const { accounts, session } = this.props;
    const permissions = this.stagePermissions(updates);
    const hasUpdates = !!Object.keys(omit({ ...updates.newAccountUser, ...updates.newAccountMembership }, ["permissions"])).length;
    const account = accounts.find((account) => account.account_id === session.account_id);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1000px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingRelationship} onClose={() => this.close()} closeOnOverlayClick={false} center>
        <ViewUserModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewUserModalInnerLogo editing={editing_avatar ? 1 : 0} span={12}>
              {!viewing && (defaults && !defaults.is_partner) && (defaults && !defaults.linked_account)
                ? (
                  <>
                    {!editing_avatar
                      ? (
                        <ViewUserModalInnerLogoContainer>
                          <ViewUserModalInnerLogoOverlay onClick={() => this.setState({ editing_avatar: true })}>
                            <ViewUserModalInnerLogoOverlayIcon>
                              <FontAwesomeIcon icon={["fad", "camera"]} />
                            </ViewUserModalInnerLogoOverlayIcon>
                          </ViewUserModalInnerLogoOverlay>
                          <ReactAvatar size={100} src={avatar || `https://${process.env.REACT_APP_STAGE || "development"}-api.${process.env.REACT_APP_API_BASE}/support/users/get-user-avatar/${defaults.cognito_id}?${Date.now()}`} name={(first_name && last_name) ? `${first_name} ${last_name}` : null} round />
                        </ViewUserModalInnerLogoContainer>
                      )
                      : (
                        <ViewContainer style={{ margin: "auto", position: "relative", width: editing_avatar ? "200px" : "100px", height: editing_avatar ? "200px" : "100px", border: `2px dashed ${avatar_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                          <AvatarImageCr
                            cancel={() => this.setState({ editing_avatar: false, avatar_error: "" }, () => this.update("avatar", "", "newAccountUser"))}
                            apply={(e) => this.onFileChange(e)}
                            isBack={false}
                            text={avatar_error ? avatar_error : "Drag a File or Click to Browse"}
                            errorHandler={(type) => this.throwAvatarError(type)}
                            iconStyle={{ marginBottom: "5px", width: "50px", height: "32px" }}
                            sliderConStyle={{ position: "relative", top: "25px", background: "#FFFFFF" }}
                            textStyle={{ fontSize: "12px" }}
                            actions={[
                              <Button key={0} style={{display: "none"}}></Button>,
                              <Button key={1} small green nomargin marginbottom={5} widthPercent={100}>Apply</Button>
                            ]}
                          />
                        </ViewContainer>
                      )
                    }
                  </>
                )
                : <ReactAvatar size={100} src={defaults.avatar || `https://${process.env.REACT_APP_STAGE}-api.${process.env.REACT_APP_API_BASE}/support/users/get-user-avatar/${defaults.cognito_id}?${Date.now()}`} name={(defaults.first_name && defaults.last_name) ? `${defaults.first_name} ${defaults.last_name}` : null} round />
              }
            </ViewUserModalInnerLogo>
          </Col>
          {editing_avatar
            ? (
              <Col span={12} style={{textAlign: "center", marginTop: "25px"}}>
                <Button onClick={() => this.setState({ editing_avatar: false, avatar_error: "" }, () => this.update("avatar", "", "newAccountUser"))} small danger nomargin marginbottom={5}>Cancel</Button>
              </Col>
            )
            : null
          }
          <UserMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewUserModalInnerHeader is_editing={editing_avatar ? 1 : 0} span={12}>New Relationship</ViewUserModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewUserModalInnerHeader is_editing={editing_avatar ? 1 : 0} span={12}>{updating ? "Updating" : "Viewing"} {defaults.linked_referral ? "New Linked Account" : (defaults.is_partner) ? "Advisor" : "Relationship"}</ViewUserModalInnerHeader>
                : null
              }

              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> First Name:</InputLabel>
                      <Input onChange={(event) => this.update("first_name", event.target.value, "newAccountUser")} maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} type="text" value={first_name} placeholder="Add a first name..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Middle Name:</InputLabel>
                      <Input maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} onChange={(event) => this.update("middle_name", event.target.value, "newAccountUser")} type="text" value={middle_name} placeholder="Add a middle name..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Last Name:</InputLabel>
                      <Input onChange={(event) => this.update("last_name", event.target.value, "newAccountUser")} maxLength={100} readOnly={viewing || defaults.is_partner || defaults.linked_account} type="text" value={last_name} placeholder="Add a last name..." />
                    </InputWrapper>
                  </Col>
                  {(defaults && !defaults.is_partner) && (defaults && !defaults.linked_account)
                    ? (
                      <>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Address:</InputLabel>
                            <Input
                              readOnly={viewing || defaults.is_partner}
                              onChange={(event) => this.update("address", event.target.value, "newAccountUser")}
                              placeholder="Add an address..."
                              autoComplete="new-password"
                              autoFill="off"
                              type="text"
                              name="address1"
                              value={address}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Address 2:</InputLabel>
                            <Input
                              readOnly={viewing || defaults.is_partner}
                              onChange={(event) => this.update("address2", event.target.value, "newAccountUser")}
                              placeholder="Add an address..."
                              autoComplete="new-password"
                              autoFill="off"
                              type="text"
                              name="address2"
                              value={address2}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>City:</InputLabel>
                            <Input
                              readOnly={viewing || defaults.is_partner}
                              onChange={(event) => this.update("city", event.target.value, "newAccountUser")}
                              placeholder="Add a city..."
                              autoComplete="new-password"
                              value={city}
                              autoFill="off"
                              type="text"
                              name="city"
                              maxLength={50}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={6}>
                          <InputWrapper>
                            <InputLabel>State</InputLabel>
                            <SelectLabel>
                              <Select onChange={(event) => this.update("state", event.target.value, "newAccountUser")} value={(state || "")} disabled={viewing || defaults.is_partner}>
                                <option disabled value="">Choose a state</option>
                                {US_STATES.map((state, index) => {
                                  return (
                                    <option key={index} value={state.name}>{state.name}</option>
                                  );
                                })}
                              </Select>
                            </SelectLabel>
                          </InputWrapper>
                        </Col>
                        <Col span={6}>
                          <InputWrapper>
                            <InputLabel>Zip:</InputLabel>
                            <Input
                              readOnly={viewing || defaults.is_partner}
                              onKeyPress={(event) => limitInput(event, 4)}
                              onChange={(event) => this.update("zip", event.target.value, "newAccountUser")}
                              autoComplete="new-password"
                              autoFill="off"
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="0"
                              max="99999"
                              placeholder="Add a zip code..."
                              value={zip}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Birthday:</InputLabel>
                            <DatePicker
                              selected={birthday ? new Date(birthday) : null}
                              dateFormat="MMMM d, yyyy"
                              customInput={<CustomDateInput flat />}
                              onChange={(date) => this.update("birthday", moment(date).utc().format("YYYY-MM-DD"), "newAccountUser")}
                              placeholderText="Choose a birth date"
                              maxDate={new Date()}
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              withPortal
                              minDate={new Date(moment().subtract(100, "year").format("YYYY-MM-DD"))}
                              value={birthday ? new Date(birthday) : null}
                              disabled={viewing || defaults.is_partner}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={6}>
                          <SelectWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar> Gender</InputLabel>
                            <Select
                              id="gender"
                              value={gender || ""}
                              disabled={viewing || defaults.is_partner}
                              onChange={(event) => this.update("gender", event.target.value, "newAccountUser")}>
                              <option disabled value="">Choose a gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="intersex">Intersex</option>
                            </Select>
                          </SelectWrapper>
                        </Col>
                        <Col span={6}>
                          <SelectWrapper>
                            <InputLabel>Preferred pronouns</InputLabel>
                            <Select id="pronouns" value={pronouns || ""} onChange={(event) => this.update("pronouns", event.target.value, "newAccountUser")} disabled={viewing || defaults.is_partner}>
                              <option disabled value="">Choose preferred pronouns</option>
                              <option value="female-pronoun">She, Her, Hers</option>
                              <option value="male-pronoun">He, Him, His</option>
                              <option value="nongender-pronoun">They, Them, Theirs</option>
                            </Select>
                          </SelectWrapper>
                        </Col>
                        {!defaults.is_partner
                          ? (
                            <Col span={12}>
                              <InputWrapper margintop={20}>
                                <InputLabel>{((email && !email.includes("hopeportalusers")) || !email) ? <RequiredStar>*</RequiredStar> : null} Email:</InputLabel>
                                <Input id="relationship_email" readOnly={viewing || defaults.is_partner} onKeyUp={(event) => { event.persist(); this.checkEmail(event); }} onChange={(event) => this.update("email", (event.target.value || "").toLowerCase().replace(/\s+/g, ""), "newAccountUser")} type="email" value={email.includes("hopeportalusers") ? "" : email} placeholder="Add an email..." />
                                <InputHint margintop={5} error={check_email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_checking_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (check_email_error || (!updating ? "A temporary password will be sent to this email." : ""))}</InputHint>
                                {error_code === "email_in_use"
                                  ? <Button type="button" small nomargin margintop={10} green onClick={() => this.confirmLinkByEmail(email)}>Invite User</Button>
                                  : null
                                }
                              </InputWrapper>
                            </Col>
                          )
                          : null
                        }
                        {!defaults.is_partner
                          ? (
                            <Col span={12}>
                              <InputWrapper>
                                <InputLabel>{type !== "beneficiary" ? <RequiredStar>*</RequiredStar> : null} Phone:</InputLabel>
                                <Input
                                  id="home_phone"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  type="tel"
                                  value={home_phone}
                                  minLength={10}
                                  maxLength={10}
                                  autoFill={false}
                                  autoComplete="new-password"
                                  placeholder="Enter a phone number..."
                                  onFocus={(event) => {
                                    this.update(event.target.id, "", "newAccountUser");
                                    this.update("phone_error", "");
                                  }}
                                  onKeyPress={allowNumbersOnly}
                                  onBlur={(event) => {
                                    if (verifyPhoneFormat(event.target.value)) {
                                      this.update(event.target.id, formatUSPhoneNumberPretty(event.target.value), "newAccountUser", formatUSPhoneNumber);
                                      this.update("phone_error", "");
                                    } else if (event.target.value) {
                                      this.update(event.target.id, event.target.value, "newAccountUser");
                                      this.update("phone_error", "This is not a valid phone format.");
                                    } else {
                                      this.update(event.target.id, formatUSPhoneNumberPretty(initial_phone), "newAccountUser", formatUSPhoneNumber);
                                      this.update("phone_error", "");
                                    }
                                  }}
                                  onChange={(event) => this.update(event.target.id, event.target.value, "newAccountUser", formatUSPhoneNumber)}
                                  readOnly={viewing || defaults.is_partner} />
                                  {phone_error
                                    ? <InputHint error>{phone_error}</InputHint>
                                    : null
                                  }
                              </InputWrapper>
                            </Col>
                          )
                          : null
                        }
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Fax:</InputLabel>
                            <Input
                              id="fax"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              type="tel"
                              value={fax}
                              minLength={10}
                              maxLength={10}
                              autoFill={false}
                              autoComplete="new-password"
                              placeholder="Enter a fax number..."
                              onFocus={(event) => {
                                this.update(event.target.id, "", "newAccountUser");
                                this.update("fax_error", "");
                              }}
                              onKeyPress={allowNumbersOnly}
                              onBlur={(event) => {
                                if (verifyPhoneFormat(event.target.value)) {
                                  this.update(event.target.id, formatUSPhoneNumberPretty(event.target.value), "newAccountUser", formatUSPhoneNumber);
                                  this.update("fax_error", "");
                                } else if (event.target.value) {
                                  this.update(event.target.id, event.target.value, "newAccountUser");
                                  this.update("fax_error", "This is not a valid fax format.");
                                } else {
                                  this.update(event.target.id, formatUSPhoneNumberPretty(initial_fax), "newAccountUser", formatUSPhoneNumber);
                                  this.update("fax_error", "");
                                }
                              }}
                              onChange={(event) => this.update(event.target.id, event.target.value, "newAccountUser", formatUSPhoneNumber)}
                              readOnly={viewing || defaults.is_partner} />
                              {fax_error
                                ? <InputHint error>{fax_error}</InputHint>
                                : null
                              }
                          </InputWrapper>
                        </Col>
                      </>
                    )
                    : null
                  }
                  {(defaults && !defaults.is_partner)
                    ? (
                      <>
                        {type !== "advisor" && !defaults.is_partner
                          ? (
                            <Col span={12}>
                              <InputWrapper>
                                <InputLabel><RequiredStar>*</RequiredStar> Relationship Type:</InputLabel>
                                <CreatableSelect
                                  components={{ GroupHeading: CustomGroupHeading }}
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
                                  name="type"
                                  placeholder="Choose a relationship type from the list or create a new one..."
                                  onChange={(select_account) => this.update("type", capitalize(select_account.label), "newAccountMembership")}
                                  value={type ? { value: type, label: capitalize(type) } : null}
                                  onCreateOption={(value) => this.handleCreateFolder(value)}
                                  formatCreateLabel={(value) => `Click or press Enter to create relationship type "${value}"`}
                                  isDisabled={viewing || (updating && (type === "beneficiary"))}
                                  options={contact_types}
                                  className="select-menu"
                                  classNamePrefix="ht"
                                />
                              </InputWrapper>
                            </Col>
                          )
                          : null
                        }
                      </>
                    )
                    : null
                  }
                  {type !== "beneficiary"
                    ? (
                      <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="emergency">Emergency contact:</InputLabel>
                          <CheckBoxInput disabled={viewing} id="emergency" onChange={(event) => this.update("emergency", event.target.checked, "newAccountMembership")} type="checkbox" defaultChecked={emergency} />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {!secondary_contact
                    ? (
                      <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="primary_contact">Primary contact?</InputLabel>
                          <CheckBoxInput disabled={viewing} id="primary_contact" onChange={(event) => this.update("primary_contact", event.target.checked, "newAccountMembership")} type="checkbox" defaultChecked={primary_contact} />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {!primary_contact
                    ? (
                      <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="secondary_contact">Secondary contact?</InputLabel>
                          <CheckBoxInput disabled={viewing} id="secondary_contact" onChange={(event) => this.update("secondary_contact", event.target.checked, "newAccountMembership")} type="checkbox" defaultChecked={secondary_contact} />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {updating || viewing
                    ? null
                    : (
                      <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="notify_user">Notify new user:</InputLabel>
                          <CheckBoxInput defaultChecked={notify} disabled={viewing || defaults.is_partner} id="notify_user" onChange={(event) => this.update("notify", event.target.checked, "newAccountMembership")} type="checkbox" />
                        </InputWrapper>
                      </Col>
                    )
                  }
                  <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                    <InputWrapper>
                      <InputLabel marginbottom={10} htmlFor="inherit">Inherit account:</InputLabel>
                      <CheckBoxInput disabled={viewing} id="inherit" onChange={(event) => this.update("inherit", event.target.checked, "newAccountMembership")} type="checkbox" defaultChecked={inherit} />
                    </InputWrapper>
                  </Col>
                  {account?.features && account?.features?.permissions
                    ? (
                      <Col span={12}>
                        <RelationshipPermissionsSettings disabled={viewing} setPermission={this.setPermission} defaults={defaultPermissions || []} account_id={account_id}/>
                      </Col>
                    )
                    : null
                  }
                </Row>
              </Col>
              {!viewing
                ? (
                  <Col span={12}>
                    {!updating
                      ? <Button disabled={!this.checkCompletion(this.state)} type="button" onClick={() => this.createRelationship()} green nomargin>Create Relationship</Button>
                      : <Button disabled={(hasUpdates || !isEqual(defaults.permissions, permissions)) && !this.checkCompletion(this.state)} type="button" onClick={() => this.updateRelationship()} green nomargin>Update Relationship</Button>
                    }
                    {updating && !defaults.is_partner && ((email && email_valid) && !defaults.email.includes("hopeportalusers")) && !defaults.linked_account
                      ? <Button type="button" disabled={waiting_for_password} onClick={() => this.resetPassword(defaults)} green>{is_loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : waiting_for_password ? "Password Sent!" : "Send New Password"}</Button>
                      : null
                    }
                  </Col>
                )
                : null
              }
            </Row>
          </UserMainContent>
        </ViewUserModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeCreateRelationshipModal: () => dispatch(closeCreateRelationshipModal()),
  openCreateRelationshipModal: (defaults, updating, viewing, account_id) => dispatch(openCreateRelationshipModal(defaults, updating, viewing, account_id)),
  createRelationship: (relationship, account_id, target_hubspot_deal_id) => dispatch(createRelationship(relationship, account_id, target_hubspot_deal_id)),
  updateRelationship: (relationship, cognito_id, account_id) => dispatch(updateRelationship(relationship, cognito_id, account_id)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  resetUserPassword: (user) => dispatch(resetUserPassword(user)),
  linkAccountByEmail: (email, account_id) => dispatch(linkAccountByEmail(email, account_id)),
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipCreateModal);
