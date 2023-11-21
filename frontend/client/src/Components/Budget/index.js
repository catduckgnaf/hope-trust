import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { openCreateBudgetModal, getBudget } from "../../store/actions/budgets";
import { getParentBudgetTypeColor } from "../../store/actions/utilities";
import { importMYTOFinance } from "../../store/actions/myto";
import { uniqBy } from "lodash";
import { getUserAge } from "../../utilities";
import {
  BudgetsTable,
  BudgetsTablePadding,
  PercentageContainer,
  PercentageInner
} from "./style";
import GenericTable from "../GenericTable";
import { expense_table_columns } from "../../column-definitions";

class Budgets extends Component {

  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
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

  getAccountTypeColor = (type) => {
    return getParentBudgetTypeColor(type);
  };

  render() {
    const { relationship, core_settings, budgets, simulation } = this.props;
    const { account } = this.state;

    return (
      <BudgetsTable id="budget">
        <BudgetsTablePadding>
          <GenericTable
            permissions={["finance-edit", "budget-edit"]}
            getData={getBudget}
            columns={expense_table_columns}
            page_size={25}
            data_path={!simulation ? ["budgets", "budget_items"] : ["myto", "budgets"]}
            initial_data={[]}
            transform_data={(data) => {
              return data.map((d) => ({ ...d, simulation }))
            }}
            loading={budgets.isFetching}
            requested={budgets.requested}
            header="Monthly Budget"
            groups={[
              {
                columnKey: "parent_category",
                icon: {
                  Component: (group, props, tableProps, dispatch) => {
                    const category_name = props.groupKey[props.groupKey.length - 1] && props.groupKey[0];
                    const beneficiary = relationship.list.find((r) => r.type === "beneficiary");
                    const total_budget = tableProps.data.filter(({ term }) => (term.length && term[0] <= getUserAge(beneficiary.birthday))).reduce((accumulator, { value }) => {
                      return accumulator + value;
                    }, 0);
                    const category_items = tableProps.data.filter((item) => item.parent_category === props.groupKey[props.groupKey.length - 1] && item.parent_category === props.groupKey[0]);
                    const category_sum = category_items.filter(({ term }) => (term.length && term[0] <= getUserAge(beneficiary.birthday))).reduce((accumulator, { value }) => {
                      return accumulator + value;
                    }, 0);
                    const percent = (category_sum && total_budget) ? ((category_sum / total_budget) * 100).toFixed(2) : 0;
                    return (
                      <PercentageContainer>
                        <PercentageInner color={this.getAccountTypeColor(category_name)}>{percent}%</PercentageInner>
                      </PercentageContainer>
                    );
                  }
                }
              }
            ]}
            fields={[
              {
                caption: "Type",
                name: "budget_category",
                type: "select",
                options: uniqBy(core_settings.budget_categories.filter((d) => d.name).map((d) => ({ caption: d.name, value: d.name })), "value")
              },
              {
                caption: "Category",
                name: "parent_category",
                type: "select",
                options: uniqBy(core_settings.budget_categories.filter((d) => d.category).map((d) => ({ caption: d.category, value: d.category })), "value")
              },
              {
                caption: "Monthly Value",
                name: "value",
                type: "number"
              },
              {
                caption: "Annual Value",
                name: "annual_value",
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
            newRow={{
              onClick: openCreateBudgetModal,
              arguments: [{}, false, false, false]
            }}
            {...(simulation && account.permissions.includes("budget-view") &&
            {
              additionalButton: {
                buttonText: "Import Expenses",
                onClick: importMYTOFinance,
                arguments: ["budgets", "budget_items"]
              }
            }
            )
            }
            paging={true}
            search={true}
            columnResizing={true}
            csvExport={true}
            radius={0}
          />
        </BudgetsTablePadding>
      </BudgetsTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  session: state.session,
  core_settings: state.customer_support.core_settings,
  budgets: state.budgets
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Budgets);