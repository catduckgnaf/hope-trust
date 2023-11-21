import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

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

export const SignatureContainer = styled.div`
  
`;
export const SignatureContainerPadding = styled.div`
  padding-top: 20px;
`;
export const SignatureContainerInner = styled.div`
  
`;

export const SignatureText = styled.div`
  font-size: 50px;
  font-weight: 300;
  font-family: 'Ephesis', cursive;
  color: ${theme.metadataGrey};
  border-bottom: 1px solid ${theme.lineGrey};
  color: rgba(255, 255, 255, 0.1);
  background: -webkit-gradient(linear, left top, right top, from(#222), to(#222), color-stop(0.5, #fff));
  background: -moz-gradient(linear, left top, right top, from(#222), to(#222), color-stop(0.5, #fff));
  background: gradient(linear, left top, right top, from(#222), to(#222), color-stop(0.5, #fff));
  -webkit-background-size: 125px 100%;
  -moz-background-size: 125px 100%;
  background-size: 125px 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  -webkit-animation-name: shimmer;
  -moz-animation-name: shimmer;
  animation-name: shimmer;
  -webkit-animation-duration: 4s;
  -moz-animation-duration: 4s;
  animation-duration: 4s;
  -webkit-animation-iteration-count: 1;
  -moz-animation-iteration-count: 1;
  animation-iteration-count: 1;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-color: #222;

  ${media.lessThan("768px")`
    font-size: 35px;
  `};
  ${media.lessThan("500px")`
    font-size: 25px;
  `};
`;
export const SignatureDate = styled.div`
  color: ${theme.metadataGrey};
  font-size: 14px;
  margin-top: 15px;
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