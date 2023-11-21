import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const BeneficiaryFinanceCardMain = styled.div`
  width: 100%;
`;

export const BeneficiaryFinanceCardPadding = styled.div`
  width: 100%;
  position: relative;
`;

export const BeneficiaryFinanceCardInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border-left: 5px solid ${theme.lineGrey};
  transition: 0.2s ease;

  ${(props) => props.color && css`
    border-left: 5px solid ${props.color};
  `};

  ${(props) => props.debt && css`
    border-right: 5px solid ${theme.errorRed};
  `};

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);

    ${(props) => props.color && css`
      border-left: 10px solid ${props.color};
    `};

    ${(props) => props.debt && css`
      border-right: 10px solid ${theme.errorRed};
    `};
  }
`;

export const BeneficiaryFinanceCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BeneficiaryFinanceCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px !important;
  `};

  ${(props) => props.aligntext && css`
    text-align: ${props.aligntext};
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

  ${(props) => props.encrypt && css`
    text-transform: ${props.transform};
    background: grey;
    color: grey;
    border-radius: 20px;
    max-width: 125px;
    transition: 0.4s ease;
    text-align: center;

    &:hover {
      background: transparent;
      color: grey;
      border-radius: 0;
    }
  `};
`;

export const BeneficiaryFinanceCardSectionLink = styled.a`
  text-align: left;
  font-size: 12px;
  padding: 0;
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

export const IconContainer = styled.div`
  background: ${theme.white};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 3px 2px 6px rgb(0 0 0 / 10%);
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  margin: auto;
  cursor: pointer;
`;

export const IconContainerInner = styled.div`
  color: ${theme.hopeTrustBlue};
  font-size: 20px;
  vertical-align: middle;
  align-self: center;
`;