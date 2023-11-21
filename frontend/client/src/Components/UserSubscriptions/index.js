import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { US_STATES } from "../../utilities";
import {
  ViewContainer
} from "../../global-components";
import { getCustomerSubscriptions } from "../../store/actions/account";
import { subscriptions_table_columns } from "../../column-definitions";
import GenericTable from "../GenericTable";

class UserSubscriptions extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { account, plans } = this.props;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["account-admin-view"]}
          getData={getCustomerSubscriptions}
          columns={subscriptions_table_columns}
          page_size={10}
          initial_data={[]}
          data_path={["account", "subscriptions", "active"]}
          loading={account.isFetchingSubscriptions}
          requested={account.requestedSubscriptions}
          header="Client Subscriptions"
          transform_data={(data) => {
            return data.filter((a) => a.type === "user");
          }}
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          fields={[
            {
              caption: "Account Name",
              name: "account_name",
              type: "string"
            },
            {
              caption: "Account Value",
              name: "account_value",
              type: "number"
            },
            {
              caption: "State",
              name: "state",
              type: "select",
              options: US_STATES.map((state) => ({ caption: state.name, value: state.name }))
            },
            {
              caption: "In Transfer",
              name: "in_transfer",
              type: "select",
              options: [
                { caption: "Yes", value: "true" },
                { caption: "No", value: "false" }
              ]
            },
            {
              caption: "Plan Name",
              name: "plan_name",
              type: "select",
              options: [...new Set(plans.active_user_plans.map((item) => item.name)).map((n) => ({ caption: n, value: n }))]
            },
            {
              caption: "Created",
              name: "created_at",
              type: "date"
            }
          ]}
        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  plans: state.plans,
  account: state.account
});
const dispatchToProps = (dispatch) => ({
  getCustomerSubscriptions: (override, customer_id) => dispatch(getCustomerSubscriptions(override, customer_id))
});
export default connect(mapStateToProps, dispatchToProps)(UserSubscriptions);
