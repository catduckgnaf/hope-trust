import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const RelationshipCardMain = styled.div`
  width: 100%;
`;

export const RelationshipCardPadding = styled.div`
  width: 100%;
`;

export const RelationshipCardInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 0;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border-left: 3px solid ${theme.lineGrey};
  transition: 0.2s ease;
  position: relative;

  ${(props) => props.emergency && css`
    border-left: 5px solid ${theme.errorRed};
  `};

  ${(props) => props.primary && css`
    border-left: 5px solid ${theme.buttonGreen};
  `};

  ${(props) => props.secondary && css`
    border-left: 5px solid ${theme.notificationOrange};
  `};

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);

    ${(props) => props.emergency && css`
      border-left: 10px solid ${theme.errorRed};
    `};

    ${(props) => props.primary && css`
      border-left: 10px solid ${theme.buttonGreen};
    `};

    ${(props) => props.secondary && css`
      border-left: 10px solid ${theme.notificationOrange};
    `};
  }
  ${media.lessThan("990px")`
    padding-left: 30px;
  `};
`;

export const RelationshipCardSection = styled(Col)`
  align-self: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RelationshipCardSectionText = styled.div`
  text-align: left;
  font-size: 12px;
  padding: 0;
  padding-right: 20px;

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

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};

  ${media.lessThan("990px")`
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    display: inline-block !important;
    padding-left: 0px;
  `};
`;

export const RelationshipCardSectionLink = styled.a`
  text-align: left;
  font-size: 12px;
  padding: 0;
  padding-right: 20px;
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

export const RelationshipAvatarContainer = styled.div`
  width: auto;
  height: 40px;
  left: -20px;
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
`;

export const OnlineIndicator = styled.div`
  position: absolute;
  font-size: 12px;
  right: 0;
  color: ${theme.errorRed};

  ${(props) => props.online && css`
    color: ${theme.buttonGreen}
  `};

  ${(props) => props.idle && css`
    color: ${theme.notificationYellow}
  `};
`;