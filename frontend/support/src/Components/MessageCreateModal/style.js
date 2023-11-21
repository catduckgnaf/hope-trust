import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const MessageModalMain = styled.div`
  
`;

export const MessageModalContent = styled(Row)`
  
`;

export const MessageModalContentSection = styled(Col)`
  
`;

export const MessageModalFooter = styled(Col)`
  
`;

export const MessageModalHeader = styled(Col)`
  text-align: center;
  padding: 0 15px 15px 15px;
  border-bottom: 1px solid ${theme.lineGrey}
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  text-transform: capitalize;
`;

export const Attachments = styled.div`
  margin: 0 0 40px 0;
`;

export const AttachmentsHeader = styled.div`
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
`;

export const AttachmentContainer = styled.div`
  
`;

export const AttachmentContainerPadding = styled.div`
  
`;

export const AttachmentContainerInner = styled.div`
  background: ${theme.white};
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  border-radius: 3px;
  padding: 10px;
  margin-top: 4px;

  &:hover {
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    cursor: pointer;
  }
`;

export const AttachmentContainerInnerRow = styled(Row)`
  
`;

export const AttachmentSection = styled(Col)`
  text-align: left;
  justify-content: center;
  align-self: center;
  color: ${theme.metadataGrey};
  font-size: 14px;
  ${(props) => props.aligntext && css`
    text-align: ${props.aligntext};
  `};
`;