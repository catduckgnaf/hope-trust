import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCreateSecurityQuestionModal, createSecurityQuestion, updateSecurityQuestionRecord, default_categories } from "../../store/actions/security-questions";
import { showNotification } from "../../store/actions/notification";
import CreatableSelect from "react-select/creatable";
import { uniqBy } from "lodash";
import {
  SecurityQuestionMainContent,
  ViewSecurityQuestionModalInner,
  ViewSecurityQuestionModalInnerLogo,
  ViewSecurityQuestionModalInnerLogoImg,
  ViewSecurityQuestionModalInnerHeader
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  TextArea,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { numbersLettersUnderscoresHyphens } from "../../utilities";

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

class SecurityQuestionCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateSecurityQuestionModal: PropTypes.func.isRequired,
    createSecurityQuestion: PropTypes.func.isRequired,
    updateSecurityQuestionRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, security } = this.props;
    const categories = security.questions.map((q) => q.category);
    const used_categories = categories.map((category) => {
      return { label: capitalize(category), value: category };
    });
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      category: defaults.category || "",
      question: defaults.question || "",
      categories: uniqBy([...used_categories, ...default_categories], "label")
    };
  }

  createSecurityQuestion = async () => {
    const { question, category = "Uncategorized" } = this.state;
    const { createSecurityQuestion, closeCreateSecurityQuestionModal, showNotification } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const created = await createSecurityQuestion({
      question,
      category: category.toLowerCase()
    });
    if (created.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Question Created", "Your question was successfully created.");
      closeCreateSecurityQuestionModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", created.message);
    }
  };

  updateSecurityQuestionRecord = async () => {
    const { question, category = "Uncategorized" } = this.state;
    const { updateSecurityQuestionRecord, closeCreateSecurityQuestionModal, showNotification, defaults } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Updating..." });
    const updated = await updateSecurityQuestionRecord(defaults.id, {
      question,
      category: category.toLowerCase()
    });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Question Updated", "Your question was successfully updated.");
      closeCreateSecurityQuestionModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  handleCreateCategory = (value) => {
    this.setState({ category: value });
  };

  render() {
    const { creating_question, closeCreateSecurityQuestionModal, updating, viewing } = this.props;
    const { loaderShow, loaderMessage, category, question, categories } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creating_question} onClose={() => closeCreateSecurityQuestionModal()} center>
        <ViewSecurityQuestionModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewSecurityQuestionModalInnerLogo span={12}>
              <ViewSecurityQuestionModalInnerLogoImg alt="HopeTrust Security Question Logo" src={icons.colorLogoOnly} />
            </ViewSecurityQuestionModalInnerLogo>
          </Col>
          <SecurityQuestionMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewSecurityQuestionModalInnerHeader span={12}>New Security Question</ViewSecurityQuestionModalInnerHeader>
                : <ViewSecurityQuestionModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Security Question</ViewSecurityQuestionModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Question Category</InputLabel>
                  <CreatableSelect
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
                    name="category"
                    placeholder="Choose a question category, or create a new one..."
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
                  <InputLabel>Question: ({255 - question.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={question} maxLength={255} onKeyPress={numbersLettersUnderscoresHyphens} onChange={(event) => this.setState({ question: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} placeholder="Add a question..."></TextArea>
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button type="button" onClick={() => this.createSecurityQuestion()} outline green rounded nomargin>Create Security Question</Button>
                  : null
                }
                {updating
                  ? <Button type="button" onClick={() => this.updateSecurityQuestionRecord()} outline green rounded nomargin>Update Security Question</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateSecurityQuestionModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </SecurityQuestionMainContent>
        </ViewSecurityQuestionModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  security: state.security
});
const dispatchToProps = (dispatch) => ({
  closeCreateSecurityQuestionModal: () => dispatch(closeCreateSecurityQuestionModal()),
  createSecurityQuestion: (question) => dispatch(createSecurityQuestion(question)),
  updateSecurityQuestionRecord: (id, updates) => dispatch(updateSecurityQuestionRecord(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(SecurityQuestionCreateModal);
