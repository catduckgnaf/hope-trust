import styled, { css } from "styled-components";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const SwitchWrap = styled.div`
  ${(props) => props.float && css && media.greaterThan("large")`
    float: ${props.float};
  `};
  ${media.lessThan("large")`
    margin-top: 20px;
  `};
`;

export const Switch = styled.label`
  display: inline-block;
  height: 13px;
  position: relative;
  width: 35px;
  margin: 0 10px 0 10px;
`;

export const SwitchSlider = styled.span`
  background-color: #edeef1;
  bottom: 0;
  box-shadow: inset 0 1px 3px 0 rgba(52,61,70,.2);
  cursor: pointer;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 20px;
  -webkit-transition: all .35s linear;
  transition: all .35s linear;

  &:before {
    background-image: -webkit-gradient(linear,left bottom,left top,from(#8c8c91),to(#aeaeb1));
    background-image: linear-gradient(0deg,#8c8c91,#aeaeb1);
    border-radius: 50%;
    bottom: 4px;
    box-shadow: 0 1px 2px 0 rgba(52,61,70,.2);
    content: "";
    height: 20px;
    left: -5px;
    position: absolute;
    top: -4px;
    width: 20px;
    -webkit-transition: all .15s linear;
    transition: all .15s linear;
  }
`;

export const SwitchCheck = styled.input`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 1px solid #dcdbdb;
  color: #4a4a4a;
  cursor: pointer;
  font-size: 14px;
  height: 15px;
  margin-right: 5px;
  position: relative;
  top: 3px;
  width: 15px;
  -webkit-transition: all .35s linear;
  transition: all .35s linear;
  border-radius: 3px;
  display: none;

  &:checked + ${SwitchSlider}:before {
    background-image: -webkit-gradient(linear,left top,left bottom,from(#8cbb5e),to(#529134));
    background-image: linear-gradient(180deg,#8cbb5e,#529134);
    -webkit-transform: translateX(20px);
    transform: translateX(20px);
  }
`;

export const SwitchLabel = styled.label`
  color: ${theme.metadataGrey};
  font-size: 11px;
  position: relative;
  top: -2px;
`;
