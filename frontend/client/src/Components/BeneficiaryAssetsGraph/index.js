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
import { getBeneficiaryAssetValues } from "../../store/actions/utilities";
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
  cutoutPercentage: 65,
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
      label: (tooltipItem, data) => {
        let total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        let value = data["datasets"][0]["data"][tooltipItem["index"]];
        let percent = ((value / total) * 100).toFixed(1);
        return ` ${percent}% - ${data["labels"][tooltipItem["index"]]} - $${value.toLocaleString()}`;
      }
    }
  }
};

class AssetsGraph extends Component {
  static propTypes = {
    getBeneficiaryAssets: PropTypes.func.isRequired,
    Component:PropTypes.instanceOf(Object).isRequired,
    type: PropTypes.string.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session, beneficiary_assets } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const chartData = getBeneficiaryAssetValues(beneficiary_assets.list);
    this.state = {
      account,
      chartData
    };
  }

  async componentDidMount() {
    const { getBeneficiaryAssets, beneficiary_assets } = this.props;
    const { account } = this.state;
    if (account.permissions.includes("finance-view") && !beneficiary_assets.requested) await getBeneficiaryAssets();
  }

  render() {
    const { Component, beneficiary_assets, setActiveFinanceTab, user } = this.props;
    const { chartData, account } = this.state;
    const beneficiaryTotal = beneficiary_assets.list.reduce((a, { value, has_debt, debt }) => a + (has_debt ? (value - debt) : value), 0);

    return (
      <div>
      {!beneficiary_assets.isFetching && beneficiaryTotal
        ? (
          <>
            <GraphGroupGraphContainer>
              <GraphGroupGraphContainerTitle to="/finances" onClick={() => setActiveFinanceTab("assets")}>${`${formatCash(beneficiaryTotal || 0)}`}<br />
                <GraphGroupGraphContainerSubtitle>Total</GraphGroupGraphContainerSubtitle>
              </GraphGroupGraphContainerTitle>
              <Component data={chartData} options={options} />
            </GraphGroupGraphContainer>
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
                      {isSelfAccount(user, account) ? "Personal Assets" : "Beneficiary Assets"} - ${beneficiaryTotal.toLocaleString()}
                    </AddtionalGraphInformationTitle>
                  </AddtionalGraphInformationSection>
                </AddtionalGraphInformationInner>
              </AddtionalGraphInformationPadding>
            </AddtionalGraphInformation>
          </>
        )
        : (
          <>
            {!beneficiaryTotal && !beneficiary_assets.isFetching
              ? (
                <Error span={12}>
                  <ErrorPadding>
                    <ErrorInner span={12}>
                      <ErrorInnerRow height={200}>
                        <ErrorIcon span={12}>
                            <FontAwesomeIcon icon={["fad", "hand-holding-usd"]} />
                        </ErrorIcon>
                        <ErrorMessage span={12}>No Beneficiary Asset Data.</ErrorMessage>
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
  beneficiary_assets: state.beneficiary_assets,
  grantor_assets: state.grantor_assets,
  user: state.user,
  session: state.session,
  accounts: state.accounts
});
const dispatchToProps = (dispatch) => ({
  getBeneficiaryAssets: () => dispatch(getBeneficiaryAssets()),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});
 
export default connect(mapStateToProps, dispatchToProps)(AssetsGraph);
