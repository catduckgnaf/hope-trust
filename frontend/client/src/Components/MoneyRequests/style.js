import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { lighten, darken } from "polished";

export const TicketListMain = styled(Row)`
  
`;
export const TicketsListPadding = styled(Col)`
  
`;
export const TicketsListInner = styled(Row)`
  
`;
export const TicketsListCardMain = styled(Col)`
  
`;
export const TicketsListCardPadding = styled.div`
  
`;
export const TicketsListCardInner = styled(Row)`
  background: ${theme.white};
  padding: 10px 0 10px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;
export const TicketsListCardInnerSection = styled(Col)`
  align-self: center;
  font-size: 12px;
  font-weight: 300;
  padding: 0 10px;

  ${(props) => props.overflow && css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `};

  ${(props) => props.type === "money" && css`
    color: ${darken(0.1, theme.moneyRequestColor)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "medical" && css`
    color: ${lighten(0.1, theme.medicalRequestColor)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "food" && css`
    color: ${lighten(0.05, theme.foodRequestColor)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "transportation" && css`
    color: ${lighten(0.1, theme.transportationRequestColor)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "other_request_type" && css`
    color: ${lighten(0.1, theme.otherRequestColor)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "permission" && css`
    color: ${lighten(0.1, theme.black)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "account_update" && css`
    color: ${lighten(0.1, theme.buttonGreen)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "new_relationship" && css`
    color: ${lighten(0.1, theme.notificationOrange)};
    font-size: 16px;
    text-align: center;
  `};
  ${(props) => props.type === "professional_portal_assistance" && css`
    color: ${lighten(0.1, theme.hopeTrustBlue)};
    font-size: 16px;
    text-align: center;
  `};

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${(props) => props.text_align && css`
    text-align: ${props.text_align};
  `};

  ${(props) => props.paddingright && css`
    padding-right: ${props.paddingright}px;
  `};

  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;