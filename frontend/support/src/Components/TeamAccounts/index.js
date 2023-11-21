import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getTeams, openCreateTeamModal } from "../../store/actions/teams";
import { team_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import GenericTable from "../GenericTable";

class TeamAccounts extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { team_state } = this.props;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["hopetrust-benefits-edit"]}
          getData={getTeams}
          columns={team_table_columns}
          page_size={25}
          data_path={["teams", "list"]}
          initial_data={[]}
          loading={team_state.isFetching}
          requested={team_state.requested}
          sortBy="created_at"
          header="Teams"
          newRow={{
            onClick: openCreateTeamModal,
            arguments: [{}, false, false]
          }}
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          fields={[
            {
              caption: "Account Name",
              name: "name",
              type: "string"
            },
            {
              caption: "Contact Name",
              name: "contact_name",
              type: "string"
            },
            {
              caption: "Email",
              name: "email",
              type: "string"
            },
            {
              caption: "Clients",
              name: "count",
              type: "number"
            },
            {
              caption: "Contract Signature ID",
              name: "signature_id",
              type: "string"
            },
            {
              caption: "Contracts Signed",
              name: "contract_signed",
              type: "select",
              options: [
                { caption: "Yes", value: "true" },
                { caption: "No", value: "false" }
              ]
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
  team_state: state.teams
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(TeamAccounts);
