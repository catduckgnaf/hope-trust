import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const ContactButtons = styled(Row)`
  
`;
export const ContactButtonMain = styled(Col)`
  
`;
export const ContactButtonPadding = styled.div`
  padding: 10px;
`;
export const ContactButtonInner = styled(Row)`
  padding: 20px 10px;
  background: ${theme.buttonGreen};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: ${theme.defaultBorderRadius};
  color: ${theme.white};

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer;
  }

  ${(props) => props.danger && css`
    background: ${theme.errorRed};
  `};
  ${(props) => props.blue && css`
    background: ${theme.hopeTrustBlue};
  `};
  ${(props) => props.purple && css`
    background: #7851a9;
  `};
  ${(props) => props.disabled && css`
    background: ${theme.disabled};
    color: ${theme.labelGrey};
    cursor: no-drop !important;
    pointer-events: none;
  `};
`;
export const ContactIconContainer = styled(Col)`
  font-size: 20px;
  align-self: center;
  padding: 0 5px;
  min-width: 20px;
`;
export const ContactTextContainer = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  align-self: center;
`;
export const Link = styled.a`
  
`;