import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { wholesale_approval_table_columns } from "../../column-definitions";
import { openCreateWholesaleConnectionModal } from "../../store/actions/wholesale";
import { getWholesaleApprovals } from "../../store/actions/account";
import {
  ViewContainer
} from "../../global-components";
import {
  UsersMain,
  UsersPadding,
  UsersInner
} from "./style";
import GenericTable from "../GenericTable";
import { orderBy } from "lodash";

class WholesaleApprovals extends Component {

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
                getData={getWholesaleApprovals}
                columns={wholesale_approval_table_columns}
                page_size={25}
                data_path={["customer_support", "wholesale_approvals"]}
                initial_data={[]}
                transform_data={(data) => {
                  return orderBy(data, [(a) => a.status === "pending", "created_at"], ["desc", "desc"]);
                }}
                loading={customer_support.isFetchingWholesaleApprovals}
                requested={customer_support.requestedWholesaleApprovals}
                header="Wholesale Connections"
                newRow={{
                  onClick: openCreateWholesaleConnectionModal,
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
                    caption: "Wholesaler Name",
                    name: "name",
                    type: "string"
                  },
                  {
                    caption: "Contact Name",
                    name: "contact_name",
                    type: "string"
                  },
                  {
                    caption: "Retailer Name",
                    name: "retailer_name",
                    type: "string"
                  },
                  {
                    caption: "Email",
                    name: "email",
                    type: "string"
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
export default connect(mapStateToProps, dispatchToProps)(WholesaleApprovals);
