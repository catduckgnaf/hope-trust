import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const PartnerLogoModalMain= styled.div`
  
`;

export const PartnerLogoModalMainPadding = styled.div`
  
`;

export const PartnerLogoModalMainInner = styled(Row)`
  
`;

export const PartnerLogoModalMainInnerSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const PartnerLogoModalHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 10px 10px 20px 10px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
`;

export const PartnerLogoModalMessage = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 20px;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
`;

export const LogoButtonContainer = styled.div`
  display: block;
  margin-top: 40px;
  margin-bottom: 30px;
`;

export const FileTypesMessage = styled.div`
  font-size: 12px;
  color: ${theme.metadataGrey};
  margin-top: 10px;
`;