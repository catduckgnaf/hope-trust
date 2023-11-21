import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { customerServiceGetAllAccounts, customerServiceGetAllUsers } from "../../store/actions/customer-support";
import { getReferrals } from "../../store/actions/referral";
import { openCreateAccountModal } from "../../store/actions/account";
import { accounts_table_columns } from "../../column-definitions";
import GenericTable from "../GenericTable";
import {
  ViewContainer
} from "../../global-components";
import {
  UserAccountsMain,
  UserAccountsPadding,
  UserAccountsInner
} from "./style";
import { getActivePartnerPlans, getActiveUserPlans, getPartnerPlans, getUserPlans } from "../../store/actions/plans";
import { US_STATES } from "../../utilities";

class UserAccounts extends Component {

  constructor(props) {
    super(props);
    const { customer_support, location } = props;
    document.title = "User Accounts";
    const account_ids = location.query.account_ids ? location.query.account_ids.split(",") : [];
    window.history.pushState({}, "User Accounts", window.location.pathname);
    let accounts = [];
    if (account_ids.length) accounts = customer_support.accounts.filter((acc) => account_ids.includes(acc.account_id));
    this.state = {
      accounts
    };
  }

  async componentDidMount() {
    const { getActivePartnerPlans, getActiveUserPlans, getPartnerPlans, getUserPlans, customerServiceGetAllUsers, customer_support, plans, referral, getReferrals } = this.props;
    if (!referral.requested && !referral.isFetching) await getReferrals();
    if (!customer_support.requestedAllUsers && !customer_support.isFetchingAllUsers) customerServiceGetAllUsers();
    if (!plans.requestedUserPlans && !plans.isFetchingUserPlans) getUserPlans();
    if (!plans.requestedActiveUserPlans && !plans.isFetchingActiveUserPlans) getActiveUserPlans();
    if (!plans.requestedPartnerPlans && !plans.isFetchingPartnerPlans) getPartnerPlans();
    if (!plans.requestedActivePartnerPlans && !plans.isFetchingActivePartnerPlans) getActivePartnerPlans();
  }

  render() {
    const { customer_support, plans } = this.props;
    const { accounts } = this.state;
    return (
      <ViewContainer>
        <UserAccountsMain>
          <UserAccountsPadding>
            <UserAccountsInner>
              <GenericTable
                permissions={["hopetrust-accounts-edit"]}
                getData={customerServiceGetAllAccounts}
                columns={accounts_table_columns}
                page_size={10}
                data_path={["customer_support", "accounts"]}
                initial_data={accounts}
                loading={customer_support.isFetching}
                requested={customer_support.requested}
                header="Client Accounts"
                newRow={{
                  onClick: openCreateAccountModal,
                  arguments: [{}]
                }}
                paging={true}
                search={true}
                columnResizing={true}
                fields={[
                  {
                    caption: "Account Name",
                    name: "account_name",
                    type: "string"
                  },
                  {
                    caption: "Customer ID",
                    name: "customer_id",
                    type: "string"
                  },
                  {
                    caption: "Subscription ID",
                    name: "subscription_id",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Deal ID",
                    name: "hubspot_deal_id",
                    type: "string"
                  },
                  {
                    caption: "State",
                    name: "state",
                    type: "select",
                    options: US_STATES.map((state) => ({ caption: state.name, value: state.name }))
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
                    caption: "Account Members",
                    name: "count",
                    type: "number"
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
  user: state.user,
  customer_support: state.customer_support,
  referral: state.referral,
  location: state.router.location,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  customerServiceGetAllUsers: (override) => dispatch(customerServiceGetAllUsers(override)),
  getReferrals: (override) => dispatch(getReferrals(override)),
  getUserPlans: (override) => dispatch(getUserPlans(override)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  getPartnerPlans: (override) => dispatch(getPartnerPlans(override)),
  getActivePartnerPlans: (type, override) => dispatch(getActivePartnerPlans(type, override))
});
export default connect(mapStateToProps, dispatchToProps)(UserAccounts);
