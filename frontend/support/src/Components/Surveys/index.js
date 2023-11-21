import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { survey_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  SurveysMain,
  SurveysPadding,
  SurveysInner
} from "./style";
import GenericTable from "../GenericTable";
import { deleteSurveys, getSurveys, openCreateSurveyModal, updateSurvey } from "../../store/actions/survey";
import { updateCoreSettings } from "../../store/actions/customer-support";

class CEStates extends Component {

  constructor(props) {
    super(props);
    document.title = "Surveys";
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
                rowReordering={true}
                dragOrderKey="survey_name"
                draggableDataKey="survey_order"
                orderUpdateFunction={updateCoreSettings}
                deleteMultiple={deleteSurveys}
                isSelectable={true}
                cellUpdateFunction={updateSurvey}
                permissions={["hopetrust-surveys-edit"]}
                getData={getSurveys}
                columns={survey_table_columns}
                page_size={25}
                data_path={["survey", "list"]}
                initial_data={[]}
                loading={survey.isFetching}
                requested={survey.requested}
                newRow={{
                  onClick: openCreateSurveyModal,
                  arguments: [{}, false, false]
                }}
                header="Surveys"
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                fields={[
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
                    caption: "Created",
                    name: "created_at",
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
