import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { deleteCEConfigs, openCeConfigModal, updateCEConfig } from "../../store/actions/ce-management";
import { getCEConfigs } from "../../store/actions/ce-management";
import { ce_state_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  CEMain,
  CEPadding,
  CEInner
} from "./style";
import GenericTable from "../GenericTable";
import moment from "moment";

class CEStates extends Component {

  constructor(props) {
    super(props);
    document.title = "CE States";
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
                deleteMultiple={deleteCEConfigs}
                isSelectable={true}
                cellUpdateFunction={updateCEConfig}
                permissions={["hopetrust-ce-edit"]}
                getData={getCEConfigs}
                columns={ce_state_table_columns}
                page_size={25}
                data_path={["ce_management", "list"]}
                initial_data={[]}
                transform_data={(data) => {
                  const transformed = data.map((ce) => {
                    const is_course_renewal_soon = moment(ce.course_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.course_renewal).isSameOrBefore(moment());
                    const is_provider_renewal_soon = moment(ce.provider_renewal).isBetween(moment(), moment().add(30, "day")) || moment(ce.provider_renewal).isSameOrBefore(moment());
                    return { ...ce, is_course_renewal_soon, is_provider_renewal_soon };
                  });
                  return transformed;
                }}
                loading={ce_management.isFetching}
                requested={ce_management.requested}
                heading="Registered States"
                newRow={{
                  onClick: openCeConfigModal,
                  arguments: [{}, false, false]
                }}
                dataRowAttributes={(rowData) => {
                  return {
                    style: {
                      backgroundColor: (rowData.is_course_renewal_soon || rowData.is_provider_renewal_soon) ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                    }
                  }
                }}
                filter={{
                  groupName: "or",
                  items: [
                    {
                      field: "is_course_renewal_soon",
                      key: "1",
                      operator: "=",
                      value: "true",
                    },
                    {
                      field: "is_provider_renewal_soon",
                      key: "2",
                      operator: "=",
                      value: "true",
                    }
                  ],
                }}
                paging={true}
                search={true}
                columnResizing={true}
                header="CE States"
                radius={0}
                fields={[
                  {
                    caption: "State",
                    name: "state",
                    type: "string"
                  },
                  {
                    caption: "Course Number",
                    name: "course_number",
                    type: "string"
                  },
                  {
                    caption: "Students Passed",
                    name: "count",
                    type: "number"
                  },
                  {
                    caption: "Average Score",
                    name: "average_score",
                    type: "number"
                  },
                  {
                    caption: "Course Renewal",
                    name: "course_renewal",
                    type: "number"
                  },
                  {
                    caption: "Provider Renewal",
                    name: "provider_renewal",
                    type: "number"
                  },
                  {
                    caption: "Is Course Renewal Soon",
                    name: "is_course_renewal_soon",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
                  },
                  {
                    caption: "Is Provider Renewal Soon",
                    name: "is_provider_renewal_soon",
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
