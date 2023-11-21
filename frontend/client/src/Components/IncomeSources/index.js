import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { openCreateIncomeModal, getIncome } from "../../store/actions/income";
import { importMYTOFinance } from "../../store/actions/myto";
import {
  IncomeTable,
  IncomePadding,
  IncomeInner
} from "./style";
import GenericTable from "../GenericTable";
import { income_table_columns } from "../../column-definitions";
import { uniqBy } from "lodash";

class Income extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { customer_support, income, session, simulation, accounts } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    return (
      <IncomeTable id="income-sources">
        <IncomePadding>
          <IncomeInner>
            <GenericTable
              permissions={["finance-edit"]}
              getData={getIncome}
              columns={income_table_columns}
              page_size={10}
              data_path={!simulation ? ["income", "income_sources"] : ["myto", "income"]}
              initial_data={[]}
              loading={income.isFetching}
              requested={income.requested}
              header="Income"
              transform_data={(data) => {
                return data.map((d) => ({ ...d, simulation }))
              }}
              newRow={{
                onClick: openCreateIncomeModal,
                arguments: [{}, false, false, simulation]
              }}
              {...(simulation && account.permissions.includes("finance-view") &&
              {
                additionalButton: {
                  buttonText: "Import Income Sources",
                  onClick: importMYTOFinance,
                  arguments: ["income", "income_sources"]
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
                  caption: "Source",
                  name: "income_type",
                  type: "select",
                  options: customer_support.core_settings.income_types.map((t) => ({ caption: t.type, value: t.type }))
                },
                {
                  caption: "Category",
                  name: "category",
                  type: "select",
                  options: uniqBy(customer_support.core_settings.income_types.map((t) => ({ caption: t.category, value: t.category })), "value")
                },
                {
                  caption: "Monthly Income",
                  name: "monthly_income",
                  type: "number"
                },
                {
                  caption: "Annual Income",
                  name: "annual_income",
                  type: "number"
                },
                {
                  caption: "Inflation Adjusted",
                  name: "inflation",
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
          </IncomeInner>
        </IncomePadding>
      </IncomeTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  income: state.income,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Income);