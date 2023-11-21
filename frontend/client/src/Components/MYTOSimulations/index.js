import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { getMYTOSimulations, switchMYTOView, runActualSimulation } from "../../store/actions/myto";
import {
  MYTOSimulationsTable,
  MYTOSimulationsTablePadding,
  Bold
} from "./style";
import GenericTable from "../GenericTable";
import { myto_table_columns } from "../../column-definitions";

class MYTOSimulations extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      account
    };
  }

  render() {
    const { myto } = this.props;
    const { account } = this.state;
    return (
      <MYTOSimulationsTable id="income-sources">
        <MYTOSimulationsTablePadding>
          <GenericTable
            permissions={["myto-edit"]}
            getData={getMYTOSimulations}
            getArgs={[true, 0, 100]}
            columns={myto_table_columns}
            page_size={10}
            data_path={["myto", "simulations"]}
            initial_data={[]}
            loading={myto.isFetching}
            requested={myto.requested}
            header={<><Bold>M</Bold>eet <Bold>Y</Bold>our <Bold>T</Bold>rust <Bold>O</Bold>bjectives - Recent Simulations</>}
            newRow={{
              onClick: switchMYTOView,
              arguments: ["calculator"]
            }}
            {...(account.permissions.includes("myto-edit") &&
            {
              additionalButton: {
                buttonText: "Calculate",
                onClick: runActualSimulation,
                arguments: []
              }
            }
            )
            }
            paging={true}
            search={true}
            columnResizing={true}
            radius={0}
            fields={[
              {
                caption: "Name",
                name: "simulation_name",
                type: "string"
              },
              {
                caption: "Fund Life",
                name: "desired_life_of_fund",
                type: "number"
              },
              {
                caption: "Current Available Assets",
                name: "current_available",
                type: "number"
              },
              {
                caption: "Total Available Assets",
                name: "total_available_assets",
                type: "number"
              },
              {
                caption: "Total Benefits Value",
                name: "total_benefits_value",
                type: "number"
              },
              {
                caption: "Gap With Benefits",
                name: "trust_funding_gap",
                type: "number"
              },
              {
                caption: "Gap Without Benefits",
                name: "trust_fund_gap_without_benefits",
                type: "number"
              },
              {
                caption: "Beneficiary Age",
                name: "beneficiary_age",
                type: "number"
              },
              {
                caption: "Concierge Level",
                name: "concierge_services",
                type: "select",
                options: [
                  { caption: "0", value: "0" },
                  { caption: "1", value: "1" },
                  { caption: "2", value: "2" },
                  { caption: "3", value: "3" }
                ]
              },
              {
                caption: "Is Default",
                name: "default_simulation",
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
        </MYTOSimulationsTablePadding>
      </MYTOSimulationsTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  myto: state.myto
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(MYTOSimulations);