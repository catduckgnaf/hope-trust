import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatCash } from "../../utilities";
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
import { getMYTOGraphValues } from "../../store/actions/utilities";
import { getMYTOSimulations } from "../../store/actions/myto";
import { setActiveFinanceTab } from "../../store/actions/finance";

const ErrorLoader = () => {
  return (
    <Error span={12}>
      <ErrorPadding>
        <ErrorInner span={12}>
          <ErrorInnerRow height={200}>
            <ErrorIcon span={12}>
              <FontAwesomeIcon icon={["fad", "spinner"]} spin />
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

class MYTOGraph extends Component {
  static propTypes = {
    getMYTOSimulations: PropTypes.func.isRequired,
    Component: PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
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

  async componentDidMount() {
    const { getMYTOSimulations, myto } = this.props;
    const { account } = this.state;
    if (!myto.requested && account.permissions.includes("myto-view")) await getMYTOSimulations(false, 0, 100);
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
    const { Component, myto, setActiveFinanceTab } = this.props;
    const default_simulation = myto.simulations.find((sim) => sim.default_simulation) || {};
    const chartData = this.combineChartData(getMYTOGraphValues({ trust_fund_gap_without_benefits: default_simulation.trust_fund_gap_without_benefits, current_available: default_simulation.current_available, total_benefits_value: default_simulation.total_benefits_value }), getMYTOGraphValues({ trust_funding_gap: default_simulation.trust_funding_gap, current_available: default_simulation.current_available, total_benefits_value: default_simulation.total_benefits_value }));

    return (
      <div>
        {!myto.isFetching && (default_simulation.trust_fund_gap_without_benefits || default_simulation.trust_funding_gap)
          ? (
            <>
              <GraphGroupGraphContainer>
                <GraphGroupGraphContainerTitle to="/finances" onClick={() => setActiveFinanceTab("myto")}>${`${formatCash(default_simulation.total_available_assets || 0)}`}<br />
                  <GraphGroupGraphContainerSubtitle>Total Assets</GraphGroupGraphContainerSubtitle>
                </GraphGroupGraphContainerTitle>
                <Component data={chartData} options={options} />
              </GraphGroupGraphContainer>
              <AddtionalGraphInformation>
                <AddtionalGraphInformationPadding>
                  <AddtionalGraphInformationInner>
                    <AddtionalGraphInformationSection span={1}>
                      <AddtionalGraphInformationIcon>
                        <FontAwesomeIcon icon={["fad", "envelope-open-dollar"]} />
                      </AddtionalGraphInformationIcon>
                    </AddtionalGraphInformationSection>
                    <AddtionalGraphInformationSection span={11}>
                      {default_simulation.total_benefits_value > 0
                        ? (
                          <AddtionalGraphInformationTitle to="/finances" onClick={() => setActiveFinanceTab("myto")}>
                            Gap With Benefits - ${(default_simulation.assets_needed_with_benefits || 0).toLocaleString()}
                          </AddtionalGraphInformationTitle>
                        )
                        : (
                          <AddtionalGraphInformationTitle to="/finances" onClick={() => setActiveFinanceTab("myto")}>
                            Gap With Benefits - ${(default_simulation.nassets_needed_without_benefits || 0).toLocaleString()}
                          </AddtionalGraphInformationTitle>
                        )
                      }
                    </AddtionalGraphInformationSection>
                  </AddtionalGraphInformationInner>
                </AddtionalGraphInformationPadding>
              </AddtionalGraphInformation>
              <AddtionalGraphInformation>
                <AddtionalGraphInformationPadding>
                  <AddtionalGraphInformationInner>
                    <AddtionalGraphInformationSection span={1}>
                      <AddtionalGraphInformationIcon>
                        <FontAwesomeIcon icon={["fad", "do-not-enter"]} />
                      </AddtionalGraphInformationIcon>
                    </AddtionalGraphInformationSection>
                    <AddtionalGraphInformationSection span={11}>
                      {default_simulation.total_benefits_value > 0
                        ? (
                          <AddtionalGraphInformationTitle to="/finances" onClick={() => setActiveFinanceTab("myto")}>
                            Gap Without Benefits  - ${(default_simulation.nassets_needed_without_benefits || 0).toLocaleString()}
                          </AddtionalGraphInformationTitle>
                        )
                        : (
                          <AddtionalGraphInformationTitle to="/finances" onClick={() => setActiveFinanceTab("myto")}>
                            Gap Without Benefits  - ${(default_simulation.assets_needed_with_benefits || 0).toLocaleString()}
                          </AddtionalGraphInformationTitle>
                        )
                      }
                    </AddtionalGraphInformationSection>
                  </AddtionalGraphInformationInner>
                </AddtionalGraphInformationPadding>
              </AddtionalGraphInformation>
            </>
          )
          : (
            <>
              {!default_simulation.total_available_assets && !myto.isFetching
                ? (
                  <Error span={12}>
                    <ErrorPadding>
                      <ErrorInner span={12}>
                        <ErrorInnerRow height={200}>
                          <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "calculator-alt"]} />
                          </ErrorIcon>
                          <ErrorMessage span={12}>No MYTO data.</ErrorMessage>
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
  accounts: state.accounts,
  session: state.session,
  myto: state.myto
});
const dispatchToProps = (dispatch) => ({
  getMYTOSimulations: (override, start, limit) => dispatch(getMYTOSimulations(override, start, limit)),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});

export default connect(mapStateToProps, dispatchToProps)(MYTOGraph);
