import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { tickets_table_columns } from "../../column-definitions";
import { deleteTickets, getTickets, openCreateTicketModal, updateTicket } from "../../store/actions/tickets";
import { customerServiceGetCSUsers } from "../../store/actions/customer-support";
import {
  ViewContainer
} from "../../global-components";

import GenericTable from "../GenericTable";

class TicketManagement extends Component {

  constructor(props) {
    super(props);
    document.title = "Ticket Management";
    this.state = {};
  }

  componentDidMount() {
    const { customerServiceGetCSUsers, customer_support } = this.props;
    if (!customer_support.requestedCsUsers && !customer_support.isFetchingCSUsers) customerServiceGetCSUsers();
  }

  render() {
    const { ticket_state } = this.props;
    return (
      <ViewContainer margintop={10}>
        <GenericTable
          deleteMultiple={deleteTickets}
          isSelectable={true}
          cellUpdateFunction={updateTicket}
          permissions={["hopetrust-tickets-edit"]}
          getData={getTickets}
          columns={tickets_table_columns}
          page_size={25}
          data_path={["tickets", "list"]}
          initial_data={[]}
          loading={ticket_state.isFetching}
          requested={ticket_state.requested}
          sortBy="created_at"
          header="Tickets"
          newRow={{
            onClick: openCreateTicketModal,
            arguments: [{}, false, false]
          }}
          filter={{
            groupName: "or",
            items: [
              {
                field: "status",
                key: "1",
                operator: "=",
                value: "new",
              },
              {
                field: "status",
                key: "2",
                operator: "=",
                value: "open",
              },
              {
                field: "status",
                key: "3",
                operator: "=",
                value: "pending",
              }
            ],
          }}
          fields={[
            {
              caption: "Account Name",
              name: "account_name",
              type: "string"
            },
            {
              caption: "Assignee Name",
              name: "assignee_name",
              type: "string"
            },
            {
              caption: "Ticket Body",
              name: "body",
              type: "string"
            },
            {
              caption: "Domain",
              name: "domain",
              type: "string"
            },
            {
              caption: "Author Name",
              name: "creator_name",
              type: "string"
            },
            {
              caption: "Organization",
              name: "organization",
              type: "string"
            },
            {
              caption: "Priority",
              name: "priority",
              type: "select",
              options: [
                { value: "urgent", caption: "Urgent" },
                { value: "high", caption: "High" },
                { value: "normal", caption: "Normal" },
                { value: "low", caption: "Low" }
              ]
            },
            {
              caption: "Request Type",
              name: "request_type",
              type: "select",
              options: [
                { caption: "Other", value: "other_request_type" },
                { caption: "Money", value: "money" },
                { caption: "Domain Approval", value: "domain_approval" },
                { caption: "Account Update", value: "account_update" },
                { caption: "Professional Portal Assistance", value: "professional_portal_assistance" },
                { caption: "Medical", value: "medical" },
                { caption: "Food", value: "food" },
                { caption: "Transportation", value: "transportation" },
                { caption: "Permission", value: "permission" },
                { caption: "New Relationship", value: "new_relationship" },
                { caption: "Course Passed", value: "course_passed" },
              ]
            },
            {
              caption: "Status",
              name: "status",
              type: "select",
              options: [
                { value: "new", caption: "New" },
                { value: "open", caption: "Open" },
                { value: "pending", caption: "Pending" },
                { value: "solved", caption: "Solved" },
                { value: "closed", caption: "Closed" }
              ]
            },
            {
              caption: "Title",
              name: "title",
              type: "string"
            },
            {
              caption: "Created",
              name: "created_at",
              type: "date"
            },
            {
              caption: "Updated",
              name: "updated_at",
              type: "date"
            }
          ]}
          paging={true}
          search={true}
          columnResizing={true}
        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  ticket_state: state.tickets,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  customerServiceGetCSUsers: (override) => dispatch(customerServiceGetCSUsers(override))
});
export default connect(mapStateToProps, dispatchToProps)(TicketManagement);
