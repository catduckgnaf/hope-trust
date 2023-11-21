import styled, { css } from "styled-components";

export const IncomeTable = styled.div`
  width: 100%;
`;

export const IncomePadding = styled.div`
  padding: 0 10px 20px 10px;
`;

export const IncomeInner = styled.div`
  
`;

export const IncomeAgeRange = styled.div`
  ${(props) => props.color && css`
    color: ${props.color};
  `};
  position: relative;
  &:after {
    content: attr(alt);
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    opacity: 0;
    -webkit-transition: all 0.5s;
    transition: all 0.5s;
    cursor: pointer;
  }

  &:hover {
    span {
      opacity: 0;
    }
    &:after {
      opacity: 1;
    }
  }
`;