import styled, { css } from "styled-components";

export const BlankSpaceMain = styled.div`
  ${(props) => props.top && css`
    margin-top: ${props.top}px;
  `};
  ${(props) => props.bottom && css`
    margin-bottom: ${props.bottom}px;
  `};
`;
