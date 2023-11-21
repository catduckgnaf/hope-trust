import styled, { css } from "styled-components";
import { theme } from "../../global-styles";

export const CustomDate = styled.input`
  padding: 10px 0;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  box-shadow: none;
  border: 1px solid ${theme.lineGrey};
  outline: none;

  ${(props) => props.flat && css`
    border: 0;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    border-radius: 0;
  `};
`;
