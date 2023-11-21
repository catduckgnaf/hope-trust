import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const ModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;
  height: 100%;
  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;

export const ModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ModalRow = styled(Row)`
  
`;

export const ModalCol = styled(Col)`
  
`;

export const ModalButtonContainer = styled(Col)`
  text-align: right;
  margin-top: 20px;
`;

export const ModalBody = styled.div`
  
`;

export const ModalConfirmationSection = styled.div`
  margin-top: 10px;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  text-align: left;
`;

export const ModalAttestationLanguage = styled.div`
  text-align: center;
  padding: 20px 30px;
  border: 2px dotted ${theme.lineGrey};
  border-radius: 6px;
  margin-bottom: 20px;
`;

export const AttestationSection = styled.div`
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  text-align: left;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
`;

export const ModalForm = styled.form`
  
`;

export const ModalNote = styled.div`
  
`;

export const ModalNotePadding = styled.div`
  
`;

export const ModalNoteInner = styled.div`
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
  position: relative;
  padding: .75rem 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid transparent;
  border-radius: .25rem;
  font-size: 13px;
  line-height: 20px;
`;