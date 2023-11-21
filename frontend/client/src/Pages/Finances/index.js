import React, { Component, lazy, Suspense } from "react";
import { connect } from "beautiful-react-redux";
import Container from "../../Components/Container";
import { Row } from "react-simple-flex-grid";
import BeneficiaryAssets from "../../Components/BeneficiaryAssets";
import GrantorAssets from "../../Components/GrantorAssets";
import Budget from "../../Components/Budget";
import { setActiveFinanceTab } from "../../store/actions/finance";
import { openPlaidLinkModal } from "../../store/actions/plaid";
import { Doughnut } from "react-chartjs-2";
import { ViewContainer } from "../../global-components";
import WidgetLoader from "../../Components/WidgetLoader";
import NoPermission from "../../Components/NoPermission";
import FinanceTabs from "../../Components/FinanceTabs";
import IncomeSources from "../../Components/IncomeSources";
import GovernmentBenefits from "../../Components/GovernmentBenefits";
import MYTO from "../../Pages/MYTO";
import MYTOSimulations from "../../Components/MYTOSimulations";
import { navigateTo } from "../../store/actions/navigation";

const finance_route_map = {
  "/assets": "assets",
  "/income": "income",
  "/budget": "budgets",
  "/myto": "myto"
};

const AsyncAssetsGraph = lazy(() => import("../../Components/AssetsGraph"));
const AsyncBeneficiaryAssetsGraph = lazy(() => import("../../Components/BeneficiaryAssetsGraph"));
const AsyncIncomeGraph = lazy(() => import("../../Components/IncomeGraph"));
const AsyncBudgetGraph = lazy(() => import("../../Components/BudgetGraph"));
const AsyncMYTOGraph = lazy(() => import("../../Components/MYTOGraph"));

class Finances extends Component {
  constructor(props) {
    super(props);
    const { accounts, session } = props;
    document.title = "Finances";
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      permissions: account.permissions
    };
  }

  componentDidMount() {
    const { location } = this.props;
    if (finance_route_map[location.pathname]) this.setView(finance_route_map[location.pathname]);
  }

  onSuccess = async (token, metadata) => {
    const { openPlaidLinkModal } = this.props;
    if (token && metadata) {
      openPlaidLinkModal(token, metadata);
    }
  };

  setView = (view) => {
    const { setActiveFinanceTab, navigateTo } = this.props;
    const route = Object.keys(finance_route_map).find((r) => finance_route_map[r] === view);
    this.setState({ view }, () => {
      setActiveFinanceTab(view);
      navigateTo(route);
    });
  };

  render() {
    const { permissions } = this.state;
    const { myto, finance } = this.props;
    const can_view_finances = permissions.includes("finance-view");
    const can_view_budgets = permissions.includes("budget-view");
    const view = finance.active_finance_tab;
    return (
      <ViewContainer>
        <Row>
          {permissions.includes("grantor-assets-view")
            ? (
              <Container bottom={15} title="Current Assets" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <Suspense fallback={<WidgetLoader />}>
                  <AsyncAssetsGraph Component={Doughnut} type="assets" span={12} />
                </Suspense>
              </Container>
            )
            : null
          }
          {!permissions.includes("grantor-assets-view") && permissions.includes("finance-view")
            ? (
              <Container bottom={15} title="Current Assets" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <Suspense fallback={<WidgetLoader />}>
                  <AsyncBeneficiaryAssetsGraph Component={Doughnut} type="assets" span={12} />
                </Suspense>
              </Container>
            )
            : null
          }
          {!permissions.includes("grantor-assets-view") && !permissions.includes("finance-view")
            ? (
              <Container bottom={15} title="Current Assets" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <NoPermission message="You do not have permission to view Assets" icon="chart-pie-alt" />
              </Container>
            )
            : null
          }
          {can_view_finances
            ? (
              <Container bottom={15} title="Current Income" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <Suspense fallback={<WidgetLoader />}>
                  <AsyncIncomeGraph Component={Doughnut} type="income" span={12} />
                </Suspense>
              </Container>
            )
            : (
              <Container bottom={15} title="Current Income" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <NoPermission message="You do not have permission to view Income" icon="chart-pie-alt"/>
              </Container>
            )
          }
          {can_view_budgets
            ? (
              <Container bottom={15} title="Current Budget" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <Suspense fallback={<WidgetLoader />}>
                  <AsyncBudgetGraph Component={Doughnut} type="budgets" span={12} />
                </Suspense>
              </Container>
            )
            : (
              <Container bottom={15} title="Current Budget" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <NoPermission message="You do not have permission to view Budgets" icon="chart-pie-alt"/>
              </Container>
            )
          }
          {permissions.includes("myto-view")
            ? (
              <Container bottom={15} title="Trust Objectives" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <AsyncMYTOGraph Component={Doughnut} type="myto" span={12} />
              </Container>
            )
            : (
              <Container bottom={15} title="Trust Objectives" xs={12} sm={6} md={6} lg={3} xl={3} height={310}>
                <NoPermission message="You do not have permission to view MYTO" icon="chart-pie-alt"/>
              </Container>
            )
          }
        </Row>
        <FinanceTabs setView={this.setView} view={view}/>
        {view === "assets"
          ? (
            <>
              <GrantorAssets onSuccess={this.onSuccess} />
              <BeneficiaryAssets onSuccess={this.onSuccess}/>
            </>
          )
          : null
        }
        {view === "income"
          ? (
            <>
              <IncomeSources />
              <GovernmentBenefits />
            </>
          )
          : null
        }
        {view === "budgets"
          ? <Budget />
          : null
        }
        {view === "myto"
          ? (
            <>
              {myto.view === "simulations"
                ? <MYTOSimulations />
                : null
              }
              {myto.view === "calculator"
                ? <MYTO />
                : null
              }
            </>
          )
          : null
        }
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  finance: state.finance,
  myto: state.myto,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  openPlaidLinkModal: (token, metadata) => dispatch(openPlaidLinkModal(token, metadata)),
  setActiveFinanceTab: (view) => dispatch(setActiveFinanceTab(view))
});
export default connect(mapStateToProps, dispatchToProps)(Finances);
