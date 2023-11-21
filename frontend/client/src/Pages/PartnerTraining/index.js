import React, { Component, Fragment } from "react";
import { connect } from "beautiful-react-redux";
import { isMobile, isTablet } from "react-device-detect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openQuiz, openQuizVideo, getQuizResponses, openQuizAttestation } from "../../store/actions/class-marker";
import { openCertificateModal } from "../../store/actions/partners";
import { getCEConfigs, getCECourses } from "../../store/actions/ce-management";
import {
  VideosContainer,
  VideoDataContainer,
  VideoDataItem,
  QuizSections,
  QuizSection,
  QuizSectionHeading,
  QuizTextSection,
  CertificateDownload,
  Course,
  HeadingSmall,
  HeadingDescription,
  HeadingLarge,
  CoursePreview,
  CourseInfo,
  ProgressContainer,
  Progress,
  ProgressText,
  BtnContainer,
  Btn,
  LoaderContainer
} from "./style";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import { orderBy } from "lodash";
import { US_STATES } from "../../utilities";
import { showBannerNotification } from "../../store/actions/notification";

class PartnerTraining extends Component {
  constructor(props) {
    super(props);
    document.title = "Partner Training";
    this.state = {};
  }

  async componentDidMount() {
    const { getCECourses, getCEConfigs, getQuizResponses, class_marker, ce_config, user } = this.props;
    const organization = user.partner_data.name;
    const partner_type = user.partner_data.partner_type;
    if (!ce_config.requestedCourses && !ce_config.isFetchingCourses) await getCECourses(organization, partner_type, true);
    if (!class_marker.requested && !class_marker.isFetching) await getQuizResponses();
    if (!ce_config.requested && !ce_config.isFetching) await getCEConfigs();
  }

  componentWillUpdate() {
    const { showBannerNotification, ce_config, user, notification } = this.props;
    const records = ce_config.list;
    const current_state = user.state;
    const US_STATE = US_STATES.find((state) => state.name === current_state);
    const config_record = records.find((c) => c.state && (c.state === US_STATE.name));
    const is_active = config_record && config_record.status === "active";
    if (!is_active && config_record && !notification.show) {
      showBannerNotification({
        message: `ATTENTION: The state of ${config_record.state} is not currently approved for Hope Trust Continuing Education credits. Taking these courses will not produce a valid ${config_record.state} certificate.`,
        type: "warning",
        action: null,
        button_text: null,
        timeout: null,
        hide_close: false,
        pages: ["/training"]
      });
    }
  }

  getStatus = (response) => {
    if (!response) return "Incomplete";
    if (!response.percentage) return "Not Started";
    if (response.passed && response.percentage >= response.percentage_passmark) return "Passed";
    if (!response.passed && response.percentage < response.percentage_passmark) return "Failed";
    return "Incomplete";
  };

  openQuiz = (item) => {
    const { openQuiz, openQuizAttestation } = this.props;
    if (item.requires_confirmation) {
      openQuizAttestation(item);
    } else {
      openQuiz(item);
    }
  };

  refresh = async (organization, user_type, override) => {
    const { getCECourses, getQuizResponses, getCEConfigs } = this.props;
    await Promise.all([
      getCECourses(organization, user_type, override),
      getQuizResponses(override),
      getCEConfigs(override)
    ]);
  };

  render() {
    const { openQuizVideo, openCertificateModal, class_marker, user, ce_config } = this.props;
    const organization = user.partner_data.name;
    const user_type = user.partner_data.partner_type;
    const course_map = {};
    (ce_config.courses || []).forEach((course) => {
      if (!course_map[course.category]) course_map[course.category] = [course];
      else if (course_map[course.category]) course_map[course.category].push(course);
    });

    const Tip = ({ children, locked }) => {
      if (locked) {
        return (
          <span
            className="tooltip danger"
            data-tooltip
            data-tooltip-position="top"
            data-tooltip-content="You must pass prior courses to access this course.">
            {children}
            </span>
        );
      }
      return (
        <span>{children}</span>
      );
    };
    
    return (
      <ViewContainer>
        <Page paddingleft={1}>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Courses</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button blue nomargin onClick={() => this.refresh(organization, user_type, true)}>{ce_config.isFetchingCourses ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        <VideosContainer gutter={20}>
          {ce_config.isFetchingCourses
            ? (
              <LoaderContainer>
                <FontAwesomeIcon size="2x" icon={["fad", "spinner"]} spin/>
              </LoaderContainer>
            )
            : (
                <VideoDataContainer span={12}>
                  {orderBy(Object.keys(course_map), (c) => course_map[c].every((c) => c.course_type === "course"), "desc").map((category, index) => {
                    return (
                      <Fragment key={index}>
                        <QuizSections>
                          <QuizSection span={12}>
                            <QuizSectionHeading>
                              <QuizTextSection span={12}>
                                {category}
                              </QuizTextSection>
                            </QuizSectionHeading>
                          </QuizSection>
                        </QuizSections>
                        <QuizSections gutter={20}>
                          {
                            orderBy(course_map[category], [(c) => !c.requires_confirmation, (c) => c.depends_on.length, "created_at"], ["desc", "asc", "desc"]).map((item, index) => {
                              const response = class_marker.responses.find((q) => q.quiz_id === item.quiz_id);
                              const should_render = item.partner_types.includes(user_type); // this partner type should see this quiz
                              const dependants_complete = item.depends_on.length ? item.depends_on.every((qid) => !!class_marker.responses.find((r) => (r.quiz_id === qid) && r.passed)) : true;
                              const state_config = ce_config.list.find((c) => c.state === user.state);
                              if (should_render) { // should this be show to this partner type
                                return (
                                  <VideoDataItem xs={12} sm={12} md={12} lg={6} xl={6} key={index}>
                                    <Course disabled={!dependants_complete && item.required_types.includes(user_type) ? 1 : 0}>
                                      <CoursePreview>
                                        <HeadingSmall>{item.organization ? `${item.organization} ` : ""}{item.course_type}</HeadingSmall>
                                        <HeadingLarge>{item.title}</HeadingLarge>
                                        {item.training_material_url
                                          ? <a href={item.training_material_url} rel="noopener noreferrer" target="_blank">Download Course Material <FontAwesomeIcon size="xs" icon={["fas", "chevron-right"]} /></a>
                                          : null
                                        }
                                        {item.certificate && (response && response.passed) && (state_config && state_config.status === "active")
                                          ? <CertificateDownload onClick={() => openCertificateModal({ item, response, state: state_config })}>View Certificate <FontAwesomeIcon size="xs" icon={["fas", "chevron-right"]} /></CertificateDownload>
                                          : null
                                        }
                                      </CoursePreview>
                                      <CourseInfo>
                                        {response
                                          ? (
                                            <ProgressContainer>
                                              <Progress percentage={response.percentage && (dependants_complete || !item.required_types.includes(user_type)) ? response.percentage : 0}></Progress>
                                              <ProgressText>
                                                {item.course_type === "video" ? `${response.percentage}% watched` : `${response.percentage}%`}
                                              </ProgressText>
                                            </ProgressContainer>
                                          )
                                          : null
                                        }
                                        {(item.quiz_id || item.description)
                                          ? (
                                            <>
                                              {item.description && item.course_type === "video"
                                                ? (
                                                  <>
                                                    <HeadingSmall>Summary</HeadingSmall>
                                                    <HeadingDescription>{item.description}</HeadingDescription>
                                                  </>
                                                )
                                                : <HeadingSmall>Status</HeadingSmall>
                                              }
                                              {item.quiz_id && (class_marker.loading === item.quiz_id)
                                                ? <HeadingLarge status="Incomplete"><FontAwesomeIcon icon={["fad", "spinner"]} spin /></HeadingLarge>
                                                : (
                                                  <>
                                                    {!item.description && item.quiz_id
                                                      ? (
                                                        <>
                                                          {!dependants_complete && item.required_types.includes(user_type)
                                                            ? <HeadingLarge status="Locked">Locked</HeadingLarge>
                                                            : <HeadingLarge status={response ? this.getStatus(response) : "Incomplete"}>{response ? this.getStatus(response) : "Incomplete"}</HeadingLarge>
                                                          }
                                                        </>
                                                      )
                                                      : null
                                                    }
                                                  </>
                                                )
                                              }
                                            </>
                                          )
                                          : null
                                        }
                                        <BtnContainer>
                                          {item.video_id
                                            ? <Btn disabled={(!dependants_complete && item.required_types.includes(user_type)) ? 1 : 0} small={item.quiz_id ? 1 : 0} green={1} onClick={() => openQuizVideo(item.video_id, item.title, { ...item, ...response })}>Watch Video</Btn>
                                            : null
                                          }
                                          <Tip locked={!dependants_complete && item.required_types.includes(user_type)}>
                                          {item.quiz_id && item.course_type !== "video"
                                              ? <Btn disabled={(!dependants_complete && item.required_types.includes(user_type)) ? 1 : 0} onClick={() => this.openQuiz(item)}>{!response ? "Start Exam" : "Start Over"}</Btn>
                                            : null
                                          }
                                          </Tip>
                                        </BtnContainer>
                                      </CourseInfo>
                                    </Course>
                                  </VideoDataItem>
                                );
                              }
                              return null;
                            })
                          }
                        </QuizSections>
                      </Fragment>
                    );
                  })}
                </VideoDataContainer>
            )
          }
        </VideosContainer>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  class_marker: state.class_marker,
  ce_config: state.ce_config,
  notification: state.notification
});
const dispatchToProps = (dispatch) => ({
  openQuiz: (quiz) => dispatch(openQuiz(quiz)),
  openQuizVideo: (quiz_id, quiz_title, quiz) => dispatch(openQuizVideo(quiz_id, quiz_title, quiz)),
  getQuizResponses: (override) => dispatch(getQuizResponses(override)),
  openQuizAttestation: (quiz) => dispatch(openQuizAttestation(quiz)),
  openCertificateModal: (config) => dispatch(openCertificateModal(config)),
  getCEConfigs: (override) => dispatch(getCEConfigs(override)),
  getCECourses: (organization, partner_type, override) => dispatch(getCECourses(organization, partner_type, override)),
  showBannerNotification: (config) => dispatch(showBannerNotification(config))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerTraining);