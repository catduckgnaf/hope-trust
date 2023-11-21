import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatCash, getUserAge } from "../../utilities";
import {
  GraphGroupGraphContainer,
  GraphGroupGraphContainerTitle,
  GraphGroupGraphContainerTitleNoLink,
  GraphGroupGraphContainerSubtitle,
  AddtionalGraphInformation,
  AddtionalGraphInformationPadding,
  AddtionalGraphInformationInner,
  AddtionalGraphInformationSection,
  AddtionalGraphInformationIcon,
  AddtionalGraphInformationTitle,
  ResetGraph
} from "./style";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import { getBudgetValues, getBudgetCategoryValues } from "../../store/actions/utilities";
import { getBudget } from "../../store/actions/budgets";
import { setActiveFinanceTab } from "../../store/actions/finance";
import { isEqual } from "lodash";

  const ErrorLoader = () => {
    return (
      <Error span={12}>
        <ErrorPadding>
          <ErrorInner span={12}>
            <ErrorInnerRow height={200}>
              <ErrorIcon span={12}>
                <FontAwesomeIcon icon={["fad", "spinner"]} spin/>
              </ErrorIcon>
              <ErrorMessage span={12}>Fetching data...</ErrorMessage>
            </ErrorInnerRow>
          </ErrorInner>
        </ErrorPadding>
      </Error>
    );
  };

const options = {
  animation: {
   animateRotate: false,
   animateScale: false
  },
  responsive: true,
  cutoutPercentage: 55,
  maintainAspectRatio: false,
  width: 500,
  legend: false,
  hover: {
    onHover: function (e) {
      const point = this.getElementAtEvent(e);
      if (point.length) {
        e.target.style.cursor = "pointer";
      } else {
        e.target.style.cursor = "default";
      }
    }
  },
  plugins: {
    labels: {
      render: () => {
        return "";
      }
    }
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem, data) => {
        let total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        let value = data["datasets"][0]["data"][tooltipItem["index"]];
        let percent = ((value / total) * 100).toFixed(1);
        return ` ${percent}% - ${data["labels"][tooltipItem["index"]]} - $${value.toLocaleString()}`;
      }
    }
  }
};

class IncomeGraph extends Component {
  static propTypes = {
    getBudget: PropTypes.func.isRequired,
    Component:PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, relationship, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");
    this.state = {
      account,
      beneficiary,
      category_items: [],
      category_view: false
    };
  }

  async componentDidMount() {
    const { getBudget, budgets } = this.props;
    const { account } = this.state;
    if (account.permissions.includes("budget-view") && !budgets.requested) await getBudget();
  }

  goToCategory = (e) => {
    const { budgets } = this.props;
    const { beneficiary } = this.state;
    if (e.length) {
      if (e[0]["_chart"] && e[0]["_chart"].data) {
        const usableItems = budgets.budget_items.filter((b) => b.parent_category === e[0]["_chart"].data.labels[e[0]["_index"]]);
        const category_items = usableItems.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
        this.setState({ category_items, category_view: true });
      }
    }
  };

  resetCategoryView = () => this.setState({ category_items: [], category_view: false });

  componentDidUpdate(prevProps, prevState) {
    if ((!isEqual(prevProps.budgets.budget_items, this.props.budgets.budget_items))) {
      this.resetCategoryView();
    }
    if (this.props.budgets.creating_budget && prevState.category_view) {
      this.resetCategoryView();
    }
  }

  render() {
    const { Component, budgets, setActiveFinanceTab } = this.props;
    const { category_view, beneficiary, category_items } = this.state;
    let usable_budgets = budgets.budget_items.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    if (category_view) usable_budgets = category_items;
    const totalValue = usable_budgets.reduce((a, { value }) => a + value, 0);
    const chartData = category_view ? getBudgetCategoryValues(usable_budgets, beneficiary.birthday) : getBudgetValues(usable_budgets, beneficiary.birthday);

    return (
      <div>
      {!budgets.isFetching && totalValue
        ? (
          <>
            <GraphGroupGraphContainer>
              {!category_view
                ? (
                  <GraphGroupGraphContainerTitle to="/finances" onClick={() => setActiveFinanceTab("budgets")}>${`${formatCash(totalValue || 0)}`}<br />
                    <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
                  </GraphGroupGraphContainerTitle>
                )
                : (
                  <GraphGroupGraphContainerTitleNoLink>${`${formatCash(totalValue || 0)}`}<br />
                    <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
                  </GraphGroupGraphContainerTitleNoLink>
                )
              }
              <Component data={chartData} options={options} onElementsClick={!category_view ? (e) => this.goToCategory(e) : null} />
            </GraphGroupGraphContainer>
            <AddtionalGraphInformation>
              <AddtionalGraphInformationPadding>
                <AddtionalGraphInformationInner>
                  {category_view
                    ? <ResetGraph blue nomargin small round onClick={() => this.resetCategoryView()}>Reset Graph</ResetGraph>
                    : null
                  }
                  <AddtionalGraphInformationSection span={1}>
                    <AddtionalGraphInformationIcon>
                      <FontAwesomeIcon icon={["fad", "calendar-alt"]} />
                    </AddtionalGraphInformationIcon>
                  </AddtionalGraphInformationSection>
                  <AddtionalGraphInformationSection span={11}>
                    <AddtionalGraphInformationTitle to="/finances#budget" onClick={() => setActiveFinanceTab("budgets")}>
                      Monthly Budget - ${totalValue.toLocaleString()}
                    </AddtionalGraphInformationTitle>
                  </AddtionalGraphInformationSection>
                </AddtionalGraphInformationInner>
              </AddtionalGraphInformationPadding>
            </AddtionalGraphInformation>
            <AddtionalGraphInformation>
              <AddtionalGraphInformationPadding>
                <AddtionalGraphInformationInner>
                  <AddtionalGraphInformationSection span={1}>
                    <AddtionalGraphInformationIcon>
                      <FontAwesomeIcon icon={["fad", "search-dollar"]} />
                    </AddtionalGraphInformationIcon>
                  </AddtionalGraphInformationSection>
                  <AddtionalGraphInformationSection span={11}>
                    <AddtionalGraphInformationTitle to="/finances#budget" onClick={() => setActiveFinanceTab("budgets")}>
                      Yearly Spend - ${(totalValue * 12).toLocaleString()}
                    </AddtionalGraphInformationTitle>
                  </AddtionalGraphInformationSection>
                </AddtionalGraphInformationInner>
              </AddtionalGraphInformationPadding>
            </AddtionalGraphInformation>
          </>
        )
        : (
          <>
              {!totalValue && !budgets.isFetching
              ? (
                <Error span={12}>
                  <ErrorPadding>
                    <ErrorInner span={12}>
                      <ErrorInnerRow height={200}>
                        <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "chart-pie"]} />
                        </ErrorIcon>
                        <ErrorMessage span={12}>No Expense Data.</ErrorMessage>
                      </ErrorInnerRow>
                    </ErrorInner>
                  </ErrorPadding>
                </Error>
              )
              : <ErrorLoader />
            }
          </>
        )
      }
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  budgets: state.budgets,
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  getBudget: () => dispatch(getBudget()),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});
 
export default connect(mapStateToProps, dispatchToProps)(IncomeGraph);
