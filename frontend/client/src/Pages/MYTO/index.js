import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import Stepper from "react-stepper-horizontal";
import { theme } from "../../global-styles";
import { buildMYTOBody } from "./utilities";
import { getUserAge } from "../../utilities";
import { runMytoSimulation, switchMYTOView, change_myto_step, clear_myto } from "../../store/actions/myto";
import { showNotification } from "../../store/actions/notification";
import { showLoader } from "../../store/actions/loader";
import { isMobile, isTablet } from "react-device-detect";
import {
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import {
  MYTOWrapper,
  StepperContainer,
  MYTOModal,
  MYTOModalPadding,
  MYTOModalInner,
  MYTOModalBody,
  MYTOModalBodyInner,
  MYTOModalInnerSection,
  MYTOModalButton,
  MYTONavigation,
  MYTOModalNavigationSection
} from "./style";

class MYTO extends Component {

  static propTypes = {}
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { myto, accounts, relationship, session, change_myto_step } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary_user = relationship.list.find((u) => u.type === "beneficiary");
    this.state = {
      currentStep: myto.current_step,
      steps: [
        {
          title: "Assets",
          message: "Asset Information",
          onClick: () => change_myto_step(0)
        },
        {
          title: "Income",
          message: "Income Information",
          onClick: () => change_myto_step(1)
        },
        {
          title: "Expenses",
          message: "Expense Information",
          onClick: () => change_myto_step(2)
        },
        {
          title: "Calculate",
          message: "Configuration Information",
          onClick: () => change_myto_step(3)
        }
      ],
      concierge_services: myto.config.concierge_services,
      children_total: myto.config.children_total,
      beneficiary_age: myto.config.beneficiary_age || getUserAge(beneficiary_user.birthday),
      desired_life_of_fund: myto.config.desired_life_of_fund || 100 - getUserAge(beneficiary_user.birthday),
      total_expenses: myto.config.total_expenses,
      annual_management_costs: myto.config.annual_management_costs,
      portfolio_risk_weighting: myto.config.portfolio_risk_weighting,
      annual_management_costs_disabled: true,
      portfolio_risk_weighting_disabled: true,
      simulation_name: myto.config.simulation_name,
      permissions: account.permissions,
      is_actual: myto.config.is_actual
    };
  }

  updateConfig = (key, value) => {
    this.setState({ [key]: value });
  };

  run = () => {
    const { runMytoSimulation, showLoader, showNotification, myto } = this.props;
    const {
      children_total,
      beneficiary_age,
      desired_life_of_fund,
      total_expenses,
      annual_management_costs,
      portfolio_risk_weighting,
      simulation_name,
      concierge_services
    } = this.state;
    const config = {
      children_total,
      beneficiary_age,
      desired_life_of_fund,
      total_expenses,
      annual_management_costs,
      portfolio_risk_weighting,
      simulation_name,
      concierge_services
    };
    if (!myto.grantor_assets.length && !myto.income.length && !myto.benefits.length && !myto.budgets.length) {
      showNotification("error", "Finances Empty", "You must add finances to run a MYTO simulation.");
    } else {
      showLoader("Calculating...");
      setTimeout(() => {
        runMytoSimulation(config);
      }, 2000);
    }
  };

  render() {
    const {
      steps,
      permissions,
      is_actual
    } = this.state;
    const { switchMYTOView, change_myto_step, myto, clear_myto } = this.props;
    let currentStep = myto.current_step;
    let MYTOView = buildMYTOBody({ ...this.state, currentStep }, steps, { updateConfig: this.updateConfig });

    return (
      <MYTOWrapper>
        <MYTOModal>
          <MYTOModalPadding span={12}>
            <MYTOModalInner>
              <MYTOModalInnerSection span={12}>
                <Page paddingtop={20}>
                  <PageHeader xs={12} sm={12} md={6} lg={6} xl={6} align="left" size={24} paddingleft={15}>Step {currentStep + 1} of {steps.length} - {steps[currentStep].message}</PageHeader>
                  <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
                    {permissions.includes("myto-view")
                      ? (
                        <>
                          <Button small danger onClick={() => clear_myto()}>Clear Calculator</Button>
                          <Button small blue onClick={() => switchMYTOView("simulations")}>View Simulations</Button>
                        </>
                      )
                      : null
                    }
                  </PageAction>
                </Page>
                <StepperContainer>
                  <Stepper
                    steps={steps}
                    activeStep={currentStep}
                    disabledSteps={null}
                    circleFontSize={0}
                    size={18}
                    lineMarginOffset={10}
                    titleTop={10}
                    activeTitleColor={theme.metadataGrey}
                    completeTitleColor={theme.buttonGreen}
                    defaultTitleColor={theme.fontGrey}
                    defaultTitleOpacity="0.4"
                    completeTitleOpacity="0.8"
                    activeTitleOpacity="1"
                    titleFontSize={12}
                    defaultColor={theme.rowGrey}
                    completeColor={theme.buttonGreen}
                    activeColor={theme.buttonLightGreen}
                    defaultBarColor={theme.buttonLightGreen}
                    completeBarColor={theme.buttonGreen}
                    defaultBorderColor={theme.rowGrey}
                    completeBorderColor={theme.buttonLightGreen}
                    activeBorderColor={theme.buttonGreen}
                    defaultBorderStyle="solid"
                    completeBorderStyle="solid"
                    activeBorderStyle="solid"
                    defaultBorderWidth={1}
                  />
                </StepperContainer>
              </MYTOModalInnerSection>
            </MYTOModalInner>
          </MYTOModalPadding>
        </MYTOModal>

        <MYTOModalBody>
          <MYTOModalBodyInner span={12}>{MYTOView}</MYTOModalBodyInner>
        </MYTOModalBody>

        {currentStep + 1 !== steps.length
          ? (
            <MYTONavigation>
              {currentStep > 0 && !is_actual
                ? (
                  <MYTOModalNavigationSection span={6}>
                    <MYTOModalButton type="button" onClick={() => change_myto_step(currentStep - 1)} secondary blue nomargin>Previous</MYTOModalButton>
                  </MYTOModalNavigationSection>
                )
                : null
              }
              <MYTOModalNavigationSection span={currentStep > 0 ? 6 : 12}>
                <MYTOModalButton type="button" onClick={() => change_myto_step(currentStep + 1)} secondary blue nomargin>Next</MYTOModalButton>
              </MYTOModalNavigationSection>
            </MYTONavigation>
          )
          : (!is_actual
              ? (
                <>
                  <MYTONavigation>
                    <MYTOModalNavigationSection span={6}>
                      <MYTOModalButton type="button" onClick={() => change_myto_step(currentStep - 1)} secondary blue nomargin>Previous</MYTOModalButton>
                    </MYTOModalNavigationSection>
                    <MYTOModalNavigationSection span={6}>
                      <MYTOModalButton disabled={myto.is_retrying} type="button" onClick={() => this.run()} secondary blue nomargin>Run</MYTOModalButton>
                    </MYTOModalNavigationSection>
                  </MYTONavigation>
                </>
              )
              : (
                <MYTONavigation>
                  <MYTOModalNavigationSection span={6}></MYTOModalNavigationSection>
                  <MYTOModalNavigationSection span={6}>
                    <MYTOModalButton disabled={myto.is_retrying} type="button" onClick={() => this.run()} secondary blue nomargin>Run</MYTOModalButton>
                  </MYTOModalNavigationSection>
                </MYTONavigation>
              )
            )
        }
      </MYTOWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session,
  myto: state.myto
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, meta) => dispatch(showNotification(type, title, message, meta)),
  runMytoSimulation: (config) => dispatch(runMytoSimulation(config)),
  switchMYTOView: (view) => dispatch(switchMYTOView(view)),
  showLoader: (message) => dispatch(showLoader(message)),
  change_myto_step: (step) => dispatch(change_myto_step(step)),
  clear_myto: () => dispatch(clear_myto()),
});
export default connect(mapStateToProps, dispatchToProps)(MYTO);
