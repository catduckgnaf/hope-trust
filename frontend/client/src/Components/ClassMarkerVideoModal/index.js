import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { closeQuizVideo } from "../../store/actions/class-marker";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import Vimeo from '@u-wave/react-vimeo';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ClassMarkerInnerModal,
  ClassMarkerMainModalTitle,
  IFrameContainer
} from "./style";
import { theme } from "../../global-styles";
import { createOrUpdateCEQuiz } from "../../store/actions/ce-management";
import { showNotification } from "../../store/actions/notification";

class ClassMarkerVideoModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      percentage: 0
    };
  }

  onReady = () => {
    this.setState({ loading: false });
  };
  onProgress = (progress) => {
    this.setState({ percentage: Math.ceil((progress.percent * 100)) });
  };
  onError = () => {
    const { closeQuizVideo, showNotification } = this.props;
    showNotification("error", "Video Error", "Something went wrong while playing this video. Please try again.");
    closeQuizVideo();
  };
  onEnd = async () => {
    const { closeQuizVideo, createOrUpdateCEQuiz, quiz } = this.props;
    const { percentage } = this.state;
    if (quiz.course_type === "video" && !quiz.passed) {
      this.setState({ loading: true });
      await createOrUpdateCEQuiz({ passed: (percentage > 70), percentage }, quiz.quiz_id);
    }
    this.setState({ loading: false }, () => closeQuizVideo());
  };

  render() {
    const { show_video, active_video_id, active_video_title } = this.props;
    const { loading } = this.state;

    return (
      <Modal closeOnOverlayClick={false} animationDuration={100} styles={{ modal: { padding: "1.2rem 0 0 0", width: "100%", borderRadius: "10px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} closeIcon={loading ? <FontAwesomeIcon size="2x" icon={["far", "spinner"]} spin /> : null} open={show_video} onClose={() => this.onEnd()} center>
        <ClassMarkerInnerModal align="middle" justify="center">
          <Col span={12}>
            <ClassMarkerMainModalTitle>{active_video_title}</ClassMarkerMainModalTitle>
            <Row>
              <IFrameContainer span={12}>
                <Vimeo
                  width="100%"
                  height="100%"
                  showByline={false}
                  video={active_video_id}
                  color={theme.hopeTrustBlue}
                  controls={true}
                  showPortrait={true}
                  showTitle={false}
                  responsive={true}
                  pip={true}
                  onProgress={this.onProgress}
                  onEnd={this.onEnd}
                  onError={this.onError}
                  onReady={this.onReady}
                />
              </IFrameContainer>
            </Row>
          </Col>
       </ClassMarkerInnerModal>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  createOrUpdateCEQuiz: (updates, quiz_id) => dispatch(createOrUpdateCEQuiz(updates, quiz_id)),
  closeQuizVideo: () => dispatch(closeQuizVideo())
});
export default connect(mapStateToProps, dispatchToProps)(ClassMarkerVideoModal);
