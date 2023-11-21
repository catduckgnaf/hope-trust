import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import { lighten } from "polished";
import media from "styled-media-query";

export const AlertMain = styled.div`
  width: 100%;
  position: sticky;
  bottom: 0;
  left: 0;
  transition: 2s ease;
  z-index: 2147483646;
  margin-bottom: 0px;

  ${(props) => props.hide && css`
    margin-bottom: -50px;
  `};
`;

export const AlertMainPadding = styled.div`
  padding: 0;
  margin: 0;
`;

export const AlertMainInner = styled.div`
  padding: 15px 10px;
  font-weight: 500;
  position: relative;
  text-align: center;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);

  ${media.lessThan("769px")`
    font-size: 12px;
    text-align: left;
  `};

  ${(props) => props.type === "error" && css`
    background: ${lighten(0.35, theme.errorRed)};
    color: ${theme.errorRed};
  `};

  ${(props) => props.type === "success" && css`
    background: ${lighten(0.55, theme.buttonGreen)};
    color: ${theme.buttonGreen};
  `};

  ${(props) => props.type === "info" && css`
    background: ${lighten(0.6, theme.hopeTrustBlue)};
    color: ${theme.hopeTrustBlue};
  `};

  ${(props) => props.type === "warning" && css`
    background: ${theme.noticeYellowBackground};
    color: ${theme.noticeYellow};
  `};
`;

export const AlertInnerContainer = styled(Row)`
  
`;

export const AlertInnerContainerSection = styled(Col)`
  
`;

export const AlertActionContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  height: 24px;
`;

export const AlertProgress = styled.div`
  height: 3px;
  width: 100%;
  transition: 1s linear;
  ${(props) => props.type === "error" && css`
    background: ${theme.errorRed};
  `};

  ${(props) => props.type === "success" && css`
    background: ${theme.buttonGreen};
  `};

  ${(props) => props.type === "info" && css`
    background: ${theme.hopeTrustBlue};
  `};

  ${(props) => props.type === "warning" && css`
    background: ${theme.noticeYellow};
  `};
`;