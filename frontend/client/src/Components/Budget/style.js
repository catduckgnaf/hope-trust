import styled, { css } from "styled-components";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const BudgetsTable = styled.div`
  width: 100%;
`;

export const BudgetsTablePadding = styled.div`
  padding: 0 10px 20px 10px;
`;

export const PercentageContainer = styled.div`
  
`;

export const PercentageInner = styled.div`
  background: ${theme.lineGrey};
  color: ${theme.white};
  height: 100%;
  align-self: center;
  padding: 18px 0;
  text-align: center;
  max-width: 75px;
  min-width: 75px;
  font-size: 12px;
  transition: 0.2s ease;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  ${(props) => props.color && css`
    background: ${props.color};
  `};

  ${media.lessThan("768px")`
    max-width: 45px;
    min-width: auto;
    padding: 18px 5px;
  `};
`;