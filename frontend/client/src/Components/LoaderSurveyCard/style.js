import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const LoaderSurveyCardMain = styled(Col)`
  
`;

export const LoaderSurveyCardPadding = styled.div`
  padding: 10px;
`;

export const LoaderSurveyCardInner = styled(Row)`
  color: ${theme.buttonGreen};
  cursor: pointer;
  padding: 20px 15px;
  background: ${theme.white};
  min-height: 90px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 4px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

export const LoaderSurveyCardIcon = styled(Col)`
  color: ${theme.buttonGreen};
  font-size: 25px;
  text-align: center;
  align-self: center;

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.warning && css`
    color: ${theme.notificationOrange};
  `};
`;

export const LoaderSurveyCardTitle = styled(Col)`
  color: ${theme.buttonGreen};
  text-align: center;
  align-self: center;
  font-weight: 300;
  font-size: 13px;

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.warning && css`
    color: ${theme.notificationOrange};
  `};
`;