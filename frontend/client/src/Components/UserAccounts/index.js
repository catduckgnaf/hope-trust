import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getAccounts, openAddNewUserModal, openCreateAccountModal } from "../../store/actions/account";
import { ViewContainer } from "../../global-components";
import GenericTable from "../GenericTable";
import { accounts_table_columns } from "../../column-definitions";

class UserAccounts extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { account, accounts, plans, user, session } = this.props;
    const current_account = accounts.find((a) => a.account_id === session.account_id);
    return (
      <ViewContainer>
        <GenericTable
          permissions={["basic-user"]}
          getData={getAccounts}
          getArgs={[user.cognito_id, current_account.account_id, true]}
          columns={accounts_table_columns}
          page_size={10}
          initial_data={[]}
          data_path={["accounts"]}
          loading={account.isFetchingAccounts}
          requested={account.requestedAccounts}
          header="Linked Accounts"
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          {...(!user.is_partner && {
            newRow: {
              onClick: openAddNewUserModal,
              arguments: [],
              buttonText: "New Relationship"
            }
          })}
          {...(user.is_partner && {
            additionalButton: ((user.is_partner && !session.is_switching && (user.coupon && user.coupon.metadata.new_accounts === "true") && current_account.features.create_accounts) && {
              onClick: openCreateAccountModal,
              arguments: [{ is_partner_creation: true, is_user_creation: false }],
              buttonText: "Create Account"
            })
          }
          )}
          fields={[
            {
              caption: "Account Name",
              name: "name",
              type: "string"
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
  user: state.user,
  session: state.session,
  accounts: state.accounts,
  account: state.account,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  openCreateAccountModal: (config) => dispatch(openCreateAccountModal(config))
});
export default connect(mapStateToProps, dispatchToProps)(UserAccounts);
