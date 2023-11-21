import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { customerServiceGetAllBenefitsConfigs } from "../../store/actions/customer-support";
import { benefit_accounts_table_columns } from "../../column-definitions";
import GenericTable from "../GenericTable";
import { openCreateAccountModal } from "../../store/actions/account";
import {
  ViewContainer
} from "../../global-components";
import {
  UserAccountsMain,
  UserAccountsPadding,
  UserAccountsInner
} from "./style";

class BenefitClients extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { customer_support, plans } = this.props;
    return (
      <ViewContainer>
        <UserAccountsMain>
          <UserAccountsPadding>
            <UserAccountsInner>
              <GenericTable
                permissions={["hopetrust-benefits-edit"]}
                getData={customerServiceGetAllBenefitsConfigs}
                columns={benefit_accounts_table_columns}
                page_size={25}
                data_path={["customer_support", "benefits_configs"]}
                initial_data={[]}
                loading={customer_support.isFetchingBenefitsConfigs}
                requested={customer_support.requestedBenefitsConfigs}
                newRow={{
                  onClick: openCreateAccountModal,
                  arguments: [{ responsibility: "benefits" }]
                }}
                paging={true}
                search={true}
                columnResizing={true}
                radius={0}
                header="Employee Benefits"
                filter={{
                  groupName: "and",
                  items: [
                    {
                      field: "invite_status",
                      key: "1",
                      operator: "=",
                      value: "claimed",
                    }
                  ],
                }}
                fields={[
                  {
                    caption: "Account Name",
                    name: "name",
                    type: "string"
                  },
                  {
                    caption: "Wholesaler Name",
                    name: "wholesaler_name",
                    type: "string"
                  },
                  {
                    caption: "Retailer Name",
                    name: "retailer_name",
                    type: "string"
                  },
                  {
                    caption: "Agent Name",
                    name: "agent_name",
                    type: "string"
                  },
                  {
                    caption: "Group Name",
                    name: "group_name",
                    type: "string"
                  },
                  {
                    caption: "Team Name",
                    name: "team_name",
                    type: "string"
                  },
                  {
                    caption: "Plan Name",
                    name: "plan_name",
                    type: "select",
                    options: [...new Set(plans.user_plans.map((item) => item.name)).map((n) => ({ caption: n, value: n }))]
                  },
                  {
                    caption: "Plan ID",
                    name: "plan_id",
                    type: "string"
                  },
                  {
                    caption: "Invite First Name",
                    name: "invite_first",
                    type: "string"
                  },
                  {
                    caption: "Invite Last Name",
                    name: "invite_last",
                    type: "string"
                  },
                  {
                    caption: "Invite Email",
                    name: "invite_email",
                    type: "string"
                  },
                  {
                    caption: "Invite Link",
                    name: "invite_url",
                    type: "string"
                  },
                  {
                    caption: "Invite Status",
                    name: "invite_status",
                    type: "select",
                    options: [
                      { caption: "Sent", value: "sent" },
                      { caption: "Read", value: "read" },
                      { caption: "Claimed", value: "claimed" }
                    ]
                  },
                  {
                    caption: "Invite Code",
                    name: "invite_code",
                    type: "string"
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  }
                ]}
              />
            </UserAccountsInner>
          </UserAccountsPadding>
        </UserAccountsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BenefitClients);
