import styled from "styled-components";
import { theme } from "../../global-styles";
import { Col } from "react-simple-flex-grid";

export const PDFContainerMain = styled(Col)`
  overflow: auto;
  max-height: 80vh;
`;

export const PDFContainerModalModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const PDFContainerModal = styled(Col)`
  padding: 2px;
`;

export const PDFContainerModalButtonContainer = styled(Col)`
  text-align: right;
  position: sticky;
  bottom: 0;
  background: #FFF;
  width: 100%;
  margin-top: 20px;
`;

export const PDFHint = styled(Col)`
  margin-top: 25px;
`;
export const PDFHintPadding = styled.div`
  padding: 0 15px;
`;
export const PDFHintInner = styled.div`
  font-size: 12px;
  text-align: center;
  color: ${theme.metaDataGrey};
  font-weight: 400;
  padding: 15px;
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
  border-radius: 6px;
`;