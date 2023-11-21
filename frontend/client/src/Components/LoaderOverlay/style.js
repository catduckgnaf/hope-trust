import styled, { css } from "styled-components";
import { theme } from "../../global-styles";

export const LoaderOverlayMain = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2147483647;
  background: ${theme.white};

  ${(props) => props.fixed && css`
    position: fixed;
  `};

  ${(props) => props.show && css`
    display: block;
  `};

  ${(props) => !props.show && css`
    display: none;
  `};
`;

export const LoaderOverlayMainPadding = styled.div`
  width: 100%;
  height: 100%;
`;

export const LoaderOverlayMainInner = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom:0;
  left: 0;
  right: 0;
  height: 120px;
  width: 120px
  background: ${theme.white};
  box-shadow: 0 2px 8px ${theme.boxShadowLight};
  padding: 0;
  border-radius: 6px;
`;

export const LoaderText = styled.div`
  width: 100%;
  text-align:center;
  font-size: 12px;
  font-weight: 300;
  color: ${theme.metadataGrey};
  padding: 10px 0;
`;
