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
import { createRelationship, updateRelationship, resetUserPassword, closeCreateRelationshipModal, openCreateRelationshipModal } from "../../store/actions/relationship";
import moment from "moment";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import { checkUserEmail } from "../../store/actions/user";
import { debounce } from "lodash";
import {
  UserMainContent,
  ViewUserModalInner,
  ViewUserModalInnerLogo,
  ViewUserModalInnerHeader,
  ViewUserModalInnerLogoOverlay,
  ViewUserModalInnerLogoContainer,
  ViewUserModalInnerLogoOverlayIcon
} from "./style";
import {
  ViewContainer,
  Button,
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  CheckBoxInput,
  RequiredStar,
  SelectLabel,
  SelectWrapper,
  Select
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import RelationshipPermissionsSettings from "../../Components/RelationshipPermissionsSettings";

class RelationshipCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, updating, user, session } = props;
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      permissions: {},
      defaultPermissions: defaults.permissions || [],
      phone_error: "",
      fax_error: "",
      initial_email: defaults.email || "",
      first_name: defaults.first_name || "",
      last_name: defaults.last_name || "",
      gender: defaults.gender || "",
      email: defaults.email || "",
      initial_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
      home_phone: defaults ? (formatUSPhoneNumberPretty(defaults.home_phone || "")) : "",
      initial_fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
      fax: defaults ? (formatUSPhoneNumberPretty(defaults.fax || "")) : "",
      is_loading: false,
      waiting_for_password: false,
      imageSrc: "",
      editing_avatar: false,
      avatar_error: "",
      is_checking_email: false,
      check_email_error: "",
      email_valid: (updating && defaults.email) ? true : false,
      account,
      error_code: false
    };
  }

  createRelationship = async () => {
    const { createRelationship, closeCreateRelationshipModal, showNotification, defaults } = this.props;
    const { first_name, last_name, gender, permissions, email, home_phone, fax, phone_error, fax_error, imageSrc, email_valid, account } = this.state;
    let middle_name = this.middleNameInput.value;
    let address = this.addressInput.value;
    let address2 = this.address2Input.value;
    let city = this.cityInput.value;
    let state = this.stateInput.value;
    let zip = this.zipInput.value;
    let birthday = this.birthdayInput.value;
    let pronouns = this.pronounsInput.value;
    let notify = this.notifyInput.checked;
    let finalPermissions = [];
    Object.keys(permissions).forEach((category) => {
      if (permissions[category] === "edit") {
        finalPermissions.push(`${category}-edit`);
        finalPermissions.push(`${category}-view`);
      } else if (permissions[category] !== "off") {
        finalPermissions.push(`${category}-${permissions[category]}`);
      }
    });
    finalPermissions = finalPermissions.filter((p) => !p.includes("basic"));
    const isComplete = this.checkCompletion(first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid);
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Creating..." });
      const created = await createRelationship({
        first_name,
        middle_name,
        last_name,
        email: (email).toLowerCase(),
        address,
        address2,
        city,
        state,
        zip,
        birthday,
        gender,
        pronouns,
        home_phone: formatUSPhoneNumber(home_phone),
        fax: formatUSPhoneNumber(fax),
        permissions: ["basic-user", account.type, ...finalPermissions],
        notify,
        avatar: imageSrc || defaults.avatar
      });
      if (created.success) {
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

  updateRelationship = async () => {
    const { updateRelationship, closeCreateRelationshipModal, showNotification, defaults } = this.props;
    const { first_name, last_name, gender, permissions, home_phone, fax, phone_error, fax_error, imageSrc, email_valid, initial_email, account } = this.state;
    let { email } = this.state;
    let middle_name = this.middleNameInput.value;
    let address = this.addressInput ? this.addressInput.value : null;
    let address2 = this.address2Input ? this.address2Input.value : null;
    let city = this.cityInput ? this.cityInput.value : null;
    let state = this.stateInput ? this.stateInput.value : null;
    let zip = this.zipInput ? this.zipInput.value : null;
    let birthday = this.birthdayInput ? this.birthdayInput.value : null;
    let pronouns = this.pronounsInput ? this.pronounsInput.value : null;
    let finalPermissions = [];
    Object.keys(permissions).forEach((category) => {
      if (permissions[category] === "edit") {
        finalPermissions.push(`${category}-edit`);
        finalPermissions.push(`${category}-view`);
      } else if (permissions[category] !== "off") {
        finalPermissions.push(`${category}-${permissions[category]}`);
      }
    });
    finalPermissions = finalPermissions.filter((p) => !p.includes("basic"));
    email = (initial_email && initial_email.includes("hopeportalusers") && !email) ? initial_email : email;
    const isComplete = this.checkCompletion(first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid);
    if (isComplete) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await updateRelationship({
        first_name,
        middle_name,
        last_name,
        email: (email).toLowerCase(),
        address,
        address2,
        city,
        state,
        zip,
        birthday,
        gender,
        pronouns,
        home_phone: formatUSPhoneNumber(home_phone),
        fax: formatUSPhoneNumber(fax),
        permissions: ["basic-user", account.type, ...finalPermissions],
        avatar: imageSrc || defaults.avatar
      }, defaults.cognito_id);
      if (created.success) {
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

  checkCompletion = (first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid) => {
    return first_name && last_name && email && home_phone && gender && (email_valid && !phone_error && !fax_error);
  };

  setPermission = (category, id) => {
    let { permissions } = this.state;
    let newPermissions = permissions;
    newPermissions[category] = id;
    this.setState({
      permissions: newPermissions
    });
  };

  checkEmail = async (event) => {
    const { checkUserEmail } = this.props;
    const { initial_email, email } = this.state;
    event.persist();

    if (initial_email !== email) {
      if (!this.debouncedFn) {
        this.debouncedFn = debounce(async () => {
          let email = event.target.value;
          if (email.includes("@")) {
            this.setState({ is_checking_email: true });
            const is_valid_email = await checkUserEmail(email, "relationship");
            this.setState({ check_email_error: is_valid_email.message, email_valid: is_valid_email.success, is_checking_email: false, error_code: is_valid_email.error_code });
          } else {
            this.setState({ check_email_error: false });
            this.setState({ email_valid: false });
          }
        }, 1000);
      }
      this.debouncedFn();
    } else {
      this.setState({ check_email_error: false });
      this.setState({ email_valid: true });
    }
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

  render() {
    const { updating, viewing, creatingRelationship, closeCreateRelationshipModal, defaults = {} } = this.props;
    const { is_loading, first_name, last_name, gender, account, loaderShow, loaderMessage, phone_error, fax_error, initial_phone, initial_fax, email, home_phone, fax, defaultPermissions, editing_avatar, imageSrc, avatar_error, is_checking_email, email_valid, check_email_error, waiting_for_password } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1000px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingRelationship} onClose={() => closeCreateRelationshipModal()} closeOnOverlayClick={false} center>
        <ViewUserModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewUserModalInnerLogo editing={editing_avatar ? 1 : 0} span={12}>
              <>
                {!editing_avatar
                  ? (
                    <ViewUserModalInnerLogoContainer>
                      {!viewing
                        ? (
                          <ViewUserModalInnerLogoOverlay onClick={() => this.setState({ editing_avatar: true })}>
                            <ViewUserModalInnerLogoOverlayIcon>
                              <FontAwesomeIcon icon={["fad", "camera"]} />
                            </ViewUserModalInnerLogoOverlayIcon>
                          </ViewUserModalInnerLogoOverlay>
                        )
                        : null
                      }
                      <ReactAvatar size={100} src={imageSrc || defaults.avatar} name={(defaults.first_name && defaults.last_name) ? `${defaults.first_name} ${defaults.last_name}` : null} round />
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
              </>
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
          <UserMainContent span={12}>
            <Row>
              <ViewUserModalInnerHeader is_editing={editing_avatar ? 1 : 0} span={12}>New Relationship</ViewUserModalInnerHeader>

              <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <Row>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> First Name:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ first_name: event.target.value })} maxLength={100} type="text" value={first_name} placeholder="Add a first name..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Middle Name:</InputLabel>
                      <Input readOnly={viewing} maxLength={100} ref={(input) => this.middleNameInput = input} type="text" defaultValue={defaults.middle_name} placeholder="Add a middle name..." />
                    </InputWrapper>
                  </Col>
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Last Name:</InputLabel>
                      <Input readOnly={viewing} onChange={(event) => this.setState({ last_name: event.target.value })} maxLength={100} type="text" value={last_name} placeholder="Add a last name..." />
                    </InputWrapper>
                  </Col>
                  {defaults
                    ? (
                      <>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Address:</InputLabel>
                            <Input
                              ref={(input) => this.addressInput = input}
                              placeholder="Add an address..."
                              autoComplete="new-password"
                              autoFill="off"
                              type="text"
                              name="address1"
                              defaultValue={defaults.address}
                              readOnly={viewing}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Address 2:</InputLabel>
                            <Input
                              ref={(input) => this.address2Input = input}
                              placeholder="Add an address..."
                              autoComplete="new-password"
                              autoFill="off"
                              type="text"
                              name="address2"
                              defaultValue={defaults.address2}
                              readOnly={viewing}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>City:</InputLabel>
                            <Input
                              ref={(input) => this.cityInput = input}
                              placeholder="Add a city..."
                              autoComplete="new-password"
                              defaultValue={defaults.city}
                              autoFill="off"
                              type="text"
                              name="city"
                              maxLength={50}
                              readOnly={viewing}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={6}>
                          <InputWrapper>
                            <InputLabel>State</InputLabel>
                            <SelectLabel>
                              <Select disabled={viewing} ref={(input) => this.stateInput = input} defaultValue={(defaults.state || "")}>
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
                              onKeyPress={(event) => limitInput(event, 4)}
                              ref={(input) => this.zipInput = input}
                              autoComplete="new-password"
                              autoFill="off"
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min="0"
                              max="99999"
                              placeholder="Add a zip code..."
                              defaultValue={defaults.zip}
                              readOnly={viewing}
                            />
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel>Birthday:</InputLabel>
                            <Input readOnly={viewing} max={moment().format("YYYY-MM-DD")} min={moment().subtract(100, "year").format("YYYY-MM-DD")} defaultValue={defaults.birthday} ref={(input) => this.birthdayInput = input} type="date" />
                          </InputWrapper>
                        </Col>
                        <Col span={6}>
                          <SelectWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar> Gender</InputLabel>
                            <Select
                              id="gender"
                              value={gender || ""}
                              disabled={viewing}
                              onChange={(event) => this.setState({ gender: event.target.value })}>
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
                            <Select disabled={viewing} id="pronouns" defaultValue={defaults.pronouns || ""} ref={(input) => this.pronounsInput = input}>
                              <option disabled value="">Choose preferred pronouns</option>
                              <option value="female-pronoun">She, Her, Hers</option>
                              <option value="male-pronoun">He, Him, His</option>
                              <option value="nongender-pronoun">They, Them, Theirs</option>
                            </Select>
                          </SelectWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper margintop={20}>
                            <InputLabel>{((email && !email.includes("hopeportalusers")) || !email) ? <RequiredStar>*</RequiredStar> : null} Email:</InputLabel>
                            <Input readOnly={viewing} id="relationship_email" onKeyUp={this.checkEmail} onChange={(event) => this.setState({ email: event.target.value })} type="email" value={email.includes("hopeportalusers") ? "" : email} placeholder="Add an email..." />
                            <InputHint margintop={5} error={check_email_error ? 1 : 0} success={email_valid ? 1 : 0}>{is_checking_email ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : (check_email_error || "A temporary password will be sent to this email.")}</InputHint>
                          </InputWrapper>
                        </Col>
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar> Phone:</InputLabel>
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
                              readOnly={viewing}
                              onFocus={(event) => {
                                this.setState({ [event.target.id]: "" });
                                this.setState({ phone_error: "" });
                              }}
                              onKeyPress={allowNumbersOnly}
                              onBlur={(event) => {
                                if (verifyPhoneFormat(event.target.value)) {
                                  this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                                  this.setState({ phone_error: "" });
                                } else if (event.target.value) {
                                  this.setState({ [event.target.id]: event.target.value });
                                  this.setState({ "phone_error": "This is not a valid phone format." });
                                } else {
                                  this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_phone) });
                                  this.setState({ phone_error: "" });
                                }
                              }}
                              onChange={(event) => this.setState({ [event.target.id]: event.target.value })} />
                              {phone_error
                                ? <InputHint error>{phone_error}</InputHint>
                                : null
                              }
                          </InputWrapper>
                        </Col>
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
                              readOnly={viewing}
                              onFocus={(event) => {
                                this.setState({ [event.target.id]: "" });
                                this.setState({ fax_error: "" });
                              }}
                              onKeyPress={allowNumbersOnly}
                              onBlur={(event) => {
                                if (verifyPhoneFormat(event.target.value)) {
                                  this.setState({ [event.target.id]: formatUSPhoneNumberPretty(event.target.value) });
                                  this.setState({ fax_error: "" });
                                } else if (event.target.value) {
                                  this.setState({ [event.target.id]: event.target.value });
                                  this.setState({ "fax_error": "This is not a valid fax format." });
                                } else {
                                  this.setState({ [event.target.id]: formatUSPhoneNumberPretty(initial_fax) });
                                  this.setState({ fax_error: "" });
                                }
                              }}
                              onChange={(event) => this.setState({ [event.target.id]: event.target.value })} />
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
                  {!updating && !viewing
                    ? (
                      <Col xs={12} sm={12} md={2} lg={2} xl={2}>
                        <InputWrapper>
                          <InputLabel marginbottom={10} htmlFor="notify_user">Notify new user:</InputLabel>
                          <CheckBoxInput readOnly={viewing} defaultChecked={true} id="notify_user" ref={(input) => this.notifyInput = input} type="checkbox" />
                        </InputWrapper>
                      </Col>
                    )
                    : null
                  }
                  {account.features && account.features.permissions
                    ? (
                      <Col span={12}>
                        <RelationshipPermissionsSettings disabled={!account.permissions.includes("account-admin-edit")} setPermission={this.setPermission} defaults={defaultPermissions || []} />
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
                      ? <Button disabled={!this.checkCompletion(first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid)} type="button" onClick={() => this.createRelationship()} outline green rounded nomargin>Create Relationship</Button>
                      : <Button disabled={!this.checkCompletion(first_name, last_name, email, home_phone, phone_error, fax_error, gender, email_valid)} type="button" onClick={() => this.updateRelationship()} outline green rounded nomargin>Update Relationship</Button>
                    }
                    {updating && (email && email_valid)
                      ? <Button type="button" disabled={waiting_for_password} onClick={() => this.resetPassword(defaults)} outline green rounded>{is_loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : waiting_for_password ? "Password Sent!" : "Send New Password"}</Button>
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
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  closeCreateRelationshipModal: () => dispatch(closeCreateRelationshipModal()),
  openCreateRelationshipModal: (defaults, updating, viewing) => dispatch(openCreateRelationshipModal(defaults, updating, viewing)),
  createRelationship: (relationship) => dispatch(createRelationship(relationship)),
  updateRelationship: (relationship, cognito_id) => dispatch(updateRelationship(relationship, cognito_id)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  resetUserPassword: (user) => dispatch(resetUserPassword(user))
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipCreateModal);
