import React, { Component } from "react";
import Container from "../../Components/Container";
import { connect } from "beautiful-react-redux";
import { getUserAge } from "../../utilities";
import { closeMYTOSimulation, runIndividualSimulation, updateMYTOSimulation } from "../../store/actions/myto";
import { Row, Col } from "react-simple-flex-grid";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-responsive-modal";
import { Button } from "../../global-components";
import { Doughnut } from "react-chartjs-2";
import { formatCash } from "../../utilities";
import { showLoader } from "../../store/actions/loader";
import { isMobile } from "react-device-detect";
import moment from "moment";
import { getMYTOGraphValues, getBudgetValues, getBudgetCategoryValues, getBenefitValues, getIncomeValues } from "../../store/actions/utilities";
import {
  MYTOSimulationModalTitle,
  MYTOSimulationButtonContainer,
  ChartContainer,
  GraphGroupGraphContainerTitle,
  GraphGroupGraphContainerSubtitle,
  ChartDataOutput,
  ChartDataOutputSection,
  ChartDataOutputSectionTitle,
  ChartDataOutputSectionHeader,
  ChartDataOutputSectionValue,
  ChartDataOutputSectionPadding,
  ChartDataOutputSectionInner,
  AddtionalGraphInformation,
  AddtionalGraphInformationPadding,
  AddtionalGraphInformationInner,
  AddtionalGraphInformationSection,
  AddtionalGraphInformationIcon,
  AddtionalGraphInformationTitle,
  Sign,
  MYTOHint,
  MYTOHintPadding,
  MYTOHintInner,
  GraphGroupGraphContainerTitleNoLink,
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

const options = {
  animation: {
    animateRotate: false,
    animateScale: false
  },
  responsive: true,
  cutoutPercentage: 60,
  maintainAspectRatio: false,
  width: 300,
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

class MYTOSimulationModal extends Component {

  constructor(props) {
    super(props);
    const { accounts, relationship, session, simulation } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");
    const usable_budgets = JSON.parse(simulation.budgets).filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const total_budget = usable_budgets.reduce((a, { value }) => a + value, 0);
    const chartDataBudget = getBudgetValues(JSON.parse(simulation.budgets), beneficiary.birthday);
    this.state = {
      simulation,
      beneficiary,
      chartDataBudget,
      totalBudgetValue: total_budget,
      usable_budgets,
      category_view: false,
      account,
      is_loading: false
    };
  }

  setDefault = async (id) => {
    const { updateMYTOSimulation, showNotification } = this.props;
    this.setState({ is_loading: true });
    const updated = await updateMYTOSimulation(id, { default_simulation: true });
    if (updated.success) {
      this.setState({ simulation: updated.payload }, () => showNotification("success", "Simulation updated", "New default simulation set."));
    }
    this.setState({ is_loading: false });
  };

  runAgain = async (sim) => {
    const { runIndividualSimulation, showLoader } = this.props;
    showLoader("Calculating...");
    const simulation = await runIndividualSimulation(sim);
    if (simulation) this.setState({ simulation });
  };

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

  goToCategory = (e) => {
    const { simulation } = this.props;
    const { beneficiary } = this.state;
    if (e.length) {
      if (e[0]["_chart"] && e[0]["_chart"].data) {
        const usableItems = JSON.parse(simulation.budgets).filter((b) => b.parent_category === e[0]["_chart"].data.labels[e[0]["_index"]]);
        const total_budget = usableItems.reduce((a, { value }) => a + value, 0);
        const chartDataBudget = getBudgetCategoryValues(usableItems, beneficiary.birthday);
        this.setState({ chartDataBudget, totalBudgetValue: total_budget, usable_budgets: usableItems, category_view: true });
      }
    }
  };

  resetCategoryView = () => {
    const { beneficiary, simulation } = this.state;
    const usable_budgets = JSON.parse(simulation.budgets).filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
    const total_budget = usable_budgets.reduce((a, { value }) => a + value, 0);
    const chartDataBudget = getBudgetValues(JSON.parse(simulation.budgets), beneficiary.birthday);
    this.setState({ chartDataBudget, totalBudgetValue: total_budget, usable_budgets, category_view: false });
  };

  render() {
    const { viewingMYTOSimulation, closeMYTOSimulation } = this.props;
    const { simulation, beneficiary, totalBudgetValue, category_view, chartDataBudget, account, is_loading } = this.state;
    const concierge_levels = {
        0: "$0",
        1: "$250",
        2: "$650",
        3: "$1000"
      };
    const currency_format = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
    const chartData = this.combineChartData(getMYTOGraphValues({ trust_fund_gap_without_benefits: simulation.trust_fund_gap_without_benefits, current_available: simulation.current_available }), getMYTOGraphValues({ trust_funding_gap: simulation.trust_funding_gap, current_available: simulation.current_available }));
    let total_income = JSON.parse(simulation.income).filter((item) => {
      if (item.monthly_income && (item.term.length && item.term[0] <= getUserAge(beneficiary.birthday))) return item;
      return null;
    }).reduce((a, b) => a + b.monthly_income, 0);
    let total_expenses = JSON.parse(simulation.budgets).filter((item) => {
      if (item.value && (item.term.length && item.term[0] <= getUserAge(beneficiary.birthday))) return item;
      return null;
    }).reduce((a, b) => a + b.value, 0);
    let total_benefits = JSON.parse(simulation.benefits).filter((item) => {
      if (item.value && (item.term.length && item.term[0] <= getUserAge(beneficiary.birthday))) return item;
      return null;
    }).reduce((a, b) => a + b.value, 0);

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1400px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewingMYTOSimulation} onClose={() => closeMYTOSimulation()} center>
        <MYTOSimulationModalTitle>{simulation.is_actual && !simulation.simulation_name ? `Projection - ${moment(simulation.created_at).format("MMMM DD, YYYY h:mm A")}` : (simulation.simulation_name || `Simulation #${simulation.id}`)}</MYTOSimulationModalTitle>
        <Row gutter={20}>
          {(total_income + total_benefits)
            ? (
              <Container title="Current Income" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  <GraphGroupGraphContainerTitle>${`${formatCash((total_income + total_benefits) || 0)}`}<br />
                    <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
                  </GraphGroupGraphContainerTitle>
                  <Doughnut data={this.combineChartData(getIncomeValues(JSON.parse(simulation.income), beneficiary.birthday), getBenefitValues(JSON.parse(simulation.benefits), beneficiary.birthday))} options={options} />
                </ChartContainer>
                <AddtionalGraphInformation>
                  <AddtionalGraphInformationPadding>
                    <AddtionalGraphInformationInner>
                      <AddtionalGraphInformationSection span={1}>
                        <AddtionalGraphInformationIcon>
                          <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                        </AddtionalGraphInformationIcon>
                      </AddtionalGraphInformationSection>
                      <AddtionalGraphInformationSection span={11}>
                        <AddtionalGraphInformationTitle>
                          Income Sources - ${total_income.toLocaleString("en-US", currency_format)}
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
                        <AddtionalGraphInformationTitle>
                          Government Benefits - ${total_benefits.toLocaleString("en-US", currency_format)}
                        </AddtionalGraphInformationTitle>
                      </AddtionalGraphInformationSection>
                    </AddtionalGraphInformationInner>
                  </AddtionalGraphInformationPadding>
                </AddtionalGraphInformation>
              </Container>
            )
            : (
              <Container title="Current Income" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  <Error span={12}>
                    <ErrorPadding>
                      <ErrorInner span={12}>
                        <ErrorInnerRow height={200}>
                          <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "chart-pie"]} />
                          </ErrorIcon>
                          <ErrorMessage span={12}>No simulated income or benefits.</ErrorMessage>
                        </ErrorInnerRow>
                      </ErrorInner>
                    </ErrorPadding>
                  </Error>
                </ChartContainer>
              </Container>
            )
          }
          {total_expenses
            ? (
              <Container title="Current Expenses" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  {!category_view
                    ? (
                      <GraphGroupGraphContainerTitleNoLink>${`${formatCash(totalBudgetValue || 0)}`}<br />
                        <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
                      </GraphGroupGraphContainerTitleNoLink>
                    )
                    : (
                      <GraphGroupGraphContainerTitleNoLink>${`${formatCash(totalBudgetValue || 0)}`}<br />
                        <GraphGroupGraphContainerSubtitle>Per Month</GraphGroupGraphContainerSubtitle>
                      </GraphGroupGraphContainerTitleNoLink>
                    )
                  }
                  <Doughnut data={chartDataBudget} options={options} onElementsClick={!category_view ? (e) => this.goToCategory(e) : null}/>
                </ChartContainer>
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
                        <AddtionalGraphInformationTitle>
                          Monthly Budget - ${total_expenses.toLocaleString("en-US", currency_format)}
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
                        <AddtionalGraphInformationTitle>
                          Annual Budget - ${(total_expenses * 12).toLocaleString("en-US", currency_format)}
                        </AddtionalGraphInformationTitle>
                      </AddtionalGraphInformationSection>
                    </AddtionalGraphInformationInner>
                  </AddtionalGraphInformationPadding>
                </AddtionalGraphInformation>
              </Container>
            )
            : (
              <Container title="Current Expenses" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  <Error span={12}>
                    <ErrorPadding>
                      <ErrorInner span={12}>
                        <ErrorInnerRow height={200}>
                          <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "chart-pie"]} />
                          </ErrorIcon>
                          <ErrorMessage span={12}>No simulated expenses.</ErrorMessage>
                        </ErrorInnerRow>
                      </ErrorInner>
                    </ErrorPadding>
                  </Error>
                </ChartContainer>
              </Container>
            )
          }
          {simulation.trust_funding_gap || simulation.trust_fund_gap_without_benefits
            ? (
              <Container title="Trust Gap" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  <GraphGroupGraphContainerTitle>${`${formatCash(simulation.total_available_assets || 0)}`}<br />
                    <GraphGroupGraphContainerSubtitle>Total Assets</GraphGroupGraphContainerSubtitle>
                  </GraphGroupGraphContainerTitle>
                  <Doughnut data={chartData} options={options} />
                </ChartContainer>
                <AddtionalGraphInformation>
                  <AddtionalGraphInformationPadding>
                    <AddtionalGraphInformationInner>
                      <AddtionalGraphInformationSection span={1}>
                        <AddtionalGraphInformationIcon>
                          <FontAwesomeIcon icon={["fad", "user-shield"]} />
                        </AddtionalGraphInformationIcon>
                      </AddtionalGraphInformationSection>
                      <AddtionalGraphInformationSection span={11}>
                        <AddtionalGraphInformationTitle>
                          {simulation.trust_funding_gap > 0 ? "Gap With Benefits" : "Excess Assets"} - ${(Math.abs(simulation.trust_funding_gap) || 0).toLocaleString("en-US", currency_format)}
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
                          <FontAwesomeIcon icon={["fad", "funnel-dollar"]} />
                        </AddtionalGraphInformationIcon>
                      </AddtionalGraphInformationSection>
                      <AddtionalGraphInformationSection span={11}>
                        <AddtionalGraphInformationTitle>
                          {simulation.trust_fund_gap_without_benefits > 0 ? "Gap Without Benefits" : "Excess Assets"} - ${(Math.abs(simulation.trust_fund_gap_without_benefits) || 0).toLocaleString("en-US", currency_format)}
                        </AddtionalGraphInformationTitle>
                      </AddtionalGraphInformationSection>
                    </AddtionalGraphInformationInner>
                  </AddtionalGraphInformationPadding>
                </AddtionalGraphInformation>
              </Container>
            )
            : (
              <Container title="Trust Gap" xs={12} sm={12} md={12} lg={4} xl={4} height={335}>
                <ChartContainer>
                  <Error span={12}>
                    <ErrorPadding>
                      <ErrorInner span={12}>
                        <ErrorInnerRow height={200}>
                          <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "chart-pie"]} />
                          </ErrorIcon>
                          <ErrorMessage span={12}>No simulated trust fund gaps.</ErrorMessage>
                        </ErrorInnerRow>
                      </ErrorInner>
                    </ErrorPadding>
                  </Error>
                </ChartContainer>
              </Container>
            )
          }
          <ChartDataOutput>

            <Col span={simulation.total_benefits_value > 0 ? (isMobile ? 12 : 6) : 12}>
              <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                {simulation.total_benefits_value > 0
                  ? <ChartDataOutputSectionHeader>With Benefits</ChartDataOutputSectionHeader>
                  : null 
                }
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Funding Objective</ChartDataOutputSectionTitle>
                    <ChartDataOutputSectionValue>${(simulation.final_average).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}><Sign>-</Sign></ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Available Assets</ChartDataOutputSectionTitle>
                    <ChartDataOutputSectionValue>${(simulation.total_available_assets).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}><Sign>=</Sign></ChartDataOutputSection>

              {simulation.trust_funding_gap > 0
                ? (
                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                    <ChartDataOutputSectionPadding>
                      <ChartDataOutputSectionInner>
                        <ChartDataOutputSectionTitle>Trust Fund Gap</ChartDataOutputSectionTitle>
                        <ChartDataOutputSectionValue>${(simulation.trust_funding_gap < 0 ? 0 : simulation.trust_funding_gap).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                      </ChartDataOutputSectionInner>
                    </ChartDataOutputSectionPadding>
                  </ChartDataOutputSection>
                )
                : (
                    <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                      <ChartDataOutputSectionPadding>
                        <ChartDataOutputSectionInner>
                          <ChartDataOutputSectionTitle>Excess Assets</ChartDataOutputSectionTitle>
                          <ChartDataOutputSectionValue>${(simulation.trust_funding_gap < 0 ? Math.abs(simulation.trust_funding_gap) : simulation.trust_funding_gap).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                        </ChartDataOutputSectionInner>
                      </ChartDataOutputSectionPadding>
                    </ChartDataOutputSection>
                )
              }
            </Col>

            {simulation.total_benefits_value > 0
              ? (
                <Col span={isMobile ? 12 : 6}>
                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                    <ChartDataOutputSectionHeader>Without Benefits</ChartDataOutputSectionHeader>
                  </ChartDataOutputSection>

                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                    <ChartDataOutputSectionPadding>
                      <ChartDataOutputSectionInner>
                        <ChartDataOutputSectionTitle>Funding Objective</ChartDataOutputSectionTitle>
                        <ChartDataOutputSectionValue>${simulation.final_average_without_benefits ? (simulation.final_average_without_benefits).toLocaleString("en-US", currency_format) : 0}</ChartDataOutputSectionValue>
                      </ChartDataOutputSectionInner>
                    </ChartDataOutputSectionPadding>
                  </ChartDataOutputSection>

                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}><Sign>-</Sign></ChartDataOutputSection>

                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                    <ChartDataOutputSectionPadding>
                      <ChartDataOutputSectionInner>
                        <ChartDataOutputSectionTitle>Available Assets</ChartDataOutputSectionTitle>
                        <ChartDataOutputSectionValue>${(simulation.total_available_assets).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                      </ChartDataOutputSectionInner>
                    </ChartDataOutputSectionPadding>
                  </ChartDataOutputSection>

                  <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}><Sign>=</Sign></ChartDataOutputSection>

                  {simulation.trust_fund_gap_without_benefits > 0
                    ? (
                      <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                        <ChartDataOutputSectionPadding>
                          <ChartDataOutputSectionInner>
                            <ChartDataOutputSectionTitle>Trust Fund Gap</ChartDataOutputSectionTitle>
                            <ChartDataOutputSectionValue>${(simulation.trust_fund_gap_without_benefits < 0 ? 0 : simulation.trust_fund_gap_without_benefits).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                          </ChartDataOutputSectionInner>
                        </ChartDataOutputSectionPadding>
                      </ChartDataOutputSection>
                    )
                    : (
                      <ChartDataOutputSection xs={12} sm={12} md={12} lg={12} xl={12}>
                        <ChartDataOutputSectionPadding>
                          <ChartDataOutputSectionInner>
                            <ChartDataOutputSectionTitle>Excess Assets</ChartDataOutputSectionTitle>
                            <ChartDataOutputSectionValue>${(simulation.trust_fund_gap_without_benefits < 0 ? Math.abs(simulation.trust_fund_gap_without_benefits) : simulation.trust_fund_gap_without_benefits || 0).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                          </ChartDataOutputSectionInner>
                        </ChartDataOutputSectionPadding>
                      </ChartDataOutputSection>
                    )
                  }
                </Col>
              )
              : null
            }
            <Col span={12}>
              <ChartDataOutputSection xs={12} sm={12} md={3} lg={3} xl={3}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Beneficiary Age</ChartDataOutputSectionTitle>
                    <ChartDataOutputSectionValue>{simulation.beneficiary_age}</ChartDataOutputSectionValue>
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={3} lg={3} xl={3}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Fund Life</ChartDataOutputSectionTitle>
                    <ChartDataOutputSectionValue>{(simulation.desired_life_of_fund || 0).toLocaleString("en-US", currency_format)} years</ChartDataOutputSectionValue>
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={3} lg={3} xl={3}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Concierge Services</ChartDataOutputSectionTitle>
                    <ChartDataOutputSectionValue>{(simulation.concierge_services ? `${concierge_levels[simulation.concierge_services]}/month` : "Off")}</ChartDataOutputSectionValue>
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>

              <ChartDataOutputSection xs={12} sm={12} md={3} lg={3} xl={3}>
                <ChartDataOutputSectionPadding>
                  <ChartDataOutputSectionInner>
                    <ChartDataOutputSectionTitle>Benefits Replacement Cost</ChartDataOutputSectionTitle>
                    {simulation.total_benefits_value > 0
                      ? <ChartDataOutputSectionValue>${(simulation.final_average_without_benefits - simulation.final_average).toLocaleString("en-US", currency_format)}</ChartDataOutputSectionValue>
                      : <ChartDataOutputSectionValue>N/A</ChartDataOutputSectionValue>
                    }
                  </ChartDataOutputSectionInner>
                </ChartDataOutputSectionPadding>
              </ChartDataOutputSection>
            </Col>
          </ChartDataOutput>
          <MYTOHint span={12}>
            <MYTOHintPadding>
              <MYTOHintInner>
                Note: MYTO utilizes Monte Carlo simulations, which provide a range of statistical probabilities based on user input and a broad array of randomly selected historical and forecasted returns. It is not a guarantee of an outcome.
              </MYTOHintInner>
            </MYTOHintPadding>
          </MYTOHint>
          
          <Col span={12}>
            <Row>
              <MYTOSimulationButtonContainer span={12}>
                {account.permissions.includes("myto-edit")
                  ? (
                    <>
                      <Button type="button" onClick={() => this.runAgain(simulation)} green>Run Again</Button>
                      {simulation.default_simulation
                        ? <Button type="button" green disabled>Default</Button>
                        : <Button disabled={is_loading} type="button" onClick={() => this.setDefault(simulation.id)} blue>{is_loading ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Set Default"}</Button>
                      }
                    </>
                  )
                  : null
                }
                <Button type="button" onClick={() => closeMYTOSimulation()} blue>Close</Button>
              </MYTOSimulationButtonContainer>
            </Row>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  closeMYTOSimulation: () => dispatch(closeMYTOSimulation()),
  runIndividualSimulation: (simulation) => dispatch(runIndividualSimulation(simulation)),
  updateMYTOSimulation: (id, updates) => dispatch(updateMYTOSimulation(id, updates)),
  showLoader: (message) => dispatch(showLoader(message)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(MYTOSimulationModal);
