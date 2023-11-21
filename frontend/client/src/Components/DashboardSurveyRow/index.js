import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import {
  SurveyRow,
  SurveyRowPadding,
  SurveyRowInner,
  SurveyRowInnerIcon,
  SurveyRowInnerTitle,
  SurveyRowInnerStatus,
  SurveyRowStatusIcon
} from "./style";

class DashboardSurveyRow extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  getSurveyStatus = (survey) => {
    if (survey.processing) {
      return { title: "Processing", icon: "sync", style: "fad" };
    } else if (survey.is_complete) {
      return { title: "Complete", icon: "check-circle", style: "fas" };
    } else if (survey.session_id && !survey.is_complete) {
      return { title: "In Progress", icon: "clock", style: "far" };
    } else if (!survey.session_id && !survey.is_complete) {
      return { title: "Not Started", icon: "circle", style: "fal" };
    } else {
      return { title: "Status Unavailable", icon: "times-circle", style: "fas" };
    }
  };

  render() {
    const { survey_reducer, survey, setSurvey, runCustomAction, noaccess } = this.props;
    const status = this.getSurveyStatus(survey);
    return (
      <SurveyRow span={12}>
        <SurveyRowPadding span={12}>
          {noaccess
            ? (
              <SurveyRowInner disabled span={12}>
                <SurveyRowInnerIcon disabled span={1}><FontAwesomeIcon icon={["fad", "lock-alt"]} swapOpacity/></SurveyRowInnerIcon>
                <SurveyRowInnerTitle disabled span={6}>{survey.survey_name}</SurveyRowInnerTitle>
                <SurveyRowInnerStatus span={5} status="No Access">
                  No Access <SurveyRowStatusIcon><FontAwesomeIcon icon={["fas", "exclamation-circle"]} /></SurveyRowStatusIcon>
                </SurveyRowInnerStatus>
              </SurveyRowInner>
            )
            : (
              <SurveyRowInner span={12} onClick={!survey.processing ? (!survey.action ? () => setSurvey(survey) : () => runCustomAction(survey.action, survey)) : null}>
                  <SurveyRowInnerIcon span={1}>
                    {survey_reducer.loading === survey.survey_name ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <FontAwesomeIcon icon={["fad", (survey.icon || "poll-h")]} />}
                  </SurveyRowInnerIcon>
                  <SurveyRowInnerTitle span={6}>{survey.survey_name}</SurveyRowInnerTitle>
                  <SurveyRowInnerStatus span={5} status={status.title}>
                    {survey_reducer.loading === survey.survey_id ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <>{status.title} <SurveyRowStatusIcon><FontAwesomeIcon icon={[status.style, status.icon]} /></SurveyRowStatusIcon></>}
                  </SurveyRowInnerStatus>
                </SurveyRowInner>
            )
          }
        </SurveyRowPadding>
      </SurveyRow>
    );
  }
}

const mapStateToProps = (state) => ({
  survey_reducer: state.survey
});
const dispatchToProps = (dispatch) => ({
  setSurvey: (survey) => dispatch(hopeCarePlan.setSurvey(survey)),
  runCustomAction: (action, survey) => dispatch(hopeCarePlan.runCustomAction(action, survey)),
});

export default connect(mapStateToProps, dispatchToProps)(DashboardSurveyRow);
