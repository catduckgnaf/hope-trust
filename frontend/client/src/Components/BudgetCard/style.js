import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const BudgetCardMain = styled.div`
  width: 100%;
`;

export const BudgetCardPadding = styled.div`
  width: 100%;
`;

export const BudgetCardInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border-left: 3px solid ${theme.lineGrey};
  transition: 0.2s ease;

  ${(props) => props.color && css`
    border-left: 5px solid ${props.color};
  `};

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    
    ${(props) => props.color && css`
      border-left: 10px solid ${props.color};
    `};
  }
`;

export const BudgetCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BudgetCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  padding-right: 20px;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${(props) => props.aligntext && css`
    text-align: ${props.aligntext};
  `};

  ${(props) => props.weight && css`
    font-weight: ${props.weight};
  `};

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  &:after {
    content: attr(alt);
    position: absolute;
    top: 0;
    left: 0;
    background: #FFF;
    opacity: 0;
    -webkit-transition: all 0.5s;
    transition: all 0.5s;
    cursor: pointer;
  }

  &:hover::after {
    opacity: 1;
  }

  ${(props) => props.size && css`
    font-size: ${props.size}px;
  `};

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px !important;
  `};

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px !important;
  `};

  ${media.lessThan("990px")`
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    display: inline-block !important;
  `};
`;

export const BudgetCardSectionLink = styled.a`
  text-align: left;
  font-size: 12px;
  padding: 0;
  padding-right: 20px;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${theme.hopeTrustBlueLink};

  ${(props) => props.aligntext && css`
    text-align: ${props.aligntext};
  `};

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${media.lessThan("990px")`
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    display: inline-block !important;
  `};
`;

export const MobileLabel = styled.div`
  display: none;
  margin-bottom: 5px;
  font-weight: 500;
  margin-right: 10px;
  min-width: 110px;

  ${media.lessThan("990px")`
    display: inline-block !important;
  `};
`;

export const BudgetPercentageContainer = styled.div`
  
`;

