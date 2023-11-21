import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const SurveysContainer = styled.div`
  width: 100%;
`;

export const SurveySection = styled(Row)`
  margin-top: 20px;
`;

export const SurveySectionHeader = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 16px;
  margin-left: 11px;
  margin-bottom: 5px;
`;

export const SurveyCardsContainer = styled(Col)`
  
`;

export const SurveyCards = styled(Row)`
  
`;