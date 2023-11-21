import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCeCourseModal, createCECourse, updateCECourse } from "../../store/actions/ce-management";
import { advisor_types } from "../../store/actions/partners";
import { showNotification } from "../../store/actions/notification";
import CreatableSelect from "react-select/creatable";
import ReactSelect from "react-select";
import Checkbox from "react-simple-checkbox";
import { uniqBy, merge } from "lodash";
import {
  CECourseMainContent,
  ViewCECourseModalInner,
  ViewCECourseModalInnerLogo,
  ViewCECourseModalInnerLogoImg,
  ViewCECourseModalInnerHeader
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
import { numbersLettersUnderscoresHyphens, uniqueID } from "../../utilities";

const category_defaults = [
  { value: "Special Needs Planning Courses", label: "Special Needs Planning Courses" },
  { value: "Hope Trust", label: "Hope Trust" }
];

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

class CECourseCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCeCourseModal: PropTypes.func.isRequired,
    createCECourse: PropTypes.func.isRequired,
    updateCECourse: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, ce_management } = this.props;
    const categories = ce_management.courses.map((q) => q.category);
    const used_categories = categories.map((category) => {
      return { label: capitalize(category), value: category };
    });
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      category: defaults.category || "",
      title: defaults.title || "",
      video_id: defaults.video_id || "",
      quiz_id: defaults.quiz_id || "",
      depends_on: defaults.depends_on || [],
      required_types: defaults.required_types || [],
      training_material_url: defaults.training_material_url,
      course_type: defaults.course_type,
      partner_types: defaults.partner_types || [],
      requires_confirmation: defaults.requires_confirmation || false,
      certificate: defaults.certificate || false,
      organization: defaults.organization,
      status: (defaults.status && defaults.status === "active"),
      description: defaults.description || "",
      org_specific: !!defaults.organization,
      categories: uniqBy([...used_categories, ...category_defaults], "label"),
      updates: {}
    };
  }

  createCECourse = async () => {
    const {
      category,
      title,
      video_id,
      quiz_id,
      training_material_url,
      depends_on,
      required_types,
      partner_types,
      course_type,
      requires_confirmation,
      organization,
      certificate,
      status,
      description
    } = this.state;
    const { createCECourse, closeCeCourseModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Creating..." });
    const created = await createCECourse({
      category,
      title,
      video_id,
      quiz_id,
      training_material_url,
      depends_on,
      required_types,
      partner_types,
      course_type,
      requires_confirmation,
      organization,
      status: (status ? "active" : "inactive"),
      certificate,
      description
    });
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Course Created", "Your course was successfully created.");
      closeCeCourseModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateCECourse = async () => {
    const {
      updates,
      status
    } = this.state;
    const { updateCECourse, closeCeCourseModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateCECourse(defaults.id, {
      ...updates,
      status: (status ? "active" : "inactive")
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Course Updated", "Your course was successfully updated.");
      closeCeCourseModal();
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

  render() {
    const { ce_management, referral, is_open, closeCeCourseModal, updating, viewing, defaults } = this.props;
    const {
      loaderShow,
      loaderMessage,
      category,
      title,
      video_id,
      quiz_id,
      training_material_url,
      depends_on,
      required_types,
      partner_types,
      course_type,
      requires_confirmation,
      certificate,
      organization,
      org_specific,
      status,
      description,
      categories
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCeCourseModal()} center>
        <ViewCECourseModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewCECourseModalInnerLogo span={12}>
              <ViewCECourseModalInnerLogoImg alt="HopeTrust Course Logo" src={icons.colorLogoOnly} />
            </ViewCECourseModalInnerLogo>
          </Col>
          <CECourseMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewCECourseModalInnerHeader span={12}>New Course</ViewCECourseModalInnerHeader>
                : <ViewCECourseModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Course</ViewCECourseModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Is this course organization specific?</InputLabel>
                  <Checkbox
                    checked={org_specific}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.update("org_specific", is_checked);
                      if (!is_checked) this.update("organization", "");
                    }}
                  />
                  <InputHint>This course will only be available to partners at this organization.</InputHint>
                </InputWrapper>
              </Col>
              {org_specific
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Organization</InputLabel>
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
                        placeholder="Choose a course organization..."
                        clearValue={() => this.setState({ organization: "" })}
                        onChange={(val) => this.setState({ organization: val ? val.value : "" })}
                        value={organization ? { value: organization, label: capitalize(organization) } : null}
                        options={referral.list.map((r) => ({ value: r.name, label: r.name }))}
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
                    placeholder="Choose a course category, or create a new one..."
                    clearValue={() => this.setState({ category: "" })}
                    onChange={(val) => this.setState({ category: val ? val.value : "" })}
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
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Course Type</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 1001
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 1001
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
                        zIndex: 1001
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
                    name="course_type"
                    placeholder="Choose a course type..."
                    clearValue={() => this.update("course_type", "")}
                    onChange={(val) => {
                      this.update("course_type", val ? val.value : "")
                      if (val && val.value === "video") this.update("quiz_id", uniqueID());
                      else this.update("quiz_id", "");
                    }}
                    value={course_type ? { value: course_type, label: capitalize(course_type) } : null}
                    options={[
                      { value: "course", label: "Course"},
                      { value: "video", label: "Video"}
                    ]}
                    isDisabled={viewing}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Title</InputLabel>
                  <Input
                    type="text"
                    id="title"
                    value={title}
                    placeholder="Enter a course title..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Vimeo ID</InputLabel>
                  <Input
                    type="text"
                    id="video_id"
                    value={video_id}
                    placeholder="Enter a Vimeo ID..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Quiz ID</InputLabel>
                  <Input
                    readOnly={(updating || viewing) && defaults.count}
                    type="text"
                    id="quiz_id"
                    value={quiz_id}
                    placeholder="Enter a Classmarker ID..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Training Material Link</InputLabel>
                  <Input
                    type="text"
                    id="training_material_url"
                    value={training_material_url}
                    placeholder="Enter a training material link..."
                    onChange={(event) => this.update(event.target.id, event.target.value)} />
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
                    placeholder="Select courses from the list..."
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    value={depends_on.map((course_id) => {
                      const course = ce_management.courses.find((c) => c.quiz_id === course_id);
                      if (course) return { value: course.quiz_id, label: course.title };
                      return null;
                    })}
                    options={ce_management.courses.map((course) => ({ value: course.quiz_id, label: course.title }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>These courses will need to be completed before this course will become available.</InputHint>
                </InputWrapper>
              </Col>
              {!org_specific
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel>Partner Types</InputLabel>
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
                          name="partner_types"
                          placeholder="Select partner types from the list..."
                          backspaceRemovesValue={true}
                          onChange={this.updateSelectInput}
                          value={partner_types.map((partner_type) => {
                            const type = advisor_types.find((c) => c.name === partner_type);
                            if (type) return { value: type.name, label: type.alias };
                            return null;
                          })}
                          options={advisor_types.map((type) => ({ value: type.name, label: type.alias }))}
                          className="select-menu"
                          classNamePrefix="ht"
                        />
                        <InputHint>This course will be available to these partner types.</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel>Required Partner Types</InputLabel>
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
                          name="required_types"
                          placeholder="Select partner types from the list..."
                          backspaceRemovesValue={true}
                          onChange={this.updateSelectInput}
                          value={required_types.map((partner_type) => {
                            const type = advisor_types.find((c) => c.name === partner_type);
                            if (type) return { value: type.name, label: type.alias };
                            return null;
                          })}
                          options={advisor_types.map((type) => ({ value: type.name, label: type.alias }))}
                          className="select-menu"
                          classNamePrefix="ht"
                        />
                        <InputHint>These partner types MUST complete this course.</InputHint>
                      </InputWrapper>
                    </Col>
                  </>
                )
                : null
              }
              {course_type === "video"
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Description (Optional) ({256 - description.length} characters remaining)</InputLabel>
                      <TextArea readOnly={viewing} maxLength={256} onKeyPress={numbersLettersUnderscoresHyphens} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 256)} rows={4} paddingtop={10} placeholder="Add a description for this video..." onChange={(event) => this.update("description", event.target.value)} value={description}></TextArea>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={4}>
                <InputWrapper>
                  <InputLabel>Confirmation Required?</InputLabel>
                  <Checkbox
                    checked={requires_confirmation}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => this.update("requires_confirmation", is_checked)}
                  />
                  <InputHint>If checked, the course taker will need to complete an attestation form prior to their course.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={4}>
                <InputWrapper>
                  <InputLabel>Certificate?</InputLabel>
                  <Checkbox
                    checked={certificate}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => this.update("certificate", is_checked)}
                  />
                  <InputHint>Will this course give a certificate to the course taker?</InputHint>
                </InputWrapper>
              </Col>
              <Col span={4}>
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
                  <InputHint>Should this course be offered to partners?</InputHint>
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button type="button" onClick={() => this.createCECourse()} outline green rounded nomargin>Create Course</Button>
                  : null
                }
                {updating
                  ? <Button type="button" onClick={() => this.updateCECourse()} outline green rounded nomargin>Update Course</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCeCourseModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
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
  ce_management: state.ce_management,
  referral: state.referral
});
const dispatchToProps = (dispatch) => ({
  closeCeCourseModal: () => dispatch(closeCeCourseModal()),
  createCECourse: (question) => dispatch(createCECourse(question)),
  updateCECourse: (id, updates) => dispatch(updateCECourse(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(CECourseCreateModal);
