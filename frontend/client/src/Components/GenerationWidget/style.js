import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const GenerateDocumentButtons = styled(Row)`
  
`;
export const GenerateDocumentButtonMain = styled(Col)`
  
`;
export const GenerateDocumentButtonPadding = styled.div`
  padding: 10px;
`;
export const GenerateDocumentIconContainer = styled(Col)`
  font-size: 20px;
  align-self: center;
  color: ${theme.white};
  padding: 0 5px;
  min-width: 20px;
`;
export const GenerateDocumentTextContainer = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  align-self: center;
  color: ${theme.white};
`;
export const GenerateDocumentButtonInner = styled(Row)`
  padding: 20px 10px;
  background: ${theme.hopeTrustBlue};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: ${theme.defaultBorderRadius};

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer;
  }
  
  ${(props) => props.disabled && css`
    background: ${theme.disabled};
  
    ${GenerateDocumentIconContainer} {
      color: ${theme.labelGrey};
    }
    ${GenerateDocumentTextContainer} {
      color: ${theme.labelGrey};
    }
    &:hover {
      cursor: no-drop !important;
    }
  `};
`;