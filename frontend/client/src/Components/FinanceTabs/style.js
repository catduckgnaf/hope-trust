import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const FinanceTabsMain = styled.div`
  width: 100%;
`;
export const FinanceTabsPadding = styled.div`
  padding: 5px 10px;
`;
export const FinanceTabsInner = styled(Row)`
  
`;
export const FinanceTab = styled(Col)`
  text-align: center;
`;
export const FinanceTabPadding = styled.div`
  
`;
export const FinanceTabInner = styled(Row)`
  background: rgba(0,0,0,0.02);
  padding: 10px 0;
  border-radius 5px 5px 0 0;
  box-shadow: 0 1px 1px rgba(0,0,0,0.1);
  color: ${theme.metadataGrey};
  font-weight: 200;

  &:hover {
    box-shadow: 0 1px 1px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  ${(props) => props.active && css`
    background: ${theme.white};
  `};
`;
export const FinanceTabIcon = styled(Col)`
  color: ${theme.buttonLightGreen};
  font-size: 22px;
  align-self: center;
  padding: 0 10px;

  ${media.lessThan("984px")`
    width: 50% !important;
    padding: 0;
  `};

  ${media.lessThan("500px")`
    width: 100% !important;
    text-align: center !important;
    font-size: 12px;
  `};
`;
export const FinanceTabText = styled(Col)`
  text-align: left;
  font-size: 16px;
  align-self: center;
  padding: 0 20px;
  font-weight: 300;

  ${(props) => props.active && css`
    color: ${theme.metadataGrey};
    font-weight: 400;
  `};

  ${media.lessThan("984px")`
    width: 50% !important;
    padding: 0;
  `};

  ${media.lessThan("500px")`
    width: 100% !important;
    text-align: center !important;
    font-size: 11px;
    padding-top: 10px;
  `};
`;