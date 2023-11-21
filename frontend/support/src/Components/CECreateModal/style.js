import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const ModalContainer = styled.div`
  margin-top: 50px;

  ${media.lessThan("769px")`
    margin-top: 95px;
  `};
`;

export const ViewCEConfigModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const ViewCEConfigModalInnerHeader = styled(Col)`
  text-align: center;
  padding: 15px;
  border-bottom: 1px solid ${theme.lineGrey}
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  text-transform: capitalize;
`;

export const ViewCEConfigModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const ViewCEConfigModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const CEConfigMainContent = styled(Col)`
  height: 100%;
`;

export const SignatureImageContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
export const SignatureImage = styled.img`
  width: 100%;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
`;