import styled, { css } from "styled-components";

export const MYTOSimulationsTable = styled.div`
  width: 100%;
`;

export const MYTOSimulationsTablePadding = styled.div`
  padding: 0 10px 20px 10px;
`;

export const Strong = styled.strong`
  font-weight: 700;
  color: green;

  ${(props) => props.color && css`
    color: ${props.color};
  `};
`;

export const Bold = styled.strong`
  font-weight: 600;
  color: white;
  letter-spacing: 1px;
`;