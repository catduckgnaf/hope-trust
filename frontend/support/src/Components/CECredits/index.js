import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getCECredits, updateCEQuiz } from "../../store/actions/ce-management";
import { ce_credits_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  CEMain,
  CEPadding,
  CEInner
} from "./style";
import GenericTable from "../GenericTable";

class CEStates extends Component {

  constructor(props) {
    super(props);
    document.title = "CE Credits";
    this.state = {};
  }

  render() {
    const { ce_management } = this.props;
    return (
      <ViewContainer>
        <CEMain>
          <CEPadding>
            <CEInner>
              <GenericTable
                cellUpdateFunction={updateCEQuiz}
                permissions={["hopetrust-ce-view"]}
                getData={getCECredits}
                columns={ce_credits_table_columns}
                page_size={25}
                data_path={["ce_management", "credits_list"]}
                initial_data={[]}
                loading={ce_management.isFetchingCredits}
                requested={ce_management.requestedCredits}
                header="Quiz Records"
                dataRowAttributes={(rowData) => {
                  return {
                    style: {
                      backgroundColor: (!rowData.passed) ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                    }
                  }
                }}
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                filter={{
                  groupName: "and",
                  items: [
                    {
                      field: "course_title",
                      key: "1",
                      operator: "=",
                      value: "Final Exam",
                    }
                  ],
                }}
                fields={[
                  {
                    caption: "Course Title",
                    name: "course_title",
                    type: "select",
                    options: ce_management.courses.map((course) => ({ caption: course.title, value: course.title }))
                  },
                  {
                    caption: "Partner Name",
                    name: "partner_name",
                    type: "string"
                  },
                  {
                    caption: "State",
                    name: "state",
                    type: "string"
                  },
                  {
                    caption: "Score",
                    name: "percentage",
                    type: "number"
                  },
                  {
                    caption: "Passed",
                    name: "passed",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
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
            </CEInner>
          </CEPadding>
        </CEMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  ce_management: state.ce_management
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(CEStates);
