import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const SurveyItems = styled(Row)`
  width: 100%;
  overflow: auto;
  height: 100%;
`;

export const SurveyItemsPadding = styled(Col)`
  padding: 5px 10px;
`;

export const SurveyItemsInner = styled(Row)`
  width: 100%;
`;

export const SurveySection = styled(Col)`
  margin-top: 20px;

  &:first-child {
    margin-top: 0;
  }
`;

export const SurveySectionHeader = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 13px;
  font-weight: 300;
  margin-bottom: 10px;
`;

export const SurveyCardsContainer = styled(Col)`
  
`;

export const SurveyCards = styled(Row)`
  
`;
export const SurveySectionInlineMessage = styled(Col)`
  font-size: 11px;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  text-align: center;
  padding: 25px 10px;
  display: block;
  background: #FFF;
  box-shadow: ${theme.boxShadowDefault};
  border-radius: 5px;
  white-space: pre-wrap;
`;
export const SurveySectionInlineMessageIcon = styled.div`
  text-align: center;
  padding: 0 10px 10px 10px !important;
  display: block;
  width: 100%;
  font-size: 50px;
`;

export const SurveySectionInlineMessageIconLocked = styled.div`
  text-align: center;
  padding: 35px 10px !important;
  display: block;
  width: 100%;
  font-size: 50px;
`;

export const NoPermissionInnerSectionIconSuper = styled.div`
  color: ${theme.black};
  z-index: 1;
`;

export const NoPermissionInnerSectionIconRegular = styled.div`
  color: ${theme.hopeTrustBlue};
  z-index: 0;
`;

export const Title = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Indicator = styled.div`
  border-radius: 50%;
  height: 10px;
  width: 10px;
  background: ${theme.buttonGreen};
  box-shadow: 0 0 0 0 ${theme.buttonGreen};
  display: inline-block;
  margin-right: 10px;

  ${(props) => props.status === "none" && css`
    background: ${theme.buttonGreen};
    box-shadow: 0 0 0 0 ${theme.buttonGreen};
    animation: pulse-green 2s infinite;
  `};

  ${(props) => props.status === "maintenance" && css`
    background: ${theme.transportationRequestColor};
    box-shadow: 0 0 0 0 ${theme.transportationRequestColor};
    animation: pulse-blue 2s infinite;
  `};

  ${(props) => props.status === "major" && css`
    background: ${theme.errorRed};
    box-shadow: 0 0 0 0 ${theme.errorRed};
    animation: pulse-red 2s infinite;
  `};

  ${(props) => props.status === "critical" && css`
    background: ${theme.red};
    box-shadow: 0 0 0 0 ${theme.red};
    animation: pulse-red 1s infinite;
  `};

  ${(props) => props.status === "minor" && css`
    background: ${theme.notificationOrange};
    box-shadow: 0 0 0 0 ${theme.notificationOrange};
    animation: pulse-orange 2s infinite;
  `};
`;

export const Badge = styled.div`
  display: inline-block;
  align-self: center;
  color: ${theme.white};
  padding: 4px 10px;
  border-radius: 20px;
  margin-left: 10px;
  font-size: 12px;
  overflow: auto;

  ${(props) => props.status === "maintenance" && css`
    background: ${theme.transportationRequestColor};
  `};

  ${(props) => props.status === "major" && css`
    background: ${theme.errorRed};
  `};

  ${(props) => props.status === "minor" && css`
    background: ${theme.notificationOrange};
  `};
`;

export const Text = styled.div`
  white-space: pre-wrap;
  line-height: 18px;
  margin: auto;
  margin-top: 20px;
  max-width: 500px;
  width: 100%;
  position: relative;
`;