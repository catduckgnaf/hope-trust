import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import "react-simple-flex-grid/lib/main.css";

export const ContainerMain = styled.div`
  width: 100%;

  ${(props) => props.padding && css`
      padding: ${props.padding}px;
  `};
  ${(props) => props.paddingtop && css`
      padding-top: ${props.paddingtop}px;
  `};
`;

export const ContainerPadding = styled.div`

`;

export const ContainerInner = styled.div`
  background: ${theme.white};
  box-shadow: ${theme.boxShadowDefault};
  border-radius: ${theme.defaultBorderRadius};
  padding: 0 10px 10px 10px;
  overflow: hidden;
  height: 100%;

  ${(props) => props.height && css`
      min-height: ${props.height}px;
      max-height: ${props.height}px;
    `};

  ${media.lessThan("769px")`
    ${(props) => props.height && css`
      max-height: 100%;
    `};
  `};

  ${(props) => props.overflow && css`
      overflow: ${props.overflow};
  `};

  ${(props) => props.transparent && css`
      background: transparent;
      box-shadow: none;
      border-radius: 0;
  `};
`;

export const ContainerInnerTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  text-transform: capitalize;
  padding: 0 10px;
  position: sticky;
  top: 0;
  z-index: 1;
  align-self: center;
  overflow-y: initial;
  text-overflow: ellipsis;
  white-space: nowrap;
  

  ${media.lessThan("small")`
    font-size: 12px;
  `}
`;

export const MainContainer = styled(Col)`
  
`;

export const ContainerHeader = styled(Row)`
  padding: 0;
  padding-top: 15px;
  padding-bottom: 10px;
  margin: 0;
  position: sticky;
  top: 0;
  background: #FFF;
  z-index: 2;

  ${(props) => props.bottom && css`
      margin-bottom: ${props.bottom}px;
  `};
`;

export const ContainerSection = styled(Col)`
  ${(props) => props.align && css`
      text-align: ${props.align};
  `};
`;