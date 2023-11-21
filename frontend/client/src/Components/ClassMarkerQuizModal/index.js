import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { closeQuiz, getQuizResponse, openProctorForm } from "../../store/actions/class-marker";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { Button } from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import {
  ClassMarkerInnerModal,
  ClassMarkerMainModalTitle,
  ClassMarkerMainButtonContainer,
  QuizFrame
} from "./style";
import { toastr } from "react-redux-toastr";

class ClassMarkerQuizModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      is_loading: false
    };
  }

  closeQuizModal = async () => {
    const { closeQuiz, openProctorForm, getQuizResponse, quiz } = this.props;
    const closeOptions = {
      onOk: async () => {
        this.setState({ is_loading: true });
        const updated_quiz = await getQuizResponse(quiz.quiz_id);
        this.setState({ is_loading: false });
        if (quiz.state && quiz.state.proctor_required && (updated_quiz.success && updated_quiz.quiz.passed)) openProctorForm();
        closeQuiz(quiz);
      },
      onCancel: () => {
        toastr.removeByType("confirms");
      },
      okText: "Exit Course",
      cancelText: "Cancel"
    };
    toastr.confirm(`Please note that closing this course before completing will not save your current progress.\n\nYou MUST complete this course attempt if you would like your progress to be saved.\n\nIf you have finished this course, you may safely exit the course.`, closeOptions);
  };

  render() {
    const { is_loading } = this.state;
    const { viewing_class_marker_quiz, quiz, user, session } = this.props;

    return (
      <Modal animationDuration={100} styles={{ modal: { borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewing_class_marker_quiz} closeOnEsc={false} showCloseIcon={false} blockScroll closeOnOverlayClick={false} center>
        <ClassMarkerInnerModal align="middle" justify="center" isloading={is_loading ? 1 : 0}>
          <Col span={12}>
            <LoaderOverlay show={is_loading} message="Saving..." />
            <ClassMarkerMainModalTitle>{quiz.title}</ClassMarkerMainModalTitle>
            <Row>
              <Col span={12}>
                <QuizFrame src={`https://www.classmarker.com/online-test/start/?quiz=${quiz.quiz_id}&cm_user_id=${user.cognito_id}__${session.account_id}&cm_fn=${user.first_name}&cm_ln=${user.last_name}&cm_e=${user.email}`} frameborder="0" />
              </Col>
              <Col span={12}>
                <Row>
                  <ClassMarkerMainButtonContainer span={12}>
                    <Button type="button" onClick={() => this.closeQuizModal()} green>Close</Button>
                  </ClassMarkerMainButtonContainer>
                </Row>
              </Col>
            </Row>
          </Col>
       </ClassMarkerInnerModal>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  closeQuiz: (quiz) => dispatch(closeQuiz(quiz)),
  getQuizResponse: (quiz_id) => dispatch(getQuizResponse(quiz_id)),
  openProctorForm: () => dispatch(openProctorForm())
});
export default connect(mapStateToProps, dispatchToProps)(ClassMarkerQuizModal);
