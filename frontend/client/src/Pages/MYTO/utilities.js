import React from "react";
import {
  InputWrapper,
  InputLabel,
  Input,
  RequiredStar
} from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import GrantorAssets from "../../Components/GrantorAssets";
import GovernmentBenefits from "../../Components/GovernmentBenefits";
import IncomeSources from "../../Components/IncomeSources";
import Budget from "../../Components/Budget";
import { 
  MYTOStepBody,
  MYTOStepBodyPadding,
  MYTOStepBodyInner,
  DependentCount,
  Hint,
  EditLink
} from "./style";

export const buildMYTOBody = (state, steps, handlers) => {
  switch(steps[state.currentStep].title) {
    case "Income":
      return (
          <MYTOStepBody>
            <MYTOStepBodyPadding span={12}>
              <IncomeSources simulation={true} />
              <GovernmentBenefits simulation={true} />
            </MYTOStepBodyPadding>
          </MYTOStepBody>
      );
    case "Expenses":
      return (
          <MYTOStepBody>
            <MYTOStepBodyPadding span={12}>
              <Budget simulation={true} />
            </MYTOStepBodyPadding>
          </MYTOStepBody>
      );
    case "Assets":
      return (
          <MYTOStepBody>
            <MYTOStepBodyPadding span={12}>
              <GrantorAssets simulation={true} />
            </MYTOStepBodyPadding>
          </MYTOStepBody>
      );
    case "Calculate":
      const concierge_levels = {
        0: "$0",
        1: "$250",
        2: "$650",
        3: "$1000"
      };
      const updateAgeAndDesired = (type, value) => {
        switch(type) {
          case "age":
            handlers.updateConfig("beneficiary_age", value);
            handlers.updateConfig("desired_life_of_fund", 100 - value);
            break;
          case "desire":
             handlers.updateConfig("desired_life_of_fund", value);
             break;
          default:
            break;
        }
      };

      const limitInputs = (e) => {
        if (e.target.value < 0) e.target.value = 0;
        if (e.target.value > 100) e.target.value = 100;
      };


      return (
          <MYTOStepBody>
            <MYTOStepBodyPadding span={12}>
              <MYTOStepBodyInner>
                <InputWrapper margintop={25}>
                  <InputLabel>Name This Simulation:</InputLabel>
                  <Row>
                    <Col span={12}>
                      <Input placeholder="ie: Social Security Simulation" id="simulation_name" type="text" onChange={(event) => handlers.updateConfig(event.target.id, event.target.value)} value={state.simulation_name} />
                    </Col>
                  </Row>
                </InputWrapper>
                <InputWrapper margintop={25}>
                  <InputLabel>Beneficiary's Age (years):</InputLabel>
                  <Row>
                    <Col span={12}>
                      <Input min={1} max={100} placeholder="What is the beneficiary's age?" id="beneficiary_age" type="number" onChange={(event) => handlers.updateConfig(event.target.id, event.target.value)} onBlur={(event) => updateAgeAndDesired("age", event.target.value)} value={state.beneficiary_age} />
                    </Col>
                  </Row>
                </InputWrapper>
                <InputWrapper margintop={15}>
                  <Row gutter={20}>
                    <Col span={6}>
                      <InputLabel><RequiredStar>*</RequiredStar> Annual Management Costs (%): <EditLink onClick={() => handlers.updateConfig("annual_management_costs_disabled", !state.annual_management_costs_disabled)}>Edit</EditLink></InputLabel>
                    </Col>
                    <Col span={6}>
                      <InputLabel><RequiredStar>*</RequiredStar> Portfolio Risk Weighting (% Stocks): <EditLink onClick={() => handlers.updateConfig("portfolio_risk_weighting_disabled", !state.portfolio_risk_weighting_disabled)}>Edit</EditLink></InputLabel>
                    </Col>
                  </Row>
                  <Row gutter={20}>
                    <Col span={6}>
                      <Input type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" min="0" max="100" id="annual_management_costs" onKeyUp={(e) => limitInputs(e)} onBlur={(event) => handlers.updateConfig(event.target.id, event.target.value)} defaultValue={state.annual_management_costs} disabled={state.annual_management_costs_disabled} />
                    </Col>
                    <Col span={6}>
                      <Input type="number" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" inputMode="decimal" min="0" max="100" id="portfolio_risk_weighting" onKeyUp={(e) => limitInputs(e)} onBlur={(event) => handlers.updateConfig(event.target.id, event.target.value)} defaultValue={state.portfolio_risk_weighting} disabled={state.portfolio_risk_weighting_disabled} />
                    </Col>
                  </Row>
                </InputWrapper>
              <InputWrapper margintop={25}>
                <InputLabel><RequiredStar>**</RequiredStar> Desired Life of Fund (years):</InputLabel>
                <Row>
                  <Col span={12}>
                    <Input min={0} max={100} placeholder="How long should this fund stay active?" id="desired_life_of_fund" type="number" onChange={(event) => handlers.updateConfig(event.target.id, event.target.value)} onBlur={(event) => updateAgeAndDesired("desire", event.target.value)} value={state.desired_life_of_fund} />
                  </Col>
                </Row>
              </InputWrapper>
              <InputWrapper>
                <InputLabel><RequiredStar>***</RequiredStar> Do you require HopeTrust concierge services?: <DependentCount>{concierge_levels[state.concierge_services]} per month</DependentCount></InputLabel>
                <Row>
                  <Col span={12}>
                    <Slider
                      format={(value) => concierge_levels[value]}
                      min={0}
                      max={3}
                      value={state.concierge_services}
                      labels={{ 0: "Off", 1: "Low", 2: "Medium", 3: "High"}}
                      onChange={(value) => handlers.updateConfig("concierge_services", value)}
                    />
                  </Col>
                </Row>
              </InputWrapper>
              <Hint top={10}><RequiredStar>*</RequiredStar> These values are the current averages, you likely do not need to make changes</Hint>
              <Hint top={8}><RequiredStar>**</RequiredStar> Based on 100 years minus beneficiary age</Hint>
              <Hint top={8}><RequiredStar>***</RequiredStar> Concierge services are individual services provided by our care team</Hint>
            </MYTOStepBodyInner>
          </MYTOStepBodyPadding>
        </MYTOStepBody>
      );
    default:
      return (
          <MYTOStepBody>
            <MYTOStepBodyPadding span={12}>
              <MYTOStepBodyInner>
                Default view
              </MYTOStepBodyInner>
            </MYTOStepBodyPadding>
          </MYTOStepBody>
      );
  }
};