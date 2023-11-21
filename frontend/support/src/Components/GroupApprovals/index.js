import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { openCreateGroupConnectionModal } from "../../store/actions/groups";
import { getGroupApprovals } from "../../store/actions/account";
import { group_approval_table_columns } from "../../column-definitions";
import GenericTable from "../GenericTable";
import {
  ViewContainer
} from "../../global-components";
import {
  UsersMain,
  UsersPadding,
  UsersInner
} from "./style";
import { orderBy } from "lodash";

class GroupApprovals extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { customer_support } = this.props;
    return (
      <ViewContainer>
        <UsersMain>
          <UsersPadding>
            <UsersInner>
              <GenericTable
                permissions={["hopetrust-benefits-edit"]}
                getData={getGroupApprovals}
                columns={group_approval_table_columns}
                page_size={25}
                data_path={["customer_support", "group_approvals"]}
                initial_data={[]}
                transform_data={(data) => {
                  return orderBy(data, [(a) => a.status === "pending", "created_at"], ["desc", "desc"])
                }}
                loading={customer_support.isFetchingGroupApprovals}
                requested={customer_support.requestedGroupApprovals}
                header="Group Connections"
                newRow={{
                  onClick: openCreateGroupConnectionModal,
                  arguments: [{}, false, false]
                }}
                dataRowAttributes={(rowData) => {
                  return {
                    style: {
                      backgroundColor: (rowData.status === "pending") ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
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
                      field: "status",
                      key: "1",
                      operator: "=",
                      value: "pending",
                    }
                  ],
                }}
                fields={[
                  {
                    caption: "Group Name",
                    name: "group_name",
                    type: "string"
                  },
                  {
                    caption: "Contact Name",
                    name: "contact_name",
                    type: "string"
                  },
                  {
                    caption: "Team Name",
                    name: "team_name",
                    type: "string"
                  },
                  {
                    caption: "Agent Name",
                    name: "agent_name",
                    type: "string"
                  },
                  {
                    caption: "Email",
                    name: "email",
                    type: "string"
                  },
                  {
                    caption: "Type",
                    name: "type",
                    type: "select",
                    options: [
                      { caption: "Team", value: "team" },
                      { caption: "Agent", value: "agent" }
                    ]
                  },
                  {
                    caption: "Status",
                    name: "status",
                    type: "select",
                    options: [
                      { caption: "Pending", value: "pending" },
                      { caption: "Approved", value: "active" },
                      { caption: "Declined", value: "declined" }
                    ]
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  }
                ]}
              />
            </UsersInner>
          </UsersPadding>
        </UsersMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(GroupApprovals);
