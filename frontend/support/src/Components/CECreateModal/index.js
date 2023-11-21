import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCeConfigModal, createCEConfig, updateCEConfig } from "../../store/actions/ce-management";
import { showNotification } from "../../store/actions/notification";
import ReactSelect from "react-select";
import { merge, uniq } from "lodash";
import Checkbox from "react-simple-checkbox";
import moment from "moment";
import {
  CEConfigMainContent,
  ViewCEConfigModalInner,
  ViewCEConfigModalInnerLogo,
  ViewCEConfigModalInnerLogoImg,
  ViewCEConfigModalInnerHeader,
  SignatureImageContainer,
  SignatureImage
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
import { US_STATES } from "../../utilities";
import { coordinator_signature, instructor_signature } from "../../assets/images/signatures";
import Resizer from "react-image-file-resizer";

const default_proctor_language = "I certify that I verified the identity of {{first_name}} {{last_name}} and that they completed the exam without assistance from any course or reference material, other source material, or outside assistance of any kind from any person or electronic device, directly or indirectly, while taking the exam.  I further attest that I am a disinterested third party, who is at least 18 years old, not related to, not an immediate supervisor or reporting employee of, and not concerned, with respect to possible gain or loss, in the result of the pending course final examination of the above named.";
const default_student_attestation = "I, {{first_name}} {{last_name}}, attest that I personally completed the entire course study material. I have not used any fraudulent or deceptive means to complete this course. I further affirm that I am completing the final exam without assistance from any course or reference material, other source material, or outside assistance of any kind from any person or electronic device, directly or indirectly, while taking the exam. I understand that I may be subject to state administrative action, which may include the revocation of my insurance license, if the state insurance department determines that I have provided it with false information in this or any other statement.";
const default_student_attestation_with_proctor = "I, {{first_name}} {{last_name}}, attest that I personally completed the entire course study material. I have not used any fraudulent or deceptive means to complete this course. I further affirm that I am completing the final exam without assistance from any course or reference material, other source material, or outside assistance of any kind from any person or electronic device, directly or indirectly, while taking the exam. I understand the self-study exam must be proctored by a disinterested third party, who is an individual that is at least 18 years old, not a relative, immediate supervisor or reporting employee of mine, and not concerned, with respect to possible gain or loss, in the result of the pending course final examination. If I launch the exam without a proctor present, I will be disqualified from receiving CE credit for the course. I understand that I may be subject to state administrative action, which may include the revocation of my insurance license, if the state insurance department determines that I have provided it with false information in this or any other statement.";
const student_attestation_note = "Student attestation required for CE credits to be reported to the department of insurance. A passing score of 70% or higher is required to earn CE credits. If student does not pass, student may retake the exam an unlimited number of times.";

const CE_COURSE_PRODUCT = "General Life Insurance";
const CE_COORDINATOR_SIGNATURE = coordinator_signature;
const CE_INSTRUCTOR_SIGNATURE = instructor_signature;
const CE_COORDINATOR_NAME = "Leslie Streitfeld";
const CE_INSTRUCTOR_NAME = "Deborah Niemann";
const CE_COORDINATOR_INFO = "Adjunct Instructor/Course Coordinator, Hope Trust, 101 Crawfords Corner Road, Suite 4-101R, Holmdel, NJ 07733, 833 - 467 - 3878";
const CE_INSTRUCTOR_INFO = "Vice President of Financial Services, Hope Trust, 101 Crawfords Corner Road, Suite 4-101R, Holmdel, NJ 07733, 833 - 467 - 3878";
const COURSE_NAME = "An Interdisciplinary Approach to Special Needs Planning";
const CREDITS_VALUE = 6;

const required_fields = [
  "state",
  "student_attestation",
  "provider_number",
  "course_number",
  "course_product",
  "credits_value",
  "course_name"
];

const proctor_required_fields = [
  "proctor_required",
  "proctor_language"
];

const coordinator_required_fields = [
  "coordinator_number",
  "has_coordinator",
  "coordinator_name",
  "coordinator_info",
  "coordinator_signature"
];

const instructor_required_fields = [
  "has_instructor",
  "instructor_name",
  "instructor_info",
  "instructor_signature"
];

class CECreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCeConfigModal: PropTypes.func.isRequired,
    createCEConfig: PropTypes.func.isRequired,
    updateCEConfig: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, ce_management } = props;
    const unavailable = ce_management.list.map((s) => s.state);
    const template = {
      proctor_language: default_proctor_language,
      student_attestation: default_student_attestation_with_proctor,
      proctor_required: true,
      virtual_proctor: false,
      coordinator_number: "",
      instructor_number: "",
      provider_number: "",
      provider_renewal: null,
      course_number: "",
      course_product: CE_COURSE_PRODUCT,
      course_renewal: null,
      introduction_statement_link: "",
      credits_value: CREDITS_VALUE,
      course_name: COURSE_NAME,
      student_attestation_note,
      has_coordinator: true,
      has_instructor: true,
      coordinator_name: CE_COORDINATOR_NAME,
      instructor_name: CE_INSTRUCTOR_NAME,
      coordinator_info: CE_COORDINATOR_INFO,
      instructor_info: CE_INSTRUCTOR_INFO,
      coordinator_signature: CE_COORDINATOR_SIGNATURE,
      instructor_signature: CE_INSTRUCTOR_SIGNATURE,
      status: defaults.status || "inactive"
    };
    const current_state = defaults.state ? { value: defaults.state, label: defaults.state } : null;
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      current_state,
      config: Object.keys(defaults).length ? defaults : template,
      updates: !Object.keys(defaults).length ? template : { status: defaults.status || "inactive" },
      available_states: US_STATES.filter((s) => !unavailable.includes(s.name))
      .map((s) => {
        return { value: s.name, label: s.name };
      })
    };
  }

  getRequired = () => {
    const { defaults } = this.props;
    const { updates } = this.state;
    const { has_coordinator, has_instructor, proctor_required } = updates;
    let all_fields = required_fields;
    if (proctor_required) all_fields.push(...proctor_required_fields);
    else if (!proctor_required) all_fields = all_fields.filter((field) => !proctor_required_fields.includes(field));
    if (has_coordinator) all_fields.push(...coordinator_required_fields);
    else if (!has_coordinator) all_fields = all_fields.filter((field) => !coordinator_required_fields.includes(field));
    if (has_instructor) all_fields.push(...instructor_required_fields);
    else if (!has_instructor) all_fields = all_fields.filter((field) => !instructor_required_fields.includes(field));
    return uniq(all_fields).every((field) => Object.keys(defaults).length ? defaults[field] : updates[field]);
  };

  update = (key, value) => {
    const { config, updates } = this.state;
    const newState = merge(config, { [key]: value });
    let updated = merge(updates, { [key]: value });
    if (updated[key] && (!value.length || !value) && typeof value !== "boolean") delete updated[key];
    this.setState({ config: newState, updates: updated });
  };

  createCEConfig = async () => {
    const { updates } = this.state;
    const { createCEConfig, closeCeConfigModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    if (this.getRequired()) {
      const created = await createCEConfig(updates);
      if (created.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Configuration Created", "Your CE configuration was successfully created.");
        closeCeConfigModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", created.message);
      }
    } else {
      showNotification("error", "Required Field", "You must fill in all required fields.");
    }
  };

  updateCEConfig = async () => {
    const { updates } = this.state;
    const { updateCEConfig, closeCeConfigModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    if (this.getRequired()) {
      const updated = await updateCEConfig(defaults.id, updates);
      if (updated.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Configuration Updated", "Your CE configuration was successfully updated.");
        closeCeConfigModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", updated.message);
      }
    } else {
      showNotification("error", "Required Field", "You must fill in all required fields.");
    }
  };

  onFileChange = async (event, key) => {
    event.persist();
    Resizer.imageFileResizer(
      event.target.files[0],
      560,
      125,
      "PNG",
      100,
      0,
      (uri) => {
        this.update(key, uri);
      },
      "base64",
      560,
      125
    );
  };

  render() {
    const { is_open, closeCeConfigModal, updating, viewing } = this.props;
    const { loaderShow, loaderMessage, config, available_states, current_state, updates } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCeConfigModal()} center>
        <ViewCEConfigModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewCEConfigModalInnerLogo span={12}>
              <ViewCEConfigModalInnerLogoImg alt="HopeTrust CE Configuration Logo" src={icons.colorLogoOnly} />
            </ViewCEConfigModalInnerLogo>
          </Col>
          <CEConfigMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewCEConfigModalInnerHeader span={12}>New CE Configuration</ViewCEConfigModalInnerHeader>
                : <ViewCEConfigModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} CE Configuration</ViewCEConfigModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> State</InputLabel>
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
                    name="state"
                    placeholder="Choose a state from the list..."
                    onChange={(state) => this.setState({ current_state: state }, () => this.update("state", state.label))}
                    value={current_state}
                    options={available_states}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              {config.has_coordinator
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Coordinator Number:</InputLabel>
                      <Input readOnly={viewing} type="text" value={config.coordinator_number} onChange={(event) => this.update("coordinator_number", event.target.value)}/>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {config.has_instructor
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel>Instructor Number:</InputLabel>
                      <Input readOnly={viewing} type="text" value={config.instructor_number} onChange={(event) => this.update("instructor_number", event.target.value)}/>
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Provider Number:</InputLabel>
                  <Input readOnly={viewing} type="text" value={config.provider_number} onChange={(event) => this.update("provider_number", event.target.value)}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Provider Renewal Date:</InputLabel>
                  <Input readOnly={viewing} type="date" value={moment.utc(config.provider_renewal).format("YYYY-MM-DD")} onChange={(event) => this.update("provider_renewal", (event.target.value || null))}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Course Number:</InputLabel>
                  <Input readOnly={viewing} type="text" value={config.course_number} onChange={(event) => this.update("course_number", event.target.value)}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Course Product:</InputLabel>
                  <Input readOnly={viewing} type="text" value={config.course_product} onChange={(event) => this.update("course_product", event.target.value)}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Course Name:</InputLabel>
                  <Input readOnly={viewing} type="text" value={config.course_name} onChange={(event) => this.update("course_name", event.target.value)}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Course Renewal Date:</InputLabel>
                  <Input readOnly={viewing} type="date" value={moment.utc(config.course_renewal).format("YYYY-MM-DD")} onChange={(event) => this.update("course_renewal", (event.target.value || null))}/>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Introduction Statement Link:</InputLabel>
                  <Input readOnly={viewing} type="url" value={config.introduction_statement_link} onChange={(event) => this.update("introduction_statement_link", event.target.value)}/>
                  <InputHint>This link is optional. If a state requires the student to view a state-specific document, add that link here.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Credits Value:</InputLabel>
                  <Input min={0} readOnly={viewing} type="number" value={config.credits_value} onChange={(event) => this.update("credits_value", event.target.value)}/>
                  <InputHint>The amount of credits this course awards the student.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Student Attestation: ({1250 - config.student_attestation?.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={config.student_attestation} maxLength={1250} onChange={(event) => this.update("student_attestation", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 1250)} rows={12} placeholder="Add attestation language..."></TextArea>
                  <InputHint>{`You may use available merge codes in this text. {{first_name}}, {{last_name}}, {{email}} - You may add a fallback by using syntax {{ first_name | fallback: "Joe" }}`}</InputHint>
                </InputWrapper>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <InputWrapper>
                  <InputLabel>Proctor Required</InputLabel>
                  <Checkbox
                    checked={config.proctor_required}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.update("proctor_required", is_checked);
                      if (!is_checked) this.update("virtual_proctor", false);
                      this.update("student_attestation", is_checked ? default_student_attestation_with_proctor : default_student_attestation);
                    }}
                  />
                </InputWrapper>
              </Col>
              {config.proctor_required
                ? (
                  <>
                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                      <InputWrapper>
                        <InputLabel>Virtual Proctor Allowed</InputLabel>
                        <Checkbox
                          checked={config.virtual_proctor}
                          borderThickness={3}
                          size={2}
                          tickSize={2}
                          onChange={(is_checked) => this.update("virtual_proctor", is_checked)}
                        />
                      </InputWrapper>
                    </Col>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Proctor Language: ({1250 - config.proctor_language?.length} characters remaining)</InputLabel>
                        <TextArea disabled={viewing} value={config.proctor_language} maxLength={1250} onChange={(event) => this.update("proctor_language", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 1250)} rows={12} placeholder="Add proctor language..."></TextArea>
                        <InputHint>{`You may use available merge codes in this text. {{first_name}}, {{last_name}}, {{email}} - You may add a fallback by using syntax {{ first_name | fallback: "Joe" }}`}</InputHint>
                      </InputWrapper>
                    </Col>
                  </>
                )
                : null
              }

              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Has Coordinator?</InputLabel>
                  <Checkbox
                    checked={config.has_coordinator}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.update("has_coordinator", is_checked);
                      if (!is_checked) {
                        this.update("coordinator_number", "");
                        this.update("coordinator_name", "");
                        this.update("coordinator_info", "");
                        this.update("coordinator_signature", "");
                      }
                    }}
                  />
                </InputWrapper>
              </Col>

              {config.has_coordinator
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Coordinator Name:</InputLabel>
                        <Input readOnly={viewing} type="text" value={config.coordinator_name} onChange={(event) => this.update("coordinator_name", event.target.value)}/>
                        <InputHint>Enter the coordinator's full name, ie: John Smith</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Coordinator Summary: ({256 - config.coordinator_info?.length} characters remaining)</InputLabel>
                        <TextArea disabled={viewing} value={config.coordinator_info} maxLength={1000} onChange={(event) => this.update("coordinator_info", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 1000)} rows={4} placeholder="Add coordinator information..."></TextArea>
                      </InputWrapper>
                    </Col>
                    <Col span={config.coordinator_signature ? 6 : 12}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Coordinator Signature</InputLabel>
                        <Input type="file" onChange={(e) => this.onFileChange(e, "coordinator_signature")} accept=".png, .PNG"/>
                        <InputHint>This image MUST be a 560x125 transparent .png file</InputHint>
                      </InputWrapper>
                    </Col>
                    {config.coordinator_signature
                      ? (
                        <Col span={6}>
                          <SignatureImageContainer>
                            <SignatureImage src={config.coordinator_signature} alt="" />
                          </SignatureImageContainer>
                        </Col>
                      )
                      : null
                    }
                  </>
                )
                : null
              }

              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Has Instructor?</InputLabel>
                  <Checkbox
                    checked={config.has_instructor}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => {
                      this.update("has_instructor", is_checked);
                      if (!is_checked) {
                        this.update("instructor_number", "");
                        this.update("instructor_name", "");
                        this.update("instructor_info", "");
                        this.update("instructor_signature", "");
                      }
                    }}
                  />
                </InputWrapper>
              </Col>

              {config.has_instructor
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Instructor Name:</InputLabel>
                        <Input readOnly={viewing} type="text" value={config.instructor_name} onChange={(event) => this.update("instructor_name", event.target.value)}/>
                        <InputHint>Enter the instructor's full name, ie: John Smith</InputHint>
                      </InputWrapper>
                    </Col>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel><RequiredStar>*</RequiredStar> Instructor Summary: ({256 - config.instructor_info?.length} characters remaining)</InputLabel>
                        <TextArea disabled={viewing} value={config.instructor_info} maxLength={1000} onChange={(event) => this.update("instructor_info", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 1000)} rows={4} placeholder="Add coordinator information..."></TextArea>
                      </InputWrapper>
                    </Col>
                    <Col span={config.instructor_signature ? 6 : 12}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Instructor Signature</InputLabel>
                        <Input type="file" onChange={(e) => this.onFileChange(e, "instructor_signature")} accept=".png, .PNG"/>
                        <InputHint>This image MUST be a 560x125 transparent .png file</InputHint>
                      </InputWrapper>
                    </Col>
                    {config.instructor_signature
                      ? (
                        <Col span={6}>
                          <SignatureImageContainer>
                            <SignatureImage src={config.instructor_signature} alt="" />
                          </SignatureImageContainer>
                        </Col>
                      )
                      : null
                    }
                  </>
                )
                : null
              }

              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Attestation Note: ({256 - config.student_attestation_note?.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={config.student_attestation_note} maxLength={256} onChange={(event) => this.update("student_attestation_note", event.target.value)} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 256)} rows={5} placeholder="Add attestation note..."></TextArea>
                  <InputHint>This text will be added to the end of the attestation text in a new paragraph.</InputHint>
                </InputWrapper>
              </Col>
              
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Active?</InputLabel>
                  <Checkbox
                    checked={config.status === "active"}
                    borderThickness={3}
                    size={2}
                    tickSize={2}
                    onChange={(is_checked) => this.update("status", is_checked ? "active" : "inactive")}
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                {!updating && !viewing
                  ? <Button disabled={!this.getRequired()} type="button" onClick={() => this.createCEConfig()} outline green rounded nomargin>Create</Button>
                  : null
                }
                {updating
                  ? <Button disabled={!this.getRequired() || !Object.keys(updates).length} type="button" onClick={() => this.updateCEConfig()} outline green rounded nomargin>Update</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCeConfigModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </CEConfigMainContent>
        </ViewCEConfigModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  ce_management: state.ce_management
});
const dispatchToProps = (dispatch) => ({
  closeCeConfigModal: () => dispatch(closeCeConfigModal()),
  createCEConfig: (question) => dispatch(createCEConfig(question)),
  updateCEConfig: (id, updates) => dispatch(updateCEConfig(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(CECreateModal);
