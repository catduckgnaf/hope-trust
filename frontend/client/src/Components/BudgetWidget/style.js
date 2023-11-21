import styled from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Row, Col } from "react-simple-flex-grid";

export const BudgetContainer = styled.div`
  flex-wrap: nowrap;
  display: inline-flex;

  ${media.lessThan("large")`
    display: block;
  `}
`;

export const BudgetGraph = styled.div`
  padding: 15px 0 0 30px;
  justify-content: center;
  vertical-align: middle;
  text-align: center;

  ${media.lessThan("769px")`
    display: inline-grid;
    width: 100%;
    padding: 10px 0;
  `}
`;

export const BudgetGraphTotal = styled.div`
  font-size: 21px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  margin: 15px;
  letter-spacing: normal;
  text-align: center;
  color: ${theme.hopeTrustBlue};
`;

export const BudgetGraphBubbles = styled(Col)`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0 0 45px;
  justify-content: center;
  vertical-align: middle;
`;
export const BudgetBubbleRow = styled(Row)`
  width: 100%;
  display: flex;
  flex-direction: row;
`;
export const BudgetBubbleItem = styled.div`
  display: flex;
  width: 50%;
  justify-content: flex-start;
  padding: 5px 0;

  ${media.lessThan("769px")`
    width: 100%;
  `}
`;
export const BudgetBubble = styled.div`
  border-radius: 50%;
  background: green;
  height: 55px;
  width: 55px;
  min-width: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${theme.white};
  font-size: 12px;
`;
export const BudgetBubbleLabel = styled.div`
  display: flex;
  color: ${theme.metadataGrey};
  align-items: center;
  padding: 0 15px;
  font-size: 14px;
`;

export const Light = styled.span`
  font-weight: 300;
`;
export const Dark = styled.span`
  font-weight: 500;
`;