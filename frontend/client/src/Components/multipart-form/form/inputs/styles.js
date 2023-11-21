import styled, { css } from "styled-components";

export const StyledFormInput = styled.input`
  display: block;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.5rem;

  border-radius: 4px;
  border: 1px solid #EBEDEE;

  &::placeholder {
    opacity: 0.25;
  }

  ${(props) => !props.valid && css`
    outline: 1px solid red;
  `};
`;

export const StyledFormSelect = styled.select`
  display: block;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.5rem;

  &:after {
    padding-right: 1rem;
  }
  
  background-color: white;
  border-radius: 4px;
  border: 1px solid #EBEDEE;

  ${(props) => !props.valid && css`
    
  `};

   -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position-x: 98%;
  background-position-y: 9px;
`;

export const StyledFormCheckbox = styled.input`
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: white;
  vertical-align: middle;
`;