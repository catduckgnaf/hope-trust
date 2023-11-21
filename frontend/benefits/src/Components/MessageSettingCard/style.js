import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const MessageSettingCardMain = styled.div`
  width: 100%;
`;

export const MessageSettingCardPadding = styled.div`
  width: 100%;
`;

export const MessageSettingCardInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;

export const MessageSettingCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MessageSettingCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 20px;
  position: relative;

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

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px !important;
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

export const ListItemSectionTextItem = styled.div`
  font-size: 13px;
  color: ${theme.metadataGrey};
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: min-content;
  display: inline-block;
  vertical-align: middle;
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

export const Icon = styled.div`
  margin-right: 10px;
  display: inline-block;
  background: ${theme.white};
  border-radius: 50%;
  position: absolute;
  left: -25px;
  font-size: 22px;
  top: 0;
  bottom: 0;
  margin: auto;
  height: 40px;
  width: 40px;
  text-align: center;
  align-items: center;
  justify-content: center;
  display: flex;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
`;