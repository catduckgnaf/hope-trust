import styled, { css } from "styled-components";
import { theme } from "../../global-styles";

export const CurrentVaultUsage = styled.div`
  display: inline-block;
  font-weight: 400;

  ${(props) => props.usage < props.limit && css`
    color: ${theme.buttonGreen};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 50) && ((props.usage * 100) / props.limit) < 90 && css`
    color: ${theme.notificationOrange};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 90) && css`
    color: ${theme.errorRed};
  `};
`;

export const TotalVaultUsage = styled.div`
  color: ${theme.hopeTrustBlue};
  display: inline-block;
  font-weight: 400;
`;