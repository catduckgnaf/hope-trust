import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const SubscriptionCardMain = styled.div`
  width: 100%;
`;

export const SubscriptionCardPadding = styled.div`
  width: 100%;
`;

export const SubscriptionCardInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;

export const SubscriptionCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SubscriptionCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 20px;

  ${(props) => props.aligntext && css`
    text-align: ${props.aligntext};
  `};

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${(props) => props.nopadding && css`
    padding: 0 !important;
  `};

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px !important;
  `};

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px !important;
  `};

  ${(props) => props.nooverflow && css`
    overflow: auto !important;
    text-overflow: none !important;
    white-space: normal !important;
  `};
  ${(props) => props.status === "active" && css`
    color: ${theme.buttonLightGreen};
  `};
  ${(props) => props.status === "cancelled" && css`
    color: ${theme.errorRed};
  `};
  ${(props) => props.status === "inactive" && css`
    color: ${theme.errorRed};
  `};
  ${(props) => props.status === "in_transfer" && css`
    color: ${theme.notificationOrange};
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
