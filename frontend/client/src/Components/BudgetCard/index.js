import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { toastr } from "react-redux-toastr";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import { getBudgetTypeColor } from "../../store/actions/utilities";
import { deleteMytoExpense } from "../../store/actions/myto";
import { getUserAge } from "../../utilities";
import { openCreateBudgetModal, deleteBudgetRecord } from "../../store/actions/budgets";
import {
  BudgetCardMain,
  BudgetCardPadding,
  BudgetCardInner,
  BudgetCardSection,
  BudgetCardSectionText,
  BudgetPercentageContainer,
  MobileLabel
} from "./style";

class BudgetCard extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      permissions: account.permissions
    };
  }

  deleteBudget = (id) => {
    const { deleteBudgetRecord, deleteMytoExpense, simulation } = this.props;
    const deleteOptions = {
      onOk: !simulation ? () => deleteBudgetRecord(id) : () => deleteMytoExpense(id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete",
      cancelText: "Cancel"
    };
    toastr.confirm("Are you sure you want to delete this budget item?", deleteOptions);
  };

  render() {
    const { budget, openCreateBudgetModal, budgets, myto, simulation, beneficiary } = this.props;
    const { permissions } = this.state;
    const usable_budgets = budgets.budget_items.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const usable_myto_budgets = myto.budgets.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const total_budget = usable_budgets.reduce((a, { value }) => a + value, 0);
    const total_myto_budget = usable_myto_budgets.reduce((a, { value }) => a + value, 0);
    const is_budget_viable = budget.term.length && budget.term[0] <= getUserAge(beneficiary.birthday);
    return (
      <BudgetCardMain>
        <BudgetCardPadding>
          <BudgetCardInner color={getBudgetTypeColor(budget.budget_category)}>
            <BudgetCardSection xs={12} sm={12} md={1} lg={1} xl={1}>
              <MobileLabel>Percentage: </MobileLabel><BudgetCardSectionText weight="600" size={15}>
                <BudgetPercentageContainer>{simulation ? ((budget.value / total_myto_budget) * 100).toFixed(1) : is_budget_viable ? ((budget.value / total_budget) * 100).toFixed(1) : 0}%</BudgetPercentageContainer>
              </BudgetCardSectionText>
            </BudgetCardSection>
            <BudgetCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Category: </MobileLabel><BudgetCardSectionText transform="capitalize">{budget.budget_category}</BudgetCardSectionText>
            </BudgetCardSection>
            <BudgetCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Projected Age Range: </MobileLabel><BudgetCardSectionText alt={!is_budget_viable ? "Age out of range" : "Age in range"} error={!is_budget_viable ? 1 : 0} transform="capitalize">{(budget.term && budget.term.length && budget.term[0] && budget.term[1]) ? `${budget.term[0]} - ${budget.term[1]}` : "N/A"}</BudgetCardSectionText>
            </BudgetCardSection>
            <BudgetCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Details: </MobileLabel><BudgetCardSectionText transform="capitalize">{budget.details || "N/A"}</BudgetCardSectionText>
            </BudgetCardSection>
            <BudgetCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Monthly Cost: </MobileLabel><BudgetCardSectionText>${budget.value.toLocaleString()}</BudgetCardSectionText>
            </BudgetCardSection>
            
            <BudgetCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>

              {permissions.includes("budget-edit")
                ? (
                  <BudgetCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateBudgetModal(budget, true, false, simulation)}>Edit</Button>
                    <Button nomargin danger small onClick={() => this.deleteBudget(budget.id)}>Delete</Button>
                  </BudgetCardSectionText>
                )
                : (
                  <BudgetCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateBudgetModal(budget, false, true, simulation)}>View</Button>
                  </BudgetCardSectionText>
                )
              }
            </BudgetCardSection>
          </BudgetCardInner>
        </BudgetCardPadding>
      </BudgetCardMain>
    );
  }
}
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  budgets: state.budgets,
  myto: state.myto
});
const dispatchToProps = (dispatch) => ({
  deleteBudgetRecord: (id) => dispatch(deleteBudgetRecord(id)),
  deleteMytoExpense: (id) => dispatch(deleteMytoExpense(id)),
  openCreateBudgetModal: (defaults, updating, viewing, simulation) => dispatch(openCreateBudgetModal(defaults, updating, viewing, simulation))
});
export default connect(mapStateToProps, dispatchToProps)(BudgetCard);
