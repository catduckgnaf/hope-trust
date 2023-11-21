import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { exportRelationships } from "../../store/actions/pdf";
import { getRelationships } from "../../store/actions/account";
import {
  ViewContainer
} from "../../global-components";
import { openCreateRelationshipModal } from "../../store/actions/relationship";
import { users_table_columns } from "../../column-definitions";
import GenericTable from "../../Components/GenericTable";

class Relationships extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    document.title = "Account Users";
    this.state = {};
  }

  render() {
    const { relationship, accounts, session, customer_support } = this.props;
    const account = accounts.find((a) => a.account_id === session.account_id);

    return (
      <ViewContainer>
        <GenericTable
          permissions={["account-admin-view"]}
          getData={getRelationships}
          onRefresh={localStorage.removeItem("react-avatar/failing")}
          columns={users_table_columns}
          page_size={25}
          data_path={["relationship", "list"]}
          initial_data={[]}
          loading={relationship.isFetching}
          requested={relationship.requested}
          header="Users"
          subscribe={true}
          {...(account.permissions.includes("account-admin-edit") && {
            newRow: {
              onClick: openCreateRelationshipModal,
              arguments: [{}, false, false]
            }
          })}
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          {...(account.permissions.includes("account-admin-view") && { exportPDFFunction: (data, searched, type) => exportRelationships(data, searched, type) })}
          fields={[
            {
              caption: "First Name",
              name: "first_name",
              type: "string"
            },
            {
              caption: "Last Name",
              name: "last_name",
              type: "string"
            },
            {
              caption: "Full Name",
              name: "name",
              type: "string"
            },
            {
              caption: "Email",
              name: "email",
              type: "string"
            },
            {
              caption: "State",
              name: "state",
              type: "string"
            },
            {
              caption: "Status",
              name: "status",
              type: "select",
              options: [
                { value: "active", caption: "Active" },
                { value: "inactive", caption: "Inactive" }
              ]
            },
            {
              caption: "Is Partner",
              name: "is_partner",
              type: "select",
              options: [
                { value: "true", caption: "Yes" },
                { value: "false", caption: "No" }
              ]
            },
            {
              caption: "Is Emergency",
              name: "emergency_contact",
              type: "select",
              options: [
                { value: "true", caption: "Yes" },
                { value: "false", caption: "No" }
              ]
            },
            {
              caption: "Is Primary",
              name: "primary_contact",
              type: "select",
              options: [
                { value: "true", caption: "Yes" },
                { value: "false", caption: "No" }
              ]
            },
            {
              caption: "Is Secondary",
              name: "secondary_contact",
              type: "select",
              options: [
                { value: "true", caption: "Yes" },
                { value: "false", caption: "No" }
              ]
            },
            {
              caption: "Will Inherit Account",
              name: "inherit",
              type: "select",
              options: [
                { value: "true", caption: "Yes" },
                { value: "false", caption: "No" }
              ]
            },
            {
              caption: "Relationship Type",
              name: "type",
              type: "select",
              options: customer_support.core_settings.contact_types.map((c) => ({ value: c.type, caption: c.type }))
            },
            {
              caption: "Created",
              name: "created_at",
              type: "date"
            },
            {
              caption: "Last Active",
              name: "last_activity",
              type: "date"
            }
          ]}
        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  relationship: state.relationship,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Relationships);
