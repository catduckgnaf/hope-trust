import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { customerServiceGetPendingApprovals, openAddMembershipModal } from "../../store/actions/customer-support";
import { pending_approval_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  UsersMain,
  UsersPadding,
  UsersInner
} from "./style";
import GenericTable from "../GenericTable";

class PendingApprovals extends Component {

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
                permissions={["hopetrust-users-edit", "hopetrust-accounts-edit", "hopetrust-partners-edit"]}
                getData={customerServiceGetPendingApprovals}
                columns={pending_approval_table_columns}
                page_size={25}
                data_path={["customer_support", "pending_approvals"]}
                initial_data={[]}
                loading={customer_support.isFetchingPendingApprovals}
                requested={customer_support.requestedPendingApprovals}
                header="Pending Approvals"
                newRow={{
                  onClick: openAddMembershipModal,
                  arguments: ["client"]
                }}
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                fields={[
                  {
                    caption: "Requester Name",
                    name: "requester_name",
                    type: "string"
                  },
                  {
                    caption: "Requested Name",
                    name: "requested_name",
                    type: "string"
                  },
                  {
                    caption: "Requester Email",
                    name: "email",
                    type: "string"
                  },
                  {
                    caption: "Requested Email",
                    name: "requested_email",
                    type: "string"
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
  customer_support: state.customer_support,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(PendingApprovals);
