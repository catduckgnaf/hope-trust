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

export const PushModuleModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const PushModuleModalInnerHeader = styled(Col)`
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

export const PushModuleModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const PushModuleModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const BenefitsModuleMainContent = styled(Col)`
  height: 100%;
`;

export const Heading = styled.div`
  font-size: 14px;
  color: #9d9b9b;
  max-width: 350px;
  width: 100%;
  text-align: left;
  font-weight: 300;
  position: relative;
  margin: auto;
  padding: 0 12px;
`;

export const Message = styled.div`
  font-size: 14px;
  color: #9d9b9b;
  text-align: left;
  font-weight: 300;
  padding: 10px 0;
`;