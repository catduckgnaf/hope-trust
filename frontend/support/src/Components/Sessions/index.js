import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { sessions_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  SurveysMain,
  SurveysPadding,
  SurveysInner
} from "./style";
import GenericTable from "../GenericTable";
import { deleteSessions, getSurveySessions, updateSession } from "../../store/actions/survey";

class CEStates extends Component {

  constructor(props) {
    super(props);
    document.title = "Survey Sessions";
    this.state = {};
  }

  render() {
    const { survey } = this.props;
    return (
      <ViewContainer>
        <SurveysMain>
          <SurveysPadding>
            <SurveysInner>
              <GenericTable
                deleteMultiple={deleteSessions}
                isSelectable={true}
                cellUpdateFunction={updateSession}
                permissions={["hopetrust-surveys-edit"]}
                getData={getSurveySessions}
                columns={sessions_table_columns}
                page_size={25}
                data_path={["survey", "sessions"]}
                initial_data={[]}
                loading={survey.isFetchingSessions}
                requested={survey.requestedSessions}
                header="Survey Sessions"
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                fields={[
                  {
                    caption: "Session ID",
                    name: "session_id",
                    type: "string"
                  },
                  {
                    caption: "Survey ID",
                    name: "survey_id",
                    type: "string"
                  },
                  {
                    caption: "Survey Title",
                    name: "survey_name",
                    type: "string"
                  },
                  {
                    caption: "Survey Slug",
                    name: "slug",
                    type: "string"
                  },
                  {
                    caption: "Session ID",
                    name: "session_id",
                    type: "string"
                  },
                  {
                    caption: "Account Name",
                    name: "account_name",
                    type: "string"
                  },
                  {
                    caption: "Is Complete",
                    name: "is_complete",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
                  },
                  {
                    caption: "Updated By",
                    name: "updated_by",
                    type: "string"
                  },
                  {
                    caption: "Category",
                    name: "category",
                    type: "string"
                  },
                  {
                    caption: "Status",
                    name: "status",
                    type: "select",
                    options: [
                      { caption: "Active", value: "active" },
                      { caption: "Inactive", value: "inactive" }
                    ]
                  },
                  {
                    caption: "Accessed",
                    name: "access_time",
                    type: "date"
                  }
                ]}
              />
            </SurveysInner>
          </SurveysPadding>
        </SurveysMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(CEStates);
