import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Col } from "react-simple-flex-grid";

export const ModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const CertificateBody = styled(Col)`
  border: 2px dotted ${theme.metadataGrey};
  padding: 20px;
  border-radius: 6px;
`;

export const CertificateBodyItem = styled.div`
  text-align: left;
  font-size: 15px;
  font-weight: 300;
  padding-bottom: 10px;

  ${(props) => props.has_sub && css`
    padding-bottom: 4px;
  `};

  ${(props) => props.line_space && css`
    line-height: 25px
  `};

  ${(props) => props.size && css`
    font-size: ${props.size}px;
  `};

  ${(props) => props.bold && css`
    font-weight: bold;
  `};

  ${(props) => props.break && css`
    margin-top: 20px;
  `};
`;

export const ButtonContainer = styled(Col)`
  text-align: right;
  margin-top: 20px;
`;

export const CertificateSignatureBlank = styled.div`
  display: block;
  width: 300px;
  margin-bottom: 5px;
  margin-top: 70px;
`;

export const CertificateSignatureImg = styled.img`
  display: block;
  width: 300px;
  margin-bottom: 5px;
`;

export const CertificateSignatureItem = styled.div`
  text-align: left;
  font-size: 15px;
  font-weight: bold;
  margin-top: 10px;
`;

export const CertificateNotice = styled.div`
  text-align: left;
  font-size: 12px;
  font-weight: 300;
  margin-top: 20px;
  border-top: 1px solid ${theme.lineGrey};
  padding-top: 20px;
  font-style: italic;
`;