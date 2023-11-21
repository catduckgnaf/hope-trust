import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const InvoiceMain = styled.div`
  max-width: 1000px;
  margin: auto;
`;

export const InvoicePadding = styled.div`
  padding: 10px;
  ${media.lessThan("1285px")`
    padding: 0;
  `};
`;

export const InvoiceInner = styled.div`
  width: 100%;
  margin: auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, .15);
  background: ${theme.white};
  font-size: 16px;
  line-height: 24px;
  color: ${theme.metadataGrey};
  border-radius: 8px;

  ${media.lessThan("1285px")`
    padding: 0;
    border-radius: 0;
  `};
`;

export const InvoiceBox = styled.div`
  ${media.lessThan("1285px")`
    padding: 20px;
  `};

  ${media.lessThan("361px")`
    max-width: 320px;
  `};
  ${media.lessThan("321px")`
    max-width: 285px;
  `};
`;

export const InvoiceBoxPadding = styled.div`
  
`;

export const InvoiceBoxInner = styled.div`
  
`;

export const InvoiceBoxRow = styled(Row)`
  margin-bottom: 20px;
  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `};
  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
  ${(props) => props.sticky === "bottom" && css`
    position: sticky;
    bottom: 0;
    background: ${theme.white};
    padding: 20px 0;
  `};
`;

export const InvoiceBoxItem = styled.div`
  
`;

export const InvoiceBoxItemPadding = styled.div`
  padding: 3px 3px 3px 1px;
`;

export const InvoiceBoxItemInner = styled(Row)`
  padding: 5px 10px;
  box-shadow: 0 0 1px 1px ${theme.boxShadowLight};
  background: ${theme.white};
  border-radius: 3px;
  ${(props) => props.disabled && css`
    background: ${theme.disabled};
    color: ${theme.labelGrey} !important;
  `};
  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;

export const InvoiceBoxCol = styled(Col)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  ${(props) => props.subheading && css`
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;

    ${media.lessThan("500px")`
      font-size: 11px;
    `};
  `};

  ${(props) => props.lighter && css`
    font-weight: 400 !important;
    text-transform: uppercase;
    vertical-align: middle;
  `};

  ${(props) => props.prewrap && css`
    white-space: pre-wrap;
  `};

  ${(props) => props.nooverflow && css`
    overflow: inherit;
    text-overflow: unset;
    white-space: initial;
  `};
`;

export const InvoiceBoxColPadding = styled.div`
  
`;

export const InvoiceBoxColInner = styled.div`
  
`;

export const InvoiceEntityInformation = styled.div`
  
`;

export const InvoiceBoxLogo = styled.img`
  width: 75%;
`;

export const InvoiceItemEmphasis = styled.span`
  font-weight: 500;
  color: ${theme.labelGrey} !important;
`;

export const InvoiceItemStrike = styled.span`
  text-decoration: line-through;
  color: #888;
  font-weight: normal;
  margin-right: 5px;
`;

export const InvoiceItemAmount = styled.span`
  
`;