import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const MedicationCardMain = styled.div`
  width: 100%;
`;

export const MedicationCardPadding = styled.div`
  width: 100%;
`;

export const MedicationCardInner = styled(Row)`
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

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);

    ${(props) => props.color && css`
      border-left: 10px solid ${props.color};
    `};
  }
`;

export const MedicationCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MedicationCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 20px;

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px !important;
  `};

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px !important;
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

export const MedicationCardAvatar = styled.div`
  display: inline-block;
  text-align: left;
  margin-left: -10px;

  img {
    box-shadow: 0 4px 4px rgba(0,0,0,0.2);
  }

  &:first-child {
    margin-left: 0px;
  }
`;

