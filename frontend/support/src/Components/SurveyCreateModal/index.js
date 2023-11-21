import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCreateSurveyModal, createSurvey, updateSurvey } from "../../store/actions/survey";
import { showNotification } from "../../store/actions/notification";
import CreatableSelect from "react-select/creatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSelect from "react-select";
import Checkbox from "react-simple-checkbox";
import { uniqBy, merge, uniq } from "lodash";
import CodeEditor from "@uiw/react-textarea-code-editor";
import Collapsible from "react-collapsible";
import {
  CECourseMainContent,
  ViewCECourseModalInner,
  ViewCECourseModalInnerLogo,
  ViewCECourseModalInnerLogoImg,
  ViewCECourseModalInnerHeader,
  ConditionItem,
  RemoveIcon
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  TextArea,
  RequiredStar,
  SelectStyles,
  InputHint
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { numbersLettersUnderscoresHyphens } from "../../utilities";
import { all_permissions } from "../../store/actions/plans";
import { theme } from "../../global-styles";
import { updateCoreSettings } from "../../store/actions/customer-support";
import { flatten } from "lodash";

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

class SurveyCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateSurveyModal: PropTypes.func.isRequired,
    createSurvey: PropTypes.func.isRequired,
    updateSurvey: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, survey } = props;
    const categories = survey.list.map((q) => q.category);
    const conditions = uniqBy(flatten(survey.list.map((q) => q.conditions)), "name");
    const used_categories = categories.map((category) => {
      return { label: capitalize(category), value: category };
    });
    const used_conditions = conditions.map((condition) => {
      return { label: condition.name, value: condition.code };
    });
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      account_id: defaults.account_id,
      survey_id: defaults ? Number(defaults.survey_id) : "",
      category: defaults.category,
      organization: defaults.organization || null,
      survey_name: defaults.survey_name,
      slug: defaults.slug,
      permissions: defaults.permissions || [],
      project_ids: defaults.project_ids || [],
      collection_ids: defaults.collection_ids || [],
      depends_on: defaults.depends_on || [],
      icon: defaults.icon || "",
      conditions: defaults.conditions || [],
      used_conditions,
      tags: defaults.tags || [],
      no_access_message: defaults.no_access_message || "You do not have access to this survey.",
      action: defaults.action,
      admin_override: defaults.admin_override || false,
      status: (defaults.status && defaults.status === "active"),
      org_specific: !!defaults.organization || false,
      account_specific: !!defaults.account_id || false,
      categories: uniqBy(used_categories, "label"),
      updates: {},
      active_condition: -1,
      selectedIcon: defaults.icon || ""
    };
  }

  createSurvey = async () => {
    const {
      account_id,
      survey_id,
      category,
      organization,
      survey_name,
      slug,
      status,
      permissions,
      project_ids,
      collection_ids,
      icon,
      conditions,
      tags,
      no_access_message,
      action,
      admin_override,
      depends_on
    } = this.state;
    const { customer_support, createSurvey, closeCreateSurveyModal, showNotification, updateCoreSettings } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Creating..." });
    const created = await createSurvey({
      account_id,
      survey_id,
      category,
      organization,
      survey_name,
      slug,
      status: (status ? "active" : "inactive"),
      permissions,
      project_ids,
      collection_ids,
      icon,
      conditions: conditions.map(({ index, ...condition }) => condition),
      tags,
      no_access_message,
      action,
      admin_override,
      depends_on
    });
    if (created.success) {
      updateCoreSettings({ survey_order: uniq([...customer_support.core_settings.survey_order, created.payload.survey_name])});
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Course Created", "Your survey was successfully created.");
      closeCreateSurveyModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateSurvey = async () => {
    const {
      updates,
      status,
      conditions
    } = this.state;
    const { updateSurvey, closeCreateSurveyModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateSurvey(defaults.id, {
      ...{ ...updates, conditions: conditions.map(({ index, ...condition }) => condition) },
      status: (status ? "active" : "inactive")
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Course Updated", "Your survey was successfully updated.");
      closeCreateSurveyModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  update = (key, value) => {
    const { updates } = this.state;
    let updated = merge(updates, { [key]: value });
    if (updated[key] && (!value.length || !value) && typeof value !== "boolean") delete updated[key];
    this.setState({ updates: updated, [key]: value });
  };

  updateConditions = (key, value, index) => {
    const { conditions } = this.state;
    let conditionsCopy = [...conditions];
    conditionsCopy = conditionsCopy.map((c, i) => ({ ...c, index: i }));
    let condition = conditionsCopy.find((c) => c.index === index);
    conditionsCopy.splice(index, 1);
    condition[key] = value;
    conditionsCopy.push(condition);
    this.update("conditions", conditionsCopy);
  };

  handleCreateCategory = (value) => {
    this.setState({ category: value });
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.update(actionOptions.name, difference);
        break;
      case "select-option":
        this.update(actionOptions.name, value.map((e) => e.value));
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.update(actionOptions.name, [...this.state[actionOptions.name], new_option.value]);
        break;
      case "clear":
        this.update(actionOptions.name, []);
        break;
      default:
        break;
    }
  };

  addCondition = (condition) => {
    const { conditions } = this.state;
    let conditionsCopy = [...conditions];
    conditionsCopy.push(condition ? condition : { name: "", code: "const [store] = args;\n\n//Write some Javascript...", index: conditions.length + 1 });
    this.update("conditions", conditionsCopy);
    this.setState({ active_condition: conditions.length });
  };

  removeCondition = (index) => {
    const { conditions } = this.state;
    let conditionsCopy = [...conditions];
    conditionsCopy.splice(index, 1);
    conditionsCopy = conditionsCopy.map((c, i) => ({ ...c, index: i }));
    this.update("conditions", conditionsCopy);
  };

  handleCreateArrayItem = (value, array_key) => {
    let arrayCopy = [...this.state[array_key]];
    arrayCopy.push(value);
    this.update(array_key, arrayCopy);
  };

  render() {
    const { survey, referral, is_open, closeCreateSurveyModal, updating, viewing, defaults, customer_support } = this.props;
    const {
      loaderShow,
      loaderMessage,
      account,
      survey_id,
      category,
      organization,
      survey_name,
      slug,
      status,
      permissions,
      project_ids,
      collection_ids,
      icon,
      conditions,
      used_conditions,
      depends_on,
      tags,
      no_access_message,
      action,
      admin_override,
      account_specific,
      org_specific,
      categories,
      updates,
      active_condition,
      selectedIcon
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateSurveyModal()} center>
        <ViewCECourseModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewCECourseModalInnerLogo span={12}>
              <ViewCECourseModalInnerLogoImg alt="HopeTrust Survey Logo" src={icons.colorLogoOnly} />
            </ViewCECourseModalInnerLogo>
          </Col>
          <CECourseMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewCECourseModalInnerHeader span={12}>New Course</ViewCECourseModalInnerHeader>
                : <ViewCECourseModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Survey</ViewCECourseModalInnerHeader>
              }
              <Col span={6}>
                <InputWrapper>
                  <InputLabel>Is this survey organization specific?</InputLabel>
                  <Checkbox
                    checked={org_specific}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.setState({ org_specific: is_checked });
                      if (!is_checked) this.update("organization", null);
                    }}
                  />
                  <InputHint>This survey will only be available to partners at this organization.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper>
                  <InputLabel>Is this survey account specific?</InputLabel>
                  <Checkbox
                    checked={account_specific}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.setState({ account_specific: is_checked });
                      if (!is_checked) {
                        this.update("account_id", null);
                        this.update("account", null);
                      }
                    }}
                  />
                  <InputHint>This survey will only be available to users of this account.</InputHint>
                </InputWrapper>
              </Col>
              {org_specific
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Organization</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 1003
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 1003
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
                            zIndex: 1003
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
                        name="organization"
                        placeholder="Choose a survey organization..."
                        clearValue={() => this.update("organization", null)}
                        onChange={(val) => this.update("organization", val ? val.value : null)}
                        value={organization ? { value: organization, label: capitalize(organization) } : null}
                        options={referral.list.map((r) => ({ value: r.name, label: r.name }))}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {account_specific
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Account</InputLabel>
                      <ReactSelect
                        styles={{
                          container: (base, state) => ({
                            ...base,
                            opacity: state.isDisabled ? ".5" : "1",
                            backgroundColor: "transparent",
                            zIndex: 1003
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 1003
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
                            zIndex: 1003
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
                        name="account_id"
                        placeholder="Choose an account..."
                        clearValue={() => {
                          this.update("account_id", null);
                          this.update("account", null);
                        }}
                        onChange={(val) => {
                          this.update("account_id", val ? val.value : "");
                          this.update("account", val ? val : "");
                        }}
                        value={account ? { value: account.account_id, label: capitalize(account.name) } : null}
                        options={customer_support.accounts.map((r) => ({ value: r.account_id, label: r.name }))}
                        isDisabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Category</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 1002
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 1002
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
                        zIndex: 1002
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
                    name="category"
                    placeholder="Choose a survey category, or create a new one..."
                    clearValue={() => this.update("category", "")}
                    onChange={(val) => this.update("category", val ? val.value : "")}
                    value={category ? { value: category, label: capitalize(category) } : null}
                    options={categories}
                    onCreateOption={(value) => this.handleCreateCategory(value)}
                    formatCreateLabel={(value) => `Click or press Enter to create new category "${value}"`}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Survey Name</InputLabel>
                  <Input
                    type="text"
                    id="survey_name"
                    value={survey_name}
                    placeholder="Enter a survey name..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Survey ID</InputLabel>
                  <Input
                    disabled={updating || viewing}
                    type="number"
                    id="survey_id"
                    value={survey_id}
                    placeholder="Enter a survey ID..."
                    onChange={(event) => this.update(event.target.id, Number(event.target.value))} />
                    <InputHint error>This must be the survey ID from Alchemer.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Survey Slug</InputLabel>
                  <Input
                    type="text"
                    id="slug"
                    value={slug}
                    placeholder="Enter a survey slug..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                    <InputHint error>This must be the survey slug from Alchemer.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Icon</InputLabel>
                  <Input
                    type="text"
                    id="icon"
                    value={icon}
                    onBlur={() => this.setState({ selectedIcon: icon })}
                    placeholder="Enter a survey icon..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                    <InputHint>
                      {selectedIcon
                        ? <FontAwesomeIcon style={{ marginRight: "10px" }} color={theme.hopeTrustBlue} icon={["fas", selectedIcon]} /> 
                        : null
                      }
                      Enter a <a target="_blank" rel="noreferrer" href="https://fontawesome.com/v6/search">Font Awesome</a> icon slug
                    </InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Action</InputLabel>
                  <Input
                    type="text"
                    id="action"
                    value={action}
                    placeholder="Enter a survey action..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                  <InputHint>This custom action will be run when the survey is clicked instead of the default behavior.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> No Access Message (Optional) ({256 - no_access_message.length} characters remaining)</InputLabel>
                  <TextArea readOnly={viewing} maxLength={256} onKeyPress={numbersLettersUnderscoresHyphens} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 256)} rows={4} paddingtop={10} placeholder="Add a message for this survey..." onChange={(event) => this.update("no_access_message", event.target.value)} value={no_access_message}></TextArea>
                  <InputHint>This message will be shown when a user does not have access to the survey.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Depends On</InputLabel>
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
                    isDisabled={viewing}
                    name="depends_on"
                    placeholder="Select surveys from the list..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    value={depends_on.map((sid) => {
                      const s = survey.list.find((c) => c.survey_id === Number(sid));
                      if (s) return { value: Number(s.survey_id), label: s.survey_name };
                      return null;
                    })}
                    options={(defaults ? survey.list.filter((s) => s.survey_id !== survey_id) : survey.list).map((survey) => ({ value: survey.survey_id, label: survey.survey_name }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>These surveys will need to be completed before this survey will become available.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Permissions</InputLabel>
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
                    isDisabled={viewing}
                    name="permissions"
                    placeholder="Select permissions from the list..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={[{ value: "basic-user", label: "Basic User" }]}
                    value={permissions.map((p) => {
                      const permission = all_permissions.find((c) => c.value === p);
                      if (permission) return permission;
                      return null;
                    })}
                    options={all_permissions}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>This survey will be available to users with these permissions.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Tags</InputLabel>
                  <CreatableSelect
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
                    isDisabled={viewing}
                    name="tags"
                    placeholder="Select tags from the list or enter a new one..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    onCreateOption={(value) => this.handleCreateArrayItem(value, "tags")}
                    formatCreateLabel={(value) => `Click or press Enter to create new tag "${value}"`}
                    value={tags.map((t) => ({ value: t, label: capitalize(t) }))}
                    options={(defaults.tags || []).map((t) => ({ value: t, label: capitalize(t) }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>Tags will be used for categorization.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Project IDs</InputLabel>
                  <CreatableSelect
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
                    isMulti
                    isDisabled={viewing}
                    name="project_ids"
                    placeholder="Enter AX Semantics project IDs..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    onCreateOption={(value) => this.handleCreateArrayItem(value, "project_ids")}
                    formatCreateLabel={(value) => `Click or press Enter to create new project ID "${value}"`}
                    value={project_ids.map((project_id) => ({ value: project_id, label: project_id }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>Survey data will be sent to these AX Semantics projects for text generation.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Collection IDs</InputLabel>
                  <CreatableSelect
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
                    isMulti
                    isDisabled={viewing}
                    name="collection_ids"
                    placeholder="Enter AX Semantics collection IDs..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    onCreateOption={(value) => this.handleCreateArrayItem(Number(value), "collection_ids")}
                    formatCreateLabel={(value) => `Click or press Enter to create new collection ID "${value}"`}
                    value={collection_ids.map((collection_id) => ({ value: Number(collection_id), label: collection_id }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>Survey data will be sent to these AX Semantics collections for text generation.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper>
                  <InputLabel>Admin Override?</InputLabel>
                  <Checkbox
                    checked={admin_override}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => this.update("admin_override", is_checked)}
                  />
                  <InputHint>If checked, this survey will show any admin-only questions within the survey (For testing purposes)</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Conditions</InputLabel>
                  <InputWrapper margintop={10}>
                    <InputLabel><RequiredStar>*</RequiredStar> Condition Name</InputLabel>
                    <CreatableSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent",
                          zIndex: 1002
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 1002
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
                          zIndex: 1002
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
                      name="name"
                      placeholder="Choose a condition, or create a new one..."
                      onChange={(val) => this.addCondition({ name: val.label, code: val.value, index: (used_conditions.length + 1) })}
                      options={used_conditions}
                      value={null}
                      onCreateOption={(value) => this.addCondition({ name: value, code: "", index: (used_conditions.length + 1) })}
                      formatCreateLabel={(value) => `Click or press Enter to create new condition "${value}"`}
                      isDisabled={viewing}
                    />
                  </InputWrapper>
                  {conditions.map((condition, index) => {
                    return (
                      <Collapsible key={index} open={active_condition === index} trigger={<ConditionItem><span><FontAwesomeIcon icon={["fad", "code"]} style={{marginRight: "10px"}}/> {condition.name || "Untitled Condition"}</span><RemoveIcon onClick={() => this.removeCondition(index)}><FontAwesomeIcon icon={["fas", "times"]} /></RemoveIcon></ConditionItem>}>
                        <InputWrapper margintop={10}>
                          <InputLabel><RequiredStar>*</RequiredStar> Condition Name</InputLabel>
                          <Input
                            type="text"
                            id="name"
                            value={condition.name}
                            placeholder="Enter a survey ID..."
                            onChange={(event) => this.updateConditions(event.target.id, event.target.value, index)} />
                        </InputWrapper>
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Condition Code</InputLabel>
                          <CodeEditor
                            value={condition.code}
                            language="js"
                            placeholder="Enter javascript code..."
                            onChange={(evn) => this.updateConditions("code", evn.target.value, index)}
                            padding={15}
                            minHeight={200}
                            style={{
                              fontSize: 12,
                              backgroundColor: "#f5f5f5",
                              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                            }}
                          />
                        </InputWrapper>
                      </Collapsible>
                    );
                  })}
                  <Button small blue outline rounded nomargin margintop={10} onClick={() => this.addCondition()}>Add Condition</Button>
                </InputWrapper>
              </Col>
              <Col span={6}>
                <InputWrapper>
                  <InputLabel>Active?</InputLabel>
                  <Checkbox
                    checked={status}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.update("status", is_checked)
                    }}
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button disabled={!Object.values(updates).length} type="button" onClick={() => this.createSurvey()} outline green rounded nomargin>Create Survey</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!Object.values(updates).length} type="button" onClick={() => this.updateSurvey()} outline green rounded nomargin>Update Survey</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateSurveyModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </CECourseMainContent>
        </ViewCECourseModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  survey: state.survey,
  referral: state.referral,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  updateCoreSettings: (updates) => dispatch(updateCoreSettings(updates)),
  closeCreateSurveyModal: () => dispatch(closeCreateSurveyModal()),
  createSurvey: (question) => dispatch(createSurvey(question)),
  updateSurvey: (id, updates) => dispatch(updateSurvey(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(SurveyCreateModal);
