import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const SurveyRow = styled(Col)`
  
`;

export const SurveyRowPadding = styled.div`
  
`;

export const SurveyRowInner = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  cursor: pointer;
  padding: 0 3px;

  &:hover {
    background: rgba(0,0,0,0.03);
  }

  ${(props) => props.disabled && css`
    background: ${theme.disabled};
  `};
`;

export const SurveyRowInnerIcon = styled(Col)`
  color: ${theme.buttonLightGreen};
  font-size: 15px;
  align-self: center;
  padding: 0 3px;
`;

export const SurveyRowInnerTitle = styled(Col)`
  text-align: left;
  padding: 8px 0;
  font-size: 12px;
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;

  ${(props) => props.disabled && css`
    color: ${theme.labelGrey};
  `};
`;

export const SurveyRowInnerStatus = styled(Col)`
  text-align: right;
  padding: 8px 3px;
  font-weight: 400;
  font-size: 12px;

  ${(props) => props.status === "Complete" && css`
    color: ${theme.buttonGreen};
    opacity: 0.5;
  `};
  ${(props) => props.status === "In Progress" && css`
    color: ${theme.notificationOrange};
  `};
  ${(props) => props.status === "Processing" && css`
    color: ${theme.notificationOrange};
  `};
  ${(props) => props.status === "Not Started" && css`
    color: ${theme.hopeTrustBlue};
  `};
  ${(props) => props.status === "Status Unavailable" && css`
    color: ${theme.errorRed};
  `};
  ${(props) => props.status === "No Access" && css`
    color: ${theme.errorRed};
  `};
`;

export const SurveyRowStatusIcon = styled.div`
  margin-left: 10px;
  display: inline-block;
`;