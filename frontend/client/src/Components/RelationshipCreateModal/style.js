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

export const ViewUserModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const ViewUserModalInnerHeader = styled(Col)`
  text-align: center;
  padding: 15px;
  border-bottom: 1px solid ${theme.lineGrey}
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  text-transform: capitalize;

  ${(props) => props.is_editing && css`
    margin-top: 25px;
  `};
`;

export const ViewUserModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;

  ${(props) => props.editing && css`
    margin-top: 20px;
  `};
`;

export const ViewUserModalInnerLogoOverlay = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  background: rgba(0,0,0,0.3);
  z-index: 1;
  top: 0;
  left: 0;
  opacity: 0;
  transition: 0.5s ease;
  cursor: pointer;
`;

export const ViewUserModalInnerLogoContainer = styled.div`
  width: 100px;
  border-radius: 50%;
  position: relative;
  margin: auto;

  &:hover {
    ${ViewUserModalInnerLogoOverlay} {
      opacity: 1;
    }
  }
`;

export const ViewUserModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
  box-shadow: 0 4px 3px rgba(0,0,0,0.3);
`;

export const UserMainContent = styled(Col)`
  height: 100%;
`;

export const ViewUserModalInnerLogoOverlayIcon = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  text-align: center;
  font-size: 40px;
  color: ${theme.white};
  align-self: center;
`;

export const Group = styled.div`
  display: inline-block;
  cursor: pointer;
`;

export const Icon = styled.div`
  display: inline-block;
  margin-left: 5px;
  cursor: pointer;
`;