import styled, { css } from "styled-components";
import { theme } from "../../global-styles";

export const TimerText = styled.div`
  color: ${theme.hopeTrustBlueLink};
  font-size: 13px;
  font-weight: 300;
  text-align: left;
  padding: 5px 10px 20px 3px;

  ${(props) => props.urgent && css`
    color: ${theme.errorRed};
  `}
`;

export const TimerTime = styled.span`
  font-weight: 500;
  ${(props) => props.urgent && css`
    font-weight: 600;
  `}
`;