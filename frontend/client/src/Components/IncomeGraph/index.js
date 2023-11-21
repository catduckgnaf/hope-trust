import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatCash, getUserAge } from "../../utilities";
import {
  GraphGroupGraphContainer,
  GraphGroupGraphContainerTitle,
  GraphGroupGraphContainerSubtitle,
  AddtionalGraphInformation,
  AddtionalGraphInformationPadding,
  AddtionalGraphInformationInner,
  AddtionalGraphInformationSection,
  AddtionalGraphInformationIcon,
  AddtionalGraphInformationTitle
} from "./style";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import { getIncomeValues, getBenefitValues } from "../../store/actions/utilities";
import { getIncome } from "../../store/actions/income";
import { getBenefits } from "../../store/actions/benefits";
import { setActiveFinanceTab } from "../../store/actions/finance";

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
  plugins: {
    labels: {
      render: () => {
        return "";
      }
    }
  },
  tooltips: {
    callbacks: {
      label: (item, data) => {
        if (data.datasets.length > 1) {
          let total = data.datasets[item.datasetIndex].data.reduce((a, b) => a + b, 0);
          let value = data.datasets[item.datasetIndex]["data"][item["index"]];
          let percent = ((value / total) * 100).toFixed(1);
          return ` ${percent}% - ${data.datasets[item.datasetIndex].labels[item.index]} - $${value.toLocaleString()}`;
        } else {
          let total = data.datasets[0].data.reduce((a, b) => a + b, 0);
          let value = data["datasets"][0]["data"][item["index"]];
          let percent = ((value / total) * 100).toFixed(1);
          return ` ${percent}% - ${data["labels"][item["index"]]} - $${value.toLocaleString()}`;
        }
      }
    }
  }
};

class IncomeGraph extends Component {
  static propTypes = {
    getIncome: PropTypes.func.isRequired,
    getBenefits: PropTypes.func.isRequired,
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
      beneficiary
    };
  }

  async componentDidMount() {
    const { getIncome, getBenefits, income, benefits } = this.props;
    const { account } = this.state;
    if (account.permissions.includes("finance-view") && (!income.requested || !benefits.requested)) {
      let all_income = [getIncome(), getBenefits()];
      await Promise.all(all_income);
    }
  }

  combineChartData = (chart_data_1, chart_data_2) => {
    let all_sets = [];
    if (chart_data_1.labels.length) all_sets.push(chart_data_1);
    if (chart_data_2.labels.length) all_sets.push(chart_data_2);
    let new_data = {
      datasets: []
    };
    if (all_sets.length > 1) {
      all_sets.forEach((set, index) => {
        if (set.datasets) set.datasets[0].label = `chart-${index}`;
        if (set.labels) set.datasets[0].labels = set.labels;
        if (set.backgroundColor) set.datasets[0].backgroundColor = set.backgroundColor;
        if (set.hoverBorderColor) set.datasets[0].hoverBorderColor = set.hoverBorderColor;
        if (set.datasets) new_data.datasets.push(set.datasets[0]);
      });
      return new_data;
    }
    return all_sets[0];
  };

  render() {
    const { Component, income, benefits, setActiveFinanceTab } = this.props;
    const { beneficiary } = this.state;
    const usable_income = income.income_sources.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const usable_benefits = benefits.government_benefits.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const incomeTotal = usable_income.reduce((a, { monthly_income }) => a + monthly_income, 0);
    const governmentBenefitsTotal = usable_benefits.reduce((a, { value }) => a + value, 0);
    const chartData = this.combineChartData(getIncomeValues(income.income_sources, beneficiary.birthday), getBenefitValues(benefits.government_benefits, beneficiary.birthday));
    
    return (
      <div>
        {(!benefits.isFetching && !income.isFetching) && (incomeTotal || governmentBenefitsTotal)
        ? (
          <>
            <GraphGroupGraphContainer>
                <GraphGroupGraphContainerTitle to="/income" onClick={() => setActiveFinanceTab("income")}>${`${formatCash((incomeTotal + governmentBenefitsTotal) || 0)}`}<br />
                <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
              </GraphGroupGraphContainerTitle>
              <Component data={chartData} options={options} />
            </GraphGroupGraphContainer>
            <AddtionalGraphInformation>
              <AddtionalGraphInformationPadding>
                <AddtionalGraphInformationInner>
                  <AddtionalGraphInformationSection span={1}>
                    <AddtionalGraphInformationIcon>
                      <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                    </AddtionalGraphInformationIcon>
                  </AddtionalGraphInformationSection>
                  <AddtionalGraphInformationSection span={11}>
                    <AddtionalGraphInformationTitle to="/income#income-sources" onClick={() => setActiveFinanceTab("income")}>
                      Income Sources - ${incomeTotal.toLocaleString()}
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
                      <FontAwesomeIcon icon={["fad", "flag-usa"]} />
                    </AddtionalGraphInformationIcon>
                  </AddtionalGraphInformationSection>
                  <AddtionalGraphInformationSection span={11}>
                    <AddtionalGraphInformationTitle to="/income#government-benefits" onClick={() => setActiveFinanceTab("income")}>
                      Government Benefits - ${governmentBenefitsTotal.toLocaleString()}
                    </AddtionalGraphInformationTitle>
                  </AddtionalGraphInformationSection>
                </AddtionalGraphInformationInner>
              </AddtionalGraphInformationPadding>
            </AddtionalGraphInformation>
          </>
        )
        : (
          <>
              {!(incomeTotal && governmentBenefitsTotal) && !(income.isFetching && benefits.isFetching)
              ? (
                <Error span={12}>
                  <ErrorPadding>
                    <ErrorInner span={12}>
                      <ErrorInnerRow height={200}>
                        <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "money-check-edit"]} />
                        </ErrorIcon>
                        <ErrorMessage span={12}>No Income Data.</ErrorMessage>
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
  income: state.income,
  benefits: state.benefits,
  session: state.session,
  accounts: state.accounts,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  getIncome: () => dispatch(getIncome()),
  getBenefits: () => dispatch(getBenefits()),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});
 
export default connect(mapStateToProps, dispatchToProps)(IncomeGraph);
