import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const ModalMain = styled.div`
  
`;

export const ModalContent = styled(Row)`
  
`;

export const ModalContentSection = styled(Col)`
  
`;

export const ModalFooter = styled(Col)`
  
`;

export const ModalHeader = styled(Col)`
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