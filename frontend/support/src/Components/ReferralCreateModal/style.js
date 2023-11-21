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

export const ViewReferralModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const ViewReferralModalInnerHeader = styled(Col)`
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

export const ViewReferralModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const ViewReferralModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const ReferralMainContent = styled(Col)`
  height: 100%;
`;

export const ReferralHint = styled(Col)`
  margin-bottom: 25px;
`;
export const ReferralHintPadding = styled.div`
  padding: 0;
`;
export const ReferralHintInner = styled.div`
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