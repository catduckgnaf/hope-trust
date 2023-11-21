import styled from "styled-components";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const TermsOfServiceCheckMain = styled.div`
  
`;

export const TermsOfServiceCheckPadding = styled.div`
  
`;

export const TermsOfServiceCheckInner = styled.div`
  margin-top: 5px;
`;

export const TermsLabel = styled.label`
  display: inline-block;
  align-self: center;
  font-size: 13px;
  font-weight: 500;
  vertical-align: middle;
  margin-left: 5px;
  color: ${theme.hopeTrustBlueLink};
  text-decoration: underline;
  cursor: pointer;

  ${media.lessThan("500px")`
    max-width: 70%;
    white-space: pre-line;
  `};
`;

export const TermsInput = styled.input`
  display: inline-block;
  align-self: center;
  width: 15px;
  height: 15px;
  margin-right: 5px;
  margin-left: 5px;
  vertical-align: middle;
`;