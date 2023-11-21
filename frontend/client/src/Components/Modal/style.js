import styled from "styled-components";
import { theme } from "../../global-styles";
import "react-simple-flex-grid/lib/main.css";
import media from "styled-media-query";
import { Row, Col } from "react-simple-flex-grid";

export const ModalMain = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 999999;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.7);
  transition: 0.5s ease;
`;

export const ModalPadding = styled.div`

`;

export const ModalInner = styled.div`
  background: #FFFFFF;
  box-shadow: ${theme.boxShadowDefault};
  height: 100vh;
  max-width: 350px;
  position: absolute;
  z-index: 99999;
  right: 0;
  transition: 0.5s ease;
  overflow: auto;
  width: 100%;

  ${media.lessThan("769px")`
    max-width: 100%;
  `};
`;

export const ModalInnerTitle = styled.div`
  width: 100%;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const ModalInnerTitlePadding = styled.div`

`;

export const ModalInnerTitleInner = styled(Row)`
  background: ${theme.hopeTrustBlue};
  position: relative;
`;

export const ModalInnerTitleInnerText = styled(Col)`
  color: ${theme.white};
  font-size: 13px;
  line-height: 40px;
  text-transform: uppercase;
  position: relative;
`;

export const ModalInnerTitleInnerClose = styled(Col)`
  color: ${theme.white};
  font-size: 13px;
  line-height: 40px;
  text-transform: uppercase;
  position: absolute;
  right: 10px;
  font-size: 25px;
  top: 0;
  bottom: 0;
  cursor: pointer;
  transition: 0.4s ease;

  &:hover {
    transform: scale(1.1)
  }
`;