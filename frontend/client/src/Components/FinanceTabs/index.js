import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FinanceTabsMain,
  FinanceTabsPadding,
  FinanceTabsInner,
  FinanceTab,
  FinanceTabPadding,
  FinanceTabInner,
  FinanceTabIcon,
  FinanceTabText
} from "./style";

class FinanceTabs extends Component {

  render() {
    const { setView, view } = this.props;
    return (
      <FinanceTabsMain>
        <FinanceTabsPadding>
          <FinanceTabsInner gutter={10}>

            <FinanceTab span={3}>
              <FinanceTabPadding>
                <FinanceTabInner onClick={() => setView("assets")} active={view === "assets" ? 1 : 0}>
                  <FinanceTabIcon span={1}>
                    <FontAwesomeIcon icon={["fad", "hand-holding-usd"]} />
                  </FinanceTabIcon>
                  <FinanceTabText span={11} active={view === "assets" ? 1 : 0}>Assets</FinanceTabText>
                </FinanceTabInner>
              </FinanceTabPadding>
            </FinanceTab>

            <FinanceTab span={3}>
              <FinanceTabPadding>
                <FinanceTabInner onClick={() => setView("income")} active={view === "income" ? 1 : 0}>
                  <FinanceTabIcon span={1}>
                    <FontAwesomeIcon icon={["fad", "money-check-edit"]} />
                  </FinanceTabIcon>
                  <FinanceTabText span={11} active={view === "income" ? 1 : 0}>Beneficiary Income</FinanceTabText>
                </FinanceTabInner>
              </FinanceTabPadding>
            </FinanceTab>

            <FinanceTab span={3}>
              <FinanceTabPadding>
                <FinanceTabInner onClick={() => setView("budgets")} active={view === "budgets" ? 1 : 0}>
                  <FinanceTabIcon span={1}>
                    <FontAwesomeIcon icon={["fad", "chart-pie"]} />
                  </FinanceTabIcon>
                  <FinanceTabText span={11} active={view === "budgets" ? 1 : 0}>Beneficiary Budget</FinanceTabText>
                </FinanceTabInner>
              </FinanceTabPadding>
            </FinanceTab>

            <FinanceTab span={3}>
              <FinanceTabPadding>
                <FinanceTabInner onClick={() => setView("myto")} active={view === "myto" ? 1 : 0}>
                  <FinanceTabIcon span={1}>
                    <FontAwesomeIcon icon={["fad", "calculator-alt"]} />
                  </FinanceTabIcon>
                  <FinanceTabText span={11} active={view === "myto" ? 1 : 0}>MYTO Calculator</FinanceTabText>
                </FinanceTabInner>
              </FinanceTabPadding>
            </FinanceTab>

          </FinanceTabsInner>
        </FinanceTabsPadding>
      </FinanceTabsMain>
    );
  }
}

export default FinanceTabs;
