import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getAgents, openCreateAgentModal } from "../../store/actions/agents";
import { agent_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import GenericTable from "../GenericTable";

class AgentAccounts extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { agent_state } = this.props;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["hopetrust-benefits-edit"]}
          getData={getAgents}
          columns={agent_table_columns}
          page_size={25}
          data_path={["agents", "list"]}
          initial_data={[]}
          loading={agent_state.isFetching}
          requested={agent_state.requested}
          sortBy="created_at"
          newRow={{
            onClick: openCreateAgentModal,
            arguments: [{}, false, false]
          }}
          header="Agents"
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          fields={[
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
  agent_state: state.agents
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(AgentAccounts);
