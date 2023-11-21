import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import LoaderSurveyCard from "../../Components/LoaderSurveyCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { toastr } from "react-redux-toastr";
import {
  SurveyCardMain,
  SurveyCardPadding,
  SurveyCardInner,
  SurveyCardInfo,
  SurveyCardTitle,
  SurveyCardSubtitle,
  SurveyCardDate,
  SurveyCardIconContainer,
  SurveyCardInfoContainer,
  SurveyCardInnerMain,
  RefreshSurveyContainer
} from "./style";

class SurveyCard extends Component {
  static propTypes = {
    survey: PropTypes.instanceOf(Object).isRequired,
    selectSurvey: PropTypes.func.isRequired,
    getSession: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  getResponder = (cognito_id) => {
    const { relationship } = this.props;
    const owner = relationship.list.find((u) => u.cognito_id === cognito_id);
    if (owner) return `${owner.first_name} ${owner.last_name.charAt(0)}.`;
    return false;
  };

  regenerate = async (survey_id) => {
    const { regeneratePlanData } = this.props;
    this.setState({ [`${survey_id}_loading`]: true });
    await regeneratePlanData(survey_id);
    this.setState({ [`${survey_id}_loading`]: false });
  };

  clearAccountSurvey = (survey) => {
    const { clearAccountSurvey } = this.props;
    const clearOptions = {
      onOk: () => clearAccountSurvey(survey),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Clear Survey",
      cancelText: "Cancel"
    };
    toastr.confirm(`Are you sure you want to clear your "${survey.survey_name}" survey?\n\nYour data cannot be recovered. This action cannot be undone.`, clearOptions);
  };

  getSurveyStatus = (survey) => {
    if (survey.processing) {
      return { title: "Processing" };
    } else if (survey.is_complete) {
      return { title: "Complete" };
    } else if (survey.session_id && !survey.is_complete) {
      return { title: "In Progress" };
    } else if (!survey.session_id && !survey.is_complete) {
      return { title: "Not Started" };
    } else {
      return { title: "Status Unavailable" };
    }
  };

  render() {
    let { current, survey, selectSurvey, runCustomAction, noaccess, message } = this.props;
    const status = this.getSurveyStatus(current);

    if (current) {
      return (
        <SurveyCardMain xs={12} sm={12} md={6} lg={4} xl={3}>
          <SurveyCardPadding>
            {noaccess
              ? (
                <SurveyCardInner disabled>
                  <SurveyCardInnerMain>
                    <SurveyCardIconContainer span={1}>
                      <FontAwesomeIcon icon={["fad", "lock-alt"]} swapOpacity/>
                    </SurveyCardIconContainer>
                    <SurveyCardInfoContainer span={11}>
                      <SurveyCardInfo>
                        <SurveyCardTitle span={12} disabled>{current.survey_name}</SurveyCardTitle>
                        <SurveyCardSubtitle span={12} status={status.title}>No Access</SurveyCardSubtitle>
                        {message
                          ? <SurveyCardDate span={12}>{message}</SurveyCardDate>
                          : <SurveyCardDate span={12}>You do not have permission to access this survey.</SurveyCardDate>
                        }
                      </SurveyCardInfo>
                    </SurveyCardInfoContainer>
                  </SurveyCardInnerMain>
                </SurveyCardInner>
              )
              : (
                  <SurveyCardInner>
                    {current.session_id && survey.loading !== current.survey_name
                      ? (
                        <RefreshSurveyContainer onClick={() => this.clearAccountSurvey(current)} title="Clear survey data.">
                          <FontAwesomeIcon icon={["fad", "sync"]} swapOpacity/>
                        </RefreshSurveyContainer>
                      )
                      : null
                    }
                    <SurveyCardInnerMain>
                      <SurveyCardIconContainer span={1}>
                        {survey.loading === current.survey_name ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fad", (current.icon || "poll-h")]} />}
                      </SurveyCardIconContainer>
                      <SurveyCardInfoContainer span={11}>
                        <SurveyCardInfo onClick={!current.processing ? (!current.action ? () => selectSurvey(current) : () => runCustomAction(current.action, current)) : null}>
                          <SurveyCardTitle span={12}>{current.survey_name}</SurveyCardTitle>
                          <SurveyCardSubtitle span={12} status={status.title}>{status.title}</SurveyCardSubtitle>
                          {current.session_id
                            ? <SurveyCardDate span={12}>Updated on {moment(current.access_time).format("MMMM DD, YYYY [at] h:mm A")} by {this.getResponder(current.cognito_id)}</SurveyCardDate>
                            : <SurveyCardDate span={12}>No survey data found.</SurveyCardDate>
                          }
                        </SurveyCardInfo>
                      </SurveyCardInfoContainer>
                    </SurveyCardInnerMain>
                  </SurveyCardInner>
              )
            }
          </SurveyCardPadding>
        </SurveyCardMain>
      );
    }
    return <LoaderSurveyCard />;
  }
}

const mapStateToProps = (state) => ({
  relationship: state.relationship,
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({
  getSession: (project_id) => dispatch(hopeCarePlan.getSession(project_id)),
  runCustomAction: (action, survey) => dispatch(hopeCarePlan.runCustomAction(action, survey)),
  regeneratePlanData: (project_id) => dispatch(hopeCarePlan.regeneratePlanData(project_id)),
  clearAccountSurvey: (survey_id) => dispatch(hopeCarePlan.clearAccountSurvey(survey_id))
});
export default connect(mapStateToProps, dispatchToProps)(SurveyCard);
