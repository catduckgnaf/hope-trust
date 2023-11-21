import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const UserCardMain = styled.div`
  width: 100%;
`;

export const UserCardPadding = styled.div`
  width: 100%;
  position: relative;
`;

export const UserCardInner = styled(Row)`
  background: ${theme.white};
  padding: 10px 0 10px 10px;
  margin: 5px 0;
  border-radius: 5px;
  box-shadow: 0px 1px 4px rgb(0 0 0 / 15%);
  transition: 0.2s ease;
  position: relative;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;

export const UserCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${(props) => props.too_long && css`
    padding-right: 20px;
  `};

  ${(props) => props.nooverflow && css`
    overflow: inherit !important;
    text-overflow: unset !important;
    white-space: normal !important;
  `};
`;

export const UserCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${(props) => props.bump && css`
    padding-left: 15px;
  `};

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
    overflow: inherit !important;
    text-overflow: unset !important;
    white-space: normal !important;
  `};

  ${media.lessThan("990px")`
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    display: inline-block !important;
  `};
`;

export const ListItemSectionTextItem = styled.div`
  font-size: 13px;
  color: ${theme.metadataGrey};
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: min-content;
  ${(props) => props.bold && css`
    font-weight: bold;
  `};

  ${(props) => props.clickable && css`
    font-weight: 500;
    color: ${theme.hopeTrustBlue};
    cursor: pointer;
    border-bottom: 1px dashed;

    &:hover {
      font-weight: 600;
    }
  `};
`;

export const UserCardSectionLink = styled.a`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 40px;
  color: ${theme.hopeTrustBlue};

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