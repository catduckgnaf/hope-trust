import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { ce_courses_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  CEMain,
  CEPadding,
  CEInner
} from "./style";
import GenericTable from "../GenericTable";
import { deleteCECourses, getCECourses, openCeCourseModal, updateCECourse } from "../../store/actions/ce-management";

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
                deleteMultiple={deleteCECourses}
                isSelectable={true}
                cellUpdateFunction={updateCECourse}
                permissions={["hopetrust-ce-edit"]}
                getData={getCECourses}
                columns={ce_courses_table_columns}
                page_size={25}
                data_path={["ce_management", "courses"]}
                initial_data={[]}
                loading={ce_management.isFetchingCourses}
                requested={ce_management.requestedCourses}
                newRow={{
                  onClick: openCeCourseModal,
                  arguments: [{}, false, false]
                }}
                header="Courses"
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                fields={[
                  {
                    caption: "Quiz ID",
                    name: "quiz_id",
                    type: "string"
                  },
                  {
                    caption: "Vimeo ID",
                    name: "video_id",
                    type: "string"
                  },
                  {
                    caption: "Category",
                    name: "category",
                    type: "string"
                  },
                  {
                    caption: "Course Type",
                    name: "course_type",
                    type: "select",
                    options: [
                      { caption: "Course", value: "course" },
                      { caption: "Video", value: "video" }
                    ]
                  },
                  {
                    caption: "Title",
                    name: "title",
                    type: "string"
                  },
                  {
                    caption: "Total Partners",
                    name: "count",
                    type: "number"
                  },
                  {
                    caption: "Passed",
                    name: "passed",
                    type: "number"
                  },
                  {
                    caption: "Failed",
                    name: "failed",
                    type: "number"
                  },
                  {
                    caption: "Average",
                    name: "average_score",
                    type: "number"
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
