import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatCash, isSelfAccount } from "../../utilities";
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
import { getTrustAssetValues, getBeneficiaryAssetValues } from "../../store/actions/utilities";
import { getGrantorAssets } from "../../store/actions/grantor-assets";
import { getBeneficiaryAssets } from "../../store/actions/beneficiary-assets";
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

class AssetsGraph extends Component {
  static propTypes = {
    getGrantorAssets: PropTypes.func.isRequired,
    getBeneficiaryAssets: PropTypes.func.isRequired,
    Component:PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { session, accounts } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      account
    };
  }

  async componentDidMount() {
    const { getGrantorAssets, getBeneficiaryAssets, grantor_assets, beneficiary_assets } = this.props;
    const { account } = this.state;
    if (account.permissions.includes("grantor-assets-view") && !grantor_assets.requested) await getGrantorAssets();
    if (account.permissions.includes("finance-view") && !beneficiary_assets.requested) await getBeneficiaryAssets();
  }

  combineChartData = (chart_data_1, chart_data_2) => {
    let all_sets = [];
    if (chart_data_1.labels && chart_data_1.labels.length) all_sets.push(chart_data_1);
    if (chart_data_2.labels && chart_data_2.labels.length) all_sets.push(chart_data_2);
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
    const { Component, grantor_assets, beneficiary_assets, setActiveFinanceTab, user } = this.props;
    const { account } = this.state;
    const grantorTotal = grantor_assets.list.reduce((a, { trust_assets }) => a + trust_assets, 0);
    const beneficiaryTotal = beneficiary_assets.list.reduce((a, { value, has_debt, debt }) => a + (has_debt ? (value - debt) : value), 0);
    let chartData = null;
    const trust_assets_data = getTrustAssetValues(grantor_assets.list);
    const beneficiary_assets_data = getBeneficiaryAssetValues(beneficiary_assets.list);
    if (account.permissions.includes("grantor-assets-view") && account.permissions.includes("finance-view")) {
      chartData = this.combineChartData(trust_assets_data, beneficiary_assets_data);
    } else if (account.permissions.includes("grantor-assets-view")) {
      chartData = this.combineChartData(trust_assets_data, []);
    } else if (account.permissions.includes("finance-view")) {
      chartData = this.combineChartData(beneficiary_assets_data, []);
    }

    return (
      <div>
        {!grantor_assets.isFetching && (grantorTotal || beneficiaryTotal)
        ? (
          <>
              <GraphGroupGraphContainer>
                <GraphGroupGraphContainerTitle to="/finances" onClick={() => setActiveFinanceTab("assets")}>${`${formatCash((grantorTotal + beneficiaryTotal) || 0)}`}<br />
                  <GraphGroupGraphContainerSubtitle>Total</GraphGroupGraphContainerSubtitle>
                </GraphGroupGraphContainerTitle>
                <Component data={chartData} options={options} />
              </GraphGroupGraphContainer>
              <AddtionalGraphInformation>
                <AddtionalGraphInformationPadding>
                  <AddtionalGraphInformationInner>
                    <AddtionalGraphInformationSection span={1}>
                      <AddtionalGraphInformationIcon>
                        <FontAwesomeIcon icon={["fad", "user-shield"]} />
                      </AddtionalGraphInformationIcon>
                    </AddtionalGraphInformationSection>
                    <AddtionalGraphInformationSection span={11}>
                      <AddtionalGraphInformationTitle to="/finances#grantor-and-trust" onClick={() => setActiveFinanceTab("assets")}>
                        {isSelfAccount(user, account) ? "Trust Assets" : "Grantor & Trust Assets"} - {account.permissions.includes("grantor-assets-view") ? `$${grantorTotal.toLocaleString()}` : "$0"}
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
                        <FontAwesomeIcon icon={["fad", "user-circle"]} />
                      </AddtionalGraphInformationIcon>
                    </AddtionalGraphInformationSection>
                    <AddtionalGraphInformationSection span={11}>
                      <AddtionalGraphInformationTitle to="/finances#beneficiary" onClick={() => setActiveFinanceTab("assets")}>
                        {isSelfAccount(user, account) ? "Personal Assets" : "Beneficiary Assets"} - {account.permissions.includes("finance-view") ? `$${beneficiaryTotal.toLocaleString()}` : "$0"}
                      </AddtionalGraphInformationTitle>
                    </AddtionalGraphInformationSection>
                  </AddtionalGraphInformationInner>
                </AddtionalGraphInformationPadding>
              </AddtionalGraphInformation>
          </>
        )
        : (
          <>
            {!grantorTotal && !grantor_assets.isFetching
              ? (
                <Error span={12}>
                  <ErrorPadding>
                    <ErrorInner span={12}>
                      <ErrorInnerRow height={200}>
                        <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "hand-holding-usd"]} />
                        </ErrorIcon>
                        <ErrorMessage span={12}>No Trust or Beneficiary Asset Data.</ErrorMessage>
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
  user: state.user,
  session: state.session,
  grantor_assets: state.grantor_assets,
  beneficiary_assets: state.beneficiary_assets
});
const dispatchToProps = (dispatch) => ({
  getGrantorAssets: (override) => dispatch(getGrantorAssets(override)),
  getBeneficiaryAssets: (override) => dispatch(getBeneficiaryAssets(override)),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});
 
export default connect(mapStateToProps, dispatchToProps)(AssetsGraph);
